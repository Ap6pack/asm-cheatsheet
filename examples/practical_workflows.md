# 🔄 Practical ASM Workflows

This document provides step-by-step procedures for common ASM scenarios, from basic discovery to advanced enterprise implementations.

## 📋 Workflow Index

| Workflow | Difficulty | Time | Use Case |
|----------|------------|------|----------|
| [New Domain Assessment](#new-domain-assessment) | 🟢 Beginner | 30 min | Initial security review |
| [Continuous Monitoring Setup](#continuous-monitoring-setup) | 🟡 Intermediate | 2 hours | Ongoing surveillance |
| [Incident Response Investigation](#incident-response-investigation) | 🟡 Intermediate | 1 hour | Security incident analysis |
| [Merger & Acquisition Due Diligence](#merger--acquisition-due-diligence) | 🔴 Advanced | 4-8 hours | M&A security assessment |
| [Bug Bounty Reconnaissance](#bug-bounty-reconnaissance) | 🟡 Intermediate | 1-2 hours | Ethical hacking preparation |
| [Cloud Migration Assessment](#cloud-migration-assessment) | 🔴 Advanced | 3-6 hours | Pre-migration security review |

---

## 🟢 New Domain Assessment

**Scenario:** Your organization has acquired a new domain or you need to assess a domain's security posture.

**Time Required:** 30 minutes  
**Prerequisites:** Basic ASM tools installed  
**Output:** Comprehensive security assessment report

### Step 1: Initial Information Gathering (5 minutes)

```bash
# ⚠️ CRITICAL: Verify authorization before proceeding
echo "🚨 AUTHORIZATION VERIFICATION 🚨"
echo "Do you own or have written permission to assess this domain? (y/N)"
read -r auth_response
if [[ ! "$auth_response" =~ ^[Yy]$ ]]; then
    echo "❌ Assessment aborted - Authorization required"
    exit 1
fi

# Set up environment
DOMAIN="target.com"
SCAN_DATE=$(date +%Y%m%d_%H%M%S)
WORKDIR="domain_assessment_${DOMAIN}_${SCAN_DATE}"

# Validate domain format
if [[ ! "$DOMAIN" =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$ ]]; then
    echo "❌ Invalid domain format: $DOMAIN"
    exit 1
fi

mkdir -p "$WORKDIR" || { echo "❌ Failed to create working directory"; exit 1; }
cd "$WORKDIR" || { echo "❌ Failed to change to working directory"; exit 1; }

# Document the assessment
cat > assessment_log.txt << EOF
Domain Assessment: $DOMAIN
Started: $(date)
Operator: $(whoami)
Purpose: Initial security assessment
Authorization: Verified $(date)
EOF

echo "✅ Assessment setup completed for: $DOMAIN"
```

### Step 2: Passive Reconnaissance (10 minutes)

```bash
echo "=== PHASE 1: PASSIVE RECONNAISSANCE ===" | tee -a assessment_log.txt

# Subdomain discovery from multiple sources (PASSIVE ONLY for safety)
echo "[+] Discovering subdomains (passive reconnaissance)..." | tee -a assessment_log.txt

# Check if tools are available
if ! command -v subfinder &> /dev/null; then
    echo "⚠️ Warning: subfinder not found, skipping..." | tee -a assessment_log.txt
else
    echo "   Running subfinder..." | tee -a assessment_log.txt
    subfinder -d "$DOMAIN" -all -silent > subdomains_subfinder.txt || echo "⚠️ subfinder failed" | tee -a assessment_log.txt
fi

if ! command -v amass &> /dev/null; then
    echo "⚠️ Warning: amass not found, skipping..." | tee -a assessment_log.txt
else
    echo "   Running amass (passive only)..." | tee -a assessment_log.txt
    # Use passive only to avoid triggering security alerts
    amass enum -passive -d "$DOMAIN" -o subdomains_amass.txt || echo "⚠️ amass failed" | tee -a assessment_log.txt
fi

# Certificate transparency search
echo "[+] Searching certificate transparency logs..." | tee -a assessment_log.txt
curl -s "https://crt.sh/?q=%.${DOMAIN}&output=json" | \
jq -r '.[].name_value' | sort -u > subdomains_ct.txt

# Combine and deduplicate
cat subdomains_*.txt | sort -u > all_subdomains.txt
SUBDOMAIN_COUNT=$(wc -l < all_subdomains.txt)
echo "   Found $SUBDOMAIN_COUNT unique subdomains" | tee -a assessment_log.txt

# WHOIS information
echo "[+] Gathering WHOIS data..." | tee -a assessment_log.txt
whois "$DOMAIN" > whois_info.txt
```

### Step 3: Active Discovery (10 minutes)

```bash
echo "=== PHASE 2: ACTIVE DISCOVERY ===" | tee -a assessment_log.txt

# Live host detection with rate limiting
echo "[+] Identifying live hosts (with rate limiting)..." | tee -a assessment_log.txt

if [[ ! -f "all_subdomains.txt" ]] || [[ ! -s "all_subdomains.txt" ]]; then
    echo "❌ No subdomains found to test" | tee -a assessment_log.txt
    exit 1
fi

SUBDOMAIN_COUNT=$(wc -l < all_subdomains.txt)
if [[ $SUBDOMAIN_COUNT -gt 100 ]]; then
    echo "⚠️ Warning: $SUBDOMAIN_COUNT subdomains found. This may take a while and could trigger rate limiting." | tee -a assessment_log.txt
    echo "Consider reducing scope or using slower rate limiting. Continue? (y/N)"
    read -r continue_response
    if [[ ! "$continue_response" =~ ^[Yy]$ ]]; then
        echo "Assessment paused. Review subdomain list and restart if needed." | tee -a assessment_log.txt
        exit 0
    fi
fi

if ! command -v httpx &> /dev/null; then
    echo "❌ httpx not found - required for live host detection" | tee -a assessment_log.txt
    exit 1
fi

# Use rate limiting to be respectful
httpx -l all_subdomains.txt -silent -status-code -title -tech-detect -rate-limit 10 > live_hosts.txt || {
    echo "❌ httpx failed" | tee -a assessment_log.txt
    exit 1
}

LIVE_COUNT=$(wc -l < live_hosts.txt)
echo "   Found $LIVE_COUNT live hosts" | tee -a assessment_log.txt

# Port scanning on live hosts (with safety checks)
echo "[+] Scanning for open ports (respectful timing)..." | tee -a assessment_log.txt

if [[ $LIVE_COUNT -eq 0 ]]; then
    echo "⚠️ No live hosts found - skipping port scanning" | tee -a assessment_log.txt
else
    if [[ $LIVE_COUNT -gt 20 ]]; then
        echo "⚠️ Warning: $LIVE_COUNT live hosts found. Port scanning may take significant time." | tee -a assessment_log.txt
        echo "Consider reducing scope. Continue with port scanning? (y/N)"
        read -r port_scan_response
        if [[ ! "$port_scan_response" =~ ^[Yy]$ ]]; then
            echo "Port scanning skipped by user choice" | tee -a assessment_log.txt
        else
            # Use respectful timing to avoid overwhelming targets
            echo "   Running respectful port scan..." | tee -a assessment_log.txt
            nmap -iL <(cut -d' ' -f1 live_hosts.txt) --top-ports 100 -T2 --max-rate 50 -oN port_scan.txt || {
                echo "⚠️ Port scan failed or interrupted" | tee -a assessment_log.txt
            }
        fi
    else
        # Smaller scope - proceed with caution
        echo "   Running port scan on $LIVE_COUNT hosts..." | tee -a assessment_log.txt
        nmap -iL <(cut -d' ' -f1 live_hosts.txt) --top-ports 100 -T2 --max-rate 50 -oN port_scan.txt || {
            echo "⚠️ Port scan failed" | tee -a assessment_log.txt
        }
    fi

    # Service fingerprinting (only if port scan succeeded)
    if [[ -f "port_scan.txt" ]] && grep -q "open" port_scan.txt; then
        echo "[+] Fingerprinting services on open ports..." | tee -a assessment_log.txt
        nmap -iL <(cut -d' ' -f1 live_hosts.txt) -sV --top-ports 50 -T2 --max-rate 25 -oN service_scan.txt || {
            echo "⚠️ Service fingerprinting failed" | tee -a assessment_log.txt
        }
    else
        echo "⚠️ No open ports found or port scan failed - skipping service fingerprinting" | tee -a assessment_log.txt
    fi
fi
```

### Step 4: Visual Reconnaissance (5 minutes)

```bash
echo "=== PHASE 3: VISUAL RECONNAISSANCE ===" | tee -a assessment_log.txt

# Take screenshots (with error handling)
echo "[+] Capturing screenshots..." | tee -a assessment_log.txt

if [[ $LIVE_COUNT -eq 0 ]]; then
    echo "⚠️ No live hosts found - skipping screenshots" | tee -a assessment_log.txt
    SCREENSHOT_COUNT=0
else
    if ! command -v gowitness &> /dev/null; then
        echo "⚠️ gowitness not found - skipping screenshots" | tee -a assessment_log.txt
        SCREENSHOT_COUNT=0
    else
        # Create screenshots directory
        mkdir -p screenshots
        
        # Add delay between screenshots to be respectful
        echo "   Taking screenshots with delays (being respectful)..." | tee -a assessment_log.txt
        gowitness file -f <(cut -d' ' -f1 live_hosts.txt) --disable-logging --delay 2 || {
            echo "⚠️ Screenshot capture failed or interrupted" | tee -a assessment_log.txt
        }
        
        SCREENSHOT_COUNT=$(ls screenshots/*.png 2>/dev/null | wc -l)
        echo "   Captured $SCREENSHOT_COUNT screenshots" | tee -a assessment_log.txt
        
        # Generate visual report if screenshots were taken
        if [[ $SCREENSHOT_COUNT -gt 0 ]]; then
            gowitness report generate || echo "⚠️ Report generation failed" | tee -a assessment_log.txt
        fi
    fi
fi
```

### Step 5: Analysis and Reporting

```bash
echo "=== PHASE 4: ANALYSIS ===" | tee -a assessment_log.txt

# Identify interesting findings
echo "[+] Analyzing findings..." | tee -a assessment_log.txt

# Look for admin panels
grep -i "admin\|login\|dashboard\|panel" live_hosts.txt > interesting_hosts.txt

# Check for common vulnerable services
grep -E "(jenkins|gitlab|jira|confluence|phpmyadmin)" live_hosts.txt >> interesting_hosts.txt

# Look for development/staging environments
grep -E "(dev|test|staging|uat)" all_subdomains.txt > dev_environments.txt

# Generate summary report
cat > assessment_summary.md << EOF
# Domain Assessment Summary: $DOMAIN

**Assessment Date:** $(date)  
**Total Subdomains:** $SUBDOMAIN_COUNT  
**Live Hosts:** $LIVE_COUNT  
**Screenshots:** $SCREENSHOT_COUNT  

## Key Findings

### Subdomains of Interest
$(cat dev_environments.txt | head -10)

### Potentially Sensitive Services
$(cat interesting_hosts.txt)

### Open Ports Summary
$(grep "open" port_scan.txt | cut -d'/' -f1 | sort -n | uniq -c | sort -nr | head -10)

## Recommendations

1. **IMMEDIATE**: Review all development/staging environments for public exposure
2. **HIGH PRIORITY**: Implement proper access controls on admin interfaces
3. **SECURITY**: Ensure all services are running latest versions
4. **PROTECTION**: Consider implementing a Web Application Firewall (WAF)
5. **MONITORING**: Set up continuous monitoring for new assets
6. **COMPLIANCE**: Ensure all findings comply with security policies

## Next Steps

1. **Detailed vulnerability assessment** of high-priority hosts (with proper authorization)
2. **Implementation of continuous monitoring** with appropriate rate limiting
3. **Security configuration review** of all discovered services
4. **Responsible disclosure** of any security issues found
5. **Documentation** of all remediation efforts

## ⚠️ Important Reminders

- All scanning was performed with proper authorization
- Rate limiting was used to avoid overwhelming target systems
- No exploitation attempts were made
- All findings should be reported through proper channels
- Follow-up assessments require renewed authorization
EOF

echo "✅ Assessment completed! Check assessment_summary.md for results"
```

---

## 🟡 Continuous Monitoring Setup

**Scenario:** Establish ongoing monitoring for changes in your attack surface.

**Time Required:** 2 hours  
**Prerequisites:** Intermediate ASM knowledge  
**Output:** Automated monitoring system with alerting

### Step 1: Infrastructure Setup (30 minutes)

```bash
# Create monitoring directory structure
mkdir -p asm_monitoring/{scripts,data,logs,reports}
cd asm_monitoring

# Create configuration file
cat > config.conf << EOF
# ASM Monitoring Configuration
DOMAINS="example.com,subsidiary.com,partner.com"
SCAN_INTERVAL="6h"
ALERT_EMAIL="security@company.com"
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
RETENTION_DAYS="90"
EOF

# Create domains list
echo "example.com" > data/domains.txt
echo "subsidiary.com" >> data/domains.txt
echo "partner.com" >> data/domains.txt
```

### Step 2: Baseline Establishment (45 minutes)

```bash
# Create baseline script
cat > scripts/establish_baseline.sh << 'EOF'
#!/bin/bash
source config.conf

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BASELINE_DIR="data/baseline_$TIMESTAMP"

mkdir -p "$BASELINE_DIR"

while IFS= read -r domain; do
    echo "Establishing baseline for: $domain"
    
    # Subdomain discovery
    subfinder -d "$domain" -all -silent > "$BASELINE_DIR/${domain}_subdomains.txt"
    
    # Live host detection
    httpx -l "$BASELINE_DIR/${domain}_subdomains.txt" -silent -status-code -title > "$BASELINE_DIR/${domain}_live_hosts.txt"
    
    # Port scanning
    nmap -iL <(cut -d' ' -f1 "$BASELINE_DIR/${domain}_live_hosts.txt") --top-ports 100 -T4 -oN "$BASELINE_DIR/${domain}_ports.txt"
    
    # Screenshots
    mkdir -p "$BASELINE_DIR/${domain}_screenshots"
    gowitness file -f <(cut -d' ' -f1 "$BASELINE_DIR/${domain}_live_hosts.txt") --screenshot-path "$BASELINE_DIR/${domain}_screenshots/"
    
done < data/domains.txt

# Create symlink to latest baseline
ln -sfn "$BASELINE_DIR" data/baseline_latest

echo "Baseline established: $BASELINE_DIR"
EOF

chmod +x scripts/establish_baseline.sh
./scripts/establish_baseline.sh
```

### Step 3: Change Detection Script (30 minutes)

```bash
# Create change detection script
cat > scripts/detect_changes.sh << 'EOF'
#!/bin/bash
source config.conf

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
CURRENT_DIR="data/current_$TIMESTAMP"
BASELINE_DIR="data/baseline_latest"
CHANGES_DIR="data/changes_$TIMESTAMP"

mkdir -p "$CURRENT_DIR" "$CHANGES_DIR"

while IFS= read -r domain; do
    echo "Scanning $domain for changes..."
    
    # Current scan
    subfinder -d "$domain" -all -silent > "$CURRENT_DIR/${domain}_subdomains.txt"
    httpx -l "$CURRENT_DIR/${domain}_subdomains.txt" -silent -status-code -title > "$CURRENT_DIR/${domain}_live_hosts.txt"
    
    # Compare with baseline
    if [ -f "$BASELINE_DIR/${domain}_subdomains.txt" ]; then
        # New subdomains
        comm -13 <(sort "$BASELINE_DIR/${domain}_subdomains.txt") <(sort "$CURRENT_DIR/${domain}_subdomains.txt") > "$CHANGES_DIR/${domain}_new_subdomains.txt"
        
        # Removed subdomains
        comm -23 <(sort "$BASELINE_DIR/${domain}_subdomains.txt") <(sort "$CURRENT_DIR/${domain}_subdomains.txt") > "$CHANGES_DIR/${domain}_removed_subdomains.txt"
        
        # New live hosts
        comm -13 <(sort "$BASELINE_DIR/${domain}_live_hosts.txt") <(sort "$CURRENT_DIR/${domain}_live_hosts.txt") > "$CHANGES_DIR/${domain}_new_hosts.txt"
        
        # Generate change report
        if [ -s "$CHANGES_DIR/${domain}_new_subdomains.txt" ] || [ -s "$CHANGES_DIR/${domain}_new_hosts.txt" ]; then
            echo "CHANGES DETECTED for $domain" >> "$CHANGES_DIR/change_summary.txt"
            echo "New subdomains: $(wc -l < "$CHANGES_DIR/${domain}_new_subdomains.txt")" >> "$CHANGES_DIR/change_summary.txt"
            echo "New live hosts: $(wc -l < "$CHANGES_DIR/${domain}_new_hosts.txt")" >> "$CHANGES_DIR/change_summary.txt"
            echo "---" >> "$CHANGES_DIR/change_summary.txt"
        fi
    fi
    
done < data/domains.txt

# Send alerts if changes detected
if [ -f "$CHANGES_DIR/change_summary.txt" ]; then
    scripts/send_alert.sh "$CHANGES_DIR/change_summary.txt"
fi
EOF

chmod +x scripts/detect_changes.sh
```

### Step 4: Alerting System (15 minutes)

```bash
# Create alerting script
cat > scripts/send_alert.sh << 'EOF'
#!/bin/bash
source config.conf

CHANGE_FILE="$1"
TIMESTAMP=$(date)

if [ ! -f "$CHANGE_FILE" ]; then
    echo "No change file provided"
    exit 1
fi

# Email alert
if [ -n "$ALERT_EMAIL" ]; then
    mail -s "ASM Alert: Changes Detected - $TIMESTAMP" "$ALERT_EMAIL" < "$CHANGE_FILE"
fi

# Slack alert
if [ -n "$SLACK_WEBHOOK" ]; then
    CHANGES=$(cat "$CHANGE_FILE")
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚨 ASM Alert: Changes Detected\\n\`\`\`$CHANGES\`\`\`\"}" \
        "$SLACK_WEBHOOK"
fi

echo "Alert sent for changes: $CHANGE_FILE"
EOF

chmod +x scripts/send_alert.sh
```

### Step 5: Automation Setup

```bash
# Create cron job
cat > scripts/setup_cron.sh << 'EOF'
#!/bin/bash

# Add to crontab
(crontab -l 2>/dev/null; echo "0 */6 * * * cd $(pwd) && ./scripts/detect_changes.sh") | crontab -

echo "Cron job added: ASM monitoring every 6 hours"
EOF

chmod +x scripts/setup_cron.sh
./scripts/setup_cron.sh
```

---

## 🟡 Incident Response Investigation

**Scenario:** A security incident has occurred and you need to quickly assess the attack surface for potential entry points.

**Time Required:** 1 hour  
**Prerequisites:** Incident details, affected domains  
**Output:** Rapid attack surface assessment

### Step 1: Rapid Asset Discovery (15 minutes)

```bash
# Set up incident investigation
INCIDENT_ID="INC-2025-001"
AFFECTED_DOMAIN="compromised.com"
INVESTIGATION_DIR="incident_${INCIDENT_ID}_$(date +%Y%m%d_%H%M%S)"

mkdir -p "$INVESTIGATION_DIR"
cd "$INVESTIGATION_DIR"

# Document incident
cat > incident_details.txt << EOF
Incident ID: $INCIDENT_ID
Affected Domain: $AFFECTED_DOMAIN
Investigation Started: $(date)
Investigator: $(whoami)
EOF

# Rapid subdomain discovery
echo "🔍 Rapid asset discovery..."
subfinder -d "$AFFECTED_DOMAIN" -all -silent > subdomains.txt
amass enum -passive -d "$AFFECTED_DOMAIN" -timeout 5 -o subdomains_amass.txt

# Combine results
cat subdomains*.txt | sort -u > all_assets.txt
echo "Found $(wc -l < all_assets.txt) total assets"
```

### Step 2: Live Service Identification (15 minutes)

```bash
# Quick live host detection
echo "🌐 Identifying live services..."
httpx -l all_assets.txt -silent -status-code -title -tech-detect -threads 50 > live_services.txt

# Identify high-risk services
echo "⚠️ Identifying high-risk services..."
grep -E "(admin|login|dashboard|api|dev|test|staging)" live_services.txt > high_risk_services.txt

# Check for common vulnerable applications
grep -iE "(jenkins|gitlab|jira|confluence|wordpress|drupal|phpmyadmin)" live_services.txt > vulnerable_apps.txt
```

### Step 3: Port and Service Analysis (20 minutes)

```bash
# Fast port scan on live hosts
echo "🔌 Scanning critical ports..."
nmap -iL <(cut -d' ' -f1 live_services.txt) -p 22,23,80,443,3389,5432,3306,1433,6379,9200 -T4 -oN critical_ports.txt

# Look for exposed databases and admin services
echo "🗄️ Checking for exposed databases..."
nmap -iL <(cut -d' ' -f1 live_services.txt) -p 3306,5432,1433,27017,6379,9200 -sV -T4 -oN database_scan.txt

# Check for remote access services
echo "🔐 Checking remote access services..."
nmap -iL <(cut -d' ' -f1 live_services.txt) -p 22,23,3389,5900 -sV -T4 -oN remote_access.txt
```

### Step 4: Threat Correlation (10 minutes)

```bash
# Generate incident report
cat > incident_assessment.md << EOF
# Incident Response - Attack Surface Assessment

**Incident ID:** $INCIDENT_ID  
**Domain:** $AFFECTED_DOMAIN  
**Assessment Time:** $(date)

## Summary
- **Total Assets:** $(wc -l < all_assets.txt)
- **Live Services:** $(wc -l < live_services.txt)
- **High-Risk Services:** $(wc -l < high_risk_services.txt)
- **Potentially Vulnerable Apps:** $(wc -l < vulnerable_apps.txt)

## Critical Findings

### High-Risk Services
$(cat high_risk_services.txt)

### Potentially Vulnerable Applications
$(cat vulnerable_apps.txt)

### Exposed Databases
$(grep "open" database_scan.txt)

### Remote Access Points
$(grep "open" remote_access.txt)

## Immediate Actions Required

1. **Secure exposed admin interfaces**
2. **Review database access controls**
3. **Audit remote access services**
4. **Implement network segmentation**
5. **Enable additional monitoring**

## Investigation Notes
- Check logs for access to identified high-risk services
- Correlate with known attack patterns
- Review recent changes to exposed services
EOF

echo "📄 Incident assessment completed: incident_assessment.md"
```

---

## 🔴 Merger & Acquisition Due Diligence

**Scenario:** Your organization is acquiring another company and needs a comprehensive security assessment of their digital assets.

**Time Required:** 4-8 hours  
**Prerequisites:** Target company domains, advanced ASM skills  
**Output:** Comprehensive security due diligence report

### Step 1: Comprehensive Asset Discovery (2 hours)

```bash
# Set up M&A assessment
TARGET_COMPANY="AcquiredCorp"
DOMAINS="acquired.com,subsidiary.acquired.com"
MA_DIR="ma_assessment_${TARGET_COMPANY}_$(date +%Y%m%d)"

mkdir -p "$MA_DIR"/{discovery,analysis,reports,evidence}
cd "$MA_DIR"

# Create domain list
echo "$DOMAINS" | tr ',' '\n' > discovery/domains.txt

# Comprehensive subdomain discovery
while IFS= read -r domain; do
    echo "🔍 Comprehensive discovery for: $domain"
    
    # Multiple subdomain sources
    subfinder -d "$domain" -all -silent > "discovery/${domain}_subfinder.txt"
    amass enum -active -d "$domain" -brute -o "discovery/${domain}_amass.txt"
    
    # Certificate transparency
    curl -s "https://crt.sh/?q=%.${domain}&output=json" | jq -r '.[].name_value' | sort -u > "discovery/${domain}_ct.txt"
    
    # DNS brute force
    dnsrecon -d "$domain" -D /usr/share/wordlists/dnsmap.txt -t brt > "discovery/${domain}_dnsrecon.txt"
    
    # Combine all sources
    cat discovery/${domain}_*.txt | sort -u > "discovery/${domain}_all_subdomains.txt"
    
done < discovery/domains.txt

# Consolidate all findings
cat discovery/*_all_subdomains.txt | sort -u > discovery/all_assets.txt
```

### Step 2: Technology Stack Analysis (1 hour)

```bash
# Comprehensive technology detection
echo "🔧 Analyzing technology stacks..."
httpx -l discovery/all_assets.txt -tech-detect -status-code -title -content-length -response-time > analysis/tech_stack.txt

# Identify technology patterns
echo "📊 Technology summary:"
grep -o 'tech:\[[^]]*\]' analysis/tech_stack.txt | sort | uniq -c | sort -nr > analysis/tech_summary.txt

# Look for outdated or vulnerable technologies
grep -iE "(wordpress|drupal|joomla|php|apache|nginx|iis)" analysis/tech_stack.txt > analysis/cms_webservers.txt
```

### Step 3: Security Posture Assessment (2 hours)

```bash
# Comprehensive port scanning
echo "🔌 Comprehensive port analysis..."
nmap -iL <(cut -d' ' -f1 analysis/tech_stack.txt) -sS -sV -O --top-ports 1000 -T4 -oA analysis/comprehensive_scan

# Look for security misconfigurations
echo "⚠️ Checking for security issues..."

# Check for exposed admin interfaces
grep -iE "(admin|login|dashboard|panel|cpanel|phpmyadmin)" analysis/tech_stack.txt > analysis/admin_interfaces.txt

# Check for development environments
grep -iE "(dev|test|staging|uat|demo)" discovery/all_assets.txt > analysis/dev_environments.txt

# Check for exposed databases
nmap -iL <(cut -d' ' -f1 analysis/tech_stack.txt) -p 3306,5432,1433,27017,6379,9200,11211 -sV -T4 -oN analysis/database_exposure.txt

# Check for cloud storage
grep -E "(s3|blob|storage)" discovery/all_assets.txt > analysis/cloud_storage.txt
```

### Step 4: Risk Assessment and Reporting (1-2 hours)

```bash
# Generate comprehensive M&A security report
cat > reports/ma_security_assessment.md << EOF
# M&A Security Assessment: $TARGET_COMPANY

**Assessment Date:** $(date)  
**Assessed Domains:** $(cat discovery/domains.txt | tr '\n' ', ')  
**Total Assets Discovered:** $(wc -l < discovery/all_assets.txt)  
**Live Services:** $(wc -l < analysis/tech_stack.txt)

## Executive Summary

This assessment reveals the security posture of $TARGET_COMPANY's digital assets. Key findings include potential security risks that should be addressed post-acquisition.

## Asset Inventory

### Domain Portfolio
$(cat discovery/domains.txt | while read domain; do
    count=$(wc -l < "discovery/${domain}_all_subdomains.txt")
    echo "- $domain: $count subdomains"
done)

### Technology Stack Distribution
$(head -20 analysis/tech_summary.txt)

## Security Findings

### 🔴 Critical Issues

#### Exposed Administrative Interfaces
$(cat analysis/admin_interfaces.txt | head -10)

#### Database Exposure
$(grep "open" analysis/database_exposure.txt)

#### Development Environment Exposure
$(cat analysis/dev_environments.txt | head -10)

### 🟡 Medium Risk Issues

#### Outdated Technologies
$(grep -iE "(php/[4-7]|apache/[1-2]|nginx/1\.[0-9])" analysis/tech_stack.txt)

#### Cloud Storage Exposure
$(cat analysis/cloud_storage.txt)

## Risk Assessment

### High Priority Remediation
1. Secure or remove exposed administrative interfaces
2. Implement proper database access controls
3. Remove or secure development environments
4. Update outdated software components

### Medium Priority Actions
1. Implement Web Application Firewall (WAF)
2. Enable security headers
3. Conduct vulnerability assessments
4. Implement monitoring and logging

## Financial Impact Considerations

### Immediate Costs
- Emergency security remediation: \$50,000 - \$200,000
- Security tool implementation: \$25,000 - \$100,000
- Compliance gap remediation: \$100,000 - \$500,000

### Ongoing Costs
- Additional security staff: \$150,000 - \$300,000/year
- Security tool licensing: \$50,000 - \$150,000/year
- Compliance maintenance: \$75,000 - \$200,000/year

## Recommendations

### Pre-Acquisition
1. Require immediate remediation of critical issues
2. Negotiate security remediation costs
3. Include security warranties in acquisition agreement

### Post-Acquisition (First 90 days)
1. Implement emergency security controls
2. Conduct comprehensive vulnerability assessment
3. Integrate into corporate security program
4. Establish ongoing monitoring

### Long-term Integration
1. Align with corporate security standards
2. Implement unified security architecture
3. Establish security governance
4. Regular security assessments

## Appendices

### A. Complete Asset Inventory
[See discovery/all_assets.txt]

### B. Technical Findings
[See analysis/ directory]

### C. Evidence
[See evidence/ directory]
EOF

echo "📄 M&A assessment completed: reports/ma_security_assessment.md"
```

---

## 🟡 Bug Bounty Reconnaissance

**Scenario:** You're participating in a bug bounty program and need to efficiently map the target's attack surface.

**Time Required:** 1-2 hours  
**Prerequisites:** Bug bounty program scope, intermediate skills  
**Output:** Comprehensive target reconnaissance

### Step 1: Scope Analysis and Planning (15 minutes)

```bash
# Set up bug bounty reconnaissance
PROGRAM="example-corp"
SCOPE_DOMAINS="*.example.com,api.example.com,mobile.example.com"
BB_DIR="bugbounty_${PROGRAM}_$(date +%Y%m%d_%H%M%S)"

mkdir -p "$BB_DIR"/{recon,analysis,targets,notes}
cd "$BB_DIR"

# Document scope
cat > notes/scope.md << EOF
# Bug Bounty Scope: $PROGRAM

## In Scope
$SCOPE_DOMAINS

## Out of Scope
- Third-party services
- Social engineering
- Physical attacks
- DoS attacks

## Program Rules
- Report duplicates are not rewarded
- Test accounts: test@example.com / password123
- Rate limiting: Max 10 requests/second
EOF

# Create target list
echo "$SCOPE_DOMAINS" | tr ',' '\n' | sed 's/\*\.//g' > recon/root_domains.txt
```

### Step 2: Aggressive Subdomain Discovery (30 minutes)

```bash
# Multi-source subdomain enumeration
while IFS= read -r domain; do
    echo "🎯 Enumerating: $domain"
    
    # Passive sources
    subfinder -d "$domain" -all -silent > "recon/${domain}_subfinder.txt"
    amass enum -passive -d "$domain" -o "recon/${domain}_amass.txt"
    
    # Certificate transparency
    curl -s "https://crt.sh/?q=%.${domain}&output=json" | jq -r '.[].name_value' | sort -u > "recon/${domain}_ct.txt"
    
    # GitHub dorking for subdomains
    curl -s "https://api.github.com/search/code?q=${domain}+extension:txt" | jq -r '.items[].html_url' > "recon/${domain}_github.txt"
    
    # Combine all sources
    cat recon/${domain}_*.txt | sort -u > "recon/${domain}_all_subs.txt"
    
done < recon/root_domains.txt

# Consolidate all subdomains
cat recon/*_all_subs.txt | sort -u > recon/all_subdomains.txt
echo "Found $(wc -l < recon/all_subdomains.txt) total subdomains"
```

### Step 3: Live Target Identification (20 minutes)

```bash
# Identify live targets with detailed information
echo "🌐 Identifying live targets..."
httpx -l recon/all_subdomains.txt -tech-detect -status-code -title -content-length -response-time -follow-redirects > analysis/live_targets.txt

# Filter for interesting targets
echo "🎯 Filtering interesting targets..."

# Web applications (potential for XSS, SQLi, etc.)
grep -E "(200|403)" analysis/live_targets.txt | grep -v "404\|301\|302" > targets/web_apps.txt

# API endpoints
grep -iE "(api|rest|graphql|json)" analysis/live_targets.txt > targets/api_endpoints.txt

# Admin/login interfaces
grep -iE "(admin|login|dashboard|panel|auth)" analysis/live_targets.txt > targets/admin_interfaces.txt

# Development environments
grep -iE "(dev|test|staging|uat|beta)" analysis/live_targets.txt > targets/dev_environments.txt
```

### Step 4: Technology Profiling (15 minutes)

```bash
# Analyze technology stacks for known vulnerabilities
echo "🔧 Profiling technologies..."

# Extract technology information
grep -o 'tech:\[[^]]*\]' analysis/live_targets.txt | sort | uniq -c | sort -nr > analysis/tech_profile.txt

# Look for potentially vulnerable technologies
grep -iE "(wordpress|drupal|joomla|struts|spring|laravel)" analysis/live_targets.txt > targets/cms_frameworks.txt

# Check for interesting headers and technologies
httpx -l <(cut -d' ' -f1 targets/web_apps.txt) -include-response-header -tech-detect > analysis/detailed_headers.txt
```

### Step 5: Target Prioritization (20 minutes)

```bash
# Create prioritized target list
cat > targets/priority_targets.md << EOF
# Bug Bounty Target Prioritization

## 🔴 High Priority Targets

### Admin Interfaces
$(cat targets/admin_interfaces.txt | head -10)

### API Endpoints
$(cat targets/api_endpoints.txt | head -10)

### Development Environments
$(cat targets/dev_environments.txt | head -5)

## 🟡 Medium Priority Targets

### CMS/Framework Applications
$(cat targets/cms_frameworks.txt | head -10)

### Standard Web Applications
$(cat targets/web_apps.txt | head -15)

## Attack Vectors to Test

### High-Value Targets
1. **Admin panels**: Test for default credentials, brute force protection
2. **API endpoints**: Test for authentication bypass, injection flaws
3. **Dev environments**: Often have weaker security controls

### Common Vulnerabilities
1. **XSS**: Test input fields, URL parameters
2. **SQL Injection**: Test database interactions
3. **Authentication bypass**: Test login mechanisms
4. **IDOR**: Test object references
5. **SSRF**: Test URL parameters and file uploads

## Testing Notes
- Use Burp Suite for manual testing
- Set up automated scanning with nuclei
- Document all findings with PoC
- Respect rate limits and scope
EOF

echo "🎯 Target prioritization completed: targets/priority_targets.md"
```

---

## 🔴 Cloud Migration Assessment

**Scenario:** Your organization is migrating to the cloud and needs to assess the security implications of the current and future attack surface.

**Time Required:** 3-6 hours  
**Prerequisites:** Cloud environment access, advanced skills  
**Output:** Pre and post-migration security assessment

### Step 1: Current State Assessment (1-2 hours)

```bash
# Set up cloud migration assessment
MIGRATION_PROJECT="CloudMigration2025"
CURRENT_DOMAINS="legacy.company.com,internal.company.com"
CLOUD_DOMAINS="company-prod.azurewebsites.net,company-api.amazonaws.com"

MIGRATION_DIR="cloud_migration_assessment_$(date +%Y%m%d)"
mkdir -p "$MIGRATION_DIR"/{current,cloud,analysis,reports}
cd "$MIGRATION_DIR"

# Document migration scope
cat > migration_scope.md << EOF
# Cloud Migration Security Assessment

**Project:** $MIGRATION_PROJECT  
**Assessment Date:** $(date)

## Current Environment
$CURRENT_DOMAINS

## Target Cloud Environment
$CLOUD_DOMAINS

## Migration Timeline
- Phase 1: Web applications (Month 1-2)
- Phase 2: APIs and services (Month 3-4)
- Phase 3: Databases and storage (Month 5-6)
EOF

# Assess current on-premises environment
echo "🏢 Assessing current environment..."
echo "$CURRENT
