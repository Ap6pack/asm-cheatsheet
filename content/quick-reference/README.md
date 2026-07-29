# 🚀 ASM Quick Reference Hub

**Get what you need in 30 seconds or less!**

## 📋 Quick Navigation

### By Experience Level
- 🟢 **[Beginner? Start Here](#beginner-start-here)** - Your first ASM scan in 5 minutes
- 🟡 **[Practitioner Resources](#practitioner-resources)** - Ready-to-use commands and scripts
- 🔴 **[Advanced Techniques](#advanced-techniques)** - Enterprise and automation solutions

### By Task
- 🔍 **[Find Subdomains](#find-subdomains-quick)** - Quick subdomain discovery
- 🌐 **[Check Live Hosts](#check-live-hosts-quick)** - Identify active services
- 📸 **[Take Screenshots](#take-screenshots-quick)** - Visual reconnaissance
- 🔌 **[Scan Ports](#scan-ports-quick)** - Service discovery

### By Resource Type
- 📄 **[Command Cheat Sheet](../resources/command_cheatsheet.md)** - Copy-paste commands for every ASM tool
- 🎯 **[Scenario Cards](scenario-cards.md)** - Phased command sequences for real situations
- 📊 **[Recon Tools](../tools/recon_tools.md)** / **[Cloud Tools](../tools/cloud_enum_tools.md)** - Compare ASM tools at a glance
- ⚡ **[Advanced Techniques](advanced-techniques.md)** - WAF bypass, anomaly detection, multi-cloud discovery
- 🐳 **[Docker Quickstart](docker-quickstart.md)** - Zero-install toolkit

---

## 🟢 Beginner: Start Here

### Your First ASM Scan in 5 Minutes

```bash
# 1. Install essential tool (one-time setup)
go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest

# 2. Find subdomains (replace example.com with YOUR domain)
subfinder -d example.com -silent > subdomains.txt

# 3. Check which are live
curl -s https://raw.githubusercontent.com/projectdiscovery/httpx/master/install.sh | bash
cat subdomains.txt | httpx -silent > live_hosts.txt

# 4. View results
echo "Found $(wc -l < subdomains.txt) subdomains"
echo "$(wc -l < live_hosts.txt) are live"
cat live_hosts.txt
```

**⚠️ IMPORTANT**: Only scan domains you own or have permission to test!

---

## 🟡 Practitioner Resources

### Most Used Commands

#### Find Subdomains Quick
```bash
# Fast passive discovery (safe, no direct contact)
subfinder -d target.com -all -silent | tee subdomains.txt

# With multiple sources
amass enum -passive -d target.com | tee -a subdomains.txt
```

#### Check Live Hosts Quick
```bash
# Basic check
cat subdomains.txt | httpx -silent -status-code

# With details
cat subdomains.txt | httpx -title -tech-detect -status-code
```

#### Take Screenshots Quick
```bash
# Install gowitness
go install github.com/sensepost/gowitness@latest

# Take screenshots
gowitness file -f live_hosts.txt
```

#### Scan Ports Quick
```bash
# Top 100 ports (respectful timing)
nmap -iL hosts.txt --top-ports 100 -T2 --max-rate 50
```

---

## 🔴 Advanced Techniques

### Automation Pipeline
```bash
# Complete ASM pipeline in one command
subfinder -d target.com -silent | httpx -silent | nuclei -t exposures/ -silent
```

### API Integration
```bash
# Shodan search
shodan search "org:Target Corp" --fields ip_str,port,product

# GitHub recon
gh api search/code -q "target.com" --jq '.items[].html_url'
```

### Cloud Enumeration
```bash
# AWS S3 buckets
aws s3 ls s3://target-bucket --no-sign-request

# Azure blob storage
./gobuster dir -u https://targetcorp.blob.core.windows.net -w wordlist.txt
```

---

## 📚 Complete Resources

- **[Full Documentation](../README.md)** - Comprehensive ASM guide
- **[Tool Guides](../tools/)** - Detailed tool documentation
- **[Automation Scripts](../scripts/)** - Ready-to-use automation
- **[Learning Path](../resources/learning_guide.md)** - Structured learning

---

## 🆘 Need Help?

- **Quick Start Issues?** Check [Troubleshooting](../getting-started.md#troubleshooting)
- **Legal Questions?** Read [Security Considerations](../resources/security_considerations.md)
- **Community Support:** [GitHub Discussions](https://github.com/Ap6pack/asm-cheatsheet/discussions)
