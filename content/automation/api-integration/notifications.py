#!/usr/bin/env python3
"""
Notification System for ASM
Send alerts via Slack, Teams, Email, and webhooks
"""

import os
import json
import smtplib
import argparse
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

class ASMNotifications:
    def __init__(self):
        self.slack_webhook = os.environ.get('SLACK_WEBHOOK')
        self.teams_webhook = os.environ.get('TEAMS_WEBHOOK')
        self.smtp_server = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.environ.get('SMTP_PORT', '587'))
        self.smtp_user = os.environ.get('SMTP_USER')
        self.smtp_password = os.environ.get('SMTP_PASSWORD')
        self.discord_webhook = os.environ.get('DISCORD_WEBHOOK')
    
    def send_slack(self, title, message, severity='info', details=None):
        """Send notification to Slack"""
        if not self.slack_webhook:
            print("Slack webhook not configured")
            return False
        
        color_map = {
            'critical': 'danger',
            'high': 'warning',
            'medium': '#FFA500',
            'low': 'good',
            'info': '#36a64f'
        }
        
        payload = {
            "attachments": [{
                "color": color_map.get(severity, 'good'),
                "title": title,
                "text": message,
                "footer": "ASM Security Scanner",
                "ts": int(datetime.now().timestamp())
            }]
        }
        
        if details:
            fields = []
            for key, value in details.items():
                fields.append({
                    "title": key,
                    "value": str(value),
                    "short": True
                })
            payload["attachments"][0]["fields"] = fields
        
        response = requests.post(self.slack_webhook, json=payload)
        return response.status_code == 200
    
    def send_teams(self, title, message, severity='info', details=None):
        """Send notification to Microsoft Teams"""
        if not self.teams_webhook:
            print("Teams webhook not configured")
            return False
        
        color_map = {
            'critical': 'FF0000',
            'high': 'FF9900',
            'medium': 'FFCC00',
            'low': '00FF00',
            'info': '0078D4'
        }
        
        sections = [{
            "activityTitle": title,
            "activitySubtitle": f"Severity: {severity.upper()}",
            "text": message,
            "markdown": True
        }]
        
        if details:
            facts = []
            for key, value in details.items():
                facts.append({
                    "name": key,
                    "value": str(value)
                })
            sections[0]["facts"] = facts
        
        payload = {
            "@type": "MessageCard",
            "@context": "http://schema.org/extensions",
            "themeColor": color_map.get(severity, '0078D4'),
            "summary": title,
            "sections": sections
        }
        
        response = requests.post(self.teams_webhook, json=payload)
        return response.status_code == 200
    
    def send_email(self, to_email, subject, body, html=False):
        """Send email notification"""
        if not self.smtp_user or not self.smtp_password:
            print("SMTP credentials not configured")
            return False
        
        msg = MIMEMultipart('alternative')
        msg['From'] = self.smtp_user
        msg['To'] = to_email
        msg['Subject'] = f"[ASM Alert] {subject}"
        
        if html:
            part = MIMEText(body, 'html')
        else:
            part = MIMEText(body, 'plain')
        
        msg.attach(part)
        
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            return True
        except Exception as e:
            print(f"Email error: {e}")
            return False
    
    def send_discord(self, title, message, severity='info', details=None):
        """Send notification to Discord"""
        if not self.discord_webhook:
            print("Discord webhook not configured")
            return False
        
        color_map = {
            'critical': 0xFF0000,
            'high': 0xFF9900,
            'medium': 0xFFCC00,
            'low': 0x00FF00,
            'info': 0x0099FF
        }
        
        embed = {
            "title": title,
            "description": message,
            "color": color_map.get(severity, 0x0099FF),
            "timestamp": datetime.utcnow().isoformat(),
            "footer": {"text": "ASM Security Scanner"}
        }
        
        if details:
            fields = []
            for key, value in details.items():
                fields.append({
                    "name": key,
                    "value": str(value),
                    "inline": True
                })
            embed["fields"] = fields
        
        payload = {"embeds": [embed]}
        response = requests.post(self.discord_webhook, json=payload)
        return response.status_code == 204
    
    def send_webhook(self, url, data):
        """Send custom webhook notification"""
        try:
            response = requests.post(url, json=data, timeout=10)
            return response.status_code in [200, 201, 204]
        except Exception as e:
            print(f"Webhook error: {e}")
            return False
    
    def send_all(self, title, message, severity='info', details=None):
        """Send notification to all configured channels"""
        results = {}
        
        if self.slack_webhook:
            results['slack'] = self.send_slack(title, message, severity, details)
        
        if self.teams_webhook:
            results['teams'] = self.send_teams(title, message, severity, details)
        
        if self.discord_webhook:
            results['discord'] = self.send_discord(title, message, severity, details)
        
        return results
    
    def format_scan_results(self, scan_type, findings):
        """Format scan results for notifications"""
        if scan_type == 'vulnerability':
            critical = findings.get('critical', 0)
            high = findings.get('high', 0)
            medium = findings.get('medium', 0)
            
            if critical > 0:
                severity = 'critical'
                title = f"🚨 Critical Vulnerabilities Found"
            elif high > 0:
                severity = 'high'
                title = f"⚠️ High Severity Vulnerabilities Found"
            elif medium > 0:
                severity = 'medium'
                title = f"⚡ Medium Severity Vulnerabilities Found"
            else:
                severity = 'info'
                title = f"✅ No Significant Vulnerabilities Found"
            
            message = f"Vulnerability scan completed with {critical} critical, {high} high, {medium} medium findings"
            
        elif scan_type == 'asset_discovery':
            new_assets = findings.get('new_assets', 0)
            total_assets = findings.get('total_assets', 0)
            
            if new_assets > 0:
                severity = 'medium'
                title = f"🆕 New Assets Discovered"
                message = f"Found {new_assets} new assets. Total: {total_assets}"
            else:
                severity = 'info'
                title = f"📊 Asset Discovery Complete"
                message = f"No new assets found. Total: {total_assets}"
            
        elif scan_type == 'credential_leak':
            leaks = findings.get('leaks', 0)
            
            if leaks > 0:
                severity = 'critical'
                title = f"🔓 Credential Leaks Detected"
                message = f"Found {leaks} potential credential exposures"
            else:
                severity = 'info'
                title = f"🔒 No Credential Leaks Found"
                message = "No exposed credentials detected"
        
        else:
            severity = 'info'
            title = "ASM Scan Complete"
            message = json.dumps(findings)
        
        return title, message, severity

