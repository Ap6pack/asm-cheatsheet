# 🔴 Advanced ASM Techniques

**Enterprise-grade strategies for sophisticated attack surface management**

---

## 🛡️ WAF & Rate Limiting Bypass Techniques

### Intelligent Request Distribution
```bash
#!/bin/bash
# ADVANCED RATE LIMITING BYPASS FRAMEWORK

# Rotating user agents pool
USER_AGENTS=(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101"
)

# Proxy rotation with health checking
PROXY_LIST="/opt/proxies/verified_proxies.txt"
PROXY_TIMEOUT=5

# Advanced request distribution
distribute_requests() {
    local target_list="$1"
    local max_concurrent="${2:-10}"
    local delay_min="${3:-2}"
    local delay_max="${4:-8}"
    
    # Initialize proxy health tracker
    declare -A proxy_health
    while IFS= read -r proxy; do
        proxy_health["$proxy"]=100
    done < "$PROXY_LIST"
    
    # Process targets with intelligent distribution
    while IFS= read -r target; do
        # Select healthy proxy
        local selected_proxy=""
        for proxy in "${!proxy_health[@]}"; do
            if [[ ${proxy_health[$proxy]} -gt 50 ]]; then
                selected_proxy="$proxy"
                break
            fi
        done
        
        # Fallback to direct connection if no healthy proxies
        [ -z "$selected_proxy" ] && selected_proxy="direct"
        
        # Random user agent
        local ua="${USER_AGENTS[$RANDOM % ${#USER_AGENTS[@]}]}"
        
        # Random delay with jitter
        local delay=$((RANDOM % (delay_max - delay_min + 1) + delay_min))
        local jitter=$((RANDOM % 1000))  # Milliseconds
        
        # Execute request with retry logic
        (
            for attempt in {1..3}; do
                if [ "$selected_proxy" = "direct" ]; then
                    response=$(curl -s -o /dev/null -w "%{http_code}" \
                        -H "User-Agent: $ua" \
                        -H "Accept-Language: en-US,en;q=0.9" \
                        -H "Accept-Encoding: gzip, deflate, br" \
                        --compressed \
                        --max-time 10 \
                        "$target")
                else
                    response=$(curl -s -o /dev/null -w "%{http_code}" \
                        --proxy "$selected_proxy" \
                        -H "User-Agent: $ua" \
                        --max-time 10 \
                        "$target")
                fi
                
                # Update proxy health based on response
                if [[ $response -eq 200 || $response -eq 301 || $response -eq 302 ]]; then
                    [ "$selected_proxy" != "direct" ] && ((proxy_health[$selected_proxy]+=5))
                    echo "[✓] $target - HTTP $response (via $selected_proxy)"
                    break
                elif [[ $response -eq 429 || $response -eq 503 ]]; then
                    [ "$selected_proxy" != "direct" ] && ((proxy_health[$selected_proxy]-=20))
                    echo "[!] Rate limited on $target, rotating..."
                    sleep $((delay * 2))
                else
                    [ "$selected_proxy" != "direct" ] && ((proxy_health[$selected_proxy]-=10))
                fi
                
                sleep $attempt
            done
        ) &
        
        # Manage concurrent connections
        while [ $(jobs -r | wc -l) -ge $max_concurrent ]; do
            sleep 0.1
        done
        
        # Intelligent delay with jitter
        sleep "${delay}.${jitter}"
    done < "$target_list"
    
    wait
}

# WAF bypass headers
bypass_waf_headers() {
    local url="$1"
    
    # Common WAF bypass headers
    local bypass_headers=(
        "X-Originating-IP: 127.0.0.1"
        "X-Forwarded-For: 127.0.0.1"
        "X-Remote-IP: 127.0.0.1"
        "X-Remote-Addr: 127.0.0.1"
        "X-Client-IP: 127.0.0.1"
        "X-Real-IP: 127.0.0.1"
        "X-Forwarded-Host: localhost"
        "X-Forwarded-Proto: https"
        "X-Frame-Options: SAMEORIGIN"
        "Content-Type: application/json"
    )
    
    # Try different header combinations
    for header in "${bypass_headers[@]}"; do
        response=$(curl -s -o /dev/null -w "%{http_code}" -H "$header" "$url")
        if [[ $response -eq 200 ]]; then
            echo "[✓] Bypass successful with: $header"
            return 0
        fi
    done
    
    return 1
}
```

