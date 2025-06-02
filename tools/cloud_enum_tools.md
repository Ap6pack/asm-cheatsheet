# Cloud Enumeration Tools

Tools for discovering misconfigurations and exposed assets in cloud environments.

## ☁️ Cloud Security Overview

Cloud enumeration is critical for ASM because:
- Cloud assets are often forgotten or misconfigured
- Public cloud storage can expose sensitive data
- Misconfigurations can lead to data breaches
- Cloud services expand attack surface rapidly
- Many organizations lack visibility into cloud assets

## 🔍 CloudEnum
**Purpose:** Multi-cloud asset enumeration for AWS, Azure, and GCP  
**Difficulty:** Beginner to Intermediate  
**Link:** https://github.com/initstring/cloud_enum

**Installation:**
```bash
# Clone repository
git clone https://github.com/initstring/cloud_enum.git
cd cloud_enum
pip3 install -r requirements.txt

# Make executable
chmod +x cloud_enum.py
```

**Basic Usage:**
```bash
# Basic enumeration with keyword
python3 cloud_enum.py -k company

# Multi-cloud enumeration
python3 cloud_enum.py -k company --aws --azure --gcp

# Custom mutations file
python3 cloud_enum.py -k company -m mutations.txt

# Disable SSL verification
python3 cloud_enum.py -k company --disable-ssl

# Custom threads
python3 cloud_enum.py -k company -t 10
```

**Advanced Options:**
```bash
# Multiple keywords
python3 cloud_enum.py -kf keywords.txt --aws --azure --gcp

# Custom output file
python3 cloud_enum.py -k company -l results.txt

# Quick scan (fewer mutations)
python3 cloud_enum.py -k company --quickscan

# Specific services only
python3 cloud_enum.py -k company --aws-only
python3 cloud_enum.py -k company --azure-only
python3 cloud_enum.py -k company --gcp-only
```

**Custom Mutations File:**
```text
# mutations.txt - Common cloud asset naming patterns
{keyword}
{keyword}-backup
{keyword}-dev
{keyword}-test
{keyword}-prod
{keyword}-staging
{keyword}-data
{keyword}-logs
{keyword}-assets
{keyword}-files
{keyword}-documents
{keyword}-images
{keyword}-videos
{keyword}-database
{keyword}-db
{keyword}-sql
{keyword}-config
{keyword}-configs
{keyword}-secrets
{keyword}-keys
{keyword}-certs
{keyword}-certificates
{keyword}-public
{keyword}-private
{keyword}-internal
{keyword}-external
{keyword}-web
{keyword}-api
{keyword}-app
{keyword}-application
{keyword}-service
{keyword}-microservice
{keyword}-lambda
{keyword}-function
{keyword}-storage
{keyword}-bucket
{keyword}-container
{keyword}-blob
{keyword}-share
{keyword}-drive
{keyword}-disk
{keyword}-volume
{keyword}-snapshot
{keyword}-image
{keyword}-ami
{keyword}-vm
{keyword}-instance
{keyword}-server
{keyword}-host
{keyword}-node
{keyword}-cluster
{keyword}-network
{keyword}-vpc
{keyword}-subnet
{keyword}-security
{keyword}-firewall
{keyword}-gateway
{keyword}-load-balancer
{keyword}-lb
{keyword}-cdn
{keyword}-cache
{keyword}-queue
{keyword}-topic
{keyword}-stream
{keyword}-pipeline
{keyword}-workflow
{keyword}-job
{keyword}-task
{keyword}-cron
{keyword}-schedule
{keyword}-monitor
{keyword}-log
{keyword}-metric
{keyword}-alert
{keyword}-notification
```

## 🛡️ Scout Suite
**Purpose:** Multi-cloud security auditing and misconfiguration detection  
**Difficulty:** Intermediate to Advanced  
**Link:** https://github.com/nccgroup/ScoutSuite

**Installation:**
```bash
# Install via pip
pip install scoutsuite

# Or clone repository
git clone https://github.com/nccgroup/ScoutSuite.git
cd ScoutSuite
pip install -r requirements.txt
```

**AWS Configuration:**
```bash
# Configure AWS credentials
aws configure

# Or use environment variables
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```

