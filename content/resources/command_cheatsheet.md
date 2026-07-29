# ASM Command Cheat Sheet

Quick reference for common Attack Surface Management commands and techniques.

## ⚠️ CRITICAL SECURITY WARNINGS

**🚨 AUTHORIZATION REQUIRED**: Only scan domains and IP addresses you own or have explicit written permission to test.

**🚨 RATE LIMITING**: Always use appropriate delays and rate limiting to avoid overwhelming target systems.

**🚨 LEGAL COMPLIANCE**: Ensure all scanning activities comply with local laws and regulations.

**🚨 RESPONSIBLE DISCLOSURE**: Report any vulnerabilities found through proper channels.

---

## 🔍 Subdomain Discovery

### Amass

OWASP's in-depth subdomain enumeration engine. Passive mode queries third-party sources without touching the target; active mode resolves and brute-forces and requires authorization.
```bash
# ⚠️ ALWAYS verify you have permission to scan the target domain

# Passive enumeration (RECOMMENDED - less intrusive)
amass enum -passive -d example.com

# Active enumeration with brute force (USE WITH CAUTION)
# Only use on domains you own - can be detected as malicious activity
amass enum -active -d example.com -brute

# Use specific data sources
amass enum -passive -d example.com -src crtsh,hackertarget

# Output to file
amass enum -passive -d example.com -o subdomains.txt

# Verbose output
amass enum -passive -d example.com -v

# Rate-limited scanning (RECOMMENDED for active scans)
amass enum -active -d example.com -max-dns-queries 200
```

### Subfinder

Fast passive subdomain discovery from ProjectDiscovery. Built for pipelines — pipe its output straight into httpx or nmap.
```bash
# Basic subdomain discovery
subfinder -d example.com

# Use all sources
subfinder -d example.com -all

# Output to file
subfinder -d example.com -o subdomains.txt

# Silent mode (only results)
subfinder -d example.com -silent

# Multiple domains from file
subfinder -dL domains.txt
```

### Certificate Transparency

Public CT logs record every TLS certificate issued for your domains, making them the fastest way to find forgotten or shadow-IT hosts without sending a single packet to the target.
```bash
# Using curl with crt.sh
curl -s "https://crt.sh/?q=%.example.com&output=json" | jq -r '.[].name_value' | sort -u

# Using certspotter
certspotter example.com

# Using ctfr
python3 ctfr.py -d example.com
```

## 🌐 Web Service Discovery

### httpx

Probes a list of hosts to find which are serving live HTTP services, and fingerprints status codes, titles, and technologies as it goes.
```bash
# Probe for live hosts
httpx -l subdomains.txt

# Check specific ports
httpx -l subdomains.txt -ports 80,443,8080,8443

# Get response codes and titles
httpx -l subdomains.txt -status-code -title

# Follow redirects
httpx -l subdomains.txt -follow-redirects

# Custom headers
httpx -l subdomains.txt -H "User-Agent: Custom-Bot"

# Output to file
httpx -l subdomains.txt -o live_hosts.txt

# JSON output
httpx -l subdomains.txt -json -o results.json
```

### httprobe

A minimal alternative to httpx that answers one question quickly: which of these hosts respond over HTTP/HTTPS?
```bash
# Basic probing
cat subdomains.txt | httprobe

# Custom ports
cat subdomains.txt | httprobe -p http:8080 -p https:8443

# Timeout settings
cat subdomains.txt | httprobe -t 3000

# Concurrent requests
cat subdomains.txt | httprobe -c 50
```

## 🔌 Port Scanning

### Nmap

