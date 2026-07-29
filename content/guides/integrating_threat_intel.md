# Integrating Threat Intelligence into ASM

Discovery tells you what you have. Threat intelligence tells you which of it an
attacker is likely to come for next. Without that context, an ASM program produces
an inventory; with it, the inventory becomes a ranked worklist.

This guide covers what to integrate, how to correlate it against discovered assets,
and how to turn the result into a priority order your team can actually work through.

---

## Why context changes the answer

A scan that reports "443 open, nginx 1.18" is a fact, not a finding. Whether it
matters depends on questions discovery can't answer on its own:

- Is there a known vulnerability in that version?
- Is it being **actively exploited in the wild** right now?
- Does the host handle sensitive data, or is it a marketing microsite?
- Have credentials for this domain shown up in a breach dump?

Two identical services can sit at opposite ends of your queue depending on those
answers. Threat intelligence supplies them.

> **The prioritization trap.** Teams that rank purely by CVSS end up working through
> a wall of "high" findings in arbitrary order. Severity describes the vulnerability
> in the abstract; exploitation and business context describe *your* risk.

---

## What to integrate

### 1. Vulnerability and exploitation feeds

The core enrichment: mapping discovered software to known issues, then filtering to
what's genuinely dangerous.

| Source | What it gives you | Why it matters |
|---|---|---|
| [NVD](https://nvd.nist.gov/developers) | CVE records, CVSS, affected versions | The baseline mapping from software to known issues |
| [CISA KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) | Vulnerabilities **known to be exploited** | The single highest-value filter — small list, all real |
| [EPSS](https://www.first.org/epss/) | Probability a CVE will be exploited in the next 30 days | Ranks the long tail that KEV doesn't cover |

**Start with KEV.** It is short, authoritative, and free. Anything in your estate
matching KEV goes to the top of the queue regardless of CVSS.

### 2. Indicator and reputation feeds

Useful for spotting assets that are already compromised or abused:

- **[AlienVault OTX](https://otx.alienvault.com/)** — community IOC pulses
- **[AbuseIPDB](https://www.abuseipdb.com/)** — IP reputation and abuse reports
- **[URLhaus](https://urlhaus.abuse.ch/)** / **[PhishTank](https://phishtank.org/)** — malicious URL and phishing feeds
- **[VirusTotal](https://developers.virustotal.com/reference/overview)** — file, domain, IP, and URL reputation

### 3. Breach and credential exposure

Your attack surface includes the credentials that unlock it:

- **[Have I Been Pwned](https://haveibeenpwned.com/API/v3)** — breach exposure by domain or address
- Secret scanning against your own repositories — see [TruffleHog and Gitleaks](../tools/modern_tools.md)

### 4. Threat intelligence platforms

Once you outgrow flat files, a platform gives you storage, deduplication, and
relationships between indicators:

- **[MISP](https://www.misp-project.org/)** — the widely-deployed open-source sharing platform
- **[OpenCTI](https://www.opencti.io/)** — knowledge graph with ATT&CK mapping
- **[IntelOwl](https://github.com/intelowlproject/IntelOwl)** — orchestrates many enrichment services behind one API

---

## The correlation pipeline

Enrichment is a join between two datasets: what you found, and what is known about it.

```
discovery output ──┐
                   ├──> normalize ──> correlate ──> score ──> prioritized findings
threat feeds ──────┘
```

### Step 1: Normalize

Feeds arrive as JSON APIs, CSV downloads, and STIX bundles. Pick one internal shape
and convert everything into it — correlation is impossible across five schemas.

A workable minimum for each indicator:

```json
{
  "indicator": "CVE-2026-1234",
  "type": "cve",
  "source": "cisa-kev",
  "severity": "critical",
  "actively_exploited": true,
  "first_seen": "2026-05-01",
  "references": ["https://..."]
}
```

### Step 2: Correlate

Match on whatever your discovery data actually contains:

| Discovery data | Correlates against |
|---|---|
| Service banner / version from `httpx -tech-detect` or `nmap -sV` | CVE records for that product and version |
| IP addresses | IP reputation and abuse feeds |
| Domains and subdomains | Malicious-domain and phishing feeds |
| Email addresses from `theHarvester` | Breach corpora |

A practical starting point using data you already collect:

```bash
# Discover, probe, and record detected technologies as JSON
subfinder -d example.com -silent \
  | httpx -silent -json -tech-detect -o live.json

# Extract the product/version pairs worth checking against CVE data
jq -r 'select(.tech != null) | "\(.url)\t\(.tech | join(","))"' live.json \
  > tech-inventory.tsv
```

Then check that inventory against KEV:

```python
#!/usr/bin/env python3
"""Flag discovered technologies that appear in CISA's KEV catalog."""
import csv, json, urllib.request

KEV_URL = ("https://www.cisa.gov/sites/default/files/feeds/"
           "known_exploited_vulnerabilities.json")

with urllib.request.urlopen(KEV_URL) as resp:
    kev = json.load(resp)

# Index KEV by lowercase product name for cheap substring matching
kev_products = {}
for vuln in kev.get("vulnerabilities", []):
    kev_products.setdefault(vuln["product"].lower(), []).append(vuln)

with open("tech-inventory.tsv") as fh:
    for url, tech_list in csv.reader(fh, delimiter="\t"):
        for tech in tech_list.split(","):
            for product, vulns in kev_products.items():
                if product in tech.lower():
                    for v in vulns:
                        print(f"[KEV] {url}\t{tech}\t{v['cveID']}\t{v['vulnerabilityName']}")
```

> Version-accurate matching needs CPE data rather than substring comparison. Treat
> the above as a triage signal that tells you where to look closely, not as proof.

### Step 3: Score

Combine the signals into one number so the queue sorts itself. A transparent starting
formula — tune the weights to your environment:

```
risk = exposure × threat × business_criticality

exposure              internet-facing 1.0 | authenticated 0.6 | internal-only 0.4
threat                in KEV 1.0 | EPSS > 0.5 → 0.8 | known CVE 0.5 | none 0.2
business_criticality  customer data 1.0 | production 0.8 | staging 0.4 | marketing 0.2
```

An internet-facing production service with a KEV entry scores `1.0 × 1.0 × 0.8 = 0.80`.
An internal staging box with a medium CVE scores `0.4 × 0.5 × 0.4 = 0.08`. That ten-fold
gap is the output you want — and note that CVSS never entered the calculation.

The weights matter less than being explicit about them. A documented, tunable formula
survives the "why is this ranked above that?" conversation; intuition does not.

### Step 4: Act

Prioritization only pays off if it reaches someone:

```bash
# Alert on critical findings as they are produced
nuclei -l live.txt -severity critical -silent | notify -bulk

# Alert only on newly-appearing assets, not the whole surface every run
subfinder -d example.com -silent | anew known-hosts.txt | notify -bulk
```

Route by score: top-tier findings page someone, mid-tier open tickets, low-tier land
in a weekly digest. Everything alerting at the same level trains people to ignore it.

---

## Operational cautions

- **Rate limits and cost.** Free tiers are small. Cache aggressively, batch lookups, and
  enrich only assets that changed since the last run.
- **Feed quality varies.** Community IOC feeds carry false positives. Never auto-block
  on a single unverified source.
- **Enrichment is a data-handling decision.** Submitting your hostnames or file hashes to
  a third-party service discloses information about your estate. Check the terms before
  wiring anything into an automated pipeline.
- **Stale intelligence misleads.** An indicator that was malicious last year may be a
  reallocated IP today. Age your data and re-validate.
- **Store keys properly.** Threat-feed API keys belong in environment variables or a
  secrets manager, never in the script — see [Security Considerations](../resources/security_considerations.md).

---

## A realistic first implementation

You do not need a platform to start. In order of value per hour spent:

1. **Pull the KEV catalog daily.** Cross-reference it against your discovered
   technology inventory. This alone catches the issues most likely to be exploited.
2. **Add EPSS scores** for CVEs that aren't in KEV, to rank the remainder.
3. **Check your domains against breach data** on a schedule.
4. **Write the scoring formula down** and apply it consistently.
5. **Wire the top tier into a notification channel** someone actually reads.
6. **Only then** consider MISP or OpenCTI — adopt a platform when flat files stop
   scaling, not before.

---

## Related material

- [Building Your Own ASM Stack](building_your_own_asm_stack.md) — the pipeline this plugs into
- [Modern ASM Toolchain](../tools/modern_tools.md) — nuclei, notify, and the discovery tools referenced above
- [Change Tracking](../examples/change_tracking.md) — detecting what's new, which is what you enrich
- [Security Considerations](../resources/security_considerations.md) — handling keys and third-party disclosure