### DNS Resolution Bypass
```bash
# Direct IP access to bypass DNS-based filtering
resolve_and_bypass() {
    local domain="$1"
    
    # Resolve to IP addresses
    local ips=$(dig +short "$domain" | grep -E '^[0-9]+\.')
    
    for ip in $ips; do
        # Direct IP access with Host header
        curl -H "Host: $domain" "http://$ip/" -s -o /dev/null -w "IP: $ip - Status: %{http_code}\n"
        
        # Try HTTPS with SNI
        curl --resolve "$domain:443:$ip" "https://$domain/" -s -o /dev/null -w "SNI: $ip - Status: %{http_code}\n"
    done
}

# CDN bypass by finding origin server
find_origin_server() {
    local domain="$1"
    
    # Historical DNS records
    echo "[+] Checking historical DNS records..."
    curl -s "https://api.securitytrails.com/v1/history/$domain/dns/a" \
        -H "apikey: $SECURITYTRAILS_API" | jq -r '.records[].values[].ip' | sort -u
    
    # Check for origin leaks in headers
    echo "[+] Checking for origin leaks..."
    curl -sI "https://$domain" | grep -iE "(server:|x-served-by:|x-backend:|via:)"
    
    # Subdomain origin search
    echo "[+] Searching subdomains for origin..."
    for subdomain in origin dev staging direct real; do
        dig +short "$subdomain.$domain"
    done
}
```

---

## 🔄 Continuous Monitoring Architecture