**Basic Usage:**
```bash
# AWS audit
scout aws

# Azure audit
scout azure --cli

# GCP audit
scout gcp --user-account

# All providers
scout aws azure gcp --cli --user-account
```

**Advanced Options:**
```bash
# Custom report name
scout aws --report-name company_audit_$(date +%Y%m%d)

# Specific services only
scout aws --services s3,iam,ec2

# Skip specific services
scout aws --skip-services cloudtrail,config

# Custom output directory
scout aws --report-dir /path/to/reports

# No browser opening
scout aws --no-browser

# Force overwrite existing report
scout aws --force
```

**Custom Rules:**
```bash
# Use custom ruleset
scout aws --ruleset-name custom_rules.json

# List available rules
scout aws --list-services
```

## ⚔️ Pacu
**Purpose:** AWS exploitation framework for penetration testing  
**Difficulty:** Advanced  
**Link:** https://github.com/RhinoSecurityLabs/pacu

**Installation:**
```bash
# Clone repository
git clone https://github.com/RhinoSecurityLabs/pacu.git
cd pacu
pip3 install -r requirements.txt

# Install Pacu
python3 install.py
```

**Basic Usage:**
```bash
# Start Pacu
python3 pacu.py

# Create new session
Pacu (no session) > new_session session_name

# Set AWS keys
Pacu (session_name) > set_keys

# List available modules
Pacu (session_name) > list

# Search for modules
Pacu (session_name) > search s3

# Run a module
Pacu (session_name) > run module_name
```

**Common Modules:**
```bash
# AWS account enumeration
run iam__enum_users_roles_policies_groups

# S3 bucket enumeration
run s3__bucket_finder

# EC2 enumeration
run ec2__enum

# Lambda enumeration
run lambda__enum

# RDS enumeration
run rds__enum

# CloudTrail enumeration
run cloudtrail__download_event_history

# IAM privilege escalation
run iam__privesc_scan
```

**Session Management:**
```bash
# List sessions
list_sessions

# Switch session
swap_session session_name

# Export session data
export_keys

# Import session data
import_keys
```

## 🪣 S3 Bucket Tools

### AWS CLI S3 Commands
```bash
# List public buckets (if accessible)
aws s3 ls s3://bucket-name --no-sign-request

# Download bucket contents
aws s3 sync s3://bucket-name ./local-folder --no-sign-request

# Check bucket permissions
aws s3api get-bucket-acl --bucket bucket-name --no-sign-request

# List bucket policy
aws s3api get-bucket-policy --bucket bucket-name --no-sign-request
```

### S3Scanner
```bash
# Install
pip install s3scanner

# Scan for open buckets
s3scanner scan --buckets-file bucket_names.txt

# Check specific bucket
s3scanner scan --bucket bucket-name

# Dump bucket contents
s3scanner dump --bucket bucket-name
```

### Bucket Stream
```bash
# Install
go install github.com/eth0izzle/bucket-stream@latest

# Monitor for new buckets
bucket-stream --only-interesting

# Save to file
bucket-stream --only-interesting > new_buckets.txt
```

## 🔧 Advanced Cloud Enumeration

