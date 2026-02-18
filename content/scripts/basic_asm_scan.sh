#!/bin/bash
# Basic ASM Scan Script
# Usage: ./basic_asm_scan.sh domain.com

set -e

# Legal warning
cat << 'EOF'
🚨 LEGAL WARNING 🚨
This script performs network reconnaissance that may be detected as malicious activity.
Only use on domains you own or have explicit written permission to test.
Unauthorized scanning may violate computer fraud laws in your jurisdiction.
EOF

DOMAIN=$1
OUTPUT_DIR="asm_results_$(date +%Y%m%d_%H%M%S)"

if [ -z "$DOMAIN" ]; then
    echo "Usage: $0 <domain>"
    echo "Example: $0 example.com"
    exit 1
fi

# Authorization check
echo ""
echo "⚠️  AUTHORIZATION CHECK ⚠️"
echo "Do you own or have written permission to scan $DOMAIN? (y/N)"
read -r auth_response
if [[ ! "$auth_response" =~ ^[Yy]$ ]]; then
    echo "❌ Scan aborted - Authorization required"
    echo "Only scan targets you own or have explicit permission to test"
    exit 1
fi
echo "✅ Authorization verified"

echo "[+] Starting ASM scan for: $DOMAIN"
echo "[+] Output directory: $OUTPUT_DIR"

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Step 1: Subdomain Discovery
echo "[+] Step 1: Discovering subdomains..."
if command -v amass &> /dev/null; then
    amass enum -passive -d "$DOMAIN" -o "$OUTPUT_DIR/subdomains.txt"
    echo "    Found $(wc -l < "$OUTPUT_DIR/subdomains.txt") subdomains"
else
    echo "    [!] Amass not found. Install with: go install github.com/owasp-amass/amass/v4/...@master"
fi

# Step 2: Find Live Hosts
echo "[+] Step 2: Finding live web services (with rate limiting)..."
if command -v httpx &> /dev/null && [ -f "$OUTPUT_DIR/subdomains.txt" ]; then
    httpx -l "$OUTPUT_DIR/subdomains.txt" -o "$OUTPUT_DIR/live_hosts.txt" -silent -rate-limit 10
    echo "    Found $(wc -l < "$OUTPUT_DIR/live_hosts.txt") live hosts"
else
    echo "    [!] httpx not found or no subdomains file. Install with: go install github.com/projectdiscovery/httpx/cmd/httpx@latest"
fi

# Step 3: Port Scanning
echo "[+] Step 3: Basic port scanning (respectful timing)..."
if command -v nmap &> /dev/null && [ -f "$OUTPUT_DIR/live_hosts.txt" ]; then
    # Extract just the hostnames/IPs for nmap
    sed 's|https\?://||g' "$OUTPUT_DIR/live_hosts.txt" | sed 's|/.*||g' > "$OUTPUT_DIR/hosts_for_nmap.txt"
    nmap -iL "$OUTPUT_DIR/hosts_for_nmap.txt" -oA "$OUTPUT_DIR/nmap_scan" --top-ports 1000 -T2
    echo "    Port scan completed"
else
    echo "    [!] nmap not found or no live hosts. Install with: sudo apt install nmap"
fi

# Step 4: Screenshots
echo "[+] Step 4: Taking screenshots..."
if command -v gowitness &> /dev/null && [ -f "$OUTPUT_DIR/live_hosts.txt" ]; then
    cd "$OUTPUT_DIR"
    gowitness file -f live_hosts.txt
    cd ..
    echo "    Screenshots saved to $OUTPUT_DIR"
else
    echo "    [!] gowitness not found. Install with: go install github.com/sensepost/gowitness@latest"
fi

echo "[+] ASM scan completed!"
echo "[+] Results saved in: $OUTPUT_DIR"
echo ""
echo "Summary:"
[ -f "$OUTPUT_DIR/subdomains.txt" ] && echo "  - Subdomains: $(wc -l < "$OUTPUT_DIR/subdomains.txt")"
[ -f "$OUTPUT_DIR/live_hosts.txt" ] && echo "  - Live hosts: $(wc -l < "$OUTPUT_DIR/live_hosts.txt")"
[ -f "$OUTPUT_DIR/nmap_scan.nmap" ] && echo "  - Port scan: $OUTPUT_DIR/nmap_scan.*"
[ -d "$OUTPUT_DIR/screenshots" ] && echo "  - Screenshots: $OUTPUT_DIR/screenshots/"
