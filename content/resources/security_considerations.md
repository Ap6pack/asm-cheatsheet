# Security and Legal Considerations for ASM

This document outlines critical security, legal, and ethical considerations when conducting Attack Surface Management activities.

## ⚖️ Legal and Ethical Framework

### 1. Authorization Requirements

**CRITICAL: Only scan assets you own or have explicit written permission to test.**

#### What Constitutes Authorization?
- **Written permission** from asset owner or authorized representative
- **Bug bounty program** with clearly defined scope
- **Penetration testing contract** with specific scope definition
- **Your own infrastructure** that you control

#### What is NOT Authorization?
- Verbal permission without documentation
- Assumed permission based on public accessibility
- Educational or research purposes without explicit consent
- "Testing" competitor systems

### 2. Legal Boundaries by Jurisdiction

#### United States
- **Computer Fraud and Abuse Act (CFAA)** - Federal law prohibiting unauthorized access
- **State laws** may have additional restrictions
- **Safe harbors** exist for security research under specific conditions

#### European Union
- **GDPR** implications for data collection and processing
- **National cybercrime laws** vary by member state
- **NIS2 Directive** requirements for critical infrastructure

#### International Considerations
- **Cross-border scanning** may violate multiple jurisdictions
- **Data sovereignty** laws affect data collection and storage
- **Export controls** may apply to security tools and techniques

### 3. Responsible Disclosure

#### Timeline Framework
```
Day 0:    Vulnerability discovered
Day 1-7:  Initial contact with vendor
Day 30:   Follow-up if no response
Day 90:   Public disclosure (industry standard)
Day 180:  Extended timeline for critical infrastructure
```

#### Disclosure Process
1. **Initial Contact**
   - Use official security contact (security@domain.com)
   - Check for bug bounty program
   - Provide clear, professional communication

2. **Information to Include**
   - Clear vulnerability description
   - Steps to reproduce
   - Potential impact assessment
   - Suggested remediation
   - Your contact information

3. **Documentation**
   - Keep records of all communications
   - Screenshot evidence with timestamps
   - Maintain chain of custody for findings

## 🛡️ Technical Security Considerations

### 1. Rate Limiting and Respectful Scanning

#### General Principles
- **Respect target resources** - Don't overwhelm systems
- **Use reasonable delays** between requests
- **Monitor for blocking** and adjust accordingly
- **Implement exponential backoff** for retries

#### Tool-Specific Rate Limits

**Shodan API:**
```bash
# Free account: 100 queries/month
# Academic: 10,000 queries/month  
# Small business: 10,000 queries/month
# Corporate: 1,000,000 queries/month

# Check your usage
shodan info

# Implement delays in scripts
for query in "${queries[@]}"; do
    shodan search "$query"
    sleep 5  # 5-second delay between queries
done
```

**GitHub API:**
```bash
# Unauthenticated: 60 requests/hour
# Authenticated: 5,000 requests/hour
# GitHub Apps: 15,000 requests/hour

# Check rate limit status
curl -H "Authorization: token YOUR_TOKEN" \
     https://api.github.com/rate_limit

# Implement rate limiting
check_rate_limit() {
    remaining=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
                https://api.github.com/rate_limit | \
                jq '.rate.remaining')
    
    if [ "$remaining" -lt 10 ]; then
        echo "Rate limit low, sleeping..."
        sleep 3600  # Wait 1 hour
    fi
}
```

**VirusTotal API:**
```bash
# Public API: 4 requests/minute
# Private API: 1000 requests/minute

# Rate-limited scanning
scan_with_vt() {
    local url="$1"
    curl -X POST 'https://www.virustotal.com/vtapi/v2/url/scan' \
         -d "apikey=$VT_API_KEY&url=$url"
    sleep 15  # Ensure we don't exceed 4/minute
}
```

**Certificate Transparency:**
```bash
# crt.sh: No official rate limit, but be respectful
# Facebook CT: 100 requests/hour

# Implement delays for CT queries
query_ct_logs() {
    local domain="$1"
    curl -s "https://crt.sh/?q=%.${domain}&output=json"
    sleep 2  # 2-second delay between queries
}
```

### 2. Network Security and Anonymization

#### Proxy Usage
```bash
# Using proxychains
proxychains nmap -sS target.com

# Using Tor
torsocks curl https://example.com

# Rotating proxies in scripts
PROXIES=("proxy1:8080" "proxy2:8080" "proxy3:8080")
for i in "${!PROXIES[@]}"; do
    proxy="${PROXIES[$i]}"
    curl --proxy "$proxy" "https://target.com/endpoint$i"
done
```