The standard port and service scanner. Version detection (-sV) turns an open port into an identified, fingerprinted service you can act on.
```bash
# ⚠️ WARNING: Port scanning can be detected and may be illegal without permission
# ⚠️ ALWAYS ensure you have written authorization before scanning

# Basic TCP scan (REQUIRES AUTHORIZATION)
nmap -sS target.com

# Top 1000 ports
nmap --top-ports 1000 target.com

# Service version detection
nmap -sV target.com

# OS detection (can be intrusive)
nmap -O target.com

# Aggressive scan (VERY INTRUSIVE - use only on your own systems)
nmap -A target.com

# Scan from file
nmap -iL hosts.txt

# Output formats
nmap -oA scan_results target.com  # All formats
nmap -oN scan.nmap target.com     # Normal
nmap -oX scan.xml target.com      # XML
nmap -oG scan.gnmap target.com    # Greppable

# RECOMMENDED: Respectful scanning with rate limiting
nmap -T2 --max-rate 100 target.com  # Slow and respectful

# Stealth scan (still detectable)
nmap -sS -T2 target.com

# UDP scan (can be very slow)
nmap -sU --top-ports 100 target.com

# Script scanning (can trigger security alerts)
nmap --script vuln target.com
nmap --script http-enum target.com

# SAFE PRACTICE: Always include delays
nmap --scan-delay 1s target.com
```

### Masscan

Internet-scale port scanning at very high packet rates. Powerful and easy to misuse — always rate-limit and only scan what you are authorized to touch.
```bash
# Fast port scan
masscan -p1-65535 192.168.1.0/24 --rate=1000

# Specific ports
masscan -p80,443,8080,8443 192.168.1.0/24 --rate=1000

# Output to file
masscan -p1-65535 192.168.1.0/24 --rate=1000 -oG masscan.txt

# Banner grabbing
masscan -p80,443 192.168.1.0/24 --banners --rate=1000
```

## 📸 Screenshots

### GoWitness

Captures screenshots of discovered web services in bulk so you can visually triage hundreds of hosts and spot login portals, default pages, and exposed dashboards.
```bash
# Screenshot from file
gowitness file -f urls.txt

# Single URL
gowitness single https://example.com

# Screenshot with custom resolution
gowitness file -f urls.txt -X 1920 -Y 1080

# Custom timeout
gowitness file -f urls.txt -T 30

# Custom user agent
gowitness file -f urls.txt --user-agent "Custom-Bot"

# Generate report
gowitness report generate
```

### Aquatone

Screenshots and clusters similar-looking web services together, which makes patterns across a large attack surface obvious at a glance.
```bash
# Basic screenshots
cat hosts.txt | aquatone

# Custom ports
cat hosts.txt | aquatone -ports 80,443,8080,8443

# Custom threads
cat hosts.txt | aquatone -threads 5

# Custom timeout
cat hosts.txt | aquatone -timeout 300
```

### EyeWitness

Screenshots web services and generates a categorized report, with the ability to flag default credentials and interesting pages.
```bash
# Screenshot from file
python3 EyeWitness.py -f urls.txt

# Web application scan
python3 EyeWitness.py -f urls.txt --web

# Custom timeout
python3 EyeWitness.py -f urls.txt --timeout 30

# Custom user agent
python3 EyeWitness.py -f urls.txt --user-agent "Custom-Bot"
```

## 🔎 Search Engine Reconnaissance

### Shodan

A search engine over internet-wide scan data. Finds your exposed services from the outside, using data already collected — no scanning of your own required.
```bash
# Install Shodan CLI
pip install shodan

# Initialize with API key
shodan init YOUR_API_KEY

# Search for organization
shodan search "org:Example Corp"

# Search by hostname
shodan search hostname:example.com

# Search by IP
shodan host 8.8.8.8

# Search by service
shodan search "apache"

# Search by port
shodan search port:22

# Download search results
shodan download results "org:Example Corp"

# Parse downloaded data
shodan parse results.json.gz
```

### Google Dorking

Targeted search-engine operators that surface indexed files, directory listings, and login pages an organization never meant to publish.
```bash
# Site-specific search
site:example.com

# File type search
site:example.com filetype:pdf

# Exclude subdomains
site:example.com -site:www.example.com

# Find login pages
site:example.com inurl:login

# Find admin panels
site:example.com inurl:admin

# Find configuration files
site:example.com filetype:xml | filetype:conf | filetype:cnf

# Find database files
site:example.com filetype:sql | filetype:dbf | filetype:mdb
```

## 🕵️ OSINT and Information Gathering

### theHarvester

Collects emails, subdomains, and hostnames from public sources — a fast way to sketch an organization's footprint before any active work.
```bash
# Email harvesting
theHarvester -d example.com -b google

# Multiple sources
theHarvester -d example.com -b google,bing,yahoo

# Limit results
theHarvester -d example.com -l 100 -b google

# Save to file
theHarvester -d example.com -b google -f results.html
```