### Multi-Cloud Asset Discovery Script
```bash
#!/bin/bash
# cloud_asset_discovery.sh

COMPANY="$1"
OUTPUT_DIR="cloud_enum_$(date +%Y%m%d_%H%M%S)"

if [ -z "$COMPANY" ]; then
    echo "Usage: $0 <company_name>"
    exit 1
fi

mkdir -p "$OUTPUT_DIR"
cd "$OUTPUT_DIR"

echo "[+] Starting cloud asset discovery for: $COMPANY"

# CloudEnum
echo "[+] Running CloudEnum..."
python3 /path/to/cloud_enum/cloud_enum.py -k "$COMPANY" --aws --azure --gcp -l cloudenum_results.txt

# S3 bucket discovery
echo "[+] Searching for S3 buckets..."
cat > s3_mutations.txt << EOF
$COMPANY
$COMPANY-backup
$COMPANY-dev
$COMPANY-test
$COMPANY-prod
$COMPANY-staging
$COMPANY-data
$COMPANY-logs
$COMPANY-assets
$COMPANY-files
$COMPANY-documents
$COMPANY-config
$COMPANY-secrets
$COMPANY-keys
$COMPANY-certs
$COMPANY-public
$COMPANY-private
$COMPANY-web
$COMPANY-api
$COMPANY-app
$COMPANY-storage
$COMPANY-bucket
EOF

# Check each S3 bucket
while read bucket; do
    echo "Checking: $bucket"
    aws s3 ls "s3://$bucket" --no-sign-request 2>/dev/null && echo "$bucket - ACCESSIBLE" >> accessible_buckets.txt
done < s3_mutations.txt

# Azure blob storage
echo "[+] Checking Azure blob storage..."
while read storage; do
    curl -s "https://$storage.blob.core.windows.net/" | grep -q "BlobNotFound" || echo "$storage - ACCESSIBLE" >> accessible_azure_storage.txt
done < s3_mutations.txt

# GCP storage
echo "[+] Checking GCP storage..."
while read storage; do
    curl -s "https://storage.googleapis.com/$storage/" | grep -q "NoSuchBucket" || echo "$storage - ACCESSIBLE" >> accessible_gcp_storage.txt
done < s3_mutations.txt

echo "[+] Cloud enumeration completed!"
echo "Results saved in: $OUTPUT_DIR"
```

### Certificate Transparency for Cloud Assets
```bash
#!/bin/bash
# ct_cloud_discovery.sh

DOMAIN="$1"

# Search certificate transparency logs for cloud-related subdomains
curl -s "https://crt.sh/?q=%.${DOMAIN}&output=json" | \
jq -r '.[].name_value' | \
grep -E "(aws|azure|gcp|cloud|s3|blob|storage)" | \
sort -u > cloud_subdomains.txt

echo "Found $(wc -l < cloud_subdomains.txt) cloud-related subdomains"
```

### Cloud Service Detection
```python
#!/usr/bin/env python3
# cloud_service_detector.py

import requests
import json
import sys

def detect_cloud_services(domain):
    """Detect cloud services used by a domain"""
    services = {
        'aws': [],
        'azure': [],
        'gcp': [],
        'cloudflare': [],
        'other': []
    }
    
    # Check DNS records
    try:
        import dns.resolver
        
        # Check CNAME records for cloud services
        for record_type in ['CNAME', 'A']:
            try:
                answers = dns.resolver.resolve(domain, record_type)
                for answer in answers:
                    answer_str = str(answer)
                    
                    if 'amazonaws.com' in answer_str:
                        services['aws'].append(answer_str)
                    elif 'azure' in answer_str or 'windows.net' in answer_str:
                        services['azure'].append(answer_str)
                    elif 'googleapis.com' in answer_str or 'gcp' in answer_str:
                        services['gcp'].append(answer_str)
                    elif 'cloudflare' in answer_str:
                        services['cloudflare'].append(answer_str)
                    else:
                        services['other'].append(answer_str)
            except:
                pass
                
    except ImportError:
        print("Install dnspython: pip install dnspython")
    
    # Check HTTP headers
    try:
        response = requests.get(f"https://{domain}", timeout=10)
        headers = response.headers
        
        # Check for cloud service headers
        if 'x-amz-' in str(headers).lower():
            services['aws'].append('HTTP headers indicate AWS')
        if 'x-azure-' in str(headers).lower():
            services['azure'].append('HTTP headers indicate Azure')
        if 'x-goog-' in str(headers).lower():
            services['gcp'].append('HTTP headers indicate GCP')
        if 'cf-' in str(headers).lower():
            services['cloudflare'].append('HTTP headers indicate Cloudflare')
            
    except:
        pass
    
    return services

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 cloud_service_detector.py <domain>")
        sys.exit(1)
    
    domain = sys.argv[1]
    services = detect_cloud_services(domain)
    
    print(f"Cloud services detected for {domain}:")
    print(json.dumps(services, indent=2))

if __name__ == "__main__":
    main()
```

## 🚨 Troubleshooting

### Common Issues

**AWS credentials not configured:**
```bash
# Configure AWS CLI
aws configure

# Or set environment variables
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_DEFAULT_REGION=us-east-1

# Test configuration
aws sts get-caller-identity
```

**Azure authentication issues:**
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Set subscription
az account set --subscription "subscription-id"
```

**GCP authentication:**
```bash
# Install gcloud SDK
curl https://sdk.cloud.google.com | bash

