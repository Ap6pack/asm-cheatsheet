# Web Application Screenshot Tools

Automated screenshot tools to visualize exposed web interfaces and detect changes over time.

## 📸 Screenshot Tools Overview

Screenshot tools are essential for ASM because they:
- Provide visual context for discovered assets
- Enable change detection through image comparison
- Help identify interesting applications and admin panels
- Support bulk processing of large host lists
- Generate reports with visual evidence

## 🚀 GoWitness
**Purpose:** Fast, lightweight screenshot tool written in Go  
**Difficulty:** Beginner  
**Link:** https://github.com/sensepost/gowitness

**Installation:**
```bash
# Go installation
go install github.com/sensepost/gowitness@latest

# Download binary
wget https://github.com/sensepost/gowitness/releases/download/2.4.2/gowitness-2.4.2-linux-amd64
chmod +x gowitness-2.4.2-linux-amd64
sudo mv gowitness-2.4.2-linux-amd64 /usr/local/bin/gowitness

# Docker
docker pull leonjza/gowitness
```

**Basic Usage:**
```bash
# Single URL
gowitness single https://example.com

# Multiple URLs from file
gowitness file -f urls.txt

# Scan CIDR range
gowitness nmap -t 192.168.1.0/24 --open --service-contains http

# Nmap XML input
gowitness nmap -f nmap_scan.xml
```

**Advanced Options:**
```bash
# Custom resolution and timeout
gowitness file -f urls.txt -X 1920 -Y 1080 -T 30

# Custom user agent
gowitness file -f urls.txt --user-agent "Mozilla/5.0 (ASM Scanner)"

# Custom headers
gowitness file -f urls.txt --header "Authorization: Bearer token"

# Disable TLS verification
gowitness file -f urls.txt --disable-tls

# Custom screenshot path
gowitness file -f urls.txt --screenshot-path ./screenshots/

# Chrome options
gowitness file -f urls.txt --chrome-path /usr/bin/google-chrome
```

**Report Generation:**
```bash
# Generate HTML report
gowitness report generate

# Export to JSON
gowitness report export -f json -o results.json

# List all screenshots
gowitness report list

# Search screenshots
gowitness report search --title "admin"
gowitness report search --url "login"
```

**Database Operations:**
```bash
# View database stats
gowitness db stats

# Export database
gowitness db export -f csv -o export.csv

# Clear database
gowitness db clear
```

## 👁️ EyeWitness
**Purpose:** Comprehensive web application screenshot tool with reporting  
**Difficulty:** Intermediate  
**Link:** https://github.com/FortyNorthSecurity/EyeWitness

**Installation:**
```bash
# Clone repository
git clone https://github.com/FortyNorthSecurity/EyeWitness.git
cd EyeWitness/Python/setup
sudo ./setup.sh

# Docker installation
docker pull eyewitness
```

**Basic Usage:**
```bash
# URLs from file
python3 EyeWitness.py -f urls.txt

# Single URL
python3 EyeWitness.py --single https://example.com

# Nmap XML input
python3 EyeWitness.py -x nmap_scan.xml

# CIDR range
python3 EyeWitness.py --web --cidr 192.168.1.0/24
```

**Advanced Features:**
```bash
# Custom timeout and threads
python3 EyeWitness.py -f urls.txt --timeout 30 --threads 10

# Custom user agent
python3 EyeWitness.py -f urls.txt --user-agent "Custom Scanner"

# Proxy support
python3 EyeWitness.py -f urls.txt --proxy-ip 127.0.0.1 --proxy-port 8080

# Custom resolution
python3 EyeWitness.py -f urls.txt --resolution 1920x1080

# Delay between requests
python3 EyeWitness.py -f urls.txt --delay 2

# Custom output directory
python3 EyeWitness.py -f urls.txt -d /path/to/output
```

**Specialized Scans:**
```bash
# RDP screenshots
python3 EyeWitness.py --rdp --cidr 192.168.1.0/24

# VNC screenshots
python3 EyeWitness.py --vnc --cidr 192.168.1.0/24

# All services
python3 EyeWitness.py --all-protocols --cidr 192.168.1.0/24

# Active Directory enumeration
python3 EyeWitness.py --web --add-http-ports 8080,8443 --add-https-ports 9443
```

