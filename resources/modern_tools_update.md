# Modern ASM Tools Update 2025

This document provides updates on modern ASM tools, newer alternatives to legacy tools, and emerging technologies in the attack surface management space.

## 🆕 Modern Tool Alternatives

### Subdomain Discovery - Next Generation

#### ProjectDiscovery Suite (Recommended)
**Modern replacement for:** Traditional subdomain enumeration tools

**Subfinder v2.6+**
```bash
# Install latest version
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest

# Enhanced features in 2024/2025
subfinder -d example.com -all -recursive -o subdomains.txt

# New passive sources integration
subfinder -d example.com -sources shodan,censys,virustotal,securitytrails

# JSON output with metadata
subfinder -d example.com -json -o results.json
```

**Chaos (ProjectDiscovery)**
```bash
# Install
go install -v github.com/projectdiscovery/chaos-client/cmd/chaos@latest

# Massive subdomain dataset
chaos -d example.com -o chaos_subdomains.txt

# API integration
chaos -key YOUR_API_KEY -d example.com
```

#### Amass v4+ (Major Updates)
**What's New in 2024/2025:**
```bash
# New architecture with better performance
amass enum -passive -d example.com -timeout 30

# Enhanced data sources
amass enum -passive -d example.com -src crtsh,hackertarget,virustotal,securitytrails,chaos

# Better output formats
amass enum -passive -d example.com -json output.json

# Improved visualization
amass viz -d3 -d example.com
```

### Web Discovery - Modern Approaches

#### httpx v1.3+ (Replaces httprobe)
**Enhanced Features:**
```bash
# Advanced probing with technology detection
httpx -l subdomains.txt -tech-detect -status-code -title

# Response analysis
httpx -l subdomains.txt -content-length -response-time -jarm

# Advanced filtering
httpx -l subdomains.txt -match-code 200,403 -filter-code 404

# Pipeline integration
subfinder -d example.com -silent | httpx -silent -tech-detect
```

#### Katana (Web Crawler - 2024)
**Purpose:** Modern web crawler replacing older tools
```bash
# Install
go install github.com/projectdiscovery/katana/cmd/katana@latest

# Advanced crawling
katana -u https://example.com -depth 3 -js-crawl

# API endpoint discovery
katana -u https://example.com -field endpoint -silent

# Integration with other tools
echo "https://example.com" | katana -silent | httpx -silent
```

### Port Scanning - Modern Alternatives

#### Naabu (Fast Port Scanner)
**Modern replacement for:** Masscan in many scenarios
```bash
# Install
go install -v github.com/projectdiscovery/naabu/v2/cmd/naabu@latest

# Fast scanning with better accuracy
naabu -host example.com -top-ports 1000

# Integration with nmap
naabu -host example.com -nmap-cli 'nmap -sV -sC'

# Multiple hosts
naabu -list hosts.txt -port 80,443,8080,8443
```

#### RustScan (Rust-based Scanner)
**Modern alternative to:** Traditional port scanners
```bash
# Install
cargo install rustscan

# Ultra-fast scanning
rustscan -a example.com -- -sV -sC

# Batch scanning
rustscan -a example.com -p 1-65535 --ulimit 5000
```

### Cloud Enumeration - 2025 Updates

#### CloudFox (AWS Focus)
**Purpose:** Modern AWS enumeration and privilege escalation
```bash
# Install
go install github.com/BishopFox/cloudfox@latest

# AWS enumeration
cloudfox aws --profile default all-checks

# Specific checks
cloudfox aws --profile default principals
cloudfox aws --profile default permissions
```

#### ScoutSuite v5.12+ (Multi-Cloud)
**Enhanced Features:**
```bash
# Install latest
pip install scoutsuite

# Enhanced reporting
scout aws --report-name company_audit_2025 --exceptions exceptions.json

# Custom rules
scout aws --ruleset custom_rules_2025.json

# Multiple accounts
scout aws --profile prod --profile dev --profile staging
```

#### Prowler v3+ (Cloud Security)
**Modern replacement for:** Basic cloud auditing tools
```bash
# Install
pip install prowler

# AWS comprehensive scan
prowler aws

# Specific compliance frameworks
prowler aws --compliance cis_2.0 --compliance pci_3.2.1

# Output formats
prowler aws --output-formats json,csv,html
```

### OSINT - Modern Platforms

#### Spiderfoot v4+ (Automated OSINT)
**Enhanced automation:**
```bash
# Install
pip install spiderfoot

# Web interface
spiderfoot -l 127.0.0.1:5001

# CLI scanning
spiderfoot -s example.com -t DOMAIN_NAME -o json
```

#### Maltego CE 4.5+ (Visual OSINT)
**Modern features:**
- Enhanced data sources
- Better API integrations
- Improved visualization
- Cloud-based transforms

#### TheHarvester v4+ (Updated)
**New data sources and features:**
```bash
# Enhanced sources
theHarvester -d example.com -b all -f results.html

# New sources: anubis, baidu, binaryedge, bufferoverun
theHarvester -d example.com -b anubis,binaryedge,bufferoverun

# API integration improvements
theHarvester -d example.com -b shodan -k YOUR_SHODAN_KEY
```