# Initialize gcloud
gcloud init

# Authenticate
gcloud auth login
gcloud auth application-default login
```

**Rate limiting:**
```bash
# Add delays to scripts
sleep 1  # Between requests

# Use multiple API keys
# Rotate keys in scripts

# Respect rate limits
# Check API documentation for limits
```

### Performance Optimization

**Parallel processing:**
```bash
# Use xargs for parallel execution
cat bucket_names.txt | xargs -n1 -P10 -I {} aws s3 ls s3://{} --no-sign-request

# GNU parallel
parallel -j10 aws s3 ls s3://{} --no-sign-request :::: bucket_names.txt
```

**Efficient bucket checking:**
```bash
# Quick HEAD request instead of LIST
check_bucket() {
    bucket="$1"
    if curl -s -I "https://$bucket.s3.amazonaws.com/" | grep -q "200 OK"; then
        echo "$bucket - EXISTS"
    fi
}

export -f check_bucket
cat bucket_names.txt | xargs -n1 -P20 -I {} bash -c 'check_bucket {}'
```

## 📊 Integration Examples

### Complete Cloud ASM Workflow
```bash
#!/bin/bash
# cloud_asm_workflow.sh

COMPANY="$1"
DOMAIN="$2"
OUTPUT_DIR="cloud_asm_$(date +%Y%m%d_%H%M%S)"

mkdir -p "$OUTPUT_DIR"
cd "$OUTPUT_DIR"

echo "[+] Starting comprehensive cloud ASM for $COMPANY"

# 1. Certificate transparency search
echo "[+] Searching certificate transparency logs..."
curl -s "https://crt.sh/?q=%.${DOMAIN}&output=json" | \
jq -r '.[].name_value' | sort -u > all_subdomains.txt

# 2. Cloud-specific subdomain filtering
grep -E "(aws|azure|gcp|cloud|s3|blob|storage|cdn|api)" all_subdomains.txt > cloud_subdomains.txt

# 3. CloudEnum
echo "[+] Running CloudEnum..."
python3 /path/to/cloud_enum/cloud_enum.py -k "$COMPANY" --aws --azure --gcp

# 4. Scout Suite (if credentials available)
if aws sts get-caller-identity &>/dev/null; then
    echo "[+] Running Scout Suite AWS audit..."
    scout aws --report-name "${COMPANY}_aws_audit"
fi

# 5. Custom bucket enumeration
echo "[+] Custom bucket enumeration..."
./cloud_asset_discovery.sh "$COMPANY"

# 6. Generate summary report
echo "[+] Generating summary report..."
cat > summary_report.md << EOF
# Cloud ASM Report for $COMPANY

## Discovery Summary
- Total subdomains found: $(wc -l < all_subdomains.txt)
- Cloud-related subdomains: $(wc -l < cloud_subdomains.txt)
- Accessible S3 buckets: $([ -f accessible_buckets.txt ] && wc -l < accessible_buckets.txt || echo 0)
- Accessible Azure storage: $([ -f accessible_azure_storage.txt ] && wc -l < accessible_azure_storage.txt || echo 0)
- Accessible GCP storage: $([ -f accessible_gcp_storage.txt ] && wc -l < accessible_gcp_storage.txt || echo 0)

## Findings
$([ -f accessible_buckets.txt ] && echo "### Accessible S3 Buckets" && cat accessible_buckets.txt)
$([ -f accessible_azure_storage.txt ] && echo "### Accessible Azure Storage" && cat accessible_azure_storage.txt)
$([ -f accessible_gcp_storage.txt ] && echo "### Accessible GCP Storage" && cat accessible_gcp_storage.txt)

## Recommendations
1. Review all accessible cloud storage for sensitive data
2. Implement proper access controls and bucket policies
3. Enable logging and monitoring for cloud resources
4. Regular security audits using Scout Suite
5. Implement least privilege access principles

Generated on: $(date)
EOF

echo "[+] Cloud ASM completed! Results in $OUTPUT_DIR"
```

### Continuous Cloud Monitoring
```bash
# Add to crontab for weekly cloud monitoring
0 2 * * 0 /path/to/cloud_asm_workflow.sh company example.com
