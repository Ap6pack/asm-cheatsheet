# Modern ASM Toolchain

The tools most external-attack-surface work runs on today. These are pipeline-first
utilities: each does one thing, reads from stdin, writes clean output, and chains
into the next. Together they replace most of what used to take a monolithic scanner.

> ⚠️ **Authorization first.** Everything here sends traffic to, or collects data about,
> real systems. Only run these against assets you own or are explicitly authorized to
> test. See [Security Considerations](../resources/security_considerations.md).

**Flags and install paths change.** Every entry links to its official documentation —
check there before relying on a specific flag in automation.

---

## 🌐 HTTP Probing and Fingerprinting

### httpx

**Purpose:** Probe a list of hosts for live HTTP services and fingerprint what they are  
**Difficulty:** Beginner  
**Link:** https://github.com/projectdiscovery/httpx  
**Status:** Active — maintained by ProjectDiscovery

The workhorse of the middle of the pipeline. Subdomain discovery gives you names;
httpx tells you which ones actually answer, what they run, and which are worth a
closer look.

**Installation:**
```bash
go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest

# Alternatives
brew install httpx                       # macOS
docker run -it projectdiscovery/httpx    # container
```

**Basic Usage:**
```bash
# Probe a list of hosts for live web services
cat subdomains.txt | httpx -silent

# Show status code, page title, and detected technologies
cat subdomains.txt | httpx -silent -status-code -title -tech-detect

# Keep only successful responses, write to a file
cat subdomains.txt | httpx -silent -mc 200,204,301,302 -o live.txt

# Follow redirects and record the final location
cat subdomains.txt | httpx -silent -follow-redirects -location
```

**Pipeline Usage:**
```bash
# Discovery -> probing -> screenshots, all in one chain
subfinder -d example.com -silent \
  | httpx -silent -mc 200 \
  | gowitness scan file -f -

# JSON output for correlation with other tools
cat subdomains.txt | httpx -silent -json -o live.json
jq -r 'select(.tech != null) | "\(.url) \(.tech | join(","))"' live.json
```

---

### tlsx

**Purpose:** Collect TLS certificate data at scale — issuers, SANs, expiry, and misconfiguration  
**Difficulty:** Intermediate  
**Link:** https://github.com/projectdiscovery/tlsx  
**Status:** Active — maintained by ProjectDiscovery

Certificates leak scope. The Subject Alternative Name field on one host routinely
names other hosts you did not know about, which makes tlsx both a discovery tool
and a hygiene check for expiring or weak certificates.

**Installation:**
```bash
go install -v github.com/projectdiscovery/tlsx/cmd/tlsx@latest
```

**Basic Usage:**
```bash
# Pull certificate details for a set of hosts
cat live.txt | tlsx -silent

# Expand scope: every hostname listed in the certificate SANs
cat live.txt | tlsx -silent -san -resp-only | sort -u

# Surface certificates that are expired or expiring soon
cat live.txt | tlsx -silent -expired -self-signed

# Full JSON for reporting
cat live.txt | tlsx -silent -json -o certs.json
```

---

## 🔍 DNS, Ports, and Network Mapping

### dnsx

**Purpose:** Fast DNS resolution, record lookup, and wildcard-aware brute forcing  
**Difficulty:** Beginner  
**Link:** https://github.com/projectdiscovery/dnsx  
**Status:** Active — maintained by ProjectDiscovery

Resolving a large candidate list is its own problem: slow resolvers, rate limits, and
wildcard DNS that answers "yes" to everything. dnsx handles all three.

**Installation:**
```bash
go install -v github.com/projectdiscovery/dnsx/cmd/dnsx@latest
```

**Basic Usage:**
```bash
# Keep only names that actually resolve
cat candidates.txt | dnsx -silent

# Resolve and show the A records
cat candidates.txt | dnsx -silent -a -resp

# Look up specific record types
cat domains.txt | dnsx -silent -cname -resp     # CNAMEs (subdomain takeover hunting)
cat domains.txt | dnsx -silent -mx -resp        # mail
cat domains.txt | dnsx -silent -txt -resp       # SPF/DMARC and verification records

# Filter out wildcard noise
cat candidates.txt | dnsx -silent -wd example.com
```

---

### naabu

**Purpose:** Fast SYN/CONNECT port scanning built for pipelines  
**Difficulty:** Intermediate  
**Link:** https://github.com/projectdiscovery/naabu  
**Status:** Active — maintained by ProjectDiscovery

