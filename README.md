# 🧩 Attack Surface Management (ASM) Cheat Sheet

A tactical, practical community reference for Attack Surface Management. This guide provides real-world advice, open-source tooling, and automation concepts for discovering, analyzing, and managing digital exposures.

## What is ASM?

Attack Surface Management (ASM) is the continuous discovery, monitoring, prioritization, and tracking of internal and external digital assets that could be attacked. This includes unknown, unmanaged, third-party, and ephemeral systems.

Goal: Identify unknown assets, reduce blind spots, and detect risky changes quickly.

## 🚀 Getting Started

### Prerequisites

Before diving into ASM, ensure you have:

**Technical Skills:**
- Basic command line familiarity (Linux/macOS terminal or Windows PowerShell)
- Understanding of networking fundamentals (DNS, IP addresses, ports, HTTP/HTTPS)
- Basic scripting knowledge (bash/python helpful but not required)

**Required Tools:**
- Git for cloning tool repositories
- Python 3.7+ and pip package manager
- Virtual machine or isolated testing environment (recommended)
- Text editor or IDE for configuration files

**API Keys (Optional but Recommended):**
- [Shodan API key](https://account.shodan.io/) for internet-wide scanning
- [GitHub Personal Access Token](https://github.com/settings/tokens) for repository searches
- [VirusTotal API key](https://www.virustotal.com/gui/join-us) for threat intelligence

### ⚖️ Legal and Ethical Considerations

**⚠️ IMPORTANT: Only scan assets you own or have explicit permission to test.**

- **Scope Definition:** Clearly define what you're authorized to scan
- **Rate Limiting:** Use reasonable delays between requests to avoid overwhelming targets
- **Responsible Disclosure:** Report vulnerabilities through proper channels
- **Legal Compliance:** Understand local laws regarding security testing

### 🎯 Your First ASM Scan (5-minute walkthrough)

**📖 New to ASM? Start with our [Complete Getting Started Guide](GETTING_STARTED.md) for a comprehensive 30-minute walkthrough!**

#### Step 1: Install Basic Tools
```bash
# Install Amass for subdomain discovery
go install -v github.com/owasp-amass/amass/v4/...@master

# Install httpx for web service discovery
go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest

# Alternative: Use package managers
sudo apt install amass  # Ubuntu/Debian
brew install amass      # macOS
```

#### Step 2: Discover Subdomains (Passive)
```bash
# Replace 'example.com' with a domain you own
amass enum -passive -d example.com -o subdomains.txt
```

#### Step 3: Find Live Web Services
```bash
# Check which subdomains have web services
httpx -l subdomains.txt -o live_hosts.txt
```

#### Step 4: Take Screenshots
```bash
# Install and use gowitness for visual reconnaissance
go install github.com/sensepost/gowitness@latest
gowitness file -f live_hosts.txt
```

### 📚 Learning Paths

**📖 [Complete Learning Guide](resources/learning_guide.md)** - Structured pathways with time estimates, prerequisites, and assessments

#### 🟢 Beginner Track (2-4 weeks) - Start Here
**Prerequisites:** Basic command line and networking knowledge  
**Time Commitment:** 8-12 hours total

1. **Passive Reconnaissance:** Learn subdomain enumeration and certificate transparency
2. **Basic Port Scanning:** Understand service discovery with nmap
3. **Web Application Discovery:** Find and screenshot web interfaces
4. **Legal & Ethics:** Understand boundaries and responsible disclosure
5. **Read:** [Building Your Own ASM Stack](guides/building_your_own_asm_stack.md)

#### 🟡 Intermediate Track (1-3 months)
**Prerequisites:** Beginner track completed  
**Time Commitment:** 20-25 hours total

1. **Automation:** Create scripts for continuous monitoring
2. **Change Detection:** Implement diff-based alerting
3. **Threat Intelligence:** Integrate CVE and IOC feeds
4. **Cloud Assets:** Discover AWS/Azure/GCP resources
5. **Data Analysis:** Generate reports and insights

#### 🔴 Advanced Track (3-6 months)
**Prerequisites:** Intermediate track completed  
**Time Commitment:** 40-60 hours total

1. **Custom Tooling:** Build specialized reconnaissance tools
2. **API Integration:** Leverage multiple data sources
3. **Machine Learning:** Implement anomaly detection
4. **Enterprise Deployment:** Scale ASM across large organizations
5. **Program Management:** Lead ASM initiatives

### 🛠️ Recommended Starter Toolkit

| Tool | Purpose | Difficulty | Installation |
|------|---------|------------|-------------|
| Amass | Subdomain discovery | Beginner | `go install github.com/owasp-amass/amass/v4/...@master` |
| httpx | Web service probing | Beginner | `go install github.com/projectdiscovery/httpx/cmd/httpx@latest` |
| nmap | Port scanning | Beginner | `sudo apt install nmap` or `brew install nmap` |
| gowitness | Screenshots | Beginner | `go install github.com/sensepost/gowitness@latest` |
| Shodan CLI | Internet scanning | Intermediate | `pip install shodan` |

### 🚨 Common Pitfalls and Solutions

**Problem:** "I'm getting blocked or rate limited"
- **Solution:** Add delays between requests (`--delay` flags), use rotating proxies, or reduce scan intensity

**Problem:** "Too many false positives in results"
- **Solution:** Filter results by response codes, content length, or known patterns

**Problem:** "Don't know what to scan first"
- **Solution:** Start with certificate transparency logs and passive DNS for your known domains

**Problem:** "Tools won't install or run"
- **Solution:** Use Docker containers or pre-built VMs like Kali Linux

### 🎯 Safe Practice Targets

- **Your own infrastructure:** Domains and IPs you control
- **Bug bounty programs:** Check [HackerOne](https://hackerone.com/) and [Bugcrowd](https://bugcrowd.com/) for in-scope targets
- **Intentionally vulnerable apps:** [DVWA](http://www.dvwa.co.uk/), [WebGoat](https://owasp.org/www-project-webgoat/)
- **Test domains:** Use `testphp.vulnweb.com` or similar designated test sites

### 📖 Next Steps

Once you've completed your first scan:
1. Review the [Core ASM Components](#core-asm-components) below
2. Explore specific tools in the [tools/](tools/) directory
3. Follow detailed guides in [guides/](guides/)
4. Check out practical examples in [examples/](examples/)

---

## Core ASM Components

| Phase               | Description                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| Discovery           | Identify domains, IPs, services, APIs, cloud assets                         |
| Enumeration         | Fingerprint ports, services, tech stacks, and endpoints                     |
| Historical Data     | Monitor changes in infrastructure and apps over time                        |
| Threat Intelligence | Integrate CVEs, leaked credentials, breach indicators, and TTPs             |
| Phishing Risks      | Detect and test for social engineering exposure points                      |
| Reporting           | Use dashboards and screenshots to prioritize and communicate risks          |

## Recon & Discovery Tools

See [tools/recon_tools.md](tools/recon_tools.md) for categorized tool listings with descriptions and links.

## Web Screenshot Tools

Screenshot web interfaces for visual diffing and alerting:
- Eyewitness
- GoWitness
- Aquatone

More details in [tools/screenshots.md](tools/screenshots.md)

## ASM vs Vulnerability Management

| Feature                      | ASM                                | Vulnerability Scanning          |
|------------------------------|-------------------------------------|---------------------------------|
| Finds unknown assets         | Yes                                 | No (requires scope definition)  |
| Change detection             | Yes                                 | No                              |
| Screenshots and UI snapshots| Yes                                 | No                              |
| Credential leak monitoring   | Yes                                 | No                              |

## Quick Wins with ASM

- Use certificate transparency logs and passive DNS to find shadow IT
- Run Shodan and GitHub API queries regularly for passive recon
- Screenshot apps daily and diff page hashes for unauthorized changes
- Track historical port, service, and HTTP banner changes over time
- Flag login portals missing 2FA or exposing verbose errors

## 🤝 Community and Contributing

**Join the ASM Community!**
- **[🤝 Contributing Guide](CONTRIBUTING.md)** - How to contribute content, tools, and improvements
- **[💬 GitHub Discussions](https://github.com/your-repo/discussions)** - Ask questions and share knowledge
- **[🐛 Report Issues](https://github.com/your-repo/issues)** - Bug reports and feature requests
- **[⭐ Star the Project](https://github.com/your-repo)** - Show your support and stay updated

**Ways to Contribute:**
- Share your ASM workflows and case studies
- Improve documentation and add examples
- Create automation scripts and tools
- Help newcomers learn ASM techniques
- Translate content for global accessibility

## Open Source ASM Tools

| Tool        | Function                                           |
|-------------|----------------------------------------------------|
| Sn1per      | Recon, port scan, screenshot, report generation    |
| Amass       | Subdomain discovery using multiple sources         |
| Recon-ng    | Full-featured recon framework with database export |
| Scout Suite | Cloud misconfiguration scanner (multi-cloud)       |
| CloudEnum   | Cloud asset enumeration for AWS, GCP, and Azure    |

Full list available in the [tools](tools/) directory.

## Build Your Own ASM Stack

Check [guides/building_your_own_asm_stack.md](guides/building_your_own_asm_stack.md) to create a lightweight, extensible ASM pipeline using:
- Shodan API
- Nmap and Masscan
- Screenshot tooling
- ElasticSearch and Kibana
- Recon scripts and GitHub monitors

## 🤖 Automation Scripts

Ready-to-use automation scripts for common ASM workflows:
- **[basic_asm_scan.sh](scripts/basic_asm_scan.sh)** - Complete domain assessment workflow
- **[monitor_changes.py](scripts/monitor_changes.py)** - Website change detection and monitoring
- **[Installation guides and examples](scripts/README.md)** - Setup instructions and usage examples

## 🚀 Project Roadmap

**[📋 Implementation Strategy](IMPLEMENTATION_STRATEGY.md)** - Comprehensive roadmap for expanding the ASM cheatsheet into a three-tiered resource:

- **Tier 1: Quick Reference** - Command cards, tool matrices, regex patterns, one-liners
- **Tier 2: Practical Automation** - CI/CD templates, API integrations, parsers, notifications  
- **Tier 3: Real-World Scenarios** - Industry playbooks, compliance guides, incident response

### Planned Enhancements

- **Quick reference command cards and lookup tables**
- **CI/CD integration templates and automation libraries**
- **Industry-specific ASM playbooks and compliance guides**
- **Cloud provider enumeration techniques and configurations**
- **Advanced API integration examples and parsing scripts**
- **Incident response procedures and emergency playbooks**

## 📚 Additional Resources

Comprehensive reference materials and cheat sheets:
- **[🚀 Getting Started Guide](GETTING_STARTED.md)** - Complete 30-minute walkthrough from zero to first scan
- **[📖 Learning Guide](resources/learning_guide.md)** - Structured learning pathways with difficulty indicators, time estimates, and assessments
- **[🔄 Practical Workflows](examples/practical_workflows.md)** - Step-by-step procedures for common ASM scenarios
- **[📚 Real-World Case Studies](examples/case_studies.md)** - Detailed examples of successful ASM implementations
- **[🛡️ Security Considerations](resources/security_considerations.md)** - Legal, ethical, and technical security guidelines
- **[🔧 Modern Tools Update 2025](resources/modern_tools_update.md)** - Latest tools and alternatives to legacy software
- **[📋 Command Cheat Sheet](resources/command_cheatsheet.md)** - Quick reference for common commands
- **[📚 Recommended Reading List](resources/reading_list.md)** - Curated books covering reconnaissance, OSINT, automation, and threat intelligence
- **[📝 Changelog](CHANGELOG.md)** - Project history and version updates
- **[📋 Implementation Strategy](IMPLEMENTATION_STRATEGY.md)** - Strategic roadmap for project expansion
- **[📖 ASM Terminology Glossary](resources/README.md#asm-terminology-glossary)** - Key concepts and definitions
- **[🌐 External Resources](resources/README.md#external-resources)** - Training, documentation, and community links
- **[🔌 API Documentation](resources/README.md#api-documentation)** - Integration examples for popular services
