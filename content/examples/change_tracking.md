# Change Tracking Techniques

Track changes to assets, ports, or web apps using:

- HTTP response hash diffs
- Screenshot comparisons
- Port scan deltas
- Historical DNS or TLS certs

You can use cronjobs or scripts to collect and diff data daily.

## HTTP Response Hash Monitoring

### Basic Hash Tracking
```bash
# Create hash of webpage content
curl -s http://example.com | sha256sum >> daily_hash.log

# Compare last two entries
diff <(tail -1 daily_hash.log) <(tail -2 daily_hash.log)

# If different, alert
if ! diff <(tail -1 daily_hash.log) <(tail -2 daily_hash.log) > /dev/null; then
    echo "Change detected on example.com!"
fi
```

### Advanced Hash Monitoring Script
```bash
#!/bin/bash
# monitor_website.sh

URL="$1"
HASH_FILE="${URL//[:\/]/_}_hashes.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Get current hash
CURRENT_HASH=$(curl -s "$URL" | sha256sum | cut -d' ' -f1)

# Check if this is the first run
if [ ! -f "$HASH_FILE" ]; then
    echo "$DATE $CURRENT_HASH BASELINE" > "$HASH_FILE"
    echo "Baseline established for $URL"
    exit 0
fi

# Get last hash
LAST_HASH=$(tail -1 "$HASH_FILE" | cut -d' ' -f2)

# Compare hashes
if [ "$CURRENT_HASH" != "$LAST_HASH" ]; then
    echo "$DATE $CURRENT_HASH CHANGED" >> "$HASH_FILE"
    echo "[ALERT] Change detected on $URL at $DATE"
    echo "Previous: $LAST_HASH"
    echo "Current:  $CURRENT_HASH"
else
    echo "$DATE $CURRENT_HASH UNCHANGED" >> "$HASH_FILE"
    echo "No changes detected on $URL"
fi
```

## Port Scan Change Detection

### Basic Port Monitoring
```bash
# Daily port scan
nmap -p- --top-ports 1000 target.com -oG today_scan.gnmap

# Compare with yesterday
if [ -f yesterday_scan.gnmap ]; then
    diff yesterday_scan.gnmap today_scan.gnmap > port_changes.txt
    if [ -s port_changes.txt ]; then
        echo "Port changes detected!"
        cat port_changes.txt
    fi
fi

# Archive today's scan
mv today_scan.gnmap yesterday_scan.gnmap
```

### Service Version Monitoring
```bash
#!/bin/bash
# monitor_services.sh

TARGET="$1"
TODAY=$(date +%Y%m%d)
YESTERDAY=$(date -d "1 day ago" +%Y%m%d)

# Scan for service versions
nmap -sV "$TARGET" -oN "services_$TODAY.txt"

# Compare with previous scan
if [ -f "services_$YESTERDAY.txt" ]; then
    echo "=== Service Changes Detected ==="
    diff "services_$YESTERDAY.txt" "services_$TODAY.txt" | grep -E '^[<>]'
fi
```

## DNS Record Monitoring

### Track DNS Changes
```bash
#!/bin/bash
# dns_monitor.sh

DOMAIN="$1"
DATE=$(date '+%Y-%m-%d')
DNS_FILE="${DOMAIN}_dns_$DATE.txt"

# Collect DNS records
echo "=== A Records ===" > "$DNS_FILE"
dig +short A "$DOMAIN" >> "$DNS_FILE"

echo "=== MX Records ===" >> "$DNS_FILE"
dig +short MX "$DOMAIN" >> "$DNS_FILE"

echo "=== NS Records ===" >> "$DNS_FILE"
dig +short NS "$DOMAIN" >> "$DNS_FILE"

echo "=== TXT Records ===" >> "$DNS_FILE"
dig +short TXT "$DOMAIN" >> "$DNS_FILE"

# Compare with previous day
YESTERDAY=$(date -d "1 day ago" '+%Y-%m-%d')
YESTERDAY_FILE="${DOMAIN}_dns_$YESTERDAY.txt"

if [ -f "$YESTERDAY_FILE" ]; then
    if ! diff "$YESTERDAY_FILE" "$DNS_FILE" > /dev/null; then
        echo "[ALERT] DNS changes detected for $DOMAIN"
        diff "$YESTERDAY_FILE" "$DNS_FILE"
    fi
fi
```