**Report Features:**
```bash
# Generate report with custom name
python3 EyeWitness.py -f urls.txt --results-dir custom_scan_$(date +%Y%m%d)

# Include source information
python3 EyeWitness.py -f urls.txt --show-selenium

# Cycle through elements
python3 EyeWitness.py -f urls.txt --cycle-through-elements
```

## 🌊 Aquatone
**Purpose:** Domain flyover reconnaissance with screenshots  
**Difficulty:** Beginner to Intermediate  
**Link:** https://github.com/michenriksen/aquatone

**Installation:**
```bash
# Download binary
wget https://github.com/michenriksen/aquatone/releases/download/v1.7.0/aquatone_linux_amd64_1.7.0.zip
unzip aquatone_linux_amd64_1.7.0.zip
sudo mv aquatone /usr/local/bin/

# Go installation
go install github.com/michenriksen/aquatone@latest
```

**Basic Usage:**
```bash
# Pipe subdomains to aquatone
cat subdomains.txt | aquatone

# Specify ports
cat subdomains.txt | aquatone -ports 80,443,8080,8443

# Custom output directory
cat subdomains.txt | aquatone -out aquatone_results
```

**Advanced Options:**
```bash
# Custom threads and timeout
cat subdomains.txt | aquatone -threads 10 -timeout 30000

# Custom Chrome path
cat subdomains.txt | aquatone -chrome-path /usr/bin/google-chrome

# Disable Chrome sandbox (for Docker)
cat subdomains.txt | aquatone -scan-timeout 2000 -screenshot-timeout 50000

# Custom resolution
cat subdomains.txt | aquatone -resolution 1920,1080
```

**Integration with Other Tools:**
```bash
# Amass + Aquatone
amass enum -passive -d example.com | aquatone

# Subfinder + httpx + Aquatone
subfinder -d example.com -silent | httpx -silent | aquatone

# Nmap + Aquatone
nmap -p 80,443,8080,8443 --open 192.168.1.0/24 -oG - | grep "/open/" | awk '{print $2":"$5}' | sed 's/:.*\/.*\/.*:/:/g' | aquatone
```

## 🔧 Advanced Techniques

### Automated Change Detection
```bash
#!/bin/bash
# screenshot_diff.sh

URL_FILE="$1"
BASELINE_DIR="baseline_screenshots"
CURRENT_DIR="current_screenshots_$(date +%Y%m%d)"

# Take current screenshots
gowitness file -f "$URL_FILE" --screenshot-path "$CURRENT_DIR"

# Compare with baseline if exists
if [ -d "$BASELINE_DIR" ]; then
    echo "Comparing screenshots..."
    
    for current in "$CURRENT_DIR"/*.png; do
        filename=$(basename "$current")
        baseline="$BASELINE_DIR/$filename"
        
        if [ -f "$baseline" ]; then
            # Calculate difference using ImageMagick
            diff_score=$(compare -metric AE "$baseline" "$current" null: 2>&1)
            
            if [ "$diff_score" -gt 1000 ]; then
                echo "[CHANGE] $filename: $diff_score pixel difference"
                
                # Create diff image
                compare "$baseline" "$current" "diff_$filename"
            fi
        else
            echo "[NEW] $filename: New screenshot"
        fi
    done
else
    echo "Creating baseline..."
    cp -r "$CURRENT_DIR" "$BASELINE_DIR"
fi
```

### Bulk Screenshot Processing
```bash
#!/bin/bash
# bulk_screenshots.sh

# Process multiple target lists
for target_file in targets/*.txt; do
    target_name=$(basename "$target_file" .txt)
    output_dir="screenshots_${target_name}_$(date +%Y%m%d)"
    
    echo "Processing $target_name..."
    
    # Take screenshots
    gowitness file -f "$target_file" --screenshot-path "$output_dir"
    
    # Generate report
    cd "$output_dir"
    gowitness report generate
    cd ..
    
    echo "Results saved to $output_dir"
done
```

