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
```bash
# Convert nmap XML to HTML
xsltproc nmap_scan.xml -o report.html

# Generate simple HTML from text
echo "<html><body><pre>" > report.html
cat results.txt >> report.html
echo "</pre></body></html>" >> report.html
```

### CSV Export
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
```bash
# Make scripts executable
chmod +x script.sh

# Run with sudo if needed
sudo nmap -sS target.com
```

### Network Issues
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