### Enterprise-Scale Change Detection System
```bash
#!/bin/bash
# ENTERPRISE ASM MONITORING SYSTEM

# Configuration
MONITORING_CONFIG="/etc/asm/monitoring.conf"
REDIS_HOST="localhost"
REDIS_PORT="6379"
ELASTICSEARCH_URL="http://localhost:9200"
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL}"

# Initialize monitoring infrastructure
setup_monitoring_infrastructure() {
    # Create monitoring database schema
    cat > /tmp/monitoring_schema.sql << 'EOF'
CREATE DATABASE IF NOT EXISTS asm_monitoring;
USE asm_monitoring;

CREATE TABLE IF NOT EXISTS assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    domain VARCHAR(255) NOT NULL,
    subdomain VARCHAR(255),
    ip_address VARCHAR(45),
    port INT,
    service VARCHAR(100),
    technology TEXT,
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    status ENUM('active', 'inactive', 'new', 'removed') DEFAULT 'new',
    risk_score INT DEFAULT 0,
    INDEX idx_domain (domain),
    INDEX idx_status (status),
    INDEX idx_risk (risk_score)
);

CREATE TABLE IF NOT EXISTS changes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT,
    change_type ENUM('new_subdomain', 'new_port', 'new_service', 'removed', 'technology_change', 'certificate_change'),
    old_value TEXT,
    new_value TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    severity ENUM('critical', 'high', 'medium', 'low') DEFAULT 'medium',
    notified BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (asset_id) REFERENCES assets(id)
);

CREATE TABLE IF NOT EXISTS vulnerabilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT,
    cve_id VARCHAR(20),
    severity ENUM('critical', 'high', 'medium', 'low'),
    description TEXT,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    remediated BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (asset_id) REFERENCES assets(id)
);
EOF
    
    mysql < /tmp/monitoring_schema.sql
    
    # Setup Redis for real-time processing
    redis-cli << EOF
CONFIG SET notify-keyspace-events Ex
CONFIG SET maxmemory 2gb
CONFIG SET maxmemory-policy allkeys-lru
EOF
    
    # Initialize Elasticsearch indices
    curl -X PUT "$ELASTICSEARCH_URL/asm-assets" -H 'Content-Type: application/json' -d '{
        "mappings": {
            "properties": {
                "domain": {"type": "keyword"},
                "subdomain": {"type": "keyword"},
                "ip": {"type": "ip"},
                "port": {"type": "integer"},
                "service": {"type": "keyword"},
                "technology": {"type": "text"},
                "timestamp": {"type": "date"},
                "risk_score": {"type": "integer"},
                "location": {"type": "geo_point"}
            }
        }
    }'
}

# Real-time asset discovery pipeline
realtime_discovery_pipeline() {
    local domain="$1"
    
    # Create named pipes for inter-process communication
    local pipe_subdomains="/tmp/asm_pipe_subdomains_$$"
    local pipe_services="/tmp/asm_pipe_services_$$"
    mkfifo "$pipe_subdomains" "$pipe_services"
    
    # Subdomain discovery process
    (
        while true; do
            # Multiple discovery sources in parallel
            {
                subfinder -d "$domain" -silent
                amass enum -passive -d "$domain" -silent
                curl -s "https://crt.sh/?q=%.$domain&output=json" | jq -r '.[].name_value'
            } | sort -u | while read -r subdomain; do
                # Check if new
                if ! redis-cli SISMEMBER "known:$domain" "$subdomain" | grep -q 1; then
                    echo "[NEW] $subdomain"
                    redis-cli SADD "known:$domain" "$subdomain"
                    redis-cli LPUSH "queue:new_subdomains" "$subdomain"
                fi
                echo "$subdomain"
            done > "$pipe_subdomains"
            
            sleep 3600  # Run every hour
        done
    ) &
    
    # Service detection process
    (
        while IFS= read -r subdomain; do
            # Quick service detection
            httpx -silent -status-code -title -tech-detect -json <<< "$subdomain" | \
            jq -c '{
                subdomain: .url,
                status: .status_code,
                title: .title,
                tech: .tech,
                timestamp: now | todate
            }' > "$pipe_services"
        done < "$pipe_subdomains"
    ) &
    
    # Change detection and alerting process
    (
        while IFS= read -r service_json; do
            local subdomain=$(echo "$service_json" | jq -r '.subdomain')
            local current_hash=$(echo "$service_json" | md5sum | cut -d' ' -f1)
            local previous_hash=$(redis-cli GET "hash:$subdomain")
            
            if [ "$previous_hash" != "$current_hash" ]; then
                # Detect specific changes
                local old_data=$(redis-cli GET "data:$subdomain")
                local change_details=$(diff <(echo "$old_data") <(echo "$service_json") || true)
                
                # Store in database
                mysql asm_monitoring << EOF
INSERT INTO changes (asset_id, change_type, old_value, new_value, severity)
SELECT id, 'technology_change', '$old_data', '$service_json', 
    CASE 
        WHEN '$service_json' LIKE '%admin%' THEN 'critical'
        WHEN '$service_json' LIKE '%api%' THEN 'high'
        ELSE 'medium'
    END
FROM assets WHERE subdomain = '$subdomain';
EOF
                
                # Send to Elasticsearch
                echo "$service_json" | curl -X POST "$ELASTICSEARCH_URL/asm-assets/_doc" \
                    -H 'Content-Type: application/json' -d @-
                
                # Alert if critical
                if echo "$service_json" | grep -qE "(admin|api|database)"; then
                    alert_critical_change "$subdomain" "$change_details"
                fi
                
                # Update cache
                redis-cli SET "hash:$subdomain" "$current_hash"
                redis-cli SET "data:$subdomain" "$service_json"
            fi
        done < "$pipe_services"
    ) &
    
    # Cleanup on exit
    trap "rm -f $pipe_subdomains $pipe_services; kill 0" EXIT
    
    wait
}

# Advanced alerting system
alert_critical_change() {
    local asset="$1"
    local details="$2"
    
    # Slack notification
    curl -X POST "$SLACK_WEBHOOK" -H 'Content-Type: application/json' -d "{
        \"text\": \"🚨 Critical ASM Change Detected\",
        \"attachments\": [{
            \"color\": \"danger\",
            \"title\": \"Asset: $asset\",
            \"text\": \"\`\`\`$details\`\`\`\",
            \"footer\": \"ASM Monitor\",
            \"ts\": $(date +%s)
        }]
    }"
    
    # PagerDuty integration
    if [ -n "$PAGERDUTY_KEY" ]; then
        curl -X POST "https://events.pagerduty.com/v2/enqueue" \
            -H 'Content-Type: application/json' \
            -d "{
                \"routing_key\": \"$PAGERDUTY_KEY\",
                \"event_action\": \"trigger\",
                \"payload\": {
                    \"summary\": \"Critical ASM change: $asset\",
                    \"severity\": \"critical\",
                    \"source\": \"ASM Monitor\",
                    \"custom_details\": {
                        \"changes\": \"$details\"
                    }
                }
            }"
    fi
}
```

---

## 🤖 Machine Learning for Anomaly Detection