#### User Agent Rotation
```bash
# User agent list
USER_AGENTS=(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
)

# Rotate user agents
for i in "${!urls[@]}"; do
    ua="${USER_AGENTS[$((i % ${#USER_AGENTS[@]}))]}"
    curl -H "User-Agent: $ua" "${urls[$i]}"
done
```

### 3. Data Protection and Privacy

#### Sensitive Data Handling
```bash
# Secure temporary files
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# Encrypt sensitive findings
encrypt_findings() {
    local file="$1"
    gpg --cipher-algo AES256 --compress-algo 1 \
        --symmetric --output "${file}.gpg" "$file"
    shred -vfz -n 3 "$file"  # Secure deletion
}

# Anonymize IP addresses in logs
anonymize_ips() {
    sed -E 's/([0-9]{1,3}\.){3}[0-9]{1,3}/XXX.XXX.XXX.XXX/g' "$1"
}
```

#### GDPR Compliance for ASM
```bash
# Data minimization - only collect necessary data
collect_minimal_data() {
    # Only collect technical indicators, not personal data
    nmap -sS --top-ports 100 "$target" | \
    grep -E "(open|filtered)" | \
    awk '{print $1,$3}' > technical_findings.txt
}

# Data retention policy
cleanup_old_data() {
    # Remove data older than 90 days
    find ./asm_data -type f -mtime +90 -delete
}
```

## 🚨 Operational Security (OpSec)

### 1. Infrastructure Isolation

#### Dedicated ASM Environment
```bash
# Use isolated VM or container
docker run -it --rm \
    -v $(pwd)/results:/results \
    kalilinux/kali-rolling

# Network isolation
# Use separate network segment for ASM activities
# Implement egress filtering
```

#### Tool Isolation
```bash
# Use virtual environments for Python tools
python3 -m venv asm_env
source asm_env/bin/activate
pip install -r requirements.txt

# Containerized tools
docker run --rm -v $(pwd):/data \
    projectdiscovery/subfinder -d example.com
```

### 2. Logging and Monitoring

#### Secure Logging
```bash
# Centralized logging with encryption
log_activity() {
    local activity="$1"
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    echo "$timestamp - $activity" | \
    gpg --encrypt -r security@company.com >> secure.log.gpg
}

# Audit trail
maintain_audit_trail() {
    cat > audit_entry.json << EOF
{
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "operator": "$USER",
    "target": "$TARGET",
    "tool": "$TOOL",
    "command": "$COMMAND",
    "authorization": "$AUTH_REFERENCE"
}
EOF
}
```

### 3. Attribution Avoidance

#### Fingerprint Reduction
```bash
# Randomize scan timing
random_delay() {
    sleep $((RANDOM % 30 + 10))  # 10-40 second random delay
}

# Vary scan patterns
randomize_ports() {
    local ports=(80 443 8080 8443 3000 5000 8000 9000)
    printf '%s\n' "${ports[@]}" | shuf | head -3
}

# Distributed scanning
distribute_scan() {
    local targets=("$@")
    local chunk_size=10
    
    for ((i=0; i<${#targets[@]}; i+=chunk_size)); do
        chunk=("${targets[@]:i:chunk_size}")
        # Process chunk on different infrastructure
        process_chunk "${chunk[@]}" &
        sleep 300  # 5-minute delay between chunks
    done
}
```

## 📋 Compliance Frameworks

### 1. ISO 27001 Alignment

#### Risk Assessment
```bash
# Document risk assessment for ASM activities
create_risk_assessment() {
    cat > risk_assessment.md << EOF
# ASM Risk Assessment

## Scope
- Target: $TARGET
- Authorization: $AUTHORIZATION
- Timeline: $START_DATE to $END_DATE

## Risks Identified
1. Service disruption due to scanning
2. Legal issues from unauthorized access
3. Data exposure during collection

## Mitigation Measures
1. Rate limiting and respectful scanning
2. Proper authorization documentation
3. Encrypted data storage and transmission

## Approval
- Security Officer: [Signature]
- Legal Review: [Signature]
- Date: $(date)
EOF
}
```

### 2. NIST Cybersecurity Framework

#### Implementation Mapping
```bash
# Identify (ID)
identify_assets() {
    # Asset inventory and classification
    echo "Identifying assets in scope..."
}

# Protect (PR)
implement_protections() {
    # Access controls and data protection
    echo "Implementing protective measures..."
}

# Detect (DE)
setup_detection() {
    # Monitoring and detection capabilities
    echo "Setting up detection mechanisms..."
}

# Respond (RS)
incident_response() {
    # Response procedures for findings
    echo "Documenting response procedures..."
}

# Recover (RC)
recovery_procedures() {
    # Recovery and lessons learned
    echo "Establishing recovery procedures..."
}
```

