# 🎯 ASM Scenario-Based Command Cards

**Professional-grade reference for real-world situations**

---

## 🚨 SCENARIO 1: Incident Response - Rapid Asset Discovery
**Time Critical: Complete assessment in under 30 minutes**

### Phase 1: Immediate Discovery (5 minutes)
```bash
#!/bin/bash
# INCIDENT RESPONSE RAPID DISCOVERY SCRIPT
DOMAIN="${1:-example.com}"
INCIDENT_ID="${2:-INC-$(date +%Y%m%d-%H%M%S)}"
OUTPUT_DIR="incident_${INCIDENT_ID}"

# Create incident workspace with error handling
mkdir -p "${OUTPUT_DIR}" || { echo "❌ Failed to create directory"; exit 1; }
cd "${OUTPUT_DIR}" || exit 1

# Log incident details
cat > incident.log << EOF
Incident ID: ${INCIDENT_ID}
Domain: ${DOMAIN}
Started: $(date)
Analyst: $(whoami)
EOF

# Parallel subdomain discovery with timeout
echo "[$(date +%T)] Starting rapid discovery..." | tee -a incident.log
(
    timeout 120 subfinder -d "${DOMAIN}" -all -silent &
    timeout 120 amass enum -passive -d "${DOMAIN}" -timeout 2 &
    timeout 120 curl -s "https://crt.sh/?q=%.${DOMAIN}&output=json" | jq -r '.[].name_value' &
    wait
) | sort -u > subdomains.txt 2>/dev/null

echo "[$(date +%T)] Found $(wc -l < subdomains.txt) subdomains" | tee -a incident.log
```

### Phase 2: Critical Service Identification (10 minutes)
```bash
# Identify live critical services with parallel processing
echo "[$(date +%T)] Identifying critical services..." | tee -a incident.log

# Check for exposed admin panels, databases, and APIs
cat subdomains.txt | \
httpx -silent -threads 50 -timeout 3 -status-code -title -tech-detect \
    -match-regex '(admin|login|dashboard|api|graphql|phpmyadmin|jenkins|gitlab)' \
    -o critical_services.txt

# Quick port scan for database and remote access services
CRITICAL_PORTS="22,23,443,1433,3306,3389,5432,5900,6379,9200,27017"
cat subdomains.txt | dnsx -silent -a -resp | cut -d' ' -f2 | \
    nmap -iL - -p ${CRITICAL_PORTS} -sS -Pn -T4 --open \
    --max-retries 1 --host-timeout 30s -oG - | \
    grep -E "Host:.*Ports:" > critical_ports.txt

# Extract high-risk findings
grep -E "(mongodb|redis|elasticsearch|mysql|postgres|rdp|vnc|telnet)" critical_ports.txt > HIGH_RISK.txt

if [ -s HIGH_RISK.txt ]; then
    echo "⚠️ HIGH RISK SERVICES EXPOSED:" | tee -a incident.log
    cat HIGH_RISK.txt | tee -a incident.log
fi
```

### Phase 3: Evidence Collection (10 minutes)
```bash
# Collect evidence for incident report
echo "[$(date +%T)] Collecting evidence..." | tee -a incident.log

# Take screenshots of critical services
cat critical_services.txt | cut -d' ' -f1 | \
    gowitness file -f - --disable-logging --timeout 10 --delay 1

# Check for exposed sensitive files
SENSITIVE_PATTERNS="(.git/|.env|.aws/|.ssh/|backup|dump|config\.php|wp-config)"
cat critical_services.txt | cut -d' ' -f1 | \
while read -r url; do
    for path in ".git/HEAD" ".env" "backup.sql" ".aws/credentials"; do
        response=$(curl -s -o /dev/null -w "%{http_code}" "${url}/${path}" --max-time 3)
        [ "$response" != "404" ] && echo "[EXPOSED] ${url}/${path} - HTTP ${response}" >> exposed_files.txt
    done
done

# Generate incident summary
cat > INCIDENT_SUMMARY.md << EOF
# Incident Response Summary
**ID:** ${INCIDENT_ID}
**Domain:** ${DOMAIN}
**Time:** $(date)

## Statistics
- Total Subdomains: $(wc -l < subdomains.txt)
- Live Services: $(wc -l < critical_services.txt)
- High Risk Ports: $(wc -l < HIGH_RISK.txt 2>/dev/null || echo 0)
- Exposed Files: $(wc -l < exposed_files.txt 2>/dev/null || echo 0)

## Critical Findings
$(cat HIGH_RISK.txt 2>/dev/null || echo "None detected")

## Immediate Actions Required
1. Isolate exposed database services
2. Review authentication on admin panels
3. Audit exposed configuration files
4. Enable network segmentation
EOF

echo "[$(date +%T)] Assessment complete. See INCIDENT_SUMMARY.md" | tee -a incident.log
```

