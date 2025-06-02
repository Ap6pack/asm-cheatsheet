# Build Your Own ASM Stack

This guide walks you through creating an open-source, self-hosted Attack Surface Management (ASM) system using practical tools and automation.

---

## Overview

An ASM stack should:

- Discover known and unknown assets  
- Monitor for changes to services or applications  
- Integrate threat intel and credential leak detection  
- Provide visual and historical context  
- Be automatable and modular  

---

## 1. Asset Discovery

Use these tools to map your external presence:

| Tool      | Function                                           |
|-----------|----------------------------------------------------|
| Amass     | Subdomain enumeration and DNS mapping              |
| Subfinder | Fast passive subdomain discovery                   |
| Shodan    | Port and banner search across the internet         |
| CT Logs   | Enumerate SAN and commonName fields in certs       |

---

## 2. Port and Service Enumeration

Scan discovered assets for open services and banners:

```bash
masscan -p1-65535 YOUR-IP-RANGE --rate=10000 -oG masscan.txt
nmap -iL masscan.txt -sV -oA nmap-output

````

Use `httpx` or `httprobe` to find live web services.

---

## 3. Screenshot and Visual Change Tracking

Automate screenshots and compare UI changes over time:

* Tools: Eyewitness, GoWitness, Aquatone
* Schedule daily runs and hash page output for diffs

```bash
gowitness file -f urls.txt
```

---

## 4. Historical and Risk Tracking

Ingest data into Elasticsearch or SQLite:

* Use Logstash or custom Python scripts
* Visualize with Kibana or Grafana
* Track:

  * Asset deltas (added or removed)
  * Port state changes
  * Web page hash diffs
  * Vulnerability matches

---

## 5. Credential Leak Monitoring

Use APIs or breach data to search for leaked secrets:

* GitHub API with Dorks
* Pastebin scraper
* Compromised credential lists (e.g., Have I Been Pwned)

Flag findings tied to your asset inventory.

---

## 6. Threat Intelligence Correlation

Map external CVEs, malware TTPs, or IOC feeds against your assets:

* Use feed aggregators: MISP, OpenCTI, IntelOwl
* Parse indicators and match on:

  * IP addresses
  * URLs
  * Component versions

---

## 7. Automation and Alerts

* Schedule tools using cron or systemd timers
* Alert via Slack, email, or dashboards
* Maintain scope and asset config in YAML or JSON

---

## Example Stack

* Recon: Amass, Shodan, Subfinder
* Port Scan: Masscan, Nmap
* Web: httpx, Eyewitness
* Data: Elasticsearch + Kibana
* Alerting: Slack via webhook
* Scripts: Python or Bash