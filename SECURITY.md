# Security Policy

This project teaches responsible disclosure, so it owes you a way to practise it here.

## Reporting a vulnerability

**Please do not open a public issue for security problems.**

Report privately through either channel:

1. **GitHub Security Advisories** (preferred) — [open a draft advisory](https://github.com/Ap6pack/asm-cheatsheet/security/advisories/new). This keeps the report private until a fix ships.
2. **Email** — security contact listed on the [maintainer's GitHub profile](https://github.com/Ap6pack).

Please include:

- What the issue is and where (file, URL, or component)
- Steps to reproduce, ideally with a minimal example
- What an attacker could achieve with it
- Any suggested fix, if you have one

### What to expect

| Stage | Target |
|---|---|
| Acknowledgement of your report | Within 5 days |
| Initial assessment and severity | Within 10 days |
| Fix or mitigation plan communicated | Within 30 days |

These are targets for a volunteer-maintained open-source project, not a contractual SLA. If you have not heard back within the acknowledgement window, please follow up — mail does get lost.

We will credit you in the advisory and release notes unless you ask us not to.

## Scope

This repository contains **documentation, training content, and a static website**. It does not host a service, process user accounts, or store user data — all learner progress lives in the visitor's own browser (`localStorage`) and is never transmitted.

### In scope

- **The website** (`website/`) — XSS, dependency vulnerabilities reachable in the built output, build-pipeline issues, content-injection through the markdown/JSON content pipeline
- **Content** (`content/`) — commands or scripts that are dangerous, destructive, or wrong in a way that could harm a reader or a target system
- **Automation** (`content/automation/`, `content/scripts/`) — credential handling, injection, or unsafe defaults in the example scripts

### Out of scope

- Vulnerabilities in the third-party tools this project documents. Report those to their maintainers; we will happily update our documentation once they are public.
- Findings against `asm-cheatsheet.vercel.app` that are really Vercel platform issues — report those via [Vercel's disclosure process](https://vercel.com/security).
- Missing security headers with no demonstrated impact on a static, credential-free site.
- Automated scanner output with no verified, reproducible impact.

## Testing this project

You do not need permission to review the source, run the site locally, or scan **your own** deployment of it. Please **do not** run active scans or automated tooling against the hosted `asm-cheatsheet.vercel.app` deployment — it is shared infrastructure, and doing so tests Vercel rather than this project.

Everything in this repository is intended for use against systems you own or are explicitly authorized to test. See [Security Considerations](content/resources/security_considerations.md) for the project's position on legal and ethical practice.

## Supported versions

This project ships from `main`; there are no maintained release branches. Fixes land on `main` and deploy from there.