### Error Handling & Recovery
```bash
# Robust error handling for production use
set -euo pipefail
trap 'echo "Error on line $LINENO. Exit code: $?" | tee -a error.log' ERR

# Network connectivity check
check_connectivity() {
    if ! ping -c 1 8.8.8.8 &>/dev/null; then
        echo "❌ No internet connectivity" >&2
        exit 1
    fi
}

# Tool availability check
check_tools() {
    local missing_tools=()
    for tool in subfinder amass httpx nmap gowitness dnsx; do
        if ! command -v "$tool" &>/dev/null; then
            missing_tools+=("$tool")
        fi
    done
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        echo "❌ Missing tools: ${missing_tools[*]}"
        echo "Install with: go install -v github.com/projectdiscovery/[tool]@latest"
        exit 1
    fi
}

# Rate limiting protection
rate_limit_check() {
    local last_request_file="/tmp/.asm_last_request"
    if [ -f "$last_request_file" ]; then
        local last_time=$(cat "$last_request_file")
        local current_time=$(date +%s)
        local diff=$((current_time - last_time))
        if [ $diff -lt 2 ]; then
            sleep $((2 - diff))
        fi
    fi
    date +%s > "$last_request_file"
}
```

---

## 💼 SCENARIO 2: M&A Due Diligence - Comprehensive Assessment
**Thorough analysis for acquisition targets**

### Phase 1: Asset Inventory (2 hours)
```bash
#!/bin/bash
# M&A COMPREHENSIVE ASSET DISCOVERY
TARGET_COMPANY="$1"
DOMAINS_FILE="$2"  # File containing all known domains

# Setup comprehensive logging
setup_ma_assessment() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    export MA_DIR="MA_${TARGET_COMPANY}_${timestamp}"
    mkdir -p "${MA_DIR}"/{discovery,analysis,evidence,reports}
    
    # Initialize assessment database
    cat > "${MA_DIR}/assessment.json" << EOF
{
    "company": "${TARGET_COMPANY}",
    "start_time": "$(date -Iseconds)",
    "domains": [],
    "findings": {
        "critical": [],
        "high": [],
        "medium": [],
        "low": []
    }
}
EOF
}

# Comprehensive subdomain enumeration with validation
deep_subdomain_discovery() {
    local domain="$1"
    local output_dir="${MA_DIR}/discovery/${domain}"
    mkdir -p "${output_dir}"
    
    echo "[+] Deep discovery for ${domain}"
    
    # Multiple enumeration sources with progress tracking
    {
        # Passive sources
        echo "[1/8] Subfinder..." >&2
        timeout 300 subfinder -d "${domain}" -all -silent -o "${output_dir}/subfinder.txt"
        
        echo "[2/8] Amass passive..." >&2
        timeout 600 amass enum -passive -d "${domain}" -o "${output_dir}/amass_passive.txt"
        
        echo "[3/8] Certificate Transparency..." >&2
        curl -s "https://crt.sh/?q=%.${domain}&output=json" | \
            jq -r '.[].name_value' | sort -u > "${output_dir}/crt.txt"
        
        echo "[4/8] SecurityTrails..." >&2
        [ -n "${SECURITYTRAILS_API}" ] && \
            curl -s "https://api.securitytrails.com/v1/domain/${domain}/subdomains" \
                -H "apikey: ${SECURITYTRAILS_API}" | \
                jq -r '.subdomains[]' | sed "s/$/\.${domain}/" > "${output_dir}/securitytrails.txt"
        
        echo "[5/8] Wayback Machine..." >&2
        curl -s "http://web.archive.org/cdx/search/cdx?url=*.${domain}/*&output=text&fl=original&collapse=urlkey" | \
            sed -e 's_https*://__' -e "s/\/.*//" | sort -u > "${output_dir}/wayback.txt"
        
        echo "[6/8] GitHub search..." >&2
        [ -n "${GITHUB_TOKEN}" ] && \
            gh api search/code -q "${domain}" --jq '.items[].html_url' | \
            grep -oP '(?<=\/\/)[^\/]*\.'"${domain}" | sort -u > "${output_dir}/github.txt"
        
        echo "[7/8] DNS brute force..." >&2
        # Only if explicitly authorized
        [ "${ACTIVE_SCAN:-false}" == "true" ] && \
            dnsrecon -d "${domain}" -D /usr/share/wordlists/subdomains-top1mil-20000.txt \
                -t brt --threads 50 -o "${output_dir}/dnsrecon.txt"
        
        echo "[8/8] Consolidating results..." >&2
        cat "${output_dir}"/*.txt 2>/dev/null | \
            grep -E "^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$" | \
            sort -u > "${output_dir}/all_subdomains.txt"
        
    } 2>&1 | tee "${output_dir}/discovery.log"
    
    echo "[✓] Found $(wc -l < "${output_dir}/all_subdomains.txt") unique subdomains for ${domain}"
}

# Parallel processing for multiple domains
while IFS= read -r domain; do
    deep_subdomain_discovery "${domain}" &
    # Limit parallel jobs to prevent resource exhaustion
    [ $(jobs -r | wc -l) -ge 5 ] && wait -n
done < "${DOMAINS_FILE}"
wait
```