def main():
    parser = argparse.ArgumentParser(description='ASM Notification System')
    parser.add_argument('--channel', choices=['slack', 'teams', 'email', 'discord', 'all'], 
                       default='all', help='Notification channel')
    parser.add_argument('--title', required=True, help='Notification title')
    parser.add_argument('--message', required=True, help='Notification message')
    parser.add_argument('--severity', choices=['critical', 'high', 'medium', 'low', 'info'],
                       default='info', help='Severity level')
    parser.add_argument('--details', help='Additional details (JSON format)')
    parser.add_argument('--email-to', help='Email recipient')
    parser.add_argument('--webhook-url', help='Custom webhook URL')
    parser.add_argument('--scan-results', help='Scan results file (JSON)')
    parser.add_argument('--scan-type', choices=['vulnerability', 'asset_discovery', 'credential_leak'],
                       help='Type of scan for formatting')
    
    args = parser.parse_args()
    
    notifier = ASMNotifications()
    
    # Process scan results if provided
    if args.scan_results and args.scan_type:
        with open(args.scan_results, 'r') as f:
            findings = json.load(f)
        title, message, severity = notifier.format_scan_results(args.scan_type, findings)
    else:
        title = args.title
        message = args.message
        severity = args.severity
    
    # Parse additional details
    details = None
    if args.details:
        try:
            details = json.loads(args.details)
        except:
            details = {"details": args.details}
    
    # Send notifications
    success = False
    
    if args.channel == 'slack':
        success = notifier.send_slack(title, message, severity, details)
    elif args.channel == 'teams':
        success = notifier.send_teams(title, message, severity, details)
    elif args.channel == 'discord':
        success = notifier.send_discord(title, message, severity, details)
    elif args.channel == 'email' and args.email_to:
        success = notifier.send_email(args.email_to, title, message)
    elif args.channel == 'all':
        results = notifier.send_all(title, message, severity, details)
        success = any(results.values())
        print(f"Notification results: {results}")
    
    if args.webhook_url:
        webhook_data = {
            "title": title,
            "message": message,
            "severity": severity,
            "details": details,
            "timestamp": datetime.utcnow().isoformat()
        }
        success = notifier.send_webhook(args.webhook_url, webhook_data)
    
    if success:
        print("Notification sent successfully")
    else:
        print("Failed to send notification")
        sys.exit(1)

if __name__ == "__main__":
    main()
