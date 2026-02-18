# Reconnaissance Tools

These tools help identify external assets, perform passive enumeration, and uncover shadow IT.

## 🔍 Subdomain Discovery Tools

### Amass
**Purpose:** Comprehensive DNS enumeration and network mapping  
**Difficulty:** Beginner to Advanced  
**Link:** https://github.com/owasp-amass/amass

**Installation:**
```bash
# Go installation
go install -v github.com/owasp-amass/amass/v4/...@master

# Package managers
sudo apt install amass          # Ubuntu/Debian
brew install amass              # macOS
sudo snap install amass         # Snap
```

**Basic Usage:**
```bash
# Passive enumeration (safe, no direct contact)
amass enum -passive -d example.com

# Active enumeration with brute force
amass enum -active -d example.com -brute

# Use specific data sources
amass enum -passive -d example.com -src crtsh,hackertarget,virustotal

# Output to file with verbose logging
amass enum -passive -d example.com -o subdomains.txt -v

# Multiple domains from file
amass enum -passive -df domains.txt
```

**Advanced Techniques:**
```bash
# Custom configuration file
amass enum -passive -d example.com -config /path/to/config.ini

# Specify resolvers
amass enum -passive -d example.com -rf resolvers.txt

# Include IP addresses in output
amass enum -passive -d example.com -ip

# Database operations
amass db -names -d example.com          # List discovered names
amass db -show -d example.com            # Show all data
amass viz -d3 -d example.com             # Generate D3.js visualization
```

**Configuration Example:**
```ini
# ~/.config/amass/config.ini
[scope]
address = 192.168.1.0/24
cidr = 192.168.1.0/24
port = 80,443,8080,8443

[data_sources]
[data_sources.AlienVault]
[data_sources.AlienVault.Credentials]
apikey = your_api_key_here

[data_sources.Shodan]
[data_sources.Shodan.Credentials]
apikey = your_shodan_api_key
```

### Subfinder
**Purpose:** Fast passive subdomain discovery  
**Difficulty:** Beginner  
**Link:** https://github.com/projectdiscovery/subfinder

**Installation:**
```bash
# Go installation
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest

# Download binary
wget https://github.com/projectdiscovery/subfinder/releases/download/v2.6.3/subfinder_2.6.3_linux_amd64.zip
```

**Usage Examples:**
```bash
# Basic discovery
subfinder -d example.com

# Use all available sources
subfinder -d example.com -all

# Multiple domains
subfinder -dL domains.txt

# Silent mode (only results)
subfinder -d example.com -silent

# Custom output format
subfinder -d example.com -o results.txt -oJ -nW

# Exclude specific sources
subfinder -d example.com -es shodan,censys
```

**API Configuration:**
```yaml
# ~/.config/subfinder/provider-config.yaml
shodan:
  - SHODAN_API_KEY
censys:
  - CENSYS_API_ID:CENSYS_API_SECRET
virustotal:
  - VIRUSTOTAL_API_KEY
```

## 🌐 Internet-Wide Scanning

### Shodan
**Purpose:** Internet-connected device search engine  
**Difficulty:** Intermediate  
**Link:** https://www.shodan.io

**Installation:**
```bash
# Python CLI
pip install shodan

# Initialize with API key
shodan init YOUR_API_KEY
```

**Basic Searches:**
```bash
# Search by organization
shodan search "org:Example Corp"

# Search by hostname
shodan search hostname:example.com

# Search by service
shodan search "apache"
shodan search "nginx"
shodan search "IIS"

# Search by port
shodan search port:22
shodan search port:3389

# Search by country
shodan search country:US
```

**Advanced Queries:**
```bash
# Combine multiple filters
shodan search "org:Example Corp" port:443 country:US

# Find specific vulnerabilities
shodan search vuln:CVE-2021-44228  # Log4j
shodan search vuln:CVE-2017-0144   # EternalBlue

# Search by HTTP headers
shodan search "Server: nginx" "X-Powered-By: PHP"

# Find default credentials
shodan search "default password"
shodan search "admin:admin"
```

**Programmatic Usage:**
```python
import shodan

api = shodan.Shodan('YOUR_API_KEY')

# Search for hosts
results = api.search('org:"Example Corp"')
for result in results['matches']:
    print(f"{result['ip_str']}:{result['port']} - {result.get('product', 'Unknown')}")

# Get host information
host = api.host('8.8.8.8')
print(f"Organization: {host.get('org', 'Unknown')}")
print(f"Operating System: {host.get('os', 'Unknown')}")
```

### Censys
**Purpose:** Internet-wide scanning and certificate transparency  
**Difficulty:** Intermediate  
**Link:** https://censys.io

**Installation:**
```bash
pip install censys
```

**Usage Examples:**
```bash
# Search certificates
censys search certificates "example.com"

# Search hosts
censys search hosts "services.service_name: HTTP"

# View specific host
censys view hosts 8.8.8.8
```

**Python API:**
```python
from censys.search import CensysHosts

h = CensysHosts(api_id="YOUR_API_ID", api_secret="YOUR_API_SECRET")

# Search for hosts
for page in h.search("services.service_name: HTTP", per_page=100, pages=5):
    for host in page:
        print(f"{host['ip']} - {host.get('location', {}).get('country', 'Unknown')}")
```

## 🕵️ OSINT and Information Gathering