## 🔄 Deprecated Tools and Replacements

### Legacy Tools to Avoid

#### Aquatone (Deprecated 2023)
**Status:** No longer maintained
**Replacement:** GoWitness or EyeWitness
```bash
# Instead of Aquatone, use:
gowitness file -f urls.txt
# or
python3 EyeWitness.py -f urls.txt
```

#### Sublist3r (Outdated)
**Status:** Limited sources, slow updates
**Replacement:** Subfinder or Amass
```bash
# Instead of Sublist3r, use:
subfinder -d example.com -all
# or
amass enum -passive -d example.com
```

#### Knockpy (Outdated)
**Status:** Limited functionality
**Replacement:** Modern subdomain tools
```bash
# Instead of Knockpy, use:
subfinder -d example.com | httpx -silent
```

### Tools with Modern Alternatives

#### Dirb/Dirbuster → Feroxbuster
```bash
# Install feroxbuster (Rust-based, faster)
cargo install feroxbuster

# Modern directory brute forcing
feroxbuster -u https://example.com -w /path/to/wordlist

# Advanced features
feroxbuster -u https://example.com -x php,html,js -t 50
```

#### Gobuster → Ffuf
```bash
# Install ffuf (Go-based, more flexible)
go install github.com/ffuf/ffuf@latest

# Directory fuzzing
ffuf -w /path/to/wordlist -u https://example.com/FUZZ

# Parameter fuzzing
ffuf -w params.txt -u https://example.com/page?FUZZ=value

# Subdomain fuzzing
ffuf -w subdomains.txt -u https://FUZZ.example.com
```

## 🚀 Emerging Technologies (2024-2025)

### AI-Powered Reconnaissance

#### GPT-Assisted OSINT
```python
# Example: AI-powered subdomain generation
import openai

def generate_subdomains(company_name, industry):
    prompt = f"""
    Generate potential subdomain names for {company_name} in the {industry} industry.
    Consider common patterns like: dev, staging, api, admin, test, etc.
    """
    
    response = openai.Completion.create(
        engine="gpt-4",
        prompt=prompt,
        max_tokens=200
    )
    
    return response.choices[0].text.strip().split('\n')
```

#### Machine Learning for Asset Classification
```python
# Example: ML-based service classification
from sklearn.ensemble import RandomForestClassifier
import pandas as pd

def classify_services(port_scan_results):
    # Train model on known service patterns
    model = RandomForestClassifier()
    
    # Features: port, banner, response_time, etc.
    features = extract_features(port_scan_results)
    
    # Predict service types
    predictions = model.predict(features)
    
    return predictions
```

### Container and Kubernetes Discovery

#### Peirates (Kubernetes Penetration Testing)
```bash
# Install
go install github.com/inguardians/peirates@latest

# Kubernetes enumeration
peirates
```

#### Kube-hunter (Kubernetes Security)
```bash
# Install
pip install kube-hunter

# Network scanning for K8s
kube-hunter --remote some.ip.add.ress

# Pod scanning
kube-hunter --pod
```

### API Discovery and Testing

#### Arjun (HTTP Parameter Discovery)
```bash
# Install
pip install arjun

# Parameter discovery
arjun -u https://example.com/api/endpoint

# Wordlist-based discovery
arjun -u https://example.com/api -w params.txt
```

#### Postman/Newman (API Testing Automation)
```bash
# Install Newman
npm install -g newman

# Automated API testing
newman run api_collection.json -e environment.json
```

### Certificate Transparency Evolution

#### CertStream (Real-time CT Monitoring)
```python
import certstream

def print_callback(message, context):
    if message['message_type'] == "certificate_update":
        all_domains = message['data']['leaf_cert']['all_domains']
        for domain in all_domains:
            if 'target-company' in domain:
                print(f"New certificate: {domain}")

certstream.listen_for_events(print_callback)
```

#### CTSubfinder (Enhanced CT Search)
```bash
# Install
go install github.com/subfinder/ctsubfinder@latest

# Enhanced CT log searching
ctsubfinder -d example.com -o ct_results.txt
```

## 📊 Modern Workflow Integration

### CI/CD Integration

#### GitHub Actions ASM Workflow
```yaml
name: ASM Scan
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM

jobs:
  asm-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install tools
        run: |
          go install github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
          go install github.com/projectdiscovery/httpx/cmd/httpx@latest
          go install github.com/sensepost/gowitness@latest
      
      - name: Subdomain discovery
        run: |
          subfinder -d ${{ secrets.TARGET_DOMAIN }} -o subdomains.txt
      
      - name: Live host detection
        run: |
          httpx -l subdomains.txt -o live_hosts.txt
      
      - name: Screenshots
        run: |
          gowitness file -f live_hosts.txt
      
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: asm-results
          path: |
            subdomains.txt
            live_hosts.txt
            screenshots/
```