### Recon-ng

A modular reconnaissance framework with a workspace and database model, useful for organizing findings across a longer engagement.
```bash
# Start recon-ng
recon-ng

# Create workspace
workspaces create example_corp

# Add domain
db insert domains example.com

# Load module
modules load recon/domains-hosts/hackertarget

# Run module
run

# Show results
show hosts
```

### Whois

Registration and ownership data for domains and IP ranges — establishes what an organization actually owns before you scope anything.
```bash
# Basic whois lookup
whois example.com

# Specific whois server
whois -h whois.arin.net 8.8.8.8

# Reverse whois
whois "Example Corp"
```

## ☁️ Cloud Asset Discovery

### CloudEnum

Enumerates public cloud assets across AWS, Azure, and GCP — storage buckets, apps, and containers that are reachable without credentials.
```bash
# AWS enumeration
python3 cloud_enum.py -k example

# Multi-cloud enumeration
python3 cloud_enum.py -k example --aws --azure --gcp

# Custom mutations
python3 cloud_enum.py -k example -m mutations.txt

# Disable SSL verification
python3 cloud_enum.py -k example --disable-ssl
```

### S3 Bucket Discovery

Finds object-storage buckets and checks whether they are publicly readable. Misconfigured buckets remain one of the most common sources of data exposure.
```bash
# Using aws cli
aws s3 ls s3://example-bucket --no-sign-request

# Using curl
curl -I https://example-bucket.s3.amazonaws.com/

# Bucket enumeration with gobuster
gobuster s3 -w bucket_names.txt
```

## 🔧 Data Processing and Analysis

### Text Processing

The unix glue that turns raw tool output into a clean, deduplicated asset list ready for the next stage of the pipeline.
```bash
# Sort and remove duplicates
sort -u subdomains.txt > unique_subdomains.txt

# Count lines
wc -l subdomains.txt

# Extract domains from URLs
cat urls.txt | sed 's|https\?://||g' | cut -d'/' -f1

# Filter by pattern
grep "\.example\.com$" all_domains.txt

# Remove specific patterns
grep -v "www\." subdomains.txt

# Extract IPs from nmap output
grep -oE "\b([0-9]{1,3}\.){3}[0-9]{1,3}\b" nmap_output.txt
```

### JSON Processing with jq

Most modern security tools emit JSON. jq filters and reshapes it so results can be correlated and chained between tools.
```bash
# Extract specific fields
cat results.json | jq '.[] | .url'

# Filter by status code
cat results.json | jq '.[] | select(.status_code == 200)'

# Count results
cat results.json | jq '. | length'

# Extract unique values
cat results.json | jq -r '.[].domain' | sort -u
```

## 🔄 Automation and Monitoring

### Cron Jobs

Schedules recurring scans so discovery becomes continuous monitoring rather than a one-time snapshot.
```bash
# Edit crontab
crontab -e

# Daily subdomain discovery
0 2 * * * /path/to/amass enum -passive -d example.com -o /path/to/daily_subdomains.txt

# Weekly port scan
0 3 * * 0 /usr/bin/nmap -iL /path/to/hosts.txt -oA /path/to/weekly_scan

# Hourly change monitoring
0 * * * * /usr/bin/python3 /path/to/monitor_changes.py /path/to/urls.txt
```

### Watch Command

Re-runs a command on an interval for live observation — useful while validating a change or watching a scan progress.
```bash
# Monitor file changes
watch -n 60 'wc -l subdomains.txt'

# Monitor process
watch -n 5 'ps aux | grep nmap'

# Monitor network connections
watch -n 2 'netstat -tuln'
```

## 🛡️ Security and Rate Limiting

### ⚠️ MANDATORY: Rate Limiting and Respectful Scanning

Pacing controls that keep reconnaissance from degrading the systems you are testing. Aggressive scanning can amount to a denial of service even against authorized targets.