### Behavioral Analysis Pipeline
```python
#!/usr/bin/env python3
"""
Advanced ML-based ASM anomaly detection system
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import redis
import json
from datetime import datetime, timedelta
import hashlib

class ASMAnalyzer:
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.scaler = StandardScaler()
        
    def extract_features(self, asset_data):
        """Extract numerical features from asset data"""
        features = []
        
        # Port diversity score
        ports = asset_data.get('ports', [])
        port_diversity = len(set(ports)) / max(len(ports), 1)
        features.append(port_diversity)
        
        # Technology stack complexity
        tech_stack = asset_data.get('technologies', [])
        tech_complexity = len(tech_stack)
        features.append(tech_complexity)
        
        # Subdomain entropy
        subdomain = asset_data.get('subdomain', '')
        entropy = self.calculate_entropy(subdomain)
        features.append(entropy)
        
        # Response time anomaly
        response_time = asset_data.get('response_time', 0)
        features.append(response_time)
        
        # Certificate age (days)
        cert_date = asset_data.get('cert_expiry', datetime.now())
        if isinstance(cert_date, str):
            cert_date = datetime.fromisoformat(cert_date)
        cert_age = (cert_date - datetime.now()).days
        features.append(cert_age)
        
        # Historical change frequency
        change_freq = self.get_change_frequency(asset_data.get('domain', ''))
        features.append(change_freq)
        
        # Risk indicators
        risk_keywords = ['admin', 'test', 'dev', 'staging', 'backup', 'old', 'temp']
        risk_score = sum(1 for keyword in risk_keywords if keyword in subdomain.lower())
        features.append(risk_score)
        
        return np.array(features).reshape(1, -1)
    
    def calculate_entropy(self, string):
        """Calculate Shannon entropy of a string"""
        if not string:
            return 0
        
        prob = [float(string.count(c)) / len(string) for c in dict.fromkeys(string)]
        entropy = -sum([p * np.log2(p) for p in prob if p > 0])
        return entropy
    
    def get_change_frequency(self, domain):
        """Get historical change frequency from Redis"""
        changes_key = f"changes:{domain}"
        changes = self.redis_client.lrange(changes_key, 0, -1)
        
        if not changes:
            return 0
        
        # Calculate changes per day over last 30 days
        recent_changes = [c for c in changes 
                         if datetime.fromisoformat(json.loads(c)['timestamp']) > 
                         datetime.now() - timedelta(days=30)]
        
        return len(recent_changes) / 30.0
    
    def train_model(self, training_data):
        """Train the anomaly detection model"""
        features = []
        for asset in training_data:
            features.append(self.extract_features(asset))
        
        if features:
            X = np.vstack(features)
            X_scaled = self.scaler.fit_transform(X)
            self.model.fit(X_scaled)
            
            # Save model state
            self.redis_client.set('model:trained', datetime.now().isoformat())
    
    def detect_anomalies(self, asset_data):
        """Detect if an asset is anomalous"""
        features = self.extract_features(asset_data)
        features_scaled = self.scaler.transform(features)
        
        # Predict anomaly (-1 for anomaly, 1 for normal)
        prediction = self.model.predict(features_scaled)[0]
        anomaly_score = self.model.score_samples(features_scaled)[0]
        
        if prediction == -1:
            self.handle_anomaly(asset_data, anomaly_score)
            return True, anomaly_score
        
        return False, anomaly_score
    
    def handle_anomaly(self, asset_data, score):
        """Handle detected anomalies"""
        alert = {
            'timestamp': datetime.now().isoformat(),
            'asset': asset_data.get('subdomain', 'unknown'),
            'anomaly_score': float(score),
            'features': asset_data,
            'severity': self.calculate_severity(score)
        }
        
        # Store in Redis for processing
        self.redis_client.lpush('anomalies:queue', json.dumps(alert))
        
        # Trigger immediate alert for critical anomalies
        if alert['severity'] == 'critical':
            self.send_critical_alert(alert)
    
    def calculate_severity(self, score):
        """Calculate anomaly severity based on score"""
        if score < -0.5:
            return 'critical'
        elif score < -0.3:
            return 'high'
        elif score < -0.1:
            return 'medium'
        else:
            return 'low'
    
    def send_critical_alert(self, alert):
        """Send critical anomaly alerts"""
        # Implementation for various alerting channels
        print(f"[CRITICAL ANOMALY] {alert['asset']}: Score {alert['anomaly_score']}")

# Continuous learning pipeline
def continuous_learning_pipeline():
    analyzer = ASMAnalyzer()
    
    while True:
        # Fetch recent asset data
        recent_assets = []
        for key in analyzer.redis_client.scan_iter("asset:*"):
            asset_data = json.loads(analyzer.redis_client.get(key))
            recent_assets.append(asset_data)
        
        # Retrain model periodically with new data
        if len(recent_assets) > 100:
            analyzer.train_model(recent_assets[-1000:])  # Use last 1000 assets
        
        # Process new assets for anomalies
        new_assets_key = "queue:new_assets"
        while analyzer.redis_client.llen(new_assets_key) > 0:
            asset_json = analyzer.redis_client.lpop(new_assets_key)
            if asset_json:
                asset_data = json.loads(asset_json)
                is_anomaly, score = analyzer.detect_anomalies(asset_data)
                
                if is_anomaly:
                    print(f"Anomaly detected: {asset_data.get('subdomain')} (score: {score})")
        
        time.sleep(60)  # Check every minute

if __name__ == "__main__":
    continuous_learning_pipeline()
```