#### Docker-based ASM Pipeline
```dockerfile
FROM golang:1.21-alpine AS builder

# Install modern tools
RUN go install github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
RUN go install github.com/projectdiscovery/httpx/cmd/httpx@latest
RUN go install github.com/projectdiscovery/naabu/v2/cmd/naabu@latest
RUN go install github.com/sensepost/gowitness@latest

FROM alpine:latest
RUN apk add --no-cache ca-certificates
COPY --from=builder /go/bin/* /usr/local/bin/

# ASM scanning script
COPY asm_scan.sh /usr/local/bin/
ENTRYPOINT ["/usr/local/bin/asm_scan.sh"]
```

### Cloud-Native ASM

#### Kubernetes-based Scanning
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: asm-scanner
spec:
  schedule: "0 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: asm-scanner
            image: asm-tools:latest
            env:
            - name: TARGET_DOMAIN
              valueFrom:
                secretKeyRef:
                  name: asm-config
                  key: target-domain
            command: ["/usr/local/bin/asm_scan.sh"]
          restartPolicy: OnFailure
```

## 🔧 Tool Configuration Updates

### Modern API Integrations

#### Enhanced Shodan Integration
```python
import shodan
import asyncio
import aiohttp

class ModernShodanScanner:
    def __init__(self, api_key):
        self.api = shodan.Shodan(api_key)
    
    async def bulk_scan(self, queries):
        results = []
        for query in queries:
            try:
                result = self.api.search(query)
                results.append(result)
                await asyncio.sleep(1)  # Rate limiting
            except shodan.APIError as e:
                print(f"Error: {e}")
        return results
    
    def get_host_details(self, ip):
        return self.api.host(ip)
```

#### Modern Certificate Transparency
```python
import requests
import asyncio
import aiohttp

class ModernCTScanner:
    def __init__(self):
        self.ct_logs = [
            "https://crt.sh/?q=%.{}&output=json",
            "https://api.certspotter.com/v1/issuances?domain={}&include_subdomains=true"
        ]
    
    async def scan_domain(self, domain):
        async with aiohttp.ClientSession() as session:
            tasks = []
            for log_url in self.ct_logs:
                url = log_url.format(domain)
                tasks.append(self.fetch_ct_data(session, url))
            
            results = await asyncio.gather(*tasks)
            return self.parse_results(results)
    
    async def fetch_ct_data(self, session, url):
        async with session.get(url) as response:
            return await response.json()
```

## 📈 Performance Improvements

### Parallel Processing Examples

#### Modern Subdomain Enumeration
```bash
#!/bin/bash
# parallel_subdomain_enum.sh

DOMAIN="$1"
OUTPUT_DIR="parallel_enum_$(date +%Y%m%d_%H%M%S)"

mkdir -p "$OUTPUT_DIR"
cd "$OUTPUT_DIR"

# Run multiple tools in parallel
(
    subfinder -d "$DOMAIN" -o subfinder_results.txt &
    amass enum -passive -d "$DOMAIN" -o amass_results.txt &
    chaos -d "$DOMAIN" -o chaos_results.txt &
    wait
)

# Combine and deduplicate results
cat *_results.txt | sort -u > all_subdomains.txt

# Parallel live host detection
cat all_subdomains.txt | httpx -silent -threads 50 > live_hosts.txt

echo "Found $(wc -l < all_subdomains.txt) subdomains"
echo "Found $(wc -l < live_hosts.txt) live hosts"
```

#### Async Python Implementation
```python
import asyncio
import aiohttp
import subprocess
from concurrent.futures import ThreadPoolExecutor

class AsyncASMScanner:
    def __init__(self, max_workers=50):
        self.max_workers = max_workers
        self.semaphore = asyncio.Semaphore(max_workers)
    
    async def scan_subdomain(self, session, subdomain):
        async with self.semaphore:
            try:
                async with session.get(f"https://{subdomain}", 
                                     timeout=10) as response:
                    return {
                        'subdomain': subdomain,
                        'status': response.status,
                        'title': await self.extract_title(response)
                    }
            except Exception as e:
                return {'subdomain': subdomain, 'error': str(e)}
    
    async def bulk_scan(self, subdomains):
        async with aiohttp.ClientSession() as session:
            tasks = [self.scan_subdomain(session, sub) for sub in subdomains]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            return results
```

## 🎯 Best Practices for Modern ASM

### 1. Tool Selection Criteria (2025)
- **Active maintenance** - Regular updates and bug fixes
- **Community support** - Active GitHub issues and discussions
- **Performance** - Efficient resource usage
- **Integration** - API support and pipeline compatibility
- **Accuracy** - Low false positive rates

### 2. Modern Scanning Strategies
- **Distributed scanning** across multiple VPS/cloud instances
- **Time-based rotation** to avoid detection
- **API-first approach** for better integration
- **Container-based** for consistency and scalability

### 3. Data Management
- **Structured output** (JSON/CSV) for analysis
- **Database integration** for historical tracking
- **API endpoints** for result consumption
- **Automated reporting** with modern visualization

Remember: Always verify tool authenticity and check for the latest versions before use. The security tool landscape evolves rapidly, and staying current is essential for effective ASM.
