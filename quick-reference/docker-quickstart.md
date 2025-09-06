# 🐳 ASM Docker Quick Start

**Zero to full ASM capability in 5 minutes**

---

## 🚀 One-Command ASM Environment

### Complete ASM Toolkit Container
```dockerfile
# Dockerfile.asm-toolkit
FROM ubuntu:22.04

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive
ENV GO_VERSION=1.21.5
ENV PATH="/usr/local/go/bin:/root/go/bin:${PATH}"

# Install base dependencies
RUN apt-get update && apt-get install -y \
    curl wget git python3 python3-pip jq \
    nmap masscan zmap \
    dnsutils whois \
    chromium-browser \
    postgresql-client mysql-client redis-tools \
    build-essential libssl-dev libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Go
RUN wget -q https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz \
    && tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz \
    && rm go${GO_VERSION}.linux-amd64.tar.gz

# Install Go-based ASM tools
RUN go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest \
    && go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest \
    && go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest \
    && go install -v github.com/projectdiscovery/dnsx/cmd/dnsx@latest \
    && go install -v github.com/projectdiscovery/naabu/v2/cmd/naabu@latest \
    && go install -v github.com/owasp-amass/amass/v4/...@master \
    && go install -v github.com/tomnomnom/anew@latest \
    && go install -v github.com/tomnomnom/waybackurls@latest \
    && go install -v github.com/sensepost/gowitness@latest \
    && go install -v github.com/hakluke/hakrawler@latest \
    && go install -v github.com/jaeles-project/gospider@latest

# Install Python tools
RUN pip3 install --no-cache-dir \
    shodan \
    censys \
    theHarvester \
    wafw00f \
    paramspider \
    arjun \
    sqlmap \
    xsrfprobe

# Download nuclei templates
RUN nuclei -update-templates

# Create working directory structure
RUN mkdir -p /asm/{tools,wordlists,configs,scripts,output}

# Download essential wordlists
RUN wget -q https://raw.githubusercontent.com/danielmiessler/SecLists/master/Discovery/DNS/subdomains-top1million-20000.txt \
    -O /asm/wordlists/subdomains.txt \
    && wget -q https://raw.githubusercontent.com/danielmiessler/SecLists/master/Discovery/Web-Content/common.txt \
    -O /asm/wordlists/common.txt

# Add custom scripts
COPY scripts/ /asm/scripts/
RUN chmod +x /asm/scripts/*

# Set up aliases and environment
RUN echo 'alias ll="ls -la"' >> /root/.bashrc \
    && echo 'alias asm-scan="/asm/scripts/quick_scan.sh"' >> /root/.bashrc \
    && echo 'alias asm-monitor="/asm/scripts/monitor.sh"' >> /root/.bashrc

WORKDIR /asm/output

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD subfinder -version && httpx -version && nuclei -version || exit 1

ENTRYPOINT ["/bin/bash"]
```

### Quick Launch Commands
```bash
# Build the ASM toolkit image
docker build -f Dockerfile.asm-toolkit -t asm-toolkit:latest .

# Run interactive ASM container
docker run -it --rm \
    -v $(pwd)/results:/asm/output \
    -v $(pwd)/configs:/asm/configs:ro \
    --name asm-scanner \
    asm-toolkit:latest

# Run with network host mode (for better scanning)
docker run -it --rm \
    --network host \
    -v $(pwd)/results:/asm/output \
    asm-toolkit:latest

# Run with custom DNS
docker run -it --rm \
    --dns 8.8.8.8 \
    --dns 1.1.1.1 \
    -v $(pwd)/results:/asm/output \
    asm-toolkit:latest
```

---

## 🎯 Pre-Built Scanning Containers

### Subdomain Discovery Container
```yaml
# docker-compose.subdomain.yml
version: '3.8'

services:
  subdomain-discovery:
    image: asm-toolkit:latest
    container_name: subdomain-discovery
    volumes:
      - ./targets.txt:/asm/targets.txt:ro
      - ./results:/asm/output
    environment:
      - SHODAN_API_KEY=${SHODAN_API_KEY}
      - CENSYS_API_ID=${CENSYS_API_ID}
      - CENSYS_API_SECRET=${CENSYS_API_SECRET}
      - GITHUB_TOKEN=${GITHUB_TOKEN}
    command: |
      bash -c '
        while IFS= read -r domain; do
          echo "[+] Discovering subdomains for: $$domain"
          
          # Run multiple tools in parallel
          (
            subfinder -d "$$domain" -all -silent > "/asm/output/$${domain}_subfinder.txt" &
            amass enum -passive -d "$$domain" -o "/asm/output/$${domain}_amass.txt" &
            wait
          )
          
          # Combine and deduplicate
          cat "/asm/output/$${domain}_"*.txt | sort -u > "/asm/output/$${domain}_all_subdomains.txt"
          
          echo "[✓] Found $$(wc -l < /asm/output/$${domain}_all_subdomains.txt) unique subdomains"
        done < /asm/targets.txt
      '
    networks:
      - asm-network

networks:
  asm-network:
    driver: bridge
```

