#!/usr/bin/env python3
"""
Shodan API Integration for ASM
Automated asset discovery and vulnerability scanning
"""

import os
import sys
import json
import argparse
from datetime import datetime
import shodan

class ShodanASM:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.environ.get('SHODAN_API_KEY')
        if not self.api_key:
            raise ValueError("Shodan API key required. Set SHODAN_API_KEY environment variable.")
        self.api = shodan.Shodan(self.api_key)
    
    def search_organization(self, org_name, limit=100):
        """Search for assets belonging to an organization"""
        try:
            query = f'org:"{org_name}"'
            results = self.api.search(query, limit=limit)
            return self._parse_results(results)
        except shodan.APIError as e:
            print(f"Error: {e}")
            return []
    
    def search_domain(self, domain, limit=100):
        """Search for assets on a specific domain"""
        try:
            query = f'hostname:{domain}'
            results = self.api.search(query, limit=limit)
            return self._parse_results(results)
        except shodan.APIError as e:
            print(f"Error: {e}")
            return []
    
    def search_network(self, cidr, limit=100):
        """Search for assets in a network range"""
        try:
            query = f'net:{cidr}'
            results = self.api.search(query, limit=limit)
            return self._parse_results(results)
        except shodan.APIError as e:
            print(f"Error: {e}")
            return []
    
    def get_host_details(self, ip):
        """Get detailed information about a host"""
        try:
            host = self.api.host(ip)
            return {
                'ip': host['ip_str'],
                'hostnames': host.get('hostnames', []),
                'ports': host.get('ports', []),
                'vulns': host.get('vulns', []),
                'os': host.get('os'),
                'services': self._extract_services(host),
                'last_update': host.get('last_update')
            }
        except shodan.APIError as e:
            print(f"Error fetching host {ip}: {e}")
            return None
    
    def search_vulnerabilities(self, cve_id):
        """Search for hosts with specific CVE"""
        try:
            query = f'vuln:{cve_id}'
            results = self.api.search(query)
            return self._parse_results(results)
        except shodan.APIError as e:
            print(f"Error: {e}")
            return []
    
    def monitor_domain(self, domain):
        """Set up monitoring for a domain"""
        try:
            # Create alert for domain
            alert = self.api.create_alert(
                name=f"ASM Monitor: {domain}",
                filters={'hostname': domain}
            )
            return alert
        except shodan.APIError as e:
            print(f"Error creating monitor: {e}")
            return None
    
    def _parse_results(self, results):
        """Parse Shodan search results"""
        parsed = []
        for item in results.get('matches', []):
            parsed.append({
                'ip': item.get('ip_str'),
                'port': item.get('port'),
                'hostname': item.get('hostnames', []),
                'org': item.get('org'),
                'product': item.get('product'),
                'version': item.get('version'),
                'vulns': item.get('vulns', []),
                'timestamp': item.get('timestamp')
            })
        return parsed
    
    def _extract_services(self, host):
        """Extract service information from host data"""
        services = []
        for item in host.get('data', []):
            services.append({
                'port': item.get('port'),
                'transport': item.get('transport'),
                'product': item.get('product'),
                'version': item.get('version'),
                'cpe': item.get('cpe', [])
            })
        return services
    
    def export_results(self, data, filename):
        """Export results to JSON file"""
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        print(f"Results exported to {filename}")

def main():
    parser = argparse.ArgumentParser(description='Shodan API Integration for ASM')
    parser.add_argument('--org', help='Search by organization name')
    parser.add_argument('--domain', help='Search by domain')
    parser.add_argument('--network', help='Search by network CIDR')
    parser.add_argument('--host', help='Get details for specific IP')
    parser.add_argument('--cve', help='Search for specific CVE')
    parser.add_argument('--monitor', help='Set up monitoring for domain')
    parser.add_argument('--output', default='shodan_results.json', help='Output file')
    parser.add_argument('--limit', type=int, default=100, help='Result limit')
    
    args = parser.parse_args()
    
    try:
        scanner = ShodanASM()
        
        if args.org:
            results = scanner.search_organization(args.org, args.limit)
        elif args.domain:
            results = scanner.search_domain(args.domain, args.limit)
        elif args.network:
            results = scanner.search_network(args.network, args.limit)
        elif args.host:
            results = scanner.get_host_details(args.host)
        elif args.cve:
            results = scanner.search_vulnerabilities(args.cve)
        elif args.monitor:
            results = scanner.monitor_domain(args.monitor)
        else:
            parser.print_help()
            sys.exit(1)
        
        if results:
            scanner.export_results(results, args.output)
            print(f"Found {len(results) if isinstance(results, list) else 1} results")
        else:
            print("No results found")
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