### Phase 2: Technology & Risk Analysis
```bash
# Technology stack profiling with vulnerability correlation
technology_risk_assessment() {
    local all_hosts="${MA_DIR}/discovery/all_live_hosts.txt"
    
    # Aggregate all discovered hosts
    find "${MA_DIR}/discovery" -name "all_subdomains.txt" -exec cat {} \; | sort -u > "${all_hosts}.tmp"
    
    # Identify live hosts with detailed information
    echo "[+] Analyzing technology stack and vulnerabilities..."
    
    httpx -l "${all_hosts}.tmp" \
        -status-code -title -tech-detect -server -content-type \
        -response-time -content-length -cdn -tls-grab \
        -threads 50 -timeout 10 -o "${all_hosts}" -json | \
    jq -r 'select(.status_code != null) | 
        {
            url: .url,
            status: .status_code,
            title: .title,
            tech: .tech,
            server: .server,
            tls: .tls,
            cdn: .cdn,
            response_time: .response_time
        }' > "${MA_DIR}/analysis/technology_profile.json"
    
    # Identify outdated and vulnerable technologies
    cat "${MA_DIR}/analysis/technology_profile.json" | \
    jq -r '.tech[]?' | sort | uniq -c | sort -rn > "${MA_DIR}/analysis/tech_summary.txt"
    
    # Check for known vulnerable versions
    while IFS= read -r tech; do
        case "$tech" in
            *"WordPress"*|*"wordpress"*)
                echo "RISK: WordPress detected - check for outdated plugins" >> "${MA_DIR}/analysis/risks.txt"
                ;;
            *"PHP/5"*|*"PHP/7.0"*|*"PHP/7.1"*|*"PHP/7.2"*)
                echo "CRITICAL: Outdated PHP version detected: $tech" >> "${MA_DIR}/analysis/risks.txt"
                ;;
            *"Apache/2.2"*|*"Apache/2.0"*)
                echo "HIGH: Outdated Apache version: $tech" >> "${MA_DIR}/analysis/risks.txt"
                ;;
            *"OpenSSL/1.0"*)
                echo "HIGH: Outdated OpenSSL version: $tech" >> "${MA_DIR}/analysis/risks.txt"
                ;;
            *"IIS/6"*|*"IIS/7"*)
                echo "CRITICAL: Severely outdated IIS version: $tech" >> "${MA_DIR}/analysis/risks.txt"
                ;;
        esac
    done < <(cat "${MA_DIR}/analysis/tech_summary.txt" | awk '{$1=""; print $0}')
}

# Cloud infrastructure assessment
cloud_infrastructure_discovery() {
    echo "[+] Discovering cloud infrastructure..."
    
    # AWS S3 buckets
    for domain in $(cat "${DOMAINS_FILE}"); do
        local company_name=$(echo "$domain" | cut -d'.' -f1)
        
        # Common S3 bucket patterns
        for pattern in "" "-backup" "-dev" "-prod" "-staging" "-uploads" "-public" "-private" "-logs" "-data"; do
            local bucket="${company_name}${pattern}"
            
            # Check if bucket exists
            if aws s3 ls "s3://${bucket}" --no-sign-request &>/dev/null; then
                echo "EXPOSED: S3 bucket found: ${bucket}" >> "${MA_DIR}/analysis/cloud_exposure.txt"
                
                # Try to list contents
                aws s3 ls "s3://${bucket}" --no-sign-request --recursive | head -20 >> "${MA_DIR}/analysis/s3_contents.txt" 2>/dev/null
            fi
        done
    done
    
    # Azure blob storage
    for domain in $(cat "${DOMAINS_FILE}"); do
        local company_name=$(echo "$domain" | cut -d'.' -f1)
        
        for pattern in "" "backup" "dev" "prod" "staging"; do
            local storage="${company_name}${pattern}"
            
            # Check Azure storage
            if curl -s "https://${storage}.blob.core.windows.net/?comp=list" | grep -q "ContainerName"; then
                echo "EXPOSED: Azure storage found: ${storage}" >> "${MA_DIR}/analysis/cloud_exposure.txt"
            fi
        done
    done
}
```