### Web Service Scanner Container
```yaml
# docker-compose.webscanner.yml
version: '3.8'

services:
  web-scanner:
    image: asm-toolkit:latest
    container_name: web-scanner
    volumes:
      - ./subdomains.txt:/asm/input.txt:ro
      - ./results:/asm/output
      - ./screenshots:/asm/screenshots
    command: |
      bash -c '
        # Check live hosts
        echo "[+] Checking live web services..."
        cat /asm/input.txt | httpx -silent -status-code -title -tech-detect -o /asm/output/live_services.txt
        
        # Take screenshots
        echo "[+] Taking screenshots..."
        cat /asm/output/live_services.txt | cut -d" " -f1 | gowitness file -f - --screenshot-path /asm/screenshots/
        
        # Run vulnerability scanning
        echo "[+] Running vulnerability scans..."
        cat /asm/output/live_services.txt | cut -d" " -f1 | nuclei -t cves/ -t vulnerabilities/ -o /asm/output/vulnerabilities.txt
        
        echo "[✓] Web scanning complete"
      '
    networks:
      - asm-network

networks:
  asm-network:
    driver: bridge
```

---

## 🔄 Automated ASM Pipeline

### Complete ASM Docker Pipeline
```yaml
# docker-compose.asm-pipeline.yml
version: '3.8'

services:
  # Stage 1: Discovery
  discovery:
    image: asm-toolkit:latest
    container_name: asm-discovery
    volumes:
      - ./config/domains.txt:/asm/domains.txt:ro
      - asm-data:/asm/data
    environment:
      - STAGE=discovery
    command: |
      bash -c '
        echo "[Stage 1] Starting discovery..."
        while IFS= read -r domain; do
          /asm/scripts/discover.sh "$$domain" "/asm/data/discovery"
        done < /asm/domains.txt
        echo "[✓] Discovery complete"
      '
    networks:
      - asm-network

  # Stage 2: Enumeration
  enumeration:
    image: asm-toolkit:latest
    container_name: asm-enumeration
    depends_on:
      discovery:
        condition: service_completed_successfully
    volumes:
      - asm-data:/asm/data
    environment:
      - STAGE=enumeration
    command: |
      bash -c '
        echo "[Stage 2] Starting enumeration..."
        find /asm/data/discovery -name "*_subdomains.txt" -exec cat {} \; | sort -u > /asm/data/all_subdomains.txt
        
        # Check live hosts
        cat /asm/data/all_subdomains.txt | httpx -silent -status-code -title -tech-detect -json -o /asm/data/live_services.json
        
        # Port scanning
        cat /asm/data/all_subdomains.txt | dnsx -silent -a -resp | cut -d" " -f2 | naabu -silent -top-ports 1000 -o /asm/data/open_ports.txt
        
        echo "[✓] Enumeration complete"
      '
    networks:
      - asm-network

  # Stage 3: Analysis
  analysis:
    image: asm-toolkit:latest
    container_name: asm-analysis
    depends_on:
      enumeration:
        condition: service_completed_successfully
    volumes:
      - asm-data:/asm/data
      - ./results:/asm/output
    environment:
      - STAGE=analysis
    command: |
      bash -c '
        echo "[Stage 3] Starting analysis..."
        
        # Vulnerability scanning
        cat /asm/data/live_services.json | jq -r .url | nuclei -t cves/ -t exposures/ -severity critical,high -o /asm/output/vulnerabilities.txt
        
        # Technology profiling
        cat /asm/data/live_services.json | jq -r "select(.tech != null) | \"\(.url) TECH: \(.tech | join(\",\"))\"" > /asm/output/technology_profile.txt
        
        # Generate report
        /asm/scripts/generate_report.sh /asm/data /asm/output/report.html
        
        echo "[✓] Analysis complete. Report saved to /asm/output/report.html"
      '
    networks:
      - asm-network

  # Stage 4: Monitoring (continuous)
  monitoring:
    image: asm-toolkit:latest
    container_name: asm-monitoring
    depends_on:
      analysis:
        condition: service_completed_successfully
    volumes:
      - asm-data:/asm/data
      - ./results:/asm/output
    environment:
      - STAGE=monitoring
      - SLACK_WEBHOOK=${SLACK_WEBHOOK}
    command: |
      bash -c '
        echo "[Stage 4] Starting continuous monitoring..."
        while true; do
          /asm/scripts/monitor_changes.sh /asm/data /asm/output
          sleep 3600  # Check every hour
        done
      '
    restart: unless-stopped
    networks:
      - asm-network

volumes:
  asm-data:
    driver: local

networks:
  asm-network:
    driver: bridge
```

