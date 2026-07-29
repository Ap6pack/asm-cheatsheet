# Changelog

All notable changes to the ASM Cheat Sheet project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Two new incident-replay labs**, both with Break-the-Chain defender challenges:
  - **[One SSRF to 106 Million Records](content/labs/capital-one-ssrf-2019.json)** — the 2019 Capital One breach, sourced to [DOJ court records](https://www.justice.gov/usao-wdwa/united-states-v-paige-thompson). A four-link chain of ordinary cloud misconfigurations; enforcing IMDSv2 alone contains it.
  - **[A Credential in a Docker Image](content/labs/codecov-bash-uploader-2021.json)** — the 2021 Codecov Bash Uploader supply-chain compromise, sourced to [Codecov's published post-mortem](https://about.codecov.io/apr-2021-post-mortem/). Shows how a leaked build credential compromises every downstream consumer.
- **Event-counted replays.** Action telemetry is now optional in the lab schema. Labs built from incidents whose responders published per-phase action counts still show "attacker actions"; labs built from the public record alone count timeline steps instead — so a replay never implies forensic precision its sources don't support. The validator enforces all-or-nothing and rejects `totalActions` without phase totals.
- **Open Graph image and per-page metadata.** A statically-generated 1200×630 OG image plus `generateMetadata` on every route — previously 7 of 17 pages (including the homepage and *every* detail route, ~40 generated pages) shared one generic title, and social shares rendered a blank card with a `localhost` image URL.
- **Optional privacy-respecting analytics.** Cookieless Plausible or Umami, entirely env-gated and **off by default** — self-hosted builds and local development send nothing. Documented in [website/.env.example](website/.env.example).
- **[SECURITY.md](SECURITY.md)** — a disclosure policy with scope, response targets, and safe-testing guidance. A project that teaches responsible disclosure previously had no channel to receive it.
- **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** — Contributor Covenant 2.1 with security-specific expectations around authorization boundaries.
- **[Dependabot](.github/dependabot.yml)** — grouped weekly npm updates and monthly GitHub Actions updates, so advisory backlogs don't accumulate again.
- **Bookmarks across all content types.** The store already supported tools, workflows, and scenarios but only commands had a button; bookmarking now works on tools, workflows, scenarios, and labs.
- **[Modern ASM Toolchain](content/tools/modern_tools.md)** — 15 newly documented tools covering the stack most external ASM work actually runs on today: **nuclei**, **httpx**, **katana**, **naabu**, **dnsx**, **tlsx**, **asnmap**, **ffuf**, **gau**, **TruffleHog**, **Gitleaks**, **BBOT**, **uncover**, **notify**, and **cloudlist** — each with purpose, install, usage, and pipeline examples, plus an end-to-end assessment script. Tool coverage went from 11 to 26.
- **Maintenance status on every tool.** A `**Status:**` field distinguishes actively-maintained tools from legacy ones, surfaced as a badge on tool cards and detail pages, with an explanatory callout on legacy tools (Recon-ng and Fierce) pointing at modern replacements.
- **Rewrote [Integrating Threat Intelligence](content/guides/integrating_threat_intel.md)** from a 24-line outline into a full guide — CISA KEV/EPSS-first prioritization, a normalize → correlate → score → act pipeline, a working KEV cross-reference script, a transparent risk-scoring formula, and operational cautions. It is Module 9's primary resource.
- **Reference section (`/reference`)** — 11 long-form pages that previously existed in the repo but were invisible on the website (~4,600 lines), including Getting Started, Security/Legal & Ethical Considerations, Advanced Techniques, Docker Quickstart, Change Tracking, Screenshot Tools, Modern Tooling, Automation Scripts, and the Reading List. Published via an authored manifest ([content/reference-pages.json](content/reference-pages.json)) rather than inferred from prose, and validated in CI.

- **Interactive Labs — Incident Replays**
  - **"Break the Chain" defender challenge** — the flagship lab's headline mode. Instead of watching the intrusion win, you deploy a budgeted set of defensive controls (each mapped to the step it neutralizes); running the intrusion severs the attack chain at your earliest control, contains the blast radius, and grades how early you stopped it (A+ → F). Teaches which control kills which step and where the high-leverage chokepoints are. Watch mode remains available via a mode toggle.
  - **A new `/labs` section** where an intrusion plays back at machine speed: a scrubber and speed controls drive a playhead across the timeline, the attack-chain graph ignites one trust boundary at a time, phase-activity bars fill, and stat tiles (actions replayed, active phase, blast radius) update live. Respects `prefers-reduced-motion`.
  - **Flagship lab: "Anatomy of a Frontier-Lab Agent Intrusion"** — an educational reconstruction of the publicly-reported July 2026 incident ([Hugging Face write-up](https://huggingface.co/blog/agent-intrusion-technical-timeline)), ~17,600 reconstructed actions across two stages and nine phases, with source attribution and a disclaimer.
  - **Fictional training lab: "Shadow IT to Customer Data at Northwind"** — a non-sensitive template showing how a single forgotten subdomain chains to a breach.
  - **Labs are contributor-authorable JSON** ([content/labs/](content/labs/), with a [format guide](content/labs/README.md)), schema-validated in CI — including a check that each phase's per-event action counts sum to its declared total.
  - Labs are indexed for search, added to the sitemap, and surfaced on the homepage and sidebar.

- **Learning Platform Modernization**
  - **Module knowledge-check quizzes** - All 12 learning modules now end with an interactive quiz (60 questions total, defined in [content/quizzes/](content/quizzes/)) with explanations, pass tracking, and retakes
  - **[content/quizzes/README.md](content/quizzes/README.md)** - Contributor guide for the quiz JSON format, schema-validated in CI
  - **Content validation script** (`pnpm validate:content`) - CI now fails loudly when content edits break module, quiz, workflow, scenario, or search-index parsing
  - **FlexSearch-powered site search** - Cmd+K search now uses an indexed engine with prefix matching and weighted field ranking instead of naive substring matching
  - **"Edit this page on GitHub" links** on learning modules and guides to lower the barrier to contribution
  - **GitHub issue templates and a pull request template** for bug reports and content suggestions
  - **E2E tests in CI** - Playwright suite (including new quiz coverage) now runs on every push and pull request

- **CI/CD Pipeline Templates**
  - **[automation/ci-cd-templates/github-actions/asm-workflow.yml](automation/ci-cd-templates/github-actions/asm-workflow.yml)** - GitHub Actions workflow for automated ASM scanning
  - **[automation/ci-cd-templates/gitlab/.gitlab-ci.yml](automation/ci-cd-templates/gitlab/.gitlab-ci.yml)** - GitLab CI pipeline for enterprise-grade ASM scanning with parallel processing
  - **[automation/ci-cd-templates/jenkins/Jenkinsfile](automation/ci-cd-templates/jenkins/Jenkinsfile)** - Jenkins pipeline for comprehensive ASM security scanning with Docker integration

- **API Integration Library**
  - **[automation/api-integration/shodan_api.py](automation/api-integration/shodan_api.py)** - Shodan API integration for organization/domain/network searches and vulnerability detection
  - **[automation/api-integration/virustotal_api.py](automation/api-integration/virustotal_api.py)** - VirusTotal API integration for reputation checking (domains, IPs, URLs, file hashes)
  - **[automation/api-integration/github_api.py](automation/api-integration/github_api.py)** - GitHub API integration for finding exposed credentials and security misconfigurations
  - **[automation/api-integration/notifications.py](automation/api-integration/notifications.py)** - Multi-channel notification system supporting Slack, Teams, Email, and Discord

- **Tool Configuration Library**
  - **[automation/tool-configs/amass_config.ini](automation/tool-configs/amass_config.ini)** - Comprehensive Amass configuration with multiple data sources and bruteforce settings
  - **[automation/tool-configs/nuclei_config.yaml](automation/tool-configs/nuclei_config.yaml)** - Nuclei vulnerability scanner configuration with template paths and rate limiting
  - **[automation/tool-configs/nmap_profiles.conf](automation/tool-configs/nmap_profiles.conf)** - 15 different Nmap scan profiles for various ASM scenarios

- **Quick Reference Materials**
  - **[quick-reference/](quick-reference/)** - Quick Reference Hub for immediate lookup (get what you need in 30 seconds or less)
  - **[quick-reference/README.md](quick-reference/README.md)** - Navigation hub with quick access to commands, one-liners, and tool matrices
  - **[quick-reference/scenario-cards.md](quick-reference/scenario-cards.md)** - Scenario-based command cards for incident response, M&A due diligence, bug bounty, and compliance
  - **[quick-reference/advanced-techniques.md](quick-reference/advanced-techniques.md)** - Enterprise strategies including WAF bypass, ML anomaly detection, and multi-cloud discovery
  - **[quick-reference/docker-quickstart.md](quick-reference/docker-quickstart.md)** - Docker-based instant deployment with zero-installation ASM toolkit

- **Documentation Enhancements**
  - **[resources/reading_list.md](resources/reading_list.md)** - Curated collection of books covering reconnaissance, OSINT, automation, threat intelligence, and vulnerability management
  - **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Comprehensive implementation guide for deploying and adopting the enhanced ASM cheatsheet

### Changed
- **[README.md](README.md)** - Updated with references to new quick reference materials, implementation guide, and reading list
- **[CONTRIBUTORS.md](CONTRIBUTORS.md)**, **[GETTING_STARTED.md](GETTING_STARTED.md)** - Minor documentation and formatting improvements
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Added website development workflow, quiz, lab, and reference-page contribution guidance

### Security
- **Reduced dependency advisories from 63 to 15** (eliminating the 1 critical and 27 of 35 highs) by updating Next.js and Vitest to patched releases and pinning patched versions of transitive build-toolchain packages. The deployed site is a static export, so the Next.js *server* advisories never affected it at runtime — this is build-pipeline supply-chain hygiene, now maintained automatically by Dependabot.

### Fixed
- **Tool docs silently lost their usage examples.** The extractor matched usage headings against a hardcoded allowlist of names, so any doc using a different heading extracted zero examples (Fierce shipped with none). It now matches on heading shape.
- **`/commands` showed mis-parsed sections as tools.** Policy and checklist sections ("Before You Scan — MANDATORY CHECKLIST", "Safe Practice Targets", "Incident Response") were extracted as if they were tools. Commands are now classified as `tool` or `technique`, and non-command policy sections are excluded (they live on the security-considerations reference page instead).
- **Every command lacked a description.** All 28 entries now carry an authored description, and the commands explorer renders it — previously the field was searched but never displayed.
- **Cloud tools were mis-categorised.** Tools documented as H2 headings took their own name as their category (`CloudEnum → CloudEnum`), breaking grouping and filtering on `/tools`. They now use a per-file default category.
- **Learning-module resources ejected learners to raw GitHub.** 12 of 27 resource links left the site mid-lesson — including two guides that already had site pages. All 27 now resolve to on-site routes.
- **Six broken internal content links** in the Quick Reference hub and a stale `GETTING_STARTED.md` path.
- **Workflow and scenario completion tracking** - Completing the final step/phase now records completion; the dashboard previously always showed 0 completed
- **Dashboard "modules completed" metric** - Now counts modules whose quiz was passed instead of modules with any checkbox ticked
- **Guides missing from search and sitemap** - Guides are now indexed for search and included in sitemap.xml
- **Guide pages broke on Vercel builds** - Guide routes now use the shared content loader, which resolves the content directory in all deploy environments
- **Hardcoded site URL** - Sitemap generation respects `NEXT_PUBLIC_SITE_URL`

### Planned
- Docker setup files for containerized ASM tools deployment
- Industry-specific ASM playbooks for healthcare, finance, and retail sectors
- Advanced API integration examples with custom parsing scripts
- Kubernetes deployment manifests for enterprise scaling
- Emergency incident response playbooks

## [v2.1.0] - 2025-06-01

### Security Enhancements
- **[resources/command_cheatsheet.md](resources/command_cheatsheet.md)** - Added critical security warnings and authorization requirements
- **[examples/practical_workflows.md](examples/practical_workflows.md)** - Enhanced with mandatory authorization verification and error handling
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Strengthened safety messaging and legal compliance guidance
- **[scripts/basic_asm_scan.sh](scripts/basic_asm_scan.sh)** - Added legal warnings and interactive authorization checks

### Added
- **[IMPLEMENTATION_STRATEGY.md](IMPLEMENTATION_STRATEGY.md)** - Comprehensive strategic roadmap for expanding the ASM cheatsheet into a three-tiered resource
- Comprehensive authorization verification prompts across all scanning tools and workflows
- Legal warning messages displayed before any scanning activities
- Rate limiting examples and respectful scanning practices throughout documentation
- Safe practice targets for learning (scanme.nmap.org, testphp.vulnweb.com, etc.)
- Enhanced error handling with tool availability checks and installation guidance
- Interactive prompts to prevent accidental unauthorized scanning
- Jurisdiction-specific legal considerations and compliance guidance

### Changed
- **[README.md](README.md)** - Added Project Roadmap section with three-tiered expansion plan, updated planned features, and included new reading list reference
- **Command examples** - Updated all nmap commands to use respectful timing (-T2 instead of -T4)
- **Rate limiting** - Added rate limiting parameters to httpx and other tools (--rate-limit 10)
- **Scanning practices** - Emphasized passive reconnaissance over active scanning for safety
- **Tool configurations** - Updated all examples to use conservative, respectful settings
- **Workflow procedures** - Enhanced all workflows with proper authorization checks and safety validations

### Security
- Implemented mandatory authorization verification before any scanning activities
- Added comprehensive legal warnings about unauthorized scanning risks
- Enhanced all scanning commands with rate limiting and respectful timing
- Added input validation and error handling to prevent common security issues
- Implemented tool availability checks to prevent execution failures
- Added clear guidance on legal boundaries and responsible disclosure practices
- Enhanced documentation with safe practice environments and authorized test targets

### Improved
- **User Safety** - All tools now include authorization prompts and legal warnings
- **Educational Value** - Enhanced learning materials with proper security practices
- **Legal Compliance** - Comprehensive guidance on authorization requirements and legal implications
- **Error Handling** - Better error messages and graceful failure handling throughout
- **Community Safety** - Clear guidelines to prevent accidental misuse of scanning tools

## [v2.0.0] - 2025-06-01

### Added
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Complete 30-minute walkthrough from zero to first scan
- **[resources/learning_guide.md](resources/learning_guide.md)** - Structured learning pathways with 12 detailed modules
- **[examples/practical_workflows.md](examples/practical_workflows.md)** - 6 step-by-step procedures for common ASM scenarios
- **[examples/case_studies.md](examples/case_studies.md)** - 6 real-world case studies with quantified business outcomes
- **[resources/security_considerations.md](resources/security_considerations.md)** - Comprehensive legal, ethical, and technical security guidelines
- **[resources/modern_tools_update.md](resources/modern_tools_update.md)** - 2025 tool updates and alternatives to legacy software
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Comprehensive community contribution framework
- Difficulty indicators (🟢🟡🔴) throughout all documentation
- Time estimates and prerequisites for all learning materials
- Cross-reference navigation system between all documents
- Community recognition and rewards system
- Regular events schedule (monthly calls, quarterly planning, annual conference)

### Enhanced
- **[README.md](README.md)** - Complete overhaul with clear learning paths and community section
- **[CONTRIBUTORS.md](CONTRIBUTORS.md)** - Updated with recognition levels and community engagement
- **[resources/README.md](resources/README.md)** - Added learning resources and community sections
- **[scripts/README.md](scripts/README.md)** - Enhanced with workflow integration and security best practices
- All existing documentation updated with proper cross-references

### Security
- Added comprehensive rate limiting guidelines for all API interactions
- Implemented legal compliance framework for multiple jurisdictions
- Created responsible disclosure procedures and templates
- Added emergency response procedures for critical vulnerability discovery
- Enhanced operational security (OpSec) guidelines

### Community
- Established contributor recognition levels (Newcomer → Regular → Core → Maintainer)
- Created mentorship program framework
- Defined regular community events and communication channels
- Implemented quality assurance and review processes
- Added code of conduct and governance model

## [v1.0.0] - 2025-06-01

### Added
- Initial comprehensive release of ASM Cheat Sheet
- **[README.md](README.md)** - Core project documentation and overview
- **[tools/recon_tools.md](tools/recon_tools.md)** - Reconnaissance tools and techniques
- **[tools/screenshots.md](tools/screenshots.md)** - Web screenshot tools comparison
- **[tools/cloud_enum_tools.md](tools/cloud_enum_tools.md)** - Cloud asset enumeration tools and techniques
- **[scripts/basic_asm_scan.sh](scripts/basic_asm_scan.sh)** - Basic ASM automation script
- **[scripts/monitor_changes.py](scripts/monitor_changes.py)** - Website change detection and monitoring
- **[guides/building_your_own_asm_stack.md](guides/building_your_own_asm_stack.md)** - ASM stack building guide
- **[guides/integrating_threat_intel.md](guides/integrating_threat_intel.md)** - Threat intelligence integration guide
- **[examples/change_tracking.md](examples/change_tracking.md)** - Change tracking techniques and examples
- **[examples/github_leak_queries.md](examples/github_leak_queries.md)** - GitHub search queries for finding exposed credentials
- **[resources/README.md](resources/README.md)** - Reference materials and external resources
- **[resources/command_cheatsheet.md](resources/command_cheatsheet.md)** - Quick command reference
- Basic project structure and organization
- Initial tool recommendations and usage examples
- Core ASM concepts and terminology

### Security
- Basic security considerations and warnings
- Initial responsible disclosure guidelines
- Rate limiting recommendations

## Version History Summary

| Version | Release Date | Major Features |
|---------|--------------|----------------|
| v2.1.0 | 2025-06-01 | Security enhancements, authorization checks, legal compliance |
| v2.0.0 | 2025-06-01 | Complete learning framework, case studies, workflows, community |
| v1.0.0 | 2025-06-01 | Initial comprehensive release with all core documentation |

## Contributing to the Changelog

When contributing to the project, please update this changelog following these guidelines:

### Categories
- **Added** - New features, tools, documentation, or capabilities
- **Changed** - Changes to existing functionality or documentation
- **Deprecated** - Soon-to-be removed features (with timeline)
- **Removed** - Features removed in this version
- **Fixed** - Bug fixes and corrections
- **Security** - Security-related changes, vulnerabilities, or improvements

### Format
- Use present tense ("Add feature" not "Added feature")
- Include links to relevant files or sections
- Provide context for why changes were made
- Mention breaking changes prominently
- Credit contributors when appropriate

### Example Entry
```markdown
## [v2.2.0] - 2025-02-15

### Added
- **[tools/ai_recon.md](tools/ai_recon.md)** - AI-powered reconnaissance techniques
- Integration with GPT-4 for automated subdomain generation
- Machine learning models for anomaly detection in scan results

### Changed
- **[scripts/basic_asm_scan.sh](scripts/basic_asm_scan.sh)** - Enhanced with parallel processing
- Updated Amass configuration for better performance
- Improved error messages and logging

### Security
- Added new rate limiting for AI API calls
- Enhanced data privacy considerations for ML models
- Updated legal guidelines for AI-assisted reconnaissance

### Contributors
- @username1 - AI reconnaissance research and implementation
- @username2 - Performance optimization and testing
```

## Migration Notes

### Current Release (v2.1.0)

This release focuses on security enhancements and legal compliance, ensuring all tools and workflows include proper authorization checks and safety measures.

**What's New:**
1. Comprehensive CI/CD pipeline templates for GitHub Actions, GitLab CI, and Jenkins
2. Complete API integration library (Shodan, VirusTotal, GitHub, notifications)
3. Tool configuration library with ready-to-use configs for Amass, Nuclei, and Nmap
4. Quick reference materials for immediate lookup and Docker-based deployment
5. Enhanced security warnings and authorization requirements throughout

### Tool Version Compatibility

| Tool | Minimum Version | Recommended Version | Notes |
|------|----------------|-------------------|-------|
| Amass | v3.19.0 | v4.2.0+ | v4+ required for latest features |
| httpx | v1.2.0 | v1.3.0+ | Enhanced tech detection in v1.3+ |
| nmap | v7.80 | v7.94+ | Latest version recommended |
| gowitness | v2.4.0 | v2.4.2+ | Bug fixes in latest versions |
| nuclei | v2.9.0 | v3.0.0+ | Major improvements in v3+ |
| Docker | v20.10 | v24.0+ | Required for containerized deployments |

## Support and Feedback

- **Issues**: [GitHub Issues](https://github.com/Ap6pack/asm-cheatsheet/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Ap6pack/asm-cheatsheet/discussions)
- **Security**: security@asm-cheatsheet.org
- **Community**: community@asm-cheatsheet.org

---

**Note**: This changelog follows the [Keep a Changelog](https://keepachangelog.com/) format. For the complete history of changes, see the [Git commit history](https://github.com/Ap6pack/asm-cheatsheet/commits/main).