```bash
# ALWAYS add delays between requests to avoid overwhelming targets
for url in $(cat urls.txt); do
    echo "Checking: $url"
    curl -I "$url"
    sleep 2  # Minimum 2-second delay
done

# Random delays (RECOMMENDED for larger scans)
for url in $(cat urls.txt); do
    echo "Checking: $url"
    curl -I "$url"
    sleep $((RANDOM % 5 + 3))  # 3-8 second random delay
done

# Rate limiting with specific tools
# Amass rate limiting
amass enum -passive -d example.com -max-dns-queries 100

# Nmap rate limiting
nmap --max-rate 50 --scan-delay 1s target.com

# httpx rate limiting
httpx -l urls.txt -rate-limit 10  # 10 requests per second max

# Masscan rate limiting
masscan -p80,443 192.168.1.0/24 --rate=100  # Very conservative rate
```

### Authorization Verification

Checks that confirm you are scanning assets you actually own or have written permission to test, before any traffic is sent.
```bash
# ALWAYS verify authorization before scanning
echo "⚠️  AUTHORIZATION CHECK ⚠️"
echo "Do you have written permission to scan $TARGET? (y/N)"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "❌ Scanning aborted - Authorization required"
    exit 1
fi
echo "✅ Proceeding with authorized scan..."
```

### Proxy Usage

Routes traffic through a proxy for inspection, logging, or to respect an engagement's required egress path.
```bash
# Using proxychains
proxychains nmap -sS target.com

# Using curl with proxy
curl --proxy socks5://127.0.0.1:9050 https://example.com

# Using wget with proxy
wget --proxy=on --proxy-user=user --proxy-password=pass https://example.com
```

## 📊 Reporting and Visualization

### Generate HTML Reports

Turns raw findings into a shareable report — the step that converts a scan into something a stakeholder can act on.
```bash
# Convert nmap XML to HTML
xsltproc nmap_scan.xml -o report.html

# Generate simple HTML from text
echo "<html><body><pre>" > report.html
cat results.txt >> report.html
echo "</pre></body></html>" >> report.html
```

### CSV Export

Flattens findings into CSV for spreadsheets, ticketing imports, and diffing results between runs.
```bash
# Convert to CSV
echo "URL,Status,Title" > results.csv
cat results.txt | awk '{print $1","$2","$3}' >> results.csv
```

## ⚠️ Legal and Ethical Guidelines

### Before You Scan - MANDATORY CHECKLIST
```bash
# 1. Verify ownership or authorization
echo "✅ I own this domain/IP or have written permission"
echo "✅ I have reviewed applicable laws and regulations"
echo "✅ I will use respectful rate limiting"
echo "✅ I will report findings responsibly"
echo "✅ I will not exploit any vulnerabilities found"
```

### Safe Practice Targets
```bash
# Use these for learning and testing (always verify current authorization)
scanme.nmap.org          # Nmap's official test target
testphp.vulnweb.com      # Acunetix test site
hack-yourself-first.com  # Troy Hunt's test site

# Your own infrastructure
yourdomain.com           # Only scan what you own
localhost               # Local testing
192.168.1.0/24          # Your local network
```

### Incident Response
```bash
# If you accidentally scan unauthorized targets:
# 1. Stop scanning immediately
# 2. Document what was scanned
# 3. Contact the target organization
# 4. Provide full disclosure of activities
# 5. Cooperate with any investigation
```

## 🚨 Common Troubleshooting

### Permission Issues

Fixes for the most common permission failures when running security tooling — executable bits and privileged operations like SYN scans.
```bash
# Make scripts executable
chmod +x script.sh

# Run with sudo if needed
sudo nmap -sS target.com
```

### Network Issues

First-line connectivity and DNS checks for when a scan returns nothing and you need to tell 'no results' from 'no route'.
```bash
# Test connectivity
ping -c 4 target.com

# Check DNS resolution
nslookup target.com

# Test specific port
telnet target.com 80
nc -zv target.com 80
```

### Tool Installation

Common installation fixes across Go, Python, and package-manager based security tooling.
```bash
# Update package lists
sudo apt update

# Install Go tools
go install github.com/projectdiscovery/httpx/cmd/httpx@latest

# Add Go bin to PATH
export PATH=$PATH:$(go env GOPATH)/bin

# Install Python tools
pip3 install shodan

# Install from source
git clone https://github.com/tool/repo.git
cd repo
make install