---

## 🛠️ Custom Script Integration

### Quick Scan Script
```bash
#!/bin/bash
# /asm/scripts/quick_scan.sh

DOMAIN="${1:-example.com}"
OUTPUT_DIR="${2:-/asm/output}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}[ASM Quick Scan]${NC} Target: $DOMAIN"

# Create output directory
mkdir -p "$OUTPUT_DIR/$DOMAIN"
cd "$OUTPUT_DIR/$DOMAIN"

# Phase 1: Subdomain Discovery
echo -e "${YELLOW}[Phase 1]${NC} Subdomain Discovery..."
{
    subfinder -d "$DOMAIN" -all -silent
    amass enum -passive -d "$DOMAIN" -silent
    curl -s "https://crt.sh/?q=%.$DOMAIN&output=json" | jq -r '.[].name_value'
} | sort -u | tee subdomains.txt

echo -e "${GREEN}✓${NC} Found $(wc -l < subdomains.txt) subdomains"

# Phase 2: Live Host Detection
echo -e "${YELLOW}[Phase 2]${NC} Live Host Detection..."
cat subdomains.txt | httpx -silent -status-code -title -tech-detect | tee live_hosts.txt
echo -e "${GREEN}✓${NC} Found $(wc -l < live_hosts.txt) live hosts"

# Phase 3: Port Scanning
echo -e "${YELLOW}[Phase 3]${NC} Port Scanning..."
cat subdomains.txt | dnsx -silent -a -resp | cut -d' ' -f2 | naabu -silent -top-ports 100 | tee open_ports.txt
echo -e "${GREEN}✓${NC} Found $(wc -l < open_ports.txt) open ports"

# Phase 4: Screenshot Capture
echo -e "${YELLOW}[Phase 4]${NC} Taking Screenshots..."
mkdir -p screenshots
cat live_hosts.txt | cut -d' ' -f1 | gowitness file -f - --screenshot-path screenshots/ --disable-logging
echo -e "${GREEN}✓${NC} Screenshots saved to screenshots/"

# Phase 5: Vulnerability Scanning
echo -e "${YELLOW}[Phase 5]${NC} Vulnerability Scanning..."
cat live_hosts.txt | cut -d' ' -f1 | nuclei -t cves/ -severity critical,high -silent | tee vulnerabilities.txt

if [ -s vulnerabilities.txt ]; then
    echo -e "${RED}⚠${NC} Found $(wc -l < vulnerabilities.txt) potential vulnerabilities!"
else
    echo -e "${GREEN}✓${NC} No critical vulnerabilities found"
fi

# Generate summary
cat > scan_summary.md << EOF
# ASM Scan Summary: $DOMAIN
**Date:** $(date)
**Scanner:** ASM Toolkit Docker

## Statistics
- Subdomains discovered: $(wc -l < subdomains.txt)
- Live hosts: $(wc -l < live_hosts.txt)
- Open ports: $(wc -l < open_ports.txt)
- Screenshots: $(ls screenshots/*.png 2>/dev/null | wc -l)
- Vulnerabilities: $(wc -l < vulnerabilities.txt 2>/dev/null || echo 0)

## Top Technologies
$(grep -oP 'tech:\K\[[^\]]+\]' live_hosts.txt | sort | uniq -c | sort -rn | head -10)

## Critical Findings
$(head -20 vulnerabilities.txt 2>/dev/null || echo "None")
EOF

echo -e "${GREEN}[✓] Scan complete!${NC} Results saved to $OUTPUT_DIR/$DOMAIN/"
```

---

## 🚀 Quick Start Commands

### Instant ASM Scan
```bash
# Pull and run pre-built image
docker run --rm -it \
    -v $(pwd):/asm/output \
    ghcr.io/asm-toolkit/scanner:latest \
    asm-scan example.com

# Run with API keys
docker run --rm -it \
    -e SHODAN_API_KEY="your-key" \
    -e CENSYS_API_ID="your-id" \
    -e CENSYS_API_SECRET="your-secret" \
    -v $(pwd):/asm/output \
    ghcr.io/asm-toolkit/scanner:latest \
    asm-scan example.com
```