### theHarvester
**Purpose:** Email, subdomain, and host OSINT gathering  
**Difficulty:** Beginner  
**Link:** https://github.com/laramies/theHarvester

**Installation:**
```bash
# Clone and install
git clone https://github.com/laramies/theHarvester.git
cd theHarvester
pip3 install -r requirements.txt

# Or via package manager
sudo apt install theharvester
```

**Basic Usage:**
```bash
# Email harvesting from Google
python3 theHarvester.py -d example.com -b google

# Multiple search engines
python3 theHarvester.py -d example.com -b google,bing,yahoo,duckduckgo

# Limit results
python3 theHarvester.py -d example.com -l 100 -b google

# Save results
python3 theHarvester.py -d example.com -b all -f results
```

**Advanced Options:**
```bash
# DNS brute force
python3 theHarvester.py -d example.com -b google -c

# Shodan integration
python3 theHarvester.py -d example.com -b shodan

# Screenshot taking
python3 theHarvester.py -d example.com -b google -s

# Verify hostnames
python3 theHarvester.py -d example.com -b google -v
```

### Recon-ng
**Purpose:** Full-featured reconnaissance framework  
**Difficulty:** Intermediate to Advanced  
**Link:** https://github.com/lanmaster53/recon-ng

**Installation:**
```bash
# Clone repository
git clone https://github.com/lanmaster53/recon-ng.git
cd recon-ng
pip install -r REQUIREMENTS

# Or via package manager
sudo apt install recon-ng
```

**Basic Workflow:**
```bash
# Start recon-ng
recon-ng

# Create workspace
workspaces create example_corp

# Add domains
db insert domains example.com
db insert domains subdomain.example.com

# Install modules
marketplace install all

# Load and run modules
modules load recon/domains-hosts/hackertarget
run

# View results
show hosts
show contacts
```

**Advanced Module Usage:**
```bash
# Certificate transparency
modules load recon/domains-hosts/certificate_transparency
run

# Shodan integration
modules load recon/hosts-hosts/shodan_hostname
keys add shodan_api YOUR_API_KEY
run

# Google dorking
modules load recon/domains-hosts/google_site_web
run

# Export results
modules load reporting/html
set FILENAME /tmp/report.html
run
```

## 🔧 Specialized Tools

### DNSRecon
**Purpose:** DNS enumeration and zone transfer testing  
**Difficulty:** Intermediate  
**Link:** https://github.com/darkoperator/dnsrecon

**Installation:**
```bash
git clone https://github.com/darkoperator/dnsrecon.git
cd dnsrecon
pip install -r requirements.txt
```

**Usage Examples:**
```bash
# Standard enumeration
python3 dnsrecon.py -d example.com

# Zone transfer attempt
python3 dnsrecon.py -d example.com -a

# Reverse lookup
python3 dnsrecon.py -r 192.168.1.0/24

# Brute force subdomains
python3 dnsrecon.py -d example.com -D subdomains.txt -t brt

# Cache snooping
python3 dnsrecon.py -d example.com -t snoop
```

### Fierce
**Purpose:** Domain scanner and subdomain brute forcer  
**Difficulty:** Beginner  
**Link:** https://github.com/mschwager/fierce

**Installation:**
```bash
pip install fierce
```

**Usage:**
```bash
# Basic scan
fierce --domain example.com

# Custom wordlist
fierce --domain example.com --wordlist custom_subdomains.txt

# Specify DNS servers
fierce --domain example.com --dns-servers 8.8.8.8,1.1.1.1

# Wide scan (more subdomains)
fierce --domain example.com --wide
```

## 🚨 Troubleshooting Common Issues

### Installation Problems

**Go tools not in PATH:**
```bash
# Add Go bin to PATH
export PATH=$PATH:$(go env GOPATH)/bin
echo 'export PATH=$PATH:$(go env GOPATH)/bin' >> ~/.bashrc
```

**Python dependency conflicts:**
```bash
# Use virtual environment
python3 -m venv asm_tools
source asm_tools/bin/activate
pip install -r requirements.txt
```

**Permission denied errors:**
```bash
# Make scripts executable
chmod +x script_name

# Install with user permissions
pip install --user package_name
```

### Runtime Issues

**DNS resolution failures:**
```bash
# Test DNS connectivity
nslookup example.com
dig example.com

# Use alternative DNS servers
echo "nameserver 8.8.8.8" >> /etc/resolv.conf
```

**Rate limiting and blocking:**
```bash
# Add delays between requests
sleep 1  # Add to scripts

# Use proxy chains
proxychains tool_name arguments

# Rotate user agents
curl -H "User-Agent: Mozilla/5.0..." url
```

**API key issues:**
```bash
# Verify API key
shodan info  # Check Shodan credits

# Test API connectivity
curl -H "Authorization: Bearer API_KEY" api_endpoint
```

### Performance Optimization

**Slow subdomain enumeration:**
```bash
# Use faster tools for initial discovery
subfinder -d example.com -silent | amass enum -passive -stdin

# Parallel processing
echo "domain1.com domain2.com" | xargs -n1 -P4 subfinder -d
```

**Memory usage issues:**
```bash
# Limit concurrent processes
amass enum -passive -d example.com -max-dns-queries 1000

# Process results in batches
split -l 1000 large_subdomain_list.txt batch_
```