### Phase 3: Comprehensive Security Assessment
```bash
# Full security evaluation with scoring
security_scoring() {
    local score=100
    local findings="${MA_DIR}/reports/security_findings.md"
    
    cat > "${findings}" << EOF
# Security Assessment Report
**Company:** ${TARGET_COMPANY}
**Date:** $(date)
**Assessor:** $(whoami)

## Executive Summary
EOF
    
    # Calculate security score based on findings
    
    # Critical findings (-20 points each)
    local critical_count=$(grep -c "CRITICAL:" "${MA_DIR}/analysis/risks.txt" 2>/dev/null || echo 0)
    score=$((score - critical_count * 20))
    
    # High findings (-10 points each)
    local high_count=$(grep -c "HIGH:" "${MA_DIR}/analysis/risks.txt" 2>/dev/null || echo 0)
    score=$((score - high_count * 10))
    
    # Exposed services (-5 points each)
    local exposed_count=$(grep -c "EXPOSED:" "${MA_DIR}/analysis/cloud_exposure.txt" 2>/dev/null || echo 0)
    score=$((score - exposed_count * 5))
    
    # Ensure score doesn't go below 0
    [ $score -lt 0 ] && score=0
    
    cat >> "${findings}" << EOF

**Security Score: ${score}/100**

### Risk Distribution
- Critical Issues: ${critical_count}
- High Risk Issues: ${high_count}
- Exposed Cloud Resources: ${exposed_count}

## Detailed Findings

### Critical Issues Requiring Immediate Attention
$(grep "CRITICAL:" "${MA_DIR}/analysis/risks.txt" 2>/dev/null || echo "None identified")

### High Risk Issues
$(grep "HIGH:" "${MA_DIR}/analysis/risks.txt" 2>/dev/null || echo "None identified")

### Cloud Exposure
$(cat "${MA_DIR}/analysis/cloud_exposure.txt" 2>/dev/null || echo "No exposed cloud resources found")

## Financial Impact Assessment

### Immediate Remediation Costs
- Critical issue remediation: \$$(( critical_count * 50000 )) - \$$(( critical_count * 100000 ))
- High risk remediation: \$$(( high_count * 25000 )) - \$$(( high_count * 50000 ))
- Cloud security implementation: \$75,000 - \$150,000

### Ongoing Security Investment
- Security team augmentation: \$300,000 - \$500,000/year
- Tool and platform costs: \$100,000 - \$250,000/year
- Compliance and audit: \$50,000 - \$150,000/year

## Recommendations

### Pre-Acquisition Requirements
1. Mandate immediate patching of critical vulnerabilities
2. Require cloud security audit and remediation
3. Negotiate price adjustment based on security debt

### Post-Acquisition 30-Day Plan
1. Implement emergency security controls
2. Conduct penetration testing
3. Deploy security monitoring
4. Establish incident response procedures

### 90-Day Security Roadmap
1. Complete vulnerability remediation
2. Implement zero-trust architecture
3. Deploy advanced threat detection
4. Achieve compliance certifications
EOF
    
    echo "[✓] Security assessment complete. Score: ${score}/100"
}
```