### Batch Domain Scanning
```bash
# Create domains file
cat > domains.txt << EOF
example.com
subdomain.example.com
another-domain.com
EOF

# Run batch scan
docker run --rm -it \
    -v $(pwd)/domains.txt:/asm/domains.txt:ro \
    -v $(pwd)/results:/asm/output \
    ghcr.io/asm-toolkit/scanner:latest \
    bash -c 'while read d; do asm-scan "$d"; done < /asm/domains.txt'
```

### Continuous Monitoring
```bash
# Start monitoring container
docker run -d \
    --name asm-monitor \
    --restart unless-stopped \
    -v $(pwd)/config:/asm/config:ro \
    -v $(pwd)/data:/asm/data \
    -e SLACK_WEBHOOK="https://hooks.slack.com/..." \
    ghcr.io/asm-toolkit/monitor:latest

# Check monitoring logs
docker logs -f asm-monitor

# Stop monitoring
docker stop asm-monitor
```

---

## 🔧 Customization

### Adding Custom Tools
```dockerfile
# Extend the base image
FROM asm-toolkit:latest

# Add your custom tools
RUN pip3 install your-custom-tool \
    && go install github.com/your/tool@latest

# Add custom scripts
COPY custom-scripts/ /asm/custom/
RUN chmod +x /asm/custom/*

# Update PATH
ENV PATH="/asm/custom:${PATH}"
```

### Custom Configuration
```yaml
# config/asm-config.yml
discovery:
  tools:
    - subfinder
    - amass
    - custom-tool
  options:
    timeout: 300
    threads: 50

enumeration:
  ports:
    - 80
    - 443
    - 8080
    - 8443
  rate_limit: 100

monitoring:
  interval: 3600
  alerts:
    slack: true
    email: true
    webhook: "https://your-webhook.com"
```

### Environment Variables
```bash
# .env file
SHODAN_API_KEY=your-shodan-key
CENSYS_API_ID=your-censys-id
CENSYS_API_SECRET=your-censys-secret
GITHUB_TOKEN=your-github-token
SECURITYTRAILS_API=your-securitytrails-key
VIRUSTOTAL_API=your-virustotal-key
SLACK_WEBHOOK=https://hooks.slack.com/services/...
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## 🐳 Docker Best Practices

### Resource Limits
```yaml
# docker-compose with resource limits
services:
  asm-scanner:
    image: asm-toolkit:latest
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

### Security Hardening
```dockerfile
# Run as non-root user
FROM asm-toolkit:latest

# Create non-root user
RUN useradd -m -s /bin/bash asmuser \
    && chown -R asmuser:asmuser /asm

USER asmuser
WORKDIR /home/asmuser

# Drop capabilities
RUN setcap -r /usr/bin/ping
```

### Multi-Stage Build
```dockerfile
# Build stage
FROM golang:1.21 AS builder

WORKDIR /build
RUN go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest

# Runtime stage
FROM ubuntu:22.04

COPY --from=builder /go/bin/subfinder /usr/local/bin/
# ... rest of the tools
```

---

## 🚨 Troubleshooting

### Common Issues

**Container exits immediately:**
```bash
# Check logs
docker logs asm-scanner

# Run with debug
docker run -it --entrypoint /bin/bash asm-toolkit:latest
```

**Permission denied errors:**
```bash
# Fix volume permissions
docker run --rm -v $(pwd):/data alpine chown -R $(id -u):$(id -g) /data
```

**Network issues:**
```bash
# Use host network
docker run --network host asm-toolkit:latest

# Custom DNS
docker run --dns 8.8.8.8 --dns 1.1.1.1 asm-toolkit:latest
```

**Out of memory:**
```bash
# Increase memory limit
docker run -m 8g asm-toolkit:latest
```

---

## 📦 Pre-Built Images

Available on Docker Hub and GitHub Container Registry:

```bash
# Docker Hub
docker pull asmtoolkit/scanner:latest
docker pull asmtoolkit/monitor:latest
docker pull asmtoolkit/analyzer:latest

# GitHub Container Registry
docker pull ghcr.io/asm-toolkit/scanner:latest
docker pull ghcr.io/asm-toolkit/monitor:latest
docker pull ghcr.io/asm-toolkit/analyzer:latest
```

**Tags:**
- `latest` - Latest stable release
- `dev` - Development version
- `minimal` - Minimal toolkit
- `full` - All tools included
- `cloud` - Cloud-focused tools
