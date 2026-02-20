#!/usr/bin/env python3
"""
GitHub Repository Monitor for ASM
Watch public repos for commits, releases, events, and file changes
"""

import os
import sys
import json
import time
import argparse
import requests
from datetime import datetime, timezone

# Allow importing notifications from the same directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from notifications import ASMNotifications


class GitHubRepoMonitor:
    def __init__(self, token=None):
        self.token = token or os.environ.get('GITHUB_TOKEN')
        if not self.token:
            raise ValueError("GitHub token required. Set GITHUB_TOKEN environment variable.")
        self.headers = {
            "Authorization": f"token {self.token}",
            "Accept": "application/vnd.github.v3+json"
        }
        self.base_url = "https://api.github.com"
        self.notifier = ASMNotifications()

    # ------------------------------------------------------------------
    # Core API helpers
    # ------------------------------------------------------------------

    def _get(self, endpoint, params=None):
        """Make a GET request to the GitHub API with rate-limit handling."""
        url = f"{self.base_url}{endpoint}" if endpoint.startswith('/') else endpoint
        response = requests.get(url, headers=self.headers, params=params)

        if response.status_code == 403 and 'rate limit' in response.text.lower():
            reset = int(response.headers.get('X-RateLimit-Reset', time.time() + 60))
            wait = max(reset - int(time.time()), 1)
            print(f"Rate limit hit. Waiting {wait}s...")
            time.sleep(wait)
            response = requests.get(url, headers=self.headers, params=params)

        if response.status_code == 200:
            return response.json()

        print(f"API error {response.status_code}: {response.text[:200]}")
        return None

    # ------------------------------------------------------------------
    # State management (baseline tracking)
    # ------------------------------------------------------------------

    def load_state(self, state_file):
        """Load monitoring state from file."""
        if os.path.exists(state_file):
            with open(state_file, 'r') as f:
                return json.load(f)
        return {}

    def save_state(self, state_file, state):
        """Save monitoring state to file."""
        with open(state_file, 'w') as f:
            json.dump(state, f, indent=2, default=str)

    # ------------------------------------------------------------------
    # Commit tracking
    # ------------------------------------------------------------------

    def get_commits(self, owner, repo, since=None, branch=None):
        """Fetch recent commits, optionally since a timestamp."""
        params = {"per_page": 100}
        if since:
            params["since"] = since
        if branch:
            params["sha"] = branch

        data = self._get(f"/repos/{owner}/{repo}/commits", params)
        if not data:
            return []

        return [{
            'sha': c['sha'],
            'message': c['commit']['message'].split('\n')[0],
            'author': c['commit']['author']['name'],
            'date': c['commit']['author']['date'],
            'url': c['html_url']
        } for c in data]

    # ------------------------------------------------------------------
    # Release tracking
    # ------------------------------------------------------------------

    def get_releases(self, owner, repo, limit=25):
        """Fetch releases for a repository."""
        data = self._get(f"/repos/{owner}/{repo}/releases", {"per_page": limit})
        if not data:
            return []

        return [{
            'id': r['id'],
            'tag': r['tag_name'],
            'name': r['name'] or r['tag_name'],
            'published': r['published_at'],
            'prerelease': r['prerelease'],
            'draft': r['draft'],
            'author': r['author']['login'],
            'url': r['html_url'],
            'body': (r['body'] or '')[:500]
        } for r in data]

    def get_tags(self, owner, repo, limit=25):
        """Fetch tags (lightweight alternative when releases aren't used)."""
        data = self._get(f"/repos/{owner}/{repo}/tags", {"per_page": limit})
        if not data:
            return []

        return [{
            'name': t['name'],
            'sha': t['commit']['sha']
        } for t in data]

    # ------------------------------------------------------------------
    # Event tracking (issues, PRs, forks, etc.)
    # ------------------------------------------------------------------

    def get_events(self, owner, repo, limit=100):
        """Fetch repository events (issues, PRs, pushes, forks, etc.)."""
        data = self._get(f"/repos/{owner}/{repo}/events", {"per_page": min(limit, 100)})
        if not data:
            return []

        return [{
            'id': str(e['id']),
            'type': e['type'],
            'actor': e['actor']['login'],
            'created': e['created_at'],
            'payload_action': e.get('payload', {}).get('action', ''),
            'payload_ref': e.get('payload', {}).get('ref', ''),
            'payload_size': e.get('payload', {}).get('size', 0)
        } for e in data[:limit]]

    def get_issues(self, owner, repo, since=None, state='all'):
        """Fetch issues and PRs updated since a given timestamp."""
        params = {"per_page": 100, "state": state, "sort": "updated", "direction": "desc"}
        if since:
            params["since"] = since

        data = self._get(f"/repos/{owner}/{repo}/issues", params)
        if not data:
            return []

        return [{
            'number': i['number'],
            'title': i['title'],
            'state': i['state'],
            'is_pr': 'pull_request' in i,
            'user': i['user']['login'],
            'created': i['created_at'],
            'updated': i['updated_at'],
            'labels': [l['name'] for l in i.get('labels', [])],
            'url': i['html_url']
        } for i in data]

    # ------------------------------------------------------------------
    # File-level change detection
    # ------------------------------------------------------------------

    def compare_commits(self, owner, repo, base, head):
        """Compare two commits and return file-level diffs."""
        data = self._get(f"/repos/{owner}/{repo}/compare/{base}...{head}")
        if not data:
            return None

        return {
            'status': data.get('status', ''),
            'ahead_by': data.get('ahead_by', 0),
            'behind_by': data.get('behind_by', 0),
            'total_commits': data.get('total_commits', 0),
            'commits': [{
                'sha': c['sha'],
                'message': c['commit']['message'].split('\n')[0],
                'author': c['commit']['author']['name'],
                'date': c['commit']['author']['date']
            } for c in data.get('commits', [])],
            'files': [{
                'filename': f['filename'],
                'status': f['status'],
                'additions': f['additions'],
                'deletions': f['deletions'],
                'changes': f['changes'],
                'patch': f.get('patch', '')[:1000]
            } for f in data.get('files', [])]
        }

    def get_tree(self, owner, repo, ref='HEAD'):
        """Get file tree at a given ref (for baseline snapshots)."""
        data = self._get(f"/repos/{owner}/{repo}/git/trees/{ref}", {"recursive": "1"})
        if not data:
            return []

        return [{
            'path': item['path'],
            'type': item['type'],
            'sha': item['sha'],
            'size': item.get('size', 0)
        } for item in data.get('tree', []) if item['type'] == 'blob']

    # ------------------------------------------------------------------
    # Main monitoring routine
    # ------------------------------------------------------------------

    def monitor(self, owner, repo, state_file='repo_monitor_state.json'):
        """
        Run a single monitoring pass against a repo.
        Compares current state to the saved baseline and reports changes.
        Returns a dict of all detected changes.
        """
        repo_key = f"{owner}/{repo}"
        state = self.load_state(state_file)
        repo_state = state.get(repo_key, {})
        changes = {
            'repo': repo_key,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'new_commits': [],
            'new_releases': [],
            'new_tags': [],
            'new_events': [],
            'updated_issues': [],
            'file_changes': None
        }

        print(f"[+] Monitoring {repo_key}...")

        # --- Commits ---
        last_commit_date = repo_state.get('last_commit_date')
        last_commit_sha = repo_state.get('last_commit_sha')
        commits = self.get_commits(owner, repo, since=last_commit_date)
        time.sleep(1)

        if commits:
            if last_commit_sha:
                new_commits = [c for c in commits if c['sha'] != last_commit_sha]
                # Stop at the previously seen commit
                trimmed = []
                for c in new_commits:
                    if c['sha'] == last_commit_sha:
                        break
                    trimmed.append(c)
                new_commits = trimmed
            else:
                new_commits = []  # First run — establish baseline only
                print(f"    [+] Baseline: {len(commits)} existing commits recorded")

            if new_commits:
                changes['new_commits'] = new_commits
                print(f"    [!] {len(new_commits)} new commit(s) detected")
                for c in new_commits[:5]:
                    print(f"        {c['sha'][:8]} {c['author']}: {c['message'][:72]}")

            # File-level diff for new commits
            if new_commits and last_commit_sha:
                diff = self.compare_commits(owner, repo, last_commit_sha, new_commits[0]['sha'])
                changes['file_changes'] = diff
                if diff:
                    print(f"    [!] {len(diff.get('files', []))} file(s) changed")
                    for f in diff.get('files', [])[:10]:
                        print(f"        {f['status']:>10} {f['filename']} (+{f['additions']}/-{f['deletions']})")
                time.sleep(1)

            repo_state['last_commit_sha'] = commits[0]['sha']
            repo_state['last_commit_date'] = commits[0]['date']

        # --- Releases ---
        releases = self.get_releases(owner, repo, limit=10)
        time.sleep(1)

        last_release_id = repo_state.get('last_release_id')
        if releases:
            if last_release_id:
                new_releases = [r for r in releases if r['id'] != last_release_id]
                trimmed = []
                for r in new_releases:
                    if r['id'] == last_release_id:
                        break
                    trimmed.append(r)
                new_releases = trimmed
            else:
                new_releases = []
                print(f"    [+] Baseline: {len(releases)} existing releases recorded")

            if new_releases:
                changes['new_releases'] = new_releases
                print(f"    [!] {len(new_releases)} new release(s)")
                for r in new_releases:
                    print(f"        {r['tag']} — {r['name']} (by {r['author']})")

            repo_state['last_release_id'] = releases[0]['id']

        # --- Tags ---
        tags = self.get_tags(owner, repo, limit=10)
        time.sleep(1)

        last_tag = repo_state.get('last_tag')
        if tags:
            if last_tag:
                new_tags = [t for t in tags if t['name'] != last_tag]
                trimmed = []
                for t in new_tags:
                    if t['name'] == last_tag:
                        break
                    trimmed.append(t)
                new_tags = trimmed
            else:
                new_tags = []
                print(f"    [+] Baseline: {len(tags)} existing tags recorded")

            if new_tags:
                changes['new_tags'] = new_tags
                print(f"    [!] {len(new_tags)} new tag(s)")

            repo_state['last_tag'] = tags[0]['name']

        # --- Events ---
        events = self.get_events(owner, repo, limit=50)
        time.sleep(1)

        last_event_id = repo_state.get('last_event_id')
        if events:
            if last_event_id:
                new_events = []
                for e in events:
                    if e['id'] == last_event_id:
                        break
                    new_events.append(e)
            else:
                new_events = []
                print(f"    [+] Baseline: {len(events)} existing events recorded")

            if new_events:
                changes['new_events'] = new_events
                print(f"    [!] {len(new_events)} new event(s)")
                for e in new_events[:10]:
                    action = f" ({e['payload_action']})" if e['payload_action'] else ''
                    print(f"        {e['type']}{action} by {e['actor']}")

            repo_state['last_event_id'] = events[0]['id']

        # --- Issues / PRs ---
        last_issue_check = repo_state.get('last_issue_check')
        issues = self.get_issues(owner, repo, since=last_issue_check)
        time.sleep(1)

        if issues:
            if last_issue_check:
                changes['updated_issues'] = issues
                prs = [i for i in issues if i['is_pr']]
                pure_issues = [i for i in issues if not i['is_pr']]
                if pure_issues:
                    print(f"    [!] {len(pure_issues)} issue(s) updated")
                if prs:
                    print(f"    [!] {len(prs)} PR(s) updated")
            else:
                print(f"    [+] Baseline: {len(issues)} existing issues/PRs recorded")

        repo_state['last_issue_check'] = datetime.now(timezone.utc).isoformat()

        # --- Save state ---
        state[repo_key] = repo_state
        self.save_state(state_file, state)

        return changes

    # ------------------------------------------------------------------
    # Notification helpers
    # ------------------------------------------------------------------

    def notify_changes(self, changes):
        """Send notifications for detected changes via configured channels."""
        repo = changes['repo']
        parts = []

        if changes['new_commits']:
            n = len(changes['new_commits'])
            parts.append(f"{n} new commit(s)")

        if changes['new_releases']:
            tags = ', '.join(r['tag'] for r in changes['new_releases'])
            parts.append(f"new release(s): {tags}")

        if changes['new_tags']:
            names = ', '.join(t['name'] for t in changes['new_tags'])
            parts.append(f"new tag(s): {names}")

        if changes['new_events']:
            n = len(changes['new_events'])
            parts.append(f"{n} new event(s)")

        if changes['updated_issues']:
            prs = sum(1 for i in changes['updated_issues'] if i['is_pr'])
            issues = len(changes['updated_issues']) - prs
            if issues:
                parts.append(f"{issues} issue(s) updated")
            if prs:
                parts.append(f"{prs} PR(s) updated")

        if not parts:
            return False

        title = f"Repository Changes Detected: {repo}"
        message = ' | '.join(parts)
        severity = 'high' if changes['new_releases'] else 'medium'

        details = {"repository": repo, "timestamp": changes['timestamp']}

        if changes.get('file_changes'):
            fc = changes['file_changes']
            details["files_changed"] = len(fc.get('files', []))
            details["total_commits"] = fc.get('total_commits', 0)

        results = self.notifier.send_all(title, message, severity, details)
        print(f"    Notification results: {results}")
        return True

    # ------------------------------------------------------------------
    # Export
    # ------------------------------------------------------------------

    def export_results(self, data, filename):
        """Export results to JSON file."""
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        print(f"Results exported to {filename}")

    # ------------------------------------------------------------------
    # Continuous monitoring loop
    # ------------------------------------------------------------------

    def watch(self, owner, repo, interval=300, state_file='repo_monitor_state.json',
              output_dir='monitor_reports', notify=True):
        """
        Continuously monitor a repo at a given interval (seconds).
        Press Ctrl+C to stop.
        """
        os.makedirs(output_dir, exist_ok=True)
        print(f"[+] Watching {owner}/{repo} every {interval}s  (Ctrl+C to stop)")

        while True:
            try:
                changes = self.monitor(owner, repo, state_file=state_file)

                has_changes = any([
                    changes['new_commits'],
                    changes['new_releases'],
                    changes['new_tags'],
                    changes['new_events'],
                    changes['updated_issues']
                ])

                if has_changes:
                    ts = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
                    report = os.path.join(output_dir, f"{owner}_{repo}_{ts}.json")
                    self.export_results(changes, report)

                    if notify:
                        self.notify_changes(changes)
                else:
                    print("    [OK] No changes detected")

                print(f"    Next check in {interval}s...\n")
                time.sleep(interval)

            except KeyboardInterrupt:
                print("\n[+] Monitoring stopped")
                break
            except Exception as e:
                print(f"    [!] Error: {e}")
                time.sleep(interval)