---

## 🐛 SCENARIO 3: Bug Bounty - Efficient Target Mapping
**Maximize coverage while respecting scope**

### Intelligent Target Discovery
```bash
#!/bin/bash
# BUG BOUNTY INTELLIGENT RECON
PROGRAM="$1"
SCOPE_FILE="$2"  # File with in-scope domains/IPs

# Smart subdomain enumeration with scope validation
bug_bounty_recon() {
    local BB_DIR="bugbounty_${PROGRAM}_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "${BB_DIR}"/{recon,targets,payloads,reports}
    
    # Parse scope rules
    parse_scope() {
        echo "[+] Parsing scope rules..."
        
        # Extract in-scope patterns
        grep -E "^\*\.|^[a-zA-Z0-9]" "${SCOPE_FILE}" | \
            sed 's/^\*\.//' > "${BB_DIR}/in_scope.txt"
        
        # Extract out-of-scope patterns
        grep "^!" "${SCOPE_FILE}" | sed 's/^!//' > "${BB_DIR}/out_scope.txt"
    }
    
    # Intelligent subdomain discovery with automatic filtering
    smart_enumeration() {
        local domain="$1"
        
        echo "[+] Smart enumeration for ${domain}"
        
        # Use multiple sources but filter aggressively
        {
            subfinder -d "${domain}" -all -silent
            amass enum -passive -d "${domain}" -silent
            curl -s "https://crt.sh/?q=%.${domain}&output=json" | jq -r '.[].name_value'
        } | sort -u | while read -r subdomain; do
            # Check if subdomain is in scope
            local in_scope=true
            
            # Check against out-of-scope patterns
            while IFS= read -r pattern; do
                if echo "$subdomain" | grep -qE "$pattern"; then
                    in_scope=false
                    break
                fi
            done < "${BB_DIR}/out_scope.txt"
            
            # Only include if in scope
            [ "$in_scope" = true ] && echo "$subdomain"
        done > "${BB_DIR}/recon/${domain}_subdomains.txt"
    }
    
    # Identify high-value targets
    find_interesting_targets() {
        echo "[+] Identifying high-value targets..."
        
        # Patterns that often have vulnerabilities
        local interesting_patterns=(
            "api" "admin" "dashboard" "portal" "upload" "dev" "test" "staging"
            "uat" "beta" "demo" "internal" "secure" "private" "auth" "oauth"
            "sso" "login" "signin" "register" "account" "user" "profile"
            "payment" "checkout" "cart" "shop" "store" "blog" "forum"
            "search" "download" "file" "document" "backup" "db" "database"
            "mysql" "postgres" "mongo" "redis" "elastic" "graphql" "rest"
            "v1" "v2" "v3" "mobile" "ios" "android" "cdn" "static" "media"
        )
        
        # Find and prioritize interesting subdomains
        for pattern in "${interesting_patterns[@]}"; do
            grep -E "(^|\.)?${pattern}(\.|$)" "${BB_DIR}/recon/"*_subdomains.txt 2>/dev/null | \
                cut -d':' -f2 >> "${BB_DIR}/targets/high_value.txt"
        done
        
        sort -u "${BB_DIR}/targets/high_value.txt" -o "${BB_DIR}/targets/high_value.txt"
    }
    
    # Technology-based targeting
    technology_targeting() {
        echo "[+] Profiling technology for targeted testing..."
        
        cat "${BB_DIR}/recon/"*_subdomains.txt | sort -u | \
        httpx -silent -tech-detect -status-code -json | \
        jq -r 'select(.tech != null) | "\(.url) TECH:\(.tech | join(","))"' > "${BB_DIR}/targets/tech_profile.txt"
        
        # Group by technology for specialized testing
        grep -i wordpress "${BB_DIR}/targets/tech_profile.txt" | cut -d' ' -f1 > "${BB_DIR}/targets/wordpress.txt"
        grep -i "php" "${BB_DIR}/targets/tech_profile.txt" | cut -d' ' -f1 > "${BB_DIR}/targets/php.txt"
        grep -i "asp" "${BB_DIR}/targets/tech_profile.txt" | cut -d' ' -f1 > "${BB_DIR}/targets/aspnet.txt"
        grep -i "java" "${BB_DIR}/targets/tech_profile.txt" | cut -d' ' -f1 > "${BB_DIR}/targets/java.txt"
        grep -i "node\|express" "${BB_DIR}/targets/tech_profile.txt" | cut -d' ' -f1 > "${BB_DIR}/targets/nodejs.txt"
    }
    
    # Generate testing strategy
    generate_test_plan() {
        cat > "${BB_DIR}/TEST_PLAN.md" << EOF
# Bug Bounty Test Plan
**Program:** ${PROGRAM}
**Generated:** $(date)

## Target Statistics
- Total in-scope subdomains: $(cat "${BB_DIR}/recon/"*_subdomains.txt | wc -l)
- High-value targets: $(wc -l < "${BB_DIR}/targets/high_value.txt")
- WordPress sites: $(wc -l < "${BB_DIR}/targets/wordpress.txt" 2>/dev/null || echo 0)
- PHP applications: $(wc -l < "${BB_DIR}/targets/php.txt" 2>/dev/null || echo 0)

## Testing Priority

### Phase 1: High-Value Targets (First 2 hours)
Focus on authentication, authorization, and API endpoints
\`\`\`bash
cat ${BB_DIR}/targets/high_value.txt | nuclei -t exposures/apis/ -t vulnerabilities/
\`\`\`

### Phase 2: Technology-Specific (Next 2 hours)
Target known vulnerabilities in identified technologies
\`\`\`bash
# WordPress specific
cat ${BB_DIR}/targets/wordpress.txt | nuclei -t vulnerabilities/wordpress/

# Generic web vulnerabilities
cat ${BB_DIR}/targets/tech_profile.txt | cut -d' ' -f1 | nuclei -t cves/ -t vulnerabilities/
\`\`\`

### Phase 3: Comprehensive Testing (Remaining time)
Systematic testing of all endpoints
\`\`\`bash
cat ${BB_DIR}/recon/*_subdomains.txt | httpx -silent | nuclei -t nuclei-templates/
\`\`\`

## Payload Suggestions

### XSS Payloads
- Reflected: \`<script>alert(document.domain)</script>\`
- DOM-based: \`#<img src=x onerror=alert(1)>\`
- Stored: \`<svg onload=alert(1)>\`

### SQL Injection
- Error-based: \`' OR '1'='1\`
- Time-based: \`'; WAITFOR DELAY '00:00:05'--\`
- Union-based: \`' UNION SELECT NULL--\`

### Command Injection
- Basic: \`; ls -la\`
- Encoded: \`%3B%20ls%20-la\`
- Chained: \`|| whoami\`
EOF
    }
    
    # Execute reconnaissance workflow
    parse_scope
    
    while IFS= read -r domain; do
        smart_enumeration "$domain" &
        [ $(jobs -r | wc -l) -ge 10 ] && wait -n
    done < "${BB_DIR}/in_scope.txt"
    wait
    
    find_interesting_targets
    technology_targeting
    generate_test_plan
    
    echo "[✓] Bug bounty recon complete. See ${BB_DIR}/TEST_PLAN.md"
}

bug_bounty_recon "$PROGRAM" "$SCOPE_FILE"
```