Sits between host discovery and service inspection. Naabu finds the open ports
quickly, then hands them to nmap for accurate service and version detection —
faster than asking nmap to do both across a large surface.

**Installation:**
```bash
# Requires libpcap (sudo apt install libpcap-dev / brew install libpcap)
go install -v github.com/projectdiscovery/naabu/v2/cmd/naabu@latest
```

**Basic Usage:**
```bash
# Scan the top ports on a host
naabu -host example.com -top-ports 100

# Scan a list, rate-limited to stay polite
naabu -list hosts.txt -top-ports 1000 -rate 500

# Hand results to nmap for service/version detection
naabu -list hosts.txt -top-ports 1000 -silent \
  | naabu -nmap-cli 'nmap -sV -oX services.xml'

# Feed straight into httpx to find web services on non-standard ports
naabu -list hosts.txt -silent | httpx -silent -title
```

---

### asnmap

**Purpose:** Map an organization to the IP ranges it actually owns via ASN lookup  
**Difficulty:** Intermediate  
**Link:** https://github.com/projectdiscovery/asnmap  
**Status:** Active — maintained by ProjectDiscovery

Scoping runs backwards from most recon: before enumerating names, establish which
netblocks belong to the organization. Anything outside them is out of scope.

**Installation:**
```bash
go install -v github.com/projectdiscovery/asnmap/cmd/asnmap@latest
```

**Basic Usage:**
```bash
# CIDR ranges announced by an organization
asnmap -org "EXAMPLE-ORG"

# Look up by ASN, IP, or domain
asnmap -a AS64496
asnmap -i 93.184.216.34
asnmap -d example.com

# Feed the ranges into port scanning (only for ranges you are authorized to scan)
asnmap -d example.com -silent | naabu -top-ports 100 -rate 300
```

---

## 🕸️ Crawling and Content Discovery

### katana

**Purpose:** Crawl web applications to map endpoints, parameters, and JavaScript-referenced routes  
**Difficulty:** Intermediate  
**Link:** https://github.com/projectdiscovery/katana  
**Status:** Active — maintained by ProjectDiscovery

Modern apps hide most of their surface behind JavaScript. Katana's headless mode
executes the page and collects the endpoints a plain HTTP crawler never sees.

**Installation:**
```bash
go install -v github.com/projectdiscovery/katana/cmd/katana@latest
```

**Basic Usage:**
```bash
# Crawl a single target
katana -u https://example.com

# Headless crawling picks up JavaScript-rendered routes
katana -u https://example.com -headless

# Crawl a list, restrict scope, control depth
katana -list live.txt -depth 3 -field-scope rdn -silent

# Collect endpoints with parameters — good candidates for further testing
katana -u https://example.com -silent -f qurl | sort -u > params.txt
```

---

### gau (GetAllUrls)

**Purpose:** Pull historically-known URLs for a domain from public archives  
**Difficulty:** Beginner  
**Link:** https://github.com/lc/gau  
**Status:** Active

Wayback Machine, Common Crawl, and URLScan remember endpoints that no longer appear
anywhere on the live site — old admin paths, retired APIs, and forgotten parameters
that are often still reachable.

**Installation:**
```bash
go install -v github.com/lc/gau/v2/cmd/gau@latest
```

**Basic Usage:**
```bash
# Every archived URL known for a domain
gau example.com

# Include subdomains, drop static file noise
gau --subs --blacklist png,jpg,gif,css,woff example.com

# Check which archived endpoints are still live
gau --subs example.com | httpx -silent -mc 200
```

---

### ffuf

**Purpose:** High-speed fuzzing for content discovery, parameters, and virtual hosts  
**Difficulty:** Intermediate  
**Link:** https://github.com/ffuf/ffuf  
**Status:** Active

Where crawling ends, fuzzing begins: ffuf finds the paths nothing links to. Its
filtering options are the important part — without them you drown in false positives.

**Installation:**
```bash
go install github.com/ffuf/ffuf/v2@latest

# Wordlists (SecLists is the common source)
git clone --depth 1 https://github.com/danielmiessler/SecLists.git
```

**Basic Usage:**
```bash
# Directory and file discovery
ffuf -u https://example.com/FUZZ -w /path/to/wordlist.txt

# Filter out the "everything returns 200" case by response size
ffuf -u https://example.com/FUZZ -w wordlist.txt -fs 4242

# Match only interesting status codes, and stay polite
ffuf -u https://example.com/FUZZ -w wordlist.txt -mc 200,204,301,302,401,403 -rate 50

# Virtual host discovery
ffuf -u https://example.com -H "Host: FUZZ.example.com" -w subdomains.txt -fs 0
```

