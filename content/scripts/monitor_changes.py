#!/usr/bin/env python3
"""
ASM Change Monitoring Script
Monitors websites for changes and alerts on differences
"""

import hashlib
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
import requests
from urllib.parse import urlparse

def get_page_hash(url, timeout=10):
    """Get SHA256 hash of webpage content"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (ASM Monitor Bot)'
        }
        response = requests.get(url, headers=headers, timeout=timeout, verify=False)
        response.raise_for_status()
        
        # Hash the content
        content_hash = hashlib.sha256(response.text.encode()).hexdigest()
        
        return {
            'hash': content_hash,
            'status_code': response.status_code,
            'content_length': len(response.text),
            'timestamp': datetime.now().isoformat()
        }
    except Exception as e:
        return {
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }

def load_baseline(baseline_file):
    """Load baseline hashes from file"""
    if os.path.exists(baseline_file):
        with open(baseline_file, 'r') as f:
            return json.load(f)
    return {}

def save_baseline(baseline_file, data):
    """Save baseline hashes to file"""
    with open(baseline_file, 'w') as f:
        json.dump(data, f, indent=2)

def check_changes(urls_file, baseline_file='baseline.json', output_file='changes.json'):
    """Check for changes in monitored URLs"""
    
    # Load URLs from file
    if not os.path.exists(urls_file):
        print(f"Error: URLs file {urls_file} not found")
        return
    
    with open(urls_file, 'r') as f:
        urls = [line.strip() for line in f if line.strip() and not line.startswith('#')]
    
    # Load baseline
    baseline = load_baseline(baseline_file)
    changes = []
    
    print(f"[+] Monitoring {len(urls)} URLs for changes...")
    
    for url in urls:
        print(f"    Checking: {url}")
        
        # Get current hash
        current = get_page_hash(url)
        
        if 'error' in current:
            print(f"    [!] Error: {current['error']}")
            continue
        
        # Compare with baseline
        if url in baseline:
            if baseline[url]['hash'] != current['hash']:
                change = {
                    'url': url,
                    'change_detected': True,
                    'old_hash': baseline[url]['hash'],
                    'new_hash': current['hash'],
                    'old_timestamp': baseline[url]['timestamp'],
                    'new_timestamp': current['timestamp'],
                    'content_length_change': current['content_length'] - baseline[url].get('content_length', 0)
                }
                changes.append(change)
                print(f"    [!] CHANGE DETECTED: {url}")
                print(f"        Content length delta: {change['content_length_change']} bytes")
            else:
                print(f"    [✓] No changes detected")
        else:
            print(f"    [+] New URL added to baseline")
        
        # Update baseline
        baseline[url] = current
        
        # Small delay to be respectful
        time.sleep(1)
    
    # Save updated baseline
    save_baseline(baseline_file, baseline)
    
    # Save changes if any
    if changes:
        with open(output_file, 'w') as f:
            json.dump(changes, f, indent=2)
        
        print(f"\n[!] {len(changes)} changes detected!")
        print(f"    Details saved to: {output_file}")
        
        # Print summary
        for change in changes:
            print(f"    - {change['url']}: {change['content_length_change']:+d} bytes")
    else:
        print("\n[✓] No changes detected")

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 monitor_changes.py <urls_file> [baseline_file] [output_file]")
        print("Example: python3 monitor_changes.py urls.txt")
        print("\nCreate urls.txt with one URL per line:")
        print("https://example.com")
        print("https://api.example.com/status")
        sys.exit(1)
    
    urls_file = sys.argv[1]
    baseline_file = sys.argv[2] if len(sys.argv) > 2 else 'baseline.json'
    output_file = sys.argv[3] if len(sys.argv) > 3 else 'changes.json'
    
    check_changes(urls_file, baseline_file, output_file)

if __name__ == "__main__":
    main()
