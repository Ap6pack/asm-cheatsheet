#!/usr/bin/env python3
"""
VirusTotal API Integration for ASM
Domain and IP reputation checking, malware scanning
"""

import os
import sys
import json
import time
import hashlib
import argparse
import requests
from datetime import datetime

class VirusTotalASM:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.environ.get('VIRUSTOTAL_API_KEY')
        if not self.api_key:
            raise ValueError("VirusTotal API key required. Set VIRUSTOTAL_API_KEY environment variable.")
        self.base_url = "https://www.virustotal.com/api/v3"
        self.headers = {"x-apikey": self.api_key}
    
    def check_domain(self, domain):
        """Check domain reputation and details"""
        url = f"{self.base_url}/domains/{domain}"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            data = response.json()['data']
            return {
                'domain': domain,
                'reputation': data['attributes']['reputation'],
                'categories': data['attributes'].get('categories', {}),
                'last_analysis_stats': data['attributes']['last_analysis_stats'],
                'whois': data['attributes'].get('whois'),
                'dns_records': self._get_dns_records(domain),
                'subdomains': self._get_subdomains(domain),
                'communicating_files': self._get_communicating_files(domain)
            }
        return None
    
    def check_ip(self, ip_address):
        """Check IP reputation and details"""
        url = f"{self.base_url}/ip_addresses/{ip_address}"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            data = response.json()['data']
            return {
                'ip': ip_address,
                'reputation': data['attributes']['reputation'],
                'country': data['attributes'].get('country'),
                'as_owner': data['attributes'].get('as_owner'),
                'last_analysis_stats': data['attributes']['last_analysis_stats'],
                'network': data['attributes'].get('network'),
                'resolutions': self._get_resolutions(ip_address)
            }
        return None
    
    def check_url(self, url):
        """Submit URL for scanning"""
        scan_url = f"{self.base_url}/urls"
        data = {"url": url}
        response = requests.post(scan_url, headers=self.headers, data=data)
        
        if response.status_code == 200:
            scan_id = response.json()['data']['id']
            return self._get_url_report(scan_id)
        return None
    
    def check_file_hash(self, file_hash):
        """Check file hash reputation"""
        url = f"{self.base_url}/files/{file_hash}"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            data = response.json()['data']
            return {
                'hash': file_hash,
                'type': data['attributes']['type_description'],
                'names': data['attributes'].get('names', []),
                'last_analysis_stats': data['attributes']['last_analysis_stats'],
                'malicious': data['attributes']['last_analysis_stats'].get('malicious', 0),
                'tags': data['attributes'].get('tags', []),
                'first_seen': data['attributes'].get('first_submission_date'),
                'last_seen': data['attributes'].get('last_submission_date')
            }
        return None
    
    def search_domain_in_files(self, domain):
        """Search for domain in malware samples"""
        url = f"{self.base_url}/intelligence/search"
        params = {"query": f"domain:{domain}", "limit": 20}
        response = requests.get(url, headers=self.headers, params=params)
        
        if response.status_code == 200:
            return response.json()['data']
        return []
    
    def _get_dns_records(self, domain):
        """Get DNS records for domain"""
        url = f"{self.base_url}/domains/{domain}/dns_records"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            records = []
            for record in response.json()['data']:
                records.append({
                    'type': record['attributes']['type'],
                    'value': record['attributes']['value']
                })
            return records
        return []
    
    def _get_subdomains(self, domain):
        """Get subdomains"""
        url = f"{self.base_url}/domains/{domain}/subdomains"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            subdomains = []
            for item in response.json()['data']:
                subdomains.append(item['id'])
            return subdomains
        return []
    
    def _get_communicating_files(self, domain):
        """Get files communicating with domain"""
        url = f"{self.base_url}/domains/{domain}/communicating_files"
        params = {"limit": 10}
        response = requests.get(url, headers=self.headers, params=params)
        
        if response.status_code == 200:
            files = []
            for item in response.json()['data']:
                files.append({
                    'sha256': item['id'],
                    'type': item['attributes'].get('type_description'),
                    'first_seen': item['attributes'].get('first_submission_date')
                })
            return files
        return []
    
    def _get_resolutions(self, ip_address):
        """Get domain resolutions for IP"""
        url = f"{self.base_url}/ip_addresses/{ip_address}/resolutions"
        params = {"limit": 10}
        response = requests.get(url, headers=self.headers, params=params)
        
        if response.status_code == 200:
            resolutions = []
            for item in response.json()['data']:
                resolutions.append({
                    'hostname': item['attributes']['host_name'],
                    'last_resolved': item['attributes'].get('date')
                })
            return resolutions
        return []
    
    def _get_url_report(self, scan_id):
        """Get URL scan report"""
        url = f"{self.base_url}/analyses/{scan_id}"
        
        # Wait for scan to complete
        for _ in range(30):
            response = requests.get(url, headers=self.headers)
            if response.status_code == 200:
                data = response.json()['data']
                if data['attributes']['status'] == 'completed':
                    return {
                        'url': data['meta']['url_info']['url'],
                        'stats': data['attributes']['stats'],
                        'malicious': data['attributes']['stats'].get('malicious', 0),
                        'suspicious': data['attributes']['stats'].get('suspicious', 0)
                    }
            time.sleep(2)
        return None
    
    def bulk_check_domains(self, domains):
        """Check multiple domains"""
        results = []
        for domain in domains:
            result = self.check_domain(domain)
            if result:
                results.append(result)
            time.sleep(15)  # Rate limiting for free API
        return results
    
    def export_results(self, data, filename):
        """Export results to JSON file"""
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        print(f"Results exported to {filename}")

def main():
    parser = argparse.ArgumentParser(description='VirusTotal API Integration for ASM')
    parser.add_argument('--domain', help='Check domain reputation')
    parser.add_argument('--ip', help='Check IP reputation')
    parser.add_argument('--url', help='Scan URL')
    parser.add_argument('--hash', help='Check file hash')
    parser.add_argument('--domain-list', help='File with list of domains')
    parser.add_argument('--search', help='Search domain in malware')
    parser.add_argument('--output', default='virustotal_results.json', help='Output file')
    
    args = parser.parse_args()
    
    try:
        vt = VirusTotalASM()
        
        if args.domain:
            results = vt.check_domain(args.domain)
        elif args.ip:
            results = vt.check_ip(args.ip)
        elif args.url:
            results = vt.check_url(args.url)
        elif args.hash:
            results = vt.check_file_hash(args.hash)
        elif args.domain_list:
            with open(args.domain_list, 'r') as f:
                domains = [line.strip() for line in f]
            results = vt.bulk_check_domains(domains)
        elif args.search:
            results = vt.search_domain_in_files(args.search)
        else:
            parser.print_help()
            sys.exit(1)
        
        if results:
            vt.export_results(results, args.output)
            print(f"Analysis complete. Results saved to {args.output}")
        else:
            print("No results found")
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