## SSL Certificate Monitoring

### Certificate Change Detection
```bash
#!/bin/bash
# ssl_monitor.sh

HOST="$1"
PORT="${2:-443}"
DATE=$(date '+%Y-%m-%d')
CERT_FILE="${HOST}_cert_$DATE.txt"

# Get certificate information
echo | openssl s_client -connect "$HOST:$PORT" -servername "$HOST" 2>/dev/null | \
    openssl x509 -noout -text > "$CERT_FILE"

# Extract key information
echo "=== Certificate Summary ===" > "${HOST}_cert_summary_$DATE.txt"
echo "Subject: $(openssl x509 -noout -subject -in <(echo | openssl s_client -connect "$HOST:$PORT" -servername "$HOST" 2>/dev/null))" >> "${HOST}_cert_summary_$DATE.txt"
echo "Issuer: $(openssl x509 -noout -issuer -in <(echo | openssl s_client -connect "$HOST:$PORT" -servername "$HOST" 2>/dev/null))" >> "${HOST}_cert_summary_$DATE.txt"
echo "Valid Until: $(openssl x509 -noout -enddate -in <(echo | openssl s_client -connect "$HOST:$PORT" -servername "$HOST" 2>/dev/null))" >> "${HOST}_cert_summary_$DATE.txt"

# Compare with previous day
YESTERDAY=$(date -d "1 day ago" '+%Y-%m-%d')
if [ -f "${HOST}_cert_summary_$YESTERDAY.txt" ]; then
    if ! diff "${HOST}_cert_summary_$YESTERDAY.txt" "${HOST}_cert_summary_$DATE.txt" > /dev/null; then
        echo "[ALERT] SSL certificate changes detected for $HOST"
        diff "${HOST}_cert_summary_$YESTERDAY.txt" "${HOST}_cert_summary_$DATE.txt"
    fi
fi
```

## Screenshot Comparison

### Visual Change Detection
```bash
#!/bin/bash
# screenshot_monitor.sh

URL="$1"
DATE=$(date '+%Y%m%d_%H%M%S')
SAFE_URL=$(echo "$URL" | sed 's/[^a-zA-Z0-9]/_/g')

# Take screenshot (requires gowitness)
gowitness single "$URL" --screenshot-path "screenshots/"

# Find the latest screenshot
LATEST=$(ls -t screenshots/*.png | head -1)

# Rename with timestamp
mv "$LATEST" "screenshots/${SAFE_URL}_$DATE.png"

# Compare with previous screenshot if exists
PREVIOUS=$(ls -t screenshots/${SAFE_URL}_*.png | sed -n '2p')

if [ -n "$PREVIOUS" ]; then
    # Calculate image difference (requires ImageMagick)
    DIFF=$(compare -metric AE "$PREVIOUS" "screenshots/${SAFE_URL}_$DATE.png" null: 2>&1)
    
    if [ "$DIFF" -gt 1000 ]; then  # Threshold for significant change
        echo "[ALERT] Significant visual changes detected on $URL"
        echo "Difference score: $DIFF pixels"
        
        # Create diff image
        compare "$PREVIOUS" "screenshots/${SAFE_URL}_$DATE.png" "screenshots/${SAFE_URL}_diff_$DATE.png"
    fi
fi
```

## Automation with Cron

### Daily Monitoring Setup
```bash
# Add to crontab (crontab -e)

# Website content monitoring (every 6 hours)
0 */6 * * * /path/to/monitor_website.sh https://example.com

# Port scan monitoring (daily at 2 AM)
0 2 * * * /path/to/monitor_services.sh target.com

# DNS monitoring (daily at 3 AM)
0 3 * * * /path/to/dns_monitor.sh example.com

# SSL certificate monitoring (daily at 4 AM)
0 4 * * * /path/to/ssl_monitor.sh example.com

# Screenshot monitoring (every 12 hours)
0 */12 * * * /path/to/screenshot_monitor.sh https://example.com
```

