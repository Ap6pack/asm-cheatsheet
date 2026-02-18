#!/usr/bin/env python3
"""
GitHub API Integration for ASM
Search for exposed credentials, API keys, and sensitive data
"""

import os
import sys
import json
import time
import argparse
import requests
from datetime import datetime, timedelta

class GitHubASM:
    def __init__(self, token=None):
        self.token = token or os.environ.get('GITHUB_TOKEN')
        if not self.token:
            raise ValueError("GitHub token required. Set GITHUB_TOKEN environment variable.")
        self.headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json"
        }
        self.base_url = "https://api.github.com"
    
    def search_code(self, query, org=None, limit=100):
        """Search for code containing specific patterns"""
        if org:
            query = f"{query} org:{org}"
        
        url = f"{self.base_url}/search/code"
        params = {"q": query, "per_page": 100}
        results = []
        
        while len(results) < limit:
            response = requests.get(url, headers=self.headers, params=params)
            
            if response.status_code == 200:
                data = response.json()
                results.extend(data['items'])
                
                if 'next' not in response.links or len(results) >= limit:
                    break
                    
                url = response.links['next']['url']
                time.sleep(2)  # Rate limiting
            elif response.status_code == 403:
                print("Rate limit exceeded. Waiting...")
                time.sleep(60)
            else:
                break
        
        return results[:limit]
    
    def search_secrets(self, domain):
        """Search for potential secrets related to domain"""
        patterns = [
            f'"{domain}" password',
            f'"{domain}" api_key',
            f'"{domain}" apikey',
            f'"{domain}" secret',
            f'"{domain}" token',
            f'"{domain}" credentials',
            f'"{domain}" private_key',
            f'"{domain}" aws_access_key_id',
            f'"{domain}" aws_secret_access_key',
            f'"{domain}" mongodb://',
            f'"{domain}" postgres://',
            f'"{domain}" mysql://',
            f'"{domain}" ftp://',
            f'"{domain}" ssh://'
        ]
        
        all_results = []
        for pattern in patterns:
            print(f"Searching for: {pattern}")
            results = self.search_code(pattern, limit=10)
            for result in results:
                all_results.append({
                    'pattern': pattern,
                    'file': result['name'],
                    'path': result['path'],
                    'repository': result['repository']['full_name'],
                    'url': result['html_url'],
                    'score': result['score']
                })
            time.sleep(3)  # Rate limiting
        
        return all_results
    
    def search_organization_repos(self, org):
        """Get all repositories for an organization"""
        url = f"{self.base_url}/orgs/{org}/repos"
        params = {"per_page": 100, "type": "all"}
        repos = []
        
        while url:
            response = requests.get(url, headers=self.headers, params=params)
            
            if response.status_code == 200:
                repos.extend(response.json())
                
                if 'next' in response.links:
                    url = response.links['next']['url']
                    params = {}  # Clear params for next page
                else:
                    break
            else:
                break
        
        return [{
            'name': repo['name'],
            'full_name': repo['full_name'],
            'private': repo['private'],
            'url': repo['html_url'],
            'created': repo['created_at'],
            'updated': repo['updated_at'],
            'language': repo['language'],
            'size': repo['size']
        } for repo in repos]
    
    def search_user_activity(self, username):
        """Get recent activity for a user"""
        url = f"{self.base_url}/users/{username}/events/public"
        params = {"per_page": 100}
        response = requests.get(url, headers=self.headers, params=params)
        
        if response.status_code == 200:
            events = response.json()
            return [{
                'type': event['type'],
                'repo': event['repo']['name'],
                'created': event['created_at'],
                'payload': event.get('payload', {})
            } for event in events]
        return []
    
    def search_gists(self, query):
        """Search public gists for sensitive data"""
        # Note: GitHub doesn't have a gist search API, using code search
        gist_query = f"{query} filename:gist"
        return self.search_code(gist_query, limit=50)
    
    def check_repo_security(self, owner, repo):
        """Check repository security settings"""
        repo_url = f"{self.base_url}/repos/{owner}/{repo}"
        vuln_url = f"{self.base_url}/repos/{owner}/{repo}/vulnerability-alerts"
        
        repo_response = requests.get(repo_url, headers=self.headers)
        vuln_response = requests.get(vuln_url, headers=self.headers)
        
        if repo_response.status_code == 200:
            repo_data = repo_response.json()
            return {
                'name': repo_data['full_name'],
                'private': repo_data['private'],
                'has_issues': repo_data['has_issues'],
                'has_wiki': repo_data['has_wiki'],
                'has_pages': repo_data['has_pages'],
                'default_branch': repo_data['default_branch'],
                'vulnerability_alerts': vuln_response.status_code == 204,
                'created': repo_data['created_at'],
                'updated': repo_data['updated_at']
            }
        return None
    
    def find_exposed_configs(self, org=None):
        """Search for exposed configuration files"""
        config_patterns = [
            'filename:.env',
            'filename:config.json',
            'filename:config.yml',
            'filename:config.yaml',
            'filename:.git-credentials',
            'filename:credentials.json',
            'filename:secrets.yml',
            'filename:database.yml',
            'filename:wp-config.php',
            'filename:.htpasswd',
            'filename:.npmrc _auth',
            'filename:dockercfg',
            'filename:.aws/credentials',
            'filename:firebase.json'
        ]
        
        exposed_configs = []
        for pattern in config_patterns:
            if org:
                pattern = f"{pattern} org:{org}"
            
            print(f"Searching for: {pattern}")
            results = self.search_code(pattern, limit=10)
            
            for result in results:
                exposed_configs.append({
                    'type': pattern.split('filename:')[1].split()[0],
                    'file': result['name'],
                    'path': result['path'],
                    'repository': result['repository']['full_name'],
                    'url': result['html_url']
                })
            time.sleep(3)
        
        return exposed_configs
    
    def export_results(self, data, filename):
        """Export results to JSON file"""
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        print(f"Results exported to {filename}")

def main():
    parser = argparse.ArgumentParser(description='GitHub API Integration for ASM')
    parser.add_argument('--search', help='Search code for pattern')
    parser.add_argument('--secrets', help='Search for secrets related to domain')
    parser.add_argument('--org', help='Search within organization')
    parser.add_argument('--org-repos', help='List organization repositories')
    parser.add_argument('--user', help='Get user activity')
    parser.add_argument('--configs', action='store_true', help='Find exposed configs')
    parser.add_argument('--repo-security', help='Check repo security (format: owner/repo)')
    parser.add_argument('--output', default='github_results.json', help='Output file')
    
    args = parser.parse_args()
    
    try:
        gh = GitHubASM()
        
        if args.search:
            results = gh.search_code(args.search, org=args.org)
        elif args.secrets:
            results = gh.search_secrets(args.secrets)
        elif args.org_repos:
            results = gh.search_organization_repos(args.org_repos)
        elif args.user:
            results = gh.search_user_activity(args.user)
        elif args.configs:
            results = gh.find_exposed_configs(org=args.org)
        elif args.repo_security:
            owner, repo = args.repo_security.split('/')
            results = gh.check_repo_security(owner, repo)
        else:
            parser.print_help()
            sys.exit(1)
        
        if results:
            gh.export_results(results, args.output)
            print(f"Found {len(results) if isinstance(results, list) else 1} results")
        else:
            print("No results found")
            
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