---

## 🎯 Vulnerability Scanning

### nuclei

**Purpose:** Template-driven scanning for known vulnerabilities, exposures, and misconfigurations  
**Difficulty:** Intermediate to Advanced  
**Link:** https://github.com/projectdiscovery/nuclei  
**Status:** Active — maintained by ProjectDiscovery

The single most important tool in a modern ASM stack. Nuclei turns "we found 400 live
services" into "these eleven have a known problem". Detection logic lives in YAML
templates maintained by a large community, so coverage tracks new CVEs quickly, and
you can write templates for issues specific to your own estate.

**Installation:**
```bash
go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest

# Fetch/refresh the community templates
nuclei -update-templates
```

**Basic Usage:**
```bash
# Scan a list of live hosts
nuclei -list live.txt

# Start with high-signal findings only
nuclei -list live.txt -severity critical,high

# Restrict to a category of checks
nuclei -list live.txt -tags exposure,misconfiguration
nuclei -list live.txt -tags cve -severity critical

# Be respectful: cap concurrency and request rate
nuclei -list live.txt -rate-limit 50 -concurrency 10
```

**Pipeline and Reporting:**
```bash
# End-to-end: discover -> probe -> scan
subfinder -d example.com -silent \
  | httpx -silent \
  | nuclei -severity critical,high -o findings.txt

# JSONL output for correlation and ticketing
nuclei -list live.txt -jsonl -o findings.jsonl
jq -r '[.info.severity, .info.name, .host] | @tsv' findings.jsonl | sort

# Run only your own templates
nuclei -list live.txt -t ./custom-templates/
```

---

## 🔑 Secret and Credential Discovery

### TruffleHog

**Purpose:** Find leaked credentials in repositories, filesystems, and cloud storage — and verify whether they still work  
**Difficulty:** Intermediate  
**Link:** https://github.com/trufflesecurity/trufflehog  
**Status:** Active

The differentiator is verification. Most secret scanners produce a pile of maybes;
TruffleHog attempts authentication against the relevant provider and tells you which
credentials are actually live, which is the difference between a report and an incident.

**Installation:**
```bash
# Install script
curl -sSfL https://raw.githubusercontent.com/trufflesecurity/trufflehog/main/scripts/install.sh \
  | sh -s -- -b /usr/local/bin

# Alternatives
brew install trufflehog
docker run --rm -it trufflesecurity/trufflehog:latest --help
```

**Basic Usage:**
```bash
# Scan a GitHub organization, reporting only verified-live secrets
trufflehog github --org=example-org --only-verified

# Scan a repository's full history
trufflehog git https://github.com/example/repo --only-verified

# Scan a local checkout or directory
trufflehog filesystem ./src --only-verified

# Scan an S3 bucket
trufflehog s3 --bucket=example-bucket --only-verified
```

---

### Gitleaks

**Purpose:** Detect hardcoded secrets in git history and block new ones in CI  
**Difficulty:** Beginner  
**Link:** https://github.com/gitleaks/gitleaks  
**Status:** Active

Complements TruffleHog: fast, rule-based, and designed to run as a pre-commit hook or
CI gate so secrets are caught before they are ever published.

**Installation:**
```bash
brew install gitleaks

# Or via Docker
docker run --rm -v "$(pwd):/path" zricethezav/gitleaks:latest detect --source="/path"
```

**Basic Usage:**
```bash
# Scan a repository's history
gitleaks detect --source . --verbose

# Scan only uncommitted changes (pre-commit use)
gitleaks protect --staged --verbose

# Machine-readable report for CI
gitleaks detect --source . --report-format json --report-path leaks.json

# Apply organization-specific rules
gitleaks detect --source . --config .gitleaks.toml
```

---

## 🤖 Frameworks and Orchestration

### BBOT

**Purpose:** Recursive OSINT and attack-surface framework that chains many modules automatically  
**Difficulty:** Advanced  
**Link:** https://github.com/blacklanternsecurity/bbot  
**Status:** Active

Where the tools above each do one step, BBOT runs the whole graph: a discovered
subdomain feeds port scanning, which feeds web probing, which feeds secret hunting —
recursively, until the surface stops growing. Powerful and noisy; understand what
each preset enables before pointing it at anything.

**Installation:**
```bash
pipx install bbot

# Or with pip
pip install bbot
```

