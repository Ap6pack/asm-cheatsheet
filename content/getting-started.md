# 🚀 Getting Started with ASM

Welcome to Attack Surface Management! This guide will take you from zero to running your first ASM scan in under 30 minutes.

## 🎯 What You'll Accomplish

By the end of this guide, you'll have:
- ✅ A working ASM environment
- ✅ Essential tools installed and configured
- ✅ Completed your first domain assessment
- ✅ Generated a professional security report
- ✅ Understanding of next steps for continued learning

**⏱️ Total Time Required:** 20-30 minutes

## 🔍 Quick Self-Assessment

**Are you ready for ASM?** Check all that apply:
- [ ] I can open a terminal/command prompt
- [ ] I understand what a domain name is (like google.com)
- [ ] I have a computer with internet access
- [ ] I want to learn about cybersecurity

**If you checked all boxes, you're ready to start!**

## 🛠️ Step 1: Environment Setup (10 minutes)

### Option A: Quick Start (Recommended for Beginners)
Use our pre-configured Docker container:

```bash
# Pull and run the ASM toolkit container
docker run -it --rm -v $(pwd)/results:/results \
  asmtoolkit/quickstart:latest

# You're now in a fully configured ASM environment!
```

### Option B: Manual Installation
If you prefer to install tools manually:

#### Install Go (Required for most tools)
```bash
# Linux/macOS
wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# macOS with Homebrew
brew install go

# Windows
# Download installer from https://golang.org/dl/
```

#### Install Essential Tools
```bash
# Subdomain discovery
go install -v github.com/owasp-amass/amass/v4/...@master
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest

# Web service discovery
go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest

# Port scanning
sudo apt install nmap  # Linux
brew install nmap      # macOS

# Screenshots
go install github.com/sensepost/gowitness@latest

# Verify installations
amass version && subfinder -version && httpx -version && nmap --version
```

## 🎯 Step 2: Your First ASM Scan (10 minutes)

### Choose Your Target
**🚨 CRITICAL AUTHORIZATION CHECK 🚨**

**BEFORE PROCEEDING - ANSWER THESE QUESTIONS:**
1. Do you own this domain? **YES/NO**
2. Do you have written permission to scan this target? **YES/NO**
3. Have you verified this is not a third-party service? **YES/NO**
4. Are you aware of the legal implications in your jurisdiction? **YES/NO**

**If you answered NO to any question, STOP and get proper authorization first.**