### Centralized Monitoring Script
```bash
#!/bin/bash
# asm_monitor.sh - Centralized monitoring

TARGETS_FILE="$1"
LOG_DIR="/var/log/asm_monitoring"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

mkdir -p "$LOG_DIR"

echo "[$DATE] Starting ASM monitoring" >> "$LOG_DIR/monitor.log"

while IFS= read -r target; do
    # Skip comments and empty lines
    [[ "$target" =~ ^#.*$ ]] && continue
    [[ -z "$target" ]] && continue
    
    echo "[$DATE] Monitoring $target" >> "$LOG_DIR/monitor.log"
    
    # Run all monitoring checks
    /path/to/monitor_website.sh "$target" >> "$LOG_DIR/web_changes.log" 2>&1
    /path/to/dns_monitor.sh "$target" >> "$LOG_DIR/dns_changes.log" 2>&1
    /path/to/ssl_monitor.sh "$target" >> "$LOG_DIR/ssl_changes.log" 2>&1
    
done < "$TARGETS_FILE"

echo "[$DATE] ASM monitoring completed" >> "$LOG_DIR/monitor.log"
```

## GitHub Repository Monitoring

Track commits, releases, events, issues, PRs, and file-level diffs on any public GitHub repo using `github_repo_monitor.py`.

### Prerequisites
```bash
export GITHUB_TOKEN="ghp_your_token_here"
pip install requests
```

### Single Monitoring Pass
```bash
# First run establishes the baseline; subsequent runs report changes
python3 automation/api-integration/github_repo_monitor.py \
    --repo owner/repo --monitor --output changes.json

# With notifications (configure SLACK_WEBHOOK, TEAMS_WEBHOOK, etc.)
python3 automation/api-integration/github_repo_monitor.py \
    --repo owner/repo --monitor --notify
```

### Continuous Watch Mode
```bash
# Poll every 5 minutes (default), send notifications on change
python3 automation/api-integration/github_repo_monitor.py \
    --repo owner/repo --watch --interval 300 --notify

# Reports are saved per-change under monitor_reports/
```

### One-Off Queries
```bash
# Recent commits
python3 automation/api-integration/github_repo_monitor.py \
    --repo owner/repo --commits --since 2025-01-01T00:00:00Z

# Releases
python3 automation/api-integration/github_repo_monitor.py \
    --repo owner/repo --releases

# Events (pushes, forks, stars, issue actions, PR actions)
python3 automation/api-integration/github_repo_monitor.py \
    --repo owner/repo --events

# Issues and PRs updated since a date
python3 automation/api-integration/github_repo_monitor.py \
    --repo owner/repo --issues --since 2025-06-01T00:00:00Z
```

### File-Level Diff Between Commits
```bash
# Compare two SHAs to see which files changed
python3 automation/api-integration/github_repo_monitor.py \
    --repo owner/repo --compare abc1234 def5678
```

### Cron Automation
```bash
# Add to crontab — monitor every hour, send notifications
0 * * * * GITHUB_TOKEN=ghp_xxx python3 /path/to/github_repo_monitor.py \
    --repo owner/repo --monitor --notify --state-file /var/lib/asm/repo_state.json
```

### How Baseline Tracking Works

1. **First run** — records the current latest commit SHA, release ID, tag name, event ID, and issue check timestamp in a JSON state file.
2. **Subsequent runs** — fetches current data from the GitHub API and compares against the saved baseline.
3. **Changes detected** — new commits, releases, tags, events, and updated issues are reported to stdout, exported to JSON, and optionally pushed through the notification system (Slack, Teams, Discord, Email).
4. **State updated** — the baseline is advanced so the next run only reports newer changes.

## Integration with Alerting

### Slack Notifications
```bash
# Add to monitoring scripts
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

send_slack_alert() {
    local message="$1"
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"$message\"}" \
        "$SLACK_WEBHOOK"
}

# Usage in monitoring scripts
if [ "$CURRENT_HASH" != "$LAST_HASH" ]; then
    send_slack_alert "🚨 Change detected on $URL at $DATE"
fi
```

### Email Alerts
```bash
# Simple email alert
send_email_alert() {
    local subject="$1"
    local body="$2"
    echo "$body" | mail -s "$subject" admin@example.com
}

# Usage
if [ "$DIFF" -gt 1000 ]; then
    send_email_alert "Visual changes detected" "Significant changes on $URL"
fi
```