**Basic Usage:**
```bash
# Passive subdomain enumeration only
bbot -t example.com -p subdomain-enum -rf passive

# Subdomain enumeration plus web probing
bbot -t example.com -p subdomain-enum web-basic

# List available modules and presets before running anything active
bbot -l
bbot -lp
```

---

### uncover

**Purpose:** Query Shodan, Censys, FOFA, and other engines from one command line  
**Difficulty:** Beginner  
**Link:** https://github.com/projectdiscovery/uncover  
**Status:** Active — maintained by ProjectDiscovery

Finds exposed hosts using data that has already been collected, so nothing you do
touches the target. Requires API keys for the engines you enable.

**Installation:**
```bash
go install -v github.com/projectdiscovery/uncover/cmd/uncover@latest
```

**Basic Usage:**
```bash
# Query Shodan and Censys together
uncover -q 'ssl:"example.com"' -e shodan,censys

# Find hosts by service banner
uncover -q 'title:"phpMyAdmin"' -e shodan -limit 100

# Chain results into probing
uncover -q 'ssl:"example.com"' -silent | httpx -silent -title
```

---

### notify

**Purpose:** Pipe tool output to Slack, Discord, Telegram, or a webhook  
**Difficulty:** Beginner  
**Link:** https://github.com/projectdiscovery/notify  
**Status:** Active — maintained by ProjectDiscovery

Turns a scheduled scan into actual monitoring. Without a delivery mechanism,
continuous discovery just writes files nobody reads.

**Installation:**
```bash
go install -v github.com/projectdiscovery/notify/cmd/notify@latest
```

**Basic Usage:**
```bash
# Send findings to your configured provider
nuclei -list live.txt -severity critical,high -silent | notify -bulk

# Alert only on newly discovered assets (see Change Tracking)
subfinder -d example.com -silent | anew known-subs.txt | notify -bulk
```

---

## ☁️ Cloud Asset Inventory

### cloudlist

**Purpose:** List assets across cloud providers using read-only credentials  
**Difficulty:** Intermediate  
**Link:** https://github.com/projectdiscovery/cloudlist  
**Status:** Active — maintained by ProjectDiscovery

The inside-out complement to external discovery. Comparing what the provider says you
own against what external enumeration found is how you spot both shadow IT and assets
you forgot to decommission.

**Installation:**
```bash
go install -v github.com/projectdiscovery/cloudlist/cmd/cloudlist@latest
```

**Basic Usage:**
```bash
# List assets from every configured provider
cloudlist

# Restrict to one provider
cloudlist -provider aws

# Hosts only, piped into probing
cloudlist -silent -host | httpx -silent -title

# Reconcile: what exists externally but not in your cloud inventory?
cloudlist -silent -host | sort -u > inventory.txt
comm -23 external-hosts.txt inventory.txt   # candidates for shadow IT
```

---

## 🔗 Putting It Together

A complete external assessment using the tools above:

```bash
#!/usr/bin/env bash
# Only run against domains you own or are authorized to test.
set -euo pipefail
DOMAIN="$1"
OUT="asm-$DOMAIN-$(date +%F)"
mkdir -p "$OUT"

# 1. Scope: which netblocks does this organization announce?
asnmap -d "$DOMAIN" -silent > "$OUT/ranges.txt" || true

# 2. Discover names
subfinder -d "$DOMAIN" -silent | tee "$OUT/subdomains.txt" \
  | dnsx -silent -a -resp-only | sort -u > "$OUT/resolved.txt"

# 3. Expand scope from certificates
httpx -l "$OUT/subdomains.txt" -silent | tlsx -silent -san -resp-only \
  | sort -u >> "$OUT/subdomains.txt"

# 4. Find live web services
httpx -l "$OUT/subdomains.txt" -silent -status-code -title -tech-detect \
  -o "$OUT/live.txt"

# 5. Scan for known issues, politely
nuclei -l "$OUT/live.txt" -severity critical,high \
  -rate-limit 50 -jsonl -o "$OUT/findings.jsonl"

# 6. Alert on anything critical
jq -r 'select(.info.severity=="critical") | .host' "$OUT/findings.jsonl" \
  | notify -bulk || true

echo "Results in $OUT/"
```

**See also:** [Recon Tools](recon_tools.md) for the foundational tools,
[Cloud Enumeration Tools](cloud_enum_tools.md) for provider-specific work, and the
[Command Cheat Sheet](../resources/command_cheatsheet.md) for individual commands.