---

## 🔒 SCENARIO 4: Compliance Audit - Evidence Collection
**Automated evidence gathering for compliance requirements**

### SOC2/PCI-DSS Evidence Collection
```bash
#!/bin/bash
# COMPLIANCE EVIDENCE COLLECTION
COMPANY="$1"
COMPLIANCE_TYPE="${2:-SOC2}"  # SOC2, PCI-DSS, HIPAA, etc.

compliance_audit() {
    local AUDIT_DIR="compliance_${COMPLIANCE_TYPE}_$(date +%Y%m%d)"
    mkdir -p "${AUDIT_DIR}"/{evidence,configs,reports,screenshots}
    
    # Security header validation
    check_security_headers() {
        echo "[+] Validating security headers..."
        
        local domains_file="$1"
        local report="${AUDIT_DIR}/evidence/security_headers.csv"
        
        echo "URL,HSTS,CSP,X-Frame-Options,X-Content-Type,X-XSS-Protection,Score" > "$report"
        
        while IFS= read -r url; do
            local headers=$(curl -sI "$url" --max-time 10)
            local score=0
            
            # Check each security header
            local hsts=$(echo "$headers" | grep -i "strict-transport-security" && echo "✓" || echo "✗")
            [ "$hsts" = "✓" ] && ((score+=20))
            
            local csp=$(echo "$headers" | grep -i "content-security-policy" && echo "✓" || echo "✗")
            [ "$csp" = "✓" ] && ((score+=20))
            
            local xframe=$(echo "$headers" | grep -i "x-frame-options" && echo "✓" || echo "✗")
            [ "$xframe" = "✓" ] && ((score+=20))
            
            local xcontent=$(echo "$headers" | grep -i "x-content-type-options" && echo "✓" || echo "✗")
            [ "$xcontent" = "✓" ] && ((score+=20))
            
            local xxss=$(echo "$headers" | grep -i "x-xss-protection" && echo "✓" || echo "✗")
            [ "$xxss" = "✓" ] && ((score+=20))
            
            echo "${url},${hsts},${csp},${xframe},${xcontent},${xxss},${score}/100" >> "$report"
        done < "$domains_file"
    }
    
    # SSL/TLS configuration audit
    ssl_audit() {
        echo "[+] Auditing SSL/TLS configurations..."
        
        local domains_file="$1"
        local report="${AUDIT_DIR}/evidence/ssl_audit.json"
        
        echo "[" > "$report"
        local first=true
        
        while IFS= read -r domain; do
            [ "$first" = false ] && echo "," >> "$report"
            first=false
            
            # Use testssl.sh for comprehensive SSL testing
            if command -v testssl.sh &>/dev/null; then
                testssl.sh --json-pretty --severity HIGH --protocols --ciphers "$domain" | \
                    jq '{domain: .scanResult[0].targetHost, 
                        protocols: .scanResult[0].protocols,
                        ciphers: .scanResult[0].ciphers,
                        vulnerabilities: .scanResult[0].vulnerabilities}' >> "$report"
            else
                # Fallback to OpenSSL
                echo "{\"domain\": \"$domain\"," >> "$report"
                echo "\"certificate\": \"$(echo | openssl s_client -connect "${domain}:443" 2>/dev/null | \
                    openssl x509 -noout -dates -subject -issuer 2>/dev/null | base64 -w0)\"," >> "$report"
                echo "\"protocols\": \"$(nmap --script ssl-enum-ciphers -p 443 "$domain" -oG - | \
                    grep -oP 'TLS[v0-9.]+' | sort -u | tr '\n' ',')\"}" >> "$report"
            fi
        done < "$domains_file"
        
        echo "]" >> "$report"
    }
    
    # Access control evidence
    access_control_audit() {
        echo "[+] Collecting access control evidence..."
        
        # Find all authentication endpoints
        cat "${AUDIT_DIR}"/evidence/live_hosts.txt | \
        httpx -silent -path "/login,/signin,/auth,/api/auth,/user/login,/admin" \
            -status-code -title -match-regex "(login|signin|auth)" \
            -o "${AUDIT_DIR}/evidence/auth_endpoints.txt"
        
        # Test for MFA indicators
        while IFS= rea