### Custom Screenshot Analysis
```python
#!/usr/bin/env python3
# analyze_screenshots.py

import os
import json
from PIL import Image
import pytesseract

def analyze_screenshot(image_path):
    """Analyze screenshot for interesting content"""
    try:
        image = Image.open(image_path)
        
        # Extract text using OCR
        text = pytesseract.image_to_string(image)
        
        # Look for interesting keywords
        keywords = ['admin', 'login', 'dashboard', 'panel', 'error', 'debug', 'api']
        found_keywords = [kw for kw in keywords if kw.lower() in text.lower()]
        
        # Check image properties
        width, height = image.size
        
        return {
            'path': image_path,
            'size': f"{width}x{height}",
            'keywords': found_keywords,
            'text_length': len(text),
            'has_text': len(text.strip()) > 0
        }
    except Exception as e:
        return {'path': image_path, 'error': str(e)}

def main():
    screenshot_dir = 'screenshots'
    results = []
    
    for filename in os.listdir(screenshot_dir):
        if filename.endswith('.png'):
            image_path = os.path.join(screenshot_dir, filename)
            analysis = analyze_screenshot(image_path)
            results.append(analysis)
    
    # Save results
    with open('screenshot_analysis.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    # Print interesting findings
    for result in results:
        if result.get('keywords'):
            print(f"Interesting: {result['path']} - Keywords: {result['keywords']}")

if __name__ == '__main__':
    main()
```

## 🚨 Troubleshooting

### Common Issues

**Chrome/Chromium not found:**
```bash
# Install Chrome
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt update
sudo apt install google-chrome-stable

# Or use Chromium
sudo apt install chromium-browser

# Specify Chrome path
gowitness file -f urls.txt --chrome-path /usr/bin/google-chrome
```

**Permission denied errors:**
```bash
# Fix Chrome sandbox issues
gowitness file -f urls.txt --disable-sandbox

# Run with proper permissions
sudo gowitness file -f urls.txt
```

**Memory issues with large lists:**
```bash
# Process in batches
split -l 100 large_urls.txt batch_
for batch in batch_*; do
    gowitness file -f "$batch" --screenshot-path "screenshots_$(basename $batch)"
done

# Reduce concurrent threads
gowitness file -f urls.txt --threads 5
```

**Timeout issues:**
```bash
# Increase timeouts
gowitness file -f urls.txt -T 60
python3 EyeWitness.py -f urls.txt --timeout 60

# Add delays
python3 EyeWitness.py -f urls.txt --delay 3
```

### Performance Optimization

**Speed up screenshots:**
```bash
# Use multiple threads
gowitness file -f urls.txt --threads 20

# Reduce resolution for speed
gowitness file -f urls.txt -X 1024 -Y 768

# Skip images and CSS
gowitness file -f urls.txt --disable-images
```

**Reduce storage usage:**
```bash
# Compress screenshots
for img in screenshots/*.png; do
    convert "$img" -quality 80 "${img%.png}.jpg"
    rm "$img"
done

# Use smaller resolution
gowitness file -f urls.txt -X 800 -Y 600
```

## 📊 Integration Examples

### Complete ASM Workflow
```bash
#!/bin/bash
# asm_visual_recon.sh

DOMAIN="$1"
OUTPUT_DIR="asm_visual_$(date +%Y%m%d_%H%M%S)"

mkdir -p "$OUTPUT_DIR"
cd "$OUTPUT_DIR"

echo "[+] Discovering subdomains..."
subfinder -d "$DOMAIN" -silent > subdomains.txt
amass enum -passive -d "$DOMAIN" >> subdomains.txt
sort -u subdomains.txt > unique_subdomains.txt

echo "[+] Finding live hosts..."
httpx -l unique_subdomains.txt -silent > live_hosts.txt

echo "[+] Taking screenshots..."
gowitness file -f live_hosts.txt

echo "[+] Generating report..."
gowitness report generate

echo "[+] Results saved in $OUTPUT_DIR"
echo "    - Subdomains: $(wc -l < unique_subdomains.txt)"
echo "    - Live hosts: $(wc -l < live_hosts.txt)"
echo "    - Screenshots: $(ls screenshots/*.png 2>/dev/null | wc -l)"
```

### Continuous Monitoring
```bash
# Add to crontab for daily visual monitoring
0 2 * * * /path/to/asm_visual_recon.sh example.com
```