**✅ SAFE OPTIONS FOR LEARNING:**
- **Your own infrastructure:** Domains and servers you personally own
- **Authorized test targets:**
  - `scanme.nmap.org` (Nmap's official test target)
  - `testphp.vulnweb.com` (Acunetix test site)
  - `hack-yourself-first.com` (Troy Hunt's test site)
- **Local testing:** `localhost` or `127.0.0.1`
- **Your home network:** `192.168.1.0/24` (if you own the router)

**⚠️ NEVER SCAN WITHOUT PERMISSION:**
- Corporate networks (unless you're authorized IT staff)
- Government websites
- Financial institutions
- Any domain you don't own
- Cloud services you don't control

### Run the Complete Workflow

```bash
# 🚨 AUTHORIZATION VERIFICATION SCRIPT 🚨
echo "⚠️  AUTHORIZATION CHECK ⚠️"
echo "Do you own or have written permission to scan the target? (y/N)"
read -r auth_response
if [[ ! "$auth_response" =~ ^[Yy]$ ]]; then
    echo "❌ Scan aborted - Authorization required"
    echo "Only scan targets you own or have explicit permission to test"
    exit 1
fi

# Set your target (replace with your authorized domain)
TARGET="scanme.nmap.org"
OUTPUT_DIR="asm_scan_$(date +%Y%m%d_%H%M%S)"

# Validate target format
if [[ ! "$TARGET" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$ ]]; then
    echo "❌ Invalid target format: $TARGET"
    exit 1
fi

# Create output directory with error handling
mkdir -p "$OUTPUT_DIR" || { echo "❌ Failed to create directory"; exit 1; }
cd "$OUTPUT_DIR" || { echo "❌ Failed to change directory"; exit 1; }

echo "✅ Authorization verified"
echo "🔍 Starting ASM scan for: $TARGET"
echo "📁 Results will be saved in: $OUTPUT_DIR"

# Step 1: Subdomain Discovery (2-3 minutes)
echo "[1/4] Discovering subdomains (passive reconnaissance)..."

# Check if subfinder is available
if ! command -v subfinder &> /dev/null; then
    echo "❌ subfinder not found. Please install it first:"
    echo "   go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest"
    exit 1
fi

# Run subdomain discovery with error handling
subfinder -d "$TARGET" -silent > subdomains.txt || {
    echo "❌ Subdomain discovery failed"
    exit 1
}

SUBDOMAIN_COUNT=$(wc -l < subdomains.txt)
echo "   Found $SUBDOMAIN_COUNT subdomains"

if [[ $SUBDOMAIN_COUNT -eq 0 ]]; then
    echo "⚠️ No subdomains found. This might be normal for some targets."
fi

# Step 2: Live Host Detection (1-2 minutes)
echo "[2/4] Finding live web services (with rate limiting)..."

# Check if httpx is available
if ! command -v httpx &> /dev/null; then
    echo "❌ httpx not found. Please install it first:"
    echo "   go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest"
    exit 1
fi

# Skip if no subdomains found
if [[ ! -s subdomains.txt ]]; then
    echo "⚠️ No subdomains to test - skipping live host detection"
    touch live_hosts.txt
    LIVE_COUNT=0
else
    # Use rate limiting to be respectful
    httpx -l subdomains.txt -silent -status-code -title -rate-limit 10 > live_hosts.txt || {
        echo "❌ Live host detection failed"
        exit 1
    }
    
    LIVE_COUNT=$(wc -l < live_hosts.txt)
    echo "   Found $LIVE_COUNT live hosts"
    
    if [[ $LIVE_COUNT -eq 0 ]]; then
        echo "⚠️ No live hosts found. This might be normal for some targets."
    fi
fi

# Step 3: Port Scanning (2-3 minutes)
echo "[3/4] Scanning for open ports (respectful timing)..."

# Check if nmap is available
if ! command -v nmap &> /dev/null; then
    echo "❌ nmap not found. Please install it first:"
    echo "   sudo apt install nmap  # Linux"
    echo "   brew install nmap      # macOS"
    exit 1
fi

# Skip if no live hosts
if [[ $LIVE_COUNT -eq 0 ]]; then
    echo "⚠️ No live hosts to scan - skipping port scanning"
    touch port_scan.txt
else
    # Warn about port scanning implications
    echo "⚠️ Port scanning can be detected by security systems"
    echo "   Using respectful timing to minimize impact..."
    
    # Use respectful timing (T2 instead of T4)
    nmap -iL <(cut -d' ' -f1 live_hosts.txt) -oN port_scan.txt --top-ports 100 -T2 --max-rate 50 || {
        echo "⚠️ Port scan failed or was interrupted"
        echo "   This might be due to network restrictions or target protection"
        touch port_scan.txt
    }
    
    echo "   Port scan completed"
fi

# Step 4: Screenshots (2-3 minutes)
echo "[4/4] Taking screenshots..."

# Check if gowitness is available
if ! command -v gowitness &> /dev/null; then
    echo "⚠️ gowitness not found. Installing..."
    go install github.com/sensepost/gowitness@latest || {
        echo "❌ Failed to install gowitness. Skipping screenshots."
        mkdir -p screenshots
        SCREENSHOT_COUNT=0
    }
fi

# Skip if no live hosts
if [[ $LIVE_COUNT -eq 0 ]]; then
    echo "⚠️ No live hosts to screenshot"
    mkdir -p screenshots
    SCREENSHOT_COUNT=0
else
    # Create screenshots directory
    mkdir -p screenshots
    
    # Take screenshots with delays to be respectful
    echo "   Taking screenshots with delays (being respectful)..."
    gowitness file -f <(cut -d' ' -f1 live_hosts.txt) --disable-logging --delay 2 || {
        echo "⚠️ Screenshot capture failed or was interrupted"
    }
    
    SCREENSHOT_COUNT=$(ls screenshots/*.png 2>/dev/null | wc -l)
    echo "   Screenshots completed ($SCREENSHOT_COUNT captured)"
fi

echo "✅ ASM scan completed! Results saved in: $OUTPUT_DIR"
```

### Understanding Your Results

```bash
# View discovered subdomains
echo "=== SUBDOMAINS DISCOVERED ==="
cat subdomains.txt

# View live web services
echo "=== LIVE WEB SERVICES ==="
cat live_hosts.txt

# View open ports
echo "=== OPEN PORTS ==="
grep "open" port_scan.txt

# View screenshots
echo "=== SCREENSHOTS ==="
ls -la screenshots/
```

## 📊 Step 3: Generate Your First Report (5 minutes)

Create a simple HTML report of your findings:

```bash
# Generate basic HTML report
cat > asm_report.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>ASM Report for $TARGET</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #007bff; }
        .finding { background: #f8f9fa; padding: 10px; margin: 5px 0; }
        .critical { border-left-color: #dc3545; }
        .warning { border-left-color: #ffc107; }
        .info { border-left-color: #17a2b8; }
    </style>
</head>
<body>
    <h1>ASM Report for $TARGET</h1>
    <p>Generated on: $(date)</p>
    
    <div class="section info">
        <h2>📊 Summary</h2>
        <div class="finding">
            <strong>Subdomains Discovered:</strong> $(wc -l < subdomains.txt)<br>
            <strong>Live Web Services:</strong> $(wc -l < live_hosts.txt)<br>
            <strong>Open Ports Found:</strong> $(grep -c "open" port_scan.txt)<br>
            <strong>Screenshots Taken:</strong> $(ls screenshots/*.png 2>/dev/null | wc -l)
        </div>
    </div>
    
    <div class="section">
        <h2>🌐 Discovered Subdomains</h2>
        $(while read subdomain; do echo "<div class='finding'>$subdomain</div>"; done < subdomains.txt)
    </div>
    
    <div class="section">
        <h2>✅ Live Web Services</h2>
        $(while read line; do echo "<div class='finding'>$line</div>"; done < live_hosts.txt)
    </div>
    
    <div class="section">
        <h2>🔌 Open Ports</h2>
        $(grep "open" port_scan.txt | while read line; do echo "<div class='finding'>$line</div>"; done)
    </div>
    
    <div class="section">
        <h2>📸 Screenshots</h2>
        $(ls screenshots/*.png 2>/dev/null | while read img; do 
            echo "<div class='finding'><img src='$img' style='max-width:300px; margin:10px;' /></div>"
        done)
    </div>
</body>
</html>
EOF

echo "📄 Report generated: asm_report.html"
echo "🌐 Open in browser: file://$(pwd)/asm_report.html"
```

## 🎉 Congratulations!

You've just completed your first ASM assessment! Here's what you accomplished:

### ✅ What You Did
1. **Discovered hidden assets** - Found subdomains that might not be publicly known
2. **Identified live services** - Determined which services are actually running
3. **Mapped the attack surface** - Catalogued potential entry points
4. **Documented findings** - Created a professional report

### 🔍 What Your Results Mean

**Subdomains Found:** Each subdomain represents a potential attack vector. More subdomains = larger attack surface.

**Live Web Services:** These are actively running services that could contain vulnerabilities.

**Open Ports:** Each open port is a potential entry point. Common concerning ports:
- 22 (SSH) - Remote access
- 23 (Telnet) - Unencrypted remote access
- 3389 (RDP) - Windows remote desktop
- Database ports (3306, 5432, 1433) - Direct database access

**Screenshots:** Visual evidence of what's actually running on each service.

## 🚨 Critical Security and Legal Reminders

### ✅ What You Should Do Next
1. **If this was your own domain:**
   - Review each finding for security implications
   - Ensure all services are intentionally exposed
   - Check for unnecessary open ports
   - Verify all subdomains are legitimate
   - Document any security improvements needed

2. **If you found concerning issues:**
   - Document everything with timestamps
   - Report to the appropriate security team
   - Follow responsible disclosure practices
   - Do NOT attempt to exploit vulnerabilities

3. **For learning purposes:**
   - Practice on authorized targets only
   - Join bug bounty programs for legal testing
   - Set up your own lab environment
   - Study the tools and techniques used

### ❌ What You Must NEVER Do
- **NEVER scan domains you don't own without explicit written permission**
- **NEVER attempt to exploit any vulnerabilities you find**
- **NEVER share sensitive findings publicly without permission**
- **NEVER ignore legal and ethical boundaries**
- **NEVER use these tools for malicious purposes**
- **NEVER assume "it's just reconnaissance" makes it legal**

### 🚨 Legal Warning
**Unauthorized scanning can result in:**
- Criminal charges under computer fraud laws
- Civil lawsuits for damages
- Permanent criminal record
- Loss of employment and security clearances
- Significant financial penalties

**When in doubt, DON'T scan. Get explicit written permission first.**

## 🎯 Next Steps

### Immediate Actions (Next 30 minutes)
1. **Review your results** - Understand what each finding means
2. **Try a different target** - Scan another authorized domain
3. **Explore the tools** - Run individual commands to understand each tool

### Short-term Learning (Next week)
1. **📖 [Complete Learning Guide](resources/learning_guide.md)** - Follow the structured curriculum
2. **🛠️ [Tool Documentation](tools/)** - Deep dive into specific tools
3. **🤖 [Automation Scripts](scripts/)** - Learn to automate your workflows

### Long-term Development (Next month)
1. **🔧 Build custom workflows** - Adapt tools to your specific needs
2. **📊 Implement monitoring** - Set up continuous asset discovery
3. **🎓 Join the community** - Contribute and learn from others

## 🆘 Troubleshooting

### Common Issues and Solutions

**"Command not found" errors:**
```bash
# Check if Go is installed
go version

# Check if tools are in PATH
echo $PATH | grep go

# Reinstall tools if needed
go install -v github.com/owasp-amass/amass/v4/...@master
```

**"Permission denied" errors:**
```bash
# Make sure you have execute permissions
chmod +x /path/to/tool

# For nmap, you might need sudo
sudo nmap -sS target.com
```

**"No results found":**
```bash
# Verify target is reachable
ping target.com

# Try with a known working target
subfinder -d google.com
```

**Tools running slowly:**
```bash
# Reduce scan intensity
nmap -T2 target.com  # Slower but more polite
amass enum -passive -d target.com  # Passive only
```

## 🤝 Getting Help

### Community Support
- **GitHub Issues:** [Report problems or ask questions](https://github.com/Ap6pack/asm-cheatsheet/issues)
- **Discord/Slack:** Join our community chat
- **Reddit:** r/AskNetsec for general security questions

### Professional Resources
- **OWASP Local Chapters:** Find local security meetups
- **Security Conferences:** BSides, DEF CON, local security events
- **Online Training:** SANS, Cybrary, Pluralsight

### Documentation
- **[Learning Guide](resources/learning_guide.md)** - Structured learning path
- **[Security Considerations](resources/security_considerations.md)** - Legal and ethical guidelines
- **[Tool Documentation](tools/)** - Detailed tool guides

## 🎊 Welcome to the ASM Community!

You've taken your first step into Attack Surface Management. This is just the beginning of your journey into understanding and securing digital assets.

**Remember:** ASM is about discovery and understanding, not exploitation. Use your new skills responsibly and help make the internet a safer place.

**Ready for more?** Check out our [Learning Guide](resources/learning_guide.md) for your next steps!

---

*Need help? Have questions? Found an issue with this guide? Please [open an issue](https://github.com/Ap6pack/asm-cheatsheet/issues) or reach out to the community.*
