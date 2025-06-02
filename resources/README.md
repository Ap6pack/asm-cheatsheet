# ASM Resources and References

This directory contains additional reference materials, cheat sheets, and external resources to support your Attack Surface Management activities.

## 📚 Contents

- [ASM Terminology Glossary](#asm-terminology-glossary)
- [Quick Reference Cheat Sheets](#quick-reference-cheat-sheets)
- [Learning Resources](#learning-resources)
- [External Resources](#external-resources)
- [API Documentation](#api-documentation)
- [Legal and Compliance](#legal-and-compliance)
- [Community Resources](#community-resources)

## ASM Terminology Glossary

### Core Concepts

**Attack Surface:** The sum of all possible attack vectors where an unauthorized user can try to enter data to or extract data from an environment.

**Asset Discovery:** The process of identifying all digital assets (domains, IPs, services, applications) that belong to an organization.

**Certificate Transparency (CT):** Public logs of SSL/TLS certificates that can be used to discover subdomains and services.

**Digital Risk:** Potential threats to an organization's digital assets, including data breaches, service disruptions, and reputation damage.

**External Attack Surface:** Assets that are accessible from the internet and potentially visible to attackers.

**Shadow IT:** IT systems, devices, software, applications, and services outside the ownership or control of IT organizations.

**Subdomain Enumeration:** The process of finding subdomains of a target domain using various techniques.

**Threat Intelligence:** Evidence-based knowledge about existing or emerging threats that can inform security decisions.

### Technical Terms

**Banner Grabbing:** Technique used to gather information about services running on networked computers.

**DNS Enumeration:** Process of locating all DNS servers and their corresponding records for an organization.

**Fingerprinting:** Identifying the specific software, version, and configuration of network services.

**OSINT (Open Source Intelligence):** Intelligence collected from publicly available sources.

**Passive Reconnaissance:** Information gathering without directly interacting with the target system.

**Port Scanning:** Technique to discover open ports and services on a network host.

**Service Enumeration:** Process of identifying services running on discovered ports.

**Web Crawling:** Automated browsing of websites to discover pages and functionality.

## Learning Resources

### 📖 Comprehensive Guides
- **[Learning Guide](learning_guide.md)** - Structured learning pathways with difficulty indicators, time estimates, and assessments
- **[Security Considerations](security_considerations.md)** - Legal, ethical, and technical security guidelines
- **[Modern Tools Update 2025](modern_tools_update.md)** - Latest tools and alternatives to legacy software
- **[Command Cheat Sheet](command_cheatsheet.md)** - Quick reference for common commands

### 🔄 Practical Implementation
- **[Practical Workflows](../examples/practical_workflows.md)** - Step-by-step procedures for common ASM scenarios
- **[Real-World Case Studies](../examples/case_studies.md)** - Detailed examples of successful ASM implementations
- **[Change Tracking Techniques](../examples/change_tracking.md)** - Monitor changes in your attack surface
- **[GitHub Leak Queries](../examples/github_leak_queries.md)** - Find exposed credentials and sensitive data

### 🚀 Getting Started
- **[Complete Getting Started Guide](../GETTING_STARTED.md)** - 30-minute walkthrough from zero to first scan
- **[Automation Scripts](../scripts/README.md)** - Ready-to-use scripts for common ASM tasks
- **[Tool Documentation](../tools/)** - Comprehensive guides for ASM tools

## Quick Reference Cheat Sheets

### Common Ports and Services

| Port | Service | Description |
|------|---------|-------------|
| 21 | FTP | File Transfer Protocol |
| 22 | SSH | Secure Shell |
| 23 | Telnet | Unencrypted remote access |
| 25 | SMTP | Simple Mail Transfer Protocol |
| 53 | DNS | Domain Name System |
| 80 | HTTP | Web traffic |
| 110 | POP3 | Post Office Protocol |
| 143 | IMAP | Internet Message Access Protocol |
| 443 | HTTPS | Secure web traffic |
| 993 | IMAPS | Secure IMAP |
| 995 | POP3S | Secure POP3 |
| 3389 | RDP | Remote Desktop Protocol |
| 5432 | PostgreSQL | Database |
| 3306 | MySQL | Database |
| 1433 | MSSQL | Microsoft SQL Server |
| 27017 | MongoDB | NoSQL Database |
| 6379 | Redis | In-memory database |
| 9200 | Elasticsearch | Search engine |

### HTTP Status Codes

| Code | Meaning | ASM Relevance |
|------|---------|---------------|
| 200 | OK | Service is responding normally |
| 301/302 | Redirect | May reveal internal structure |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Access denied, but resource exists |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Potential vulnerability |
| 502 | Bad Gateway | Proxy/load balancer issue |
| 503 | Service Unavailable | Service temporarily down |

### Common Subdomain Patterns

```
www, mail, ftp, admin, test, dev, staging, api, app, blog, shop, 
support, help, docs, cdn, static, assets, img, images, media, 
vpn, remote, portal, dashboard, panel, cpanel, webmail, mx, 
ns1, ns2, dns, backup, old, new, beta, demo, sandbox
```

### Useful Search Engines and Databases

| Service | Purpose | URL |
|---------|---------|-----|
| Shodan | Internet-connected device search | https://shodan.io |
| Censys | Internet-wide scanning | https://censys.io |
| ZoomEye | Cyberspace search engine | https://zoomeye.org |
| Fofa | Network space search | https://fofa.so |
| BinaryEdge | Internet scanning platform | https://binaryedge.io |
| VirusTotal | File and URL analysis | https://virustotal.com |
| URLVoid | Website reputation checker | https://urlvoid.com |
| crt.sh | Certificate transparency logs | https://crt.sh |
| SecurityTrails | DNS and domain intelligence | https://securitytrails.com |

## External Resources

### Documentation and Guides

- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [SANS Reading Room](https://www.sans.org/reading-room/)
- [MITRE ATT&CK Framework](https://attack.mitre.org/)

### Training and Certification

- [SANS SEC487: Open-Source Intelligence (OSINT) Gathering and Analysis](https://www.sans.org/cyber-security-courses/open-source-intelligence-gathering/)
- [eLearnSecurity Web Application Penetration Tester (eWPT)](https://elearnsecurity.com/product/ewpt-certification/)
- [Offensive Security Certified Professional (OSCP)](https://www.offensive-security.com/pwk-oscp/)

### Communities and Forums

- [Reddit r/netsec](https://reddit.com/r/netsec)
- [Reddit r/AskNetsec](https://reddit.com/r/AskNetsec)
- [OWASP Local Chapters](https://owasp.org/chapters/)
- [DEF CON Groups](https://defcon.org/html/links/dc-groups.html)

### Blogs and News

- [Krebs on Security](https://krebsonsecurity.com/)
- [Schneier on Security](https://schneier.com/)
- [The Hacker News](https://thehackernews.com/)
- [Dark Reading](https://darkreading.com/)

## API Documentation

### Shodan API

```bash
# Search for specific service
curl "https://api.shodan.io/shodan/host/search?key=YOUR_API_KEY&query=apache"

# Get host information
curl "https://api.shodan.io/shodan/host/8.8.8.8?key=YOUR_API_KEY"
```

### VirusTotal API

```bash
# Check URL reputation
curl -X POST "https://www.virustotal.com/vtapi/v2/url/report" \
  -d "apikey=YOUR_API_KEY&resource=http://example.com"

# Check domain reputation
curl "https://www.virustotal.com/vtapi/v2/domain/report?apikey=YOUR_API_KEY&domain=example.com"
```

### Certificate Transparency

```bash
# Search crt.sh for certificates
curl "https://crt.sh/?q=%.example.com&output=json"

# Facebook CT API
curl "https://graph.facebook.com/certificates?query=example.com"
```

## Legal and Compliance

### Key Considerations

1. **Authorization:** Always ensure you have explicit permission to test
2. **Scope:** Clearly define what is and isn't authorized
3. **Data Handling:** Follow privacy laws (GDPR, CCPA, etc.)
4. **Responsible Disclosure:** Report vulnerabilities through proper channels
5. **Rate Limiting:** Avoid overwhelming target systems

### Responsible Disclosure Guidelines

1. **Initial Contact:** Use security contact or responsible disclosure program
2. **Information to Include:**
   - Clear description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested remediation
3. **Timeline:** Allow reasonable time for response (typically 90 days)
4. **Documentation:** Keep records of all communications

### Bug Bounty Platforms

- [HackerOne](https://hackerone.com/)
- [Bugcrowd](https://bugcrowd.com/)
- [Synack](https://synack.com/)
- [Cobalt](https://cobalt.io/)

### Legal Resources

- [EFF Legal Guide for Bloggers](https://www.eff.org/issues/bloggers/legal)
- [CFAA Reform](https://www.eff.org/issues/cfaa)
- [Vulnerability Disclosure Legal Basics](https://blog.rapid7.com/2016/07/07/vulnerability-disclosure-legal-basics/)

## Community Resources

### 🤝 Contributing and Community
- **[Contributing Guide](../CONTRIBUTING.md)** - How to contribute content, tools, and improvements
- **[Contributors](../CONTRIBUTORS.md)** - Recognition for community members
- **GitHub Issues** - Bug reports, feature requests, questions
- **GitHub Discussions** - General community conversation

### 📅 Learning Schedules
- **Intensive Track (2 weeks)** - For security professionals needing rapid ASM skills
- **Part-Time Track (8 weeks)** - For working professionals learning gradually
- **Academic Track (16 weeks)** - For students with extended timelines
- **Enterprise Track (6 months)** - For building organizational ASM capabilities

### 🎯 Skill Assessments
- **🟢 Beginner Certification** - Basic ASM concepts and tools
- **🟡 Intermediate Certification** - Advanced configurations and automation
- **🔴 Advanced Certification** - Enterprise architecture and custom development

## Contributing to Resources

To add new resources:

1. **Verify Accuracy:** Ensure all information is current and correct
2. **Provide Context:** Explain why the resource is valuable for ASM
3. **Check Links:** Verify all URLs are working and legitimate
4. **Follow Format:** Maintain consistent formatting and structure
5. **Update Index:** Add new sections to the table of contents

### Submission Guidelines

- Resources should be publicly available
- Prefer official documentation over third-party summaries
- Include brief descriptions of why each resource is useful
- Organize content logically within existing categories
- Test all commands and examples before submitting
- Follow our [Contributing Guide](../CONTRIBUTING.md) for detailed submission process

### Priority Contribution Areas

1. **Tool Documentation** - Comprehensive guides for popular ASM tools
2. **Real-World Case Studies** - Anonymized stories of successful implementations
3. **Automation Scripts** - Practical automation for common ASM tasks
4. **Learning Materials** - Tutorials, exercises, and educational content
5. **Translations** - Making ASM accessible globally