---

## 🌐 Multi-Cloud Asset Discovery

### Unified Cloud Enumeration Framework
```bash
#!/bin/bash
# MULTI-CLOUD ASSET DISCOVERY SYSTEM

# Cloud provider configurations
AWS_REGIONS="us-east-1 us-west-2 eu-west-1 ap-southeast-1"
AZURE_SUBSCRIPTIONS="${AZURE_SUBSCRIPTION_IDS}"
GCP_PROJECTS="${GCP_PROJECT_IDS}"

# AWS Asset Discovery
discover_aws_assets() {
    local output_dir="$1/aws"
    mkdir -p "$output_dir"
    
    echo "[+] Discovering AWS assets..."
    
    # EC2 Instances
    for region in $AWS_REGIONS; do
        echo "  [*] Scanning region: $region"
        
        # EC2 instances with public IPs
        aws ec2 describe-instances --region "$region" \
            --query 'Reservations[*].Instances[?PublicIpAddress!=`null`].[InstanceId,PublicIpAddress,PublicDnsName,Tags[?Key==`Name`].Value|[0]]' \
            --output json > "$output_dir/ec2_${region}.json"
        
        # Elastic IPs
        aws ec2 describe-addresses --region "$region" \
            --output json > "$output_dir/eips_${region}.json"
        
        # Load Balancers
        aws elbv2 describe-load-balancers --region "$region" \
            --output json > "$output_dir/alb_${region}.json"
        
        # RDS instances
        aws rds describe-db-instances --region "$region" \
            --query 'DBInstances[?PubliclyAccessible==`true`]' \
            --output json > "$output_dir/rds_${region}.json"
        
        # S3 buckets (global but check region)
        if [ "$region" = "us-east-1" ]; then
            aws s3api list-buckets --output json > "$output_dir/s3_buckets.json"
            
            # Check each bucket for public access
            aws s3api list-buckets --query 'Buckets[].Name' --output text | \
            tr '\t' '\n' | while read -r bucket; do
                echo "    Checking bucket: $bucket"
                
                # Check bucket ACL
                aws s3api get-bucket-acl --bucket "$bucket" 2>/dev/null | \
                    jq -r '.Grants[] | select(.Grantee.Type=="Group" and .Grantee.URI | contains("AllUsers"))' \
                    > "$output_dir/public_bucket_${bucket}.json"
                
                # Check bucket policy
                aws s3api get-bucket-policy --bucket "$bucket" 2>/dev/null | \
                    jq -r '.Policy | fromjson | select(.Statement[].Principal=="*")' \
                    >> "$output_dir/public_bucket_${bucket}.json"
            done
        fi
        
        # CloudFront distributions
        aws cloudfront list-distributions --region "$region" \
            --query 'DistributionList.Items[*].[Id,DomainName,Aliases.Items]' \
            --output json > "$output_dir/cloudfront_${region}.json"
        
        # API Gateways
        aws apigateway get-rest-apis --region "$region" \
            --output json > "$output_dir/apigateway_${region}.json"
        
        # Lambda functions with URLs
        aws lambda list-functions --region "$region" \
            --query 'Functions[?FunctionUrl!=`null`]' \
            --output json > "$output_dir/lambda_urls_${region}.json"
    done
    
    # Consolidate findings
    echo "[+] Consolidating AWS assets..."
    jq -s 'add | map(select(.PublicIpAddress != null))' "$output_dir"/ec2_*.json > "$output_dir/all_public_ips.json"
}

# Azure Asset Discovery
discover_azure_assets() {
    local output_dir="$1/azure"
    mkdir -p "$output_dir"
    
    echo "[+] Discovering Azure assets..."
    
    for subscription in $AZURE_SUBSCRIPTIONS; do
        echo "  [*] Scanning subscription: $subscription"
        
        # Set subscription
        az account set --subscription "$subscription"
        
        # Public IPs
        az network public-ip list --output json > "$output_dir/public_ips_${subscription}.json"
        
        # Web Apps
        az webapp list --output json > "$output_dir/webapps_${subscription}.json"
        
        # Storage accounts
        az storage account list --output json | \
        jq -r '.[] | select(.allowBlobPublicAccess==true)' > "$output_dir/public_storage_${subscription}.json"
        
        # Check for publicly accessible containers
        az storage account list --query '[].name' -o tsv | while read -r account; do
            az storage container list --account-name "$account" --auth-mode login 2>/dev/null | \
            jq -r '.[] | select(.properties.publicAccess!=null)' >> "$output_dir/public_containers_${subscription}.json"
        done
        
        # Azure Front Door
        az network front-door list --output json > "$output_dir/frontdoor_${subscription}.json"
        
        # Application Gateways
        az network application-gateway list --output json > "$output_dir/appgateway_${subscription}.json"
        
        # Cosmos DB accounts
        az cosmosdb list --output json > "$output_dir/cosmosdb_${subscription}.json"
        
        # Azure Functions
        az functionapp list --output json > "$output_dir/functions_${subscription}.json"
    done
}

# GCP Asset Discovery
discover_gcp_assets() {
    local output_dir="$1/gcp"
    mkdir -p "$output_dir"
    
    echo "[+] Discovering GCP assets..."
    
    for project in $GCP_PROJECTS; do
        echo "  [*] Scanning project: $project"
        
        # Set project
        gcloud config set project "$project"
        
        # Compute instances with external IPs
        gcloud compute instances list --format=json \
            --filter="networkInterfaces[].accessConfigs[].natIP:*" > "$output_dir/instances_${project}.json"
        
        # Load balancers
        gcloud compute forwarding-rules list --format=json > "$output_dir/loadbalancers_${project}.json"
        
        # Cloud Storage buckets
        gsutil ls -L -b gs://* 2>/dev/null | grep -E "gs://|ACL:" > "$output_dir/buckets_${project}.txt"
        
        # Check for public buckets
        gsutil ls | while read -r bucket; do
            gsutil iam get "$bucket" 2>/dev/null | \
            grep -q "allUsers\|allAuthenticatedUsers" && echo "$bucket" >> "$output_dir/public_buckets_${project}.txt"
        done
        
        # Cloud Functions
        gcloud functions list --format=json > "$output_dir/functions_${project}.json"
        
        # App Engine services
        gcloud app services list --format=json > "$output_dir/appengine_${project}.json"
        
        # Cloud Run services
        gcloud run services list --platform=managed --format=json > "$output_dir/cloudrun_${project}.json"
        
        # Cloud SQL instances
        gcloud sql instances list --format=json | \
        jq -r '.[] | select(.settings.ipConfiguration.authorizedNetworks[].value=="0.0.0.0/0")' \
        > "$output_dir/public_sql_${project}.json"
    done
}

# Kubernetes Cluster Discovery
discover_k8s_assets() {
    local output_dir="$1/kubernetes"
    mkdir -p "$output_dir"
    
    echo "[+] Discovering Kubernetes assets..."
    
    # Get all contexts
    kubectl config get-contexts -o name | while read -r context; do
        echo "  [*] Scanning context: $context"
        kubectl config use-context "$context"
        
        # Exposed services
        kubectl get services --all-namespaces -o json | \
        jq -r '.items[] | select(.spec.type=="LoadBalancer" or .spec.type=="NodePort")' \
        > "$output_dir/exposed_services_${context}.json"
        
        # Ingresses
        kubectl get ingress --all-namespaces -o json > "$output_dir/ingresses_${context}.json"
        
        # Check for risky configurations
        kubectl get pods --all-namespaces -o json | \
        jq -r '.items[] | select(.spec.containers[].securityContext.privileged==true)' \
        > "$output_dir/privileged_pods_${context}.json"
    done
}

# Main execution
main() {
    local output_base="cloud_assets_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$output_base"
    
    # Run discoveries in parallel
    discover_aws_assets "$output_base" &
    discover_azure_assets "$output_base" &
    discover_gcp_assets "$output_base" &
    discover_k8s_assets "$output_base" &
    
    wait
    
    # Generate consolidated report
    echo "[+] Generating consolidated report..."
    cat >