# ======================================================================
# CLI
# ======================================================================

def main():
    parser = argparse.ArgumentParser(
        description='GitHub Repository Monitor for ASM — track commits, releases, events, and file changes'
    )
    parser.add_argument('--repo', required=True,
                        help='Repository to monitor (format: owner/repo)')
    parser.add_argument('--commits', action='store_true',
                        help='List recent commits')
    parser.add_argument('--releases', action='store_true',
                        help='List recent releases')
    parser.add_argument('--events', action='store_true',
                        help='List recent events')
    parser.add_argument('--issues', action='store_true',
                        help='List recent issues and PRs')
    parser.add_argument('--compare', nargs=2, metavar=('BASE', 'HEAD'),
                        help='Compare two commits (SHAs or refs)')
    parser.add_argument('--tree', metavar='REF',
                        help='List file tree at a given ref')
    parser.add_argument('--monitor', action='store_true',
                        help='Run a single monitoring pass (baseline + diff)')
    parser.add_argument('--watch', action='store_true',
                        help='Continuously monitor at --interval seconds')
    parser.add_argument('--interval', type=int, default=300,
                        help='Watch interval in seconds (default: 300)')
    parser.add_argument('--state-file', default='repo_monitor_state.json',
                        help='State file for baseline tracking')
    parser.add_argument('--notify', action='store_true',
                        help='Send notifications for detected changes')
    parser.add_argument('--output', default='repo_monitor_results.json',
                        help='Output file for results')
    parser.add_argument('--since', help='Filter since ISO timestamp (e.g. 2025-01-01T00:00:00Z)')
    parser.add_argument('--branch', help='Branch to monitor (default: repo default branch)')

    args = parser.parse_args()

    try:
        owner, repo = args.repo.split('/')
    except ValueError:
        print("Error: --repo must be in owner/repo format")
        sys.exit(1)

    try:
        mon = GitHubRepoMonitor()

        if args.watch:
            mon.watch(owner, repo, interval=args.interval,
                      state_file=args.state_file, notify=args.notify)

        elif args.monitor:
            changes = mon.monitor(owner, repo, state_file=args.state_file)
            mon.export_results(changes, args.output)
            if args.notify:
                mon.notify_changes(changes)

        elif args.commits:
            results = mon.get_commits(owner, repo, since=args.since, branch=args.branch)
            mon.export_results(results, args.output)
            print(f"Found {len(results)} commits")

        elif args.releases:
            results = mon.get_releases(owner, repo)
            mon.export_results(results, args.output)
            print(f"Found {len(results)} releases")

        elif args.events:
            results = mon.get_events(owner, repo)
            mon.export_results(results, args.output)
            print(f"Found {len(results)} events")

        elif args.issues:
            results = mon.get_issues(owner, repo, since=args.since)
            mon.export_results(results, args.output)
            print(f"Found {len(results)} issues/PRs")

        elif args.compare:
            results = mon.compare_commits(owner, repo, args.compare[0], args.compare[1])
            if results:
                mon.export_results(results, args.output)
                print(f"Comparison: {results['total_commits']} commit(s), "
                      f"{len(results['files'])} file(s) changed")
            else:
                print("Could not compare commits")

        elif args.tree:
            results = mon.get_tree(owner, repo, ref=args.tree)
            mon.export_results(results, args.output)
            print(f"Tree contains {len(results)} files")

        else:
            parser.print_help()
            sys.exit(1)

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