## 🔧 Tool-Specific Security Configurations

### 1. Nmap Security Settings

```bash
# Stealth scanning options
nmap_stealth() {
    local target="$1"
    nmap -sS -T2 -f --randomize-hosts \
         --data-length 25 --spoof-mac 0 \
         --source-port 53 "$target"
}

# Avoid detection
nmap_evasion() {
    local target="$1"
    nmap -sS -T1 --scan-delay 10s \
         --max-retries 1 --host-timeout 300s \
         --max-scan-delay 20s "$target"
}
```

### 2. Subdomain Enumeration Security

```bash
# Rate-limited subdomain enumeration
safe_subdomain_enum() {
    local domain="$1"
    
    # Amass with rate limiting
    amass enum -passive -d "$domain" \
        -config <(cat << EOF
[scope]
[scope.blacklisted]
[scope.domains]
[scope.ips]
[scope.cidrs]

[data_sources]
[data_sources.AlienVault]
[data_sources.AlienVault.Credentials]
apikey = $ALIENVAULT_API_KEY

[data_sources.Shodan]
[data_sources.Shodan.Credentials]
apikey = $SHODAN_API_KEY

[bruteforcing]
enabled = false
recursive = false
minimum_for_recursive = 0

[alterations]
enabled = false
minimum_for_alterations = 0

[settings]
maximum_dns_queries = 100
EOF
    )
}
```

### 3. API Security Best Practices

```bash
# Secure API key management
setup_api_keys() {
    # Store in encrypted file
    gpg --symmetric --cipher-algo AES256 api_keys.txt
    
    # Load keys securely
    load_api_keys() {
        eval $(gpg --decrypt api_keys.txt.gpg | grep -E '^export')
    }
    
    # Rotate keys regularly
    rotate_api_keys() {
        echo "Rotating API keys on $(date)" >> key_rotation.log
        # Implementation specific to each service
    }
}
```

## 📚 Legal Resources and References

### 1. Legal Consultation

#### When to Consult Legal Counsel
- Cross-border scanning activities
- Government or critical infrastructure targets
- Unclear authorization scope
- Potential legal gray areas

#### Documentation Requirements
- Written authorization letters
- Scope definition documents
- Data handling agreements
- Incident response procedures

### 2. Professional Organizations

#### Security Communities
- **OWASP** - Open Web Application Security Project
- **SANS** - SysAdmin, Audit, Network, and Security Institute
- **ISC2** - International Information System Security Certification Consortium
- **(ISC)²** - Information Systems Security Association

#### Legal Resources
- **EFF** - Electronic Frontier Foundation
- **ACLU** - American Civil Liberties Union
- **Local bar associations** - Cybersecurity law specialists

## 🎯 Best Practices Summary

### 1. Pre-Engagement Checklist
- [ ] Written authorization obtained
- [ ] Scope clearly defined
- [ ] Legal review completed
- [ ] Technical safeguards implemented
- [ ] Incident response plan ready

### 2. During Engagement
- [ ] Respect rate limits
- [ ] Monitor for blocking/detection
- [ ] Document all activities
- [ ] Secure data handling
- [ ] Regular authorization verification

### 3. Post-Engagement
- [ ] Secure data storage
- [ ] Responsible disclosure
- [ ] Documentation retention
- [ ] Lessons learned capture
- [ ] Tool and process improvement

## 🚨 Emergency Procedures

### 1. If You Discover Critical Vulnerabilities

```bash
# Immediate response procedure
critical_vuln_response() {
    local vuln_details="$1"
    
    # 1. Stop further testing
    echo "CRITICAL VULNERABILITY DISCOVERED - STOPPING SCAN" | \
    tee -a emergency.log
    
    # 2. Secure evidence
    encrypt_findings "critical_vuln_$(date +%Y%m%d_%H%M%S).txt"
    
    # 3. Immediate notification
    send_emergency_notification "$vuln_details"
    
    # 4. Document timeline
    echo "$(date): Critical vulnerability discovered" >> timeline.log
}
```

### 2. If You Receive Legal Contact

```bash
# Legal contact response
legal_contact_response() {
    # 1. Stop all activities immediately
    pkill -f "nmap|amass|subfinder|httpx"
    
    # 2. Preserve evidence
    tar -czf evidence_$(date +%Y%m%d).tar.gz logs/ results/
    
    # 3. Contact legal counsel
    echo "Legal contact received at $(date)" >> legal_log.txt
    
    # 4. Prepare documentation
    generate_activity_report
}
```

Remember: When in doubt, err on the side of caution and seek legal counsel before proceeding with any ASM activities.
