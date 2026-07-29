# 🤝 Contributing to ASM Cheat Sheet

Welcome to the ASM community! We're excited to have you contribute to making this the most comprehensive and practical Attack Surface Management resource available.

## 🌟 Ways to Contribute

### 📝 Content Contributions
- **Tool reviews and guides** - Share your experience with ASM tools
- **Real-world case studies** - Document successful ASM implementations
- **Workflow improvements** - Suggest better processes and procedures
- **Security considerations** - Add legal, ethical, or technical guidance
- **Learning materials** - Create tutorials, examples, or explanations
- **Quiz questions** - Add knowledge-check questions to learning modules (see [content/quizzes/README.md](content/quizzes/README.md))
- **Incident-replay labs** - Author an interactive attack-chain replay as JSON (see [content/labs/README.md](content/labs/README.md)) — real incidents (with a cited source) or fictional training scenarios
- **Reference pages** - Publish long-form markdown to the site by adding an entry to [content/reference-pages.json](content/reference-pages.json) with a title, description, and category

### 🔧 Technical Contributions
- **Automation scripts** - Share useful ASM automation
- **Tool integrations** - Connect different ASM tools and platforms
- **Performance improvements** - Optimize existing scripts and workflows
- **Bug fixes** - Fix issues in documentation or code examples
- **New features** - Add functionality to existing tools

### 🌍 Community Building
- **Translations** - Help make ASM accessible globally
- **Mentoring** - Help newcomers learn ASM techniques
- **Event organization** - Organize ASM meetups or workshops
- **Social media** - Share ASM knowledge and resources
- **Feedback** - Provide constructive feedback on existing content

## 🚀 Getting Started

### 1. Choose Your Contribution Type

#### 🟢 Beginner Contributions (Great for first-time contributors)
- **Fix typos or improve documentation clarity**
- **Add missing installation instructions**
- **Create simple tool usage examples**
- **Improve existing explanations**
- **Add troubleshooting tips**

#### 🟡 Intermediate Contributions
- **Write comprehensive tool guides**
- **Create workflow documentation**
- **Add security best practices**
- **Develop automation scripts**
- **Create case study examples**

#### 🔴 Advanced Contributions
- **Design new ASM methodologies**
- **Create complex integrations**
- **Lead major documentation overhauls**
- **Mentor other contributors**
- **Establish new project standards**

### 2. Set Up Your Environment

```bash
# Fork and clone the repository
git clone https://github.com/your-username/asm-cheatsheet.git
cd asm-cheatsheet

# Create a new branch for your contribution
git checkout -b feature/your-contribution-name

# Make your changes
# ... edit files ...

# Test your changes (if applicable)
# ... run tests or verify examples ...

# Commit your changes
git add .
git commit -m "Add: Brief description of your contribution"

# Push to your fork
git push origin feature/your-contribution-name

# Create a pull request
# Go to GitHub and create a PR from your branch
```

### 3. Working on the Website

The interactive site at [asm-cheatsheet.vercel.app](https://asm-cheatsheet.vercel.app) lives in `website/` (Next.js 15 + TypeScript). All learning content is parsed from the markdown and JSON files in `content/`, so most contributions never touch the website code.

```bash
cd website
pnpm install

pnpm dev               # local dev server at http://localhost:3000
pnpm validate:content  # check that content/ parses correctly (run after editing content)
pnpm typecheck         # TypeScript
pnpm lint              # ESLint
pnpm test              # unit tests (Vitest)
pnpm test:e2e          # end-to-end tests (Playwright)
```

CI runs all of these on every pull request. If you only changed files under `content/`, `pnpm validate:content` is the one check to run locally — it verifies your markdown structure and quiz JSON will render correctly.

## 📋 Contribution Guidelines

### Content Standards

#### Documentation Quality
- **Clear and concise** - Write for your intended audience
- **Practical examples** - Include working code and commands
- **Proper formatting** - Use consistent markdown formatting
- **Cross-references** - Link to related sections and resources
- **Up-to-date information** - Verify all tools and techniques work

#### Code Standards
```bash
# Shell scripts should include:
#!/bin/bash
# Script description and purpose
# Author: Your Name
# Date: YYYY-MM-DD

# Error handling
set -euo pipefail

# Clear variable names
TARGET_DOMAIN="example.com"
OUTPUT_DIR="results_$(date +%Y%m%d)"

# Comments for complex operations
# This section performs subdomain discovery
subfinder -d "$TARGET_DOMAIN" -silent > subdomains.txt
```

#### Security Considerations
- **Legal compliance** - Ensure all examples follow legal guidelines
- **Ethical practices** - Promote responsible disclosure and testing
- **Safety first** - Include warnings about potential risks
- **Rate limiting** - Show proper rate limiting in examples
- **Authorization** - Emphasize the need for proper authorization

### File Organization

```
asm-cheatsheet/
├── README.md                    # Main project overview
├── GETTING_STARTED.md          # Quick start guide
├── CONTRIBUTING.md             # This file
├── IMPLEMENTATION_STRATEGY.md  # Strategic roadmap for expansion
├── CHANGELOG.md                # Project history and updates
├── tools/                      # Tool-specific documentation
│   ├── recon_tools.md
│   ├── screenshots.md
│   └── cloud_enum_tools.md
├── scripts/                    # Automation scripts
│   ├── basic_asm_scan.sh
│   └── monitor_changes.py
├── examples/                   # Practical examples
│   ├── case_studies.md
│   ├── practical_workflows.md
│   └── change_tracking.md
├── guides/                     # Comprehensive guides
│   ├── building_your_own_asm_stack.md
│   └── integrating_threat_intel.md
└── resources/                  # Reference materials
    ├── README.md
    ├── learning_guide.md
    ├── command_cheatsheet.md
    ├── security_considerations.md
    └── modern_tools_update.md
```

## 🚀 Strategic Contribution Areas

**See our [Implementation Strategy](IMPLEMENTATION_STRATEGY.md) for the complete roadmap of planned enhancements across three tiers:**

- **Tier 1: Quick Reference** - Command cards, tool matrices, regex patterns, one-liners
- **Tier 2: Practical Automation** - CI/CD templates, API integrations, parsers, notifications
- **Tier 3: Real-World Scenarios** - Industry playbooks, compliance guides, incident response

## 🎯 Specific Contribution Opportunities

### High-Priority Needs

#### 1. Tool Documentation Expansion
**What we need:** Comprehensive guides for popular ASM tools
**Skills required:** Tool experience, technical writing
**Time commitment:** 2-4 hours per tool

**Example contribution:**
```markdown
# Tool Name: Nuclei

**Purpose:** Fast vulnerability scanner using YAML templates
**Difficulty:** 🟡 Intermediate
**Link:** https://github.com/projectdiscovery/nuclei

**Installation:**
[Detailed installation instructions]

**Basic Usage:**
[Step-by-step examples]

**Advanced Techniques:**
[Complex use cases and integrations]

**Troubleshooting:**
[Common issues and solutions]
```

#### 2. Real-World Case Studies
**What we need:** Anonymized stories of successful ASM implementations
**Skills required:** ASM experience, storytelling
**Time commitment:** 3-6 hours per case study

**Template:**
```markdown
# Case Study: [Industry] [Challenge Type]

## Background
- Company type and size
- Challenge description
- Timeline and constraints

## ASM Approach
- Methodology used
- Tools and techniques
- Implementation steps

## Results
- Quantified outcomes
- Lessons learned
- Recommendations
```

#### 3. Automation Scripts
**What we need:** Practical automation for common ASM tasks
**Skills required:** Scripting (bash/python), ASM tools
**Time commitment:** 1-3 hours per script

**Requirements:**
- Clear documentation
- Error handling
- Rate limiting
- Security considerations
- Usage examples

#### 4. Learning Materials
**What we need:** Tutorials, exercises, and educational content
**Skills required:** Teaching ability, ASM knowledge
**Time commitment:** 2-8 hours per module

**Ideas:**
- Interactive tutorials
- Hands-on exercises
- Video walkthroughs
- Assessment quizzes
- Certification programs

### Medium-Priority Opportunities

#### 1. Tool Comparisons
Create detailed comparisons between similar tools:
- Subdomain discovery tools (Amass vs Subfinder vs DNSRecon)
- Screenshot tools (GoWitness vs EyeWitness vs Aquatone)
- Port scanners (Nmap vs Masscan vs RustScan)

#### 2. Integration Guides
Document how to integrate ASM tools with:
- SIEM systems
- Ticketing systems
- CI/CD pipelines
- Cloud platforms
- Security orchestration tools

#### 3. Compliance Mappings
Map ASM activities to compliance frameworks:
- NIST Cybersecurity Framework
- ISO 27001
- SOC2
- PCI DSS
- GDPR requirements

### Long-term Projects

#### 1. ASM Maturity Model
Develop a framework for organizations to assess their ASM maturity:
- Level 1: Ad-hoc discovery
- Level 2: Regular scanning
- Level 3: Continuous monitoring
- Level 4: Automated response
- Level 5: Predictive analytics

#### 2. Community Tool Development
Collaborate on developing new ASM tools:
- Unified ASM dashboard
- Multi-tool orchestration platform
- ASM-specific threat intelligence feeds
- Automated compliance reporting

#### 3. Research Initiatives
Conduct research on emerging ASM topics:
- AI/ML applications in ASM
- IoT device discovery
- Container and Kubernetes security
- Supply chain attack surface management

## 🏆 Recognition and Rewards

### Contributor Levels

#### 🌱 Newcomer (1-5 contributions)
- Welcome package with ASM resources
- Contributor badge on GitHub
- Mention in monthly newsletter

#### 🌿 Regular Contributor (6-15 contributions)
- Featured contributor spotlight
- Early access to new content
- Invitation to contributor calls

#### 🌳 Core Contributor (16+ contributions)
- Co-author credit on major releases
- Speaking opportunities at events
- Input on project direction

#### 🏅 Maintainer (Ongoing leadership)
- Repository write access
- Release management responsibilities
- Community leadership role

### Recognition Programs

#### Monthly Highlights
- **Contributor of the Month** - Featured on main README
- **Best New Content** - Highlighted in community updates
- **Most Helpful** - Recognition for community support

#### Annual Awards
- **Innovation Award** - Most creative contribution
- **Impact Award** - Contribution with biggest community benefit
- **Mentorship Award** - Outstanding community support

## 📞 Getting Help

### Communication Channels

#### GitHub
- **Issues** - Bug reports, feature requests, questions
- **Discussions** - General community conversation
- **Pull Requests** - Code and content contributions

#### Community Platforms
- **Discord Server** - Real-time chat and collaboration
- **Reddit Community** - r/AttackSurfaceManagement
- **LinkedIn Group** - Professional networking and discussions

#### Regular Events
- **Monthly Contributor Calls** - First Friday of each month
- **Quarterly Planning Sessions** - Project roadmap discussions
- **Annual ASM Conference** - Community gathering and presentations

### Mentorship Program

#### For New Contributors
- **Buddy System** - Paired with experienced contributor
- **Guided First Contribution** - Step-by-step support
- **Regular Check-ins** - Progress and feedback sessions

#### For Experienced Contributors
- **Mentorship Opportunities** - Help guide newcomers
- **Leadership Development** - Training for community roles
- **Speaking Opportunities** - Present at events and conferences

## 🔄 Contribution Process

### 1. Planning Phase
```bash
# Before starting work:
# 1. Check existing issues and discussions
# 2. Create an issue to discuss your idea
# 3. Get feedback from maintainers
# 4. Clarify scope and requirements
```

### 2. Development Phase
```bash
# While working:
# 1. Follow coding and documentation standards
# 2. Test your changes thoroughly
# 3. Update related documentation
# 4. Consider security implications
```

### 3. Review Phase
```bash
# When submitting:
# 1. Create clear pull request description
# 2. Link to related issues
# 3. Respond to reviewer feedback
# 4. Make requested changes promptly
```

### 4. Merge and Follow-up
```bash
# After merge:
# 1. Monitor for any issues
# 2. Update documentation if needed
# 3. Share your contribution with community
# 4. Consider follow-up improvements
```

## 📊 Quality Assurance

### Content Review Process

#### Technical Accuracy
- All commands and scripts tested
- Tool versions and links verified
- Security practices validated
- Legal considerations reviewed

#### Editorial Review
- Grammar and spelling checked
- Formatting consistency verified
- Cross-references validated
- Accessibility considerations

#### Community Feedback
- Peer review by other contributors
- Testing by community members
- Feedback incorporation
- Continuous improvement

### Testing Standards

#### Script Testing
```bash
# All scripts should be tested with:
# 1. Valid inputs
# 2. Invalid inputs
# 3. Edge cases
# 4. Different environments
# 5. Rate limiting scenarios
```

#### Documentation Testing
- All examples manually verified
- Links checked for validity
- Instructions tested by newcomers
- Cross-platform compatibility verified

## 🎉 Community Events

### Regular Events

#### Monthly Contributor Calls
- **When:** First Friday of each month, 2 PM UTC
- **Format:** Video conference (Zoom/Teams)
- **Agenda:** Project updates, new contributions, Q&A
- **Duration:** 60 minutes

#### Quarterly Planning Sessions
- **When:** Last Friday of March, June, September, December
- **Format:** Extended video conference
- **Agenda:** Roadmap planning, major initiatives, community feedback
- **Duration:** 90 minutes

#### Annual ASM Conference
- **When:** October (dates vary)
- **Format:** Virtual or hybrid event
- **Content:** Presentations, workshops, networking
- **Duration:** 2 days

### Special Events

#### Hacktoberfest Participation
- October annual event
- Special ASM-focused challenges
- Beginner-friendly issues
- Prizes and recognition

#### Security Awareness Month
- October activities
- Educational content focus
- Community challenges
- Expert presentations

#### New Year Planning
- January roadmap sessions
- Goal setting for the year
- Community feedback collection
- Priority setting

## 📈 Project Roadmap

### 2025 Goals

#### Q1: Foundation Strengthening
- Complete tool documentation overhaul
- Establish contributor onboarding process
- Launch mentorship program
- Create assessment framework

#### Q2: Community Growth
- Reach 1000 GitHub stars
- Establish regular events
- Launch certification program
- Create video content

#### Q3: Advanced Features
- Develop automation platform
- Create compliance mappings
- Launch research initiatives
- Establish partnerships

#### Q4: Sustainability
- Establish governance model
- Create funding strategy
- Plan 2026 roadmap
- Celebrate achievements

### Long-term Vision (2026-2030)
- Become the definitive ASM resource
- Establish ASM certification standard
- Create commercial partnerships
- Influence industry best practices

## 🤝 Code of Conduct

### Our Commitment
We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background, experience level, or identity.

### Expected Behavior
- **Be respectful** - Treat all community members with respect
- **Be inclusive** - Welcome newcomers and diverse perspectives
- **Be collaborative** - Work together towards common goals
- **Be constructive** - Provide helpful feedback and suggestions
- **Be patient** - Help others learn and grow

### Unacceptable Behavior
- Harassment or discrimination of any kind
- Trolling, insulting, or derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct inappropriate for a professional setting

### Enforcement
- Issues will be addressed promptly and fairly
- Violations may result in temporary or permanent bans
- Appeals process available for disputed decisions
- Maintainers have final authority on enforcement

### Reporting
- Report issues to: conduct@asm-cheatsheet.org
- All reports will be kept confidential
- Anonymous reporting options available
- Regular review of policies and procedures

## 📞 Contact Information

### Project Maintainers
- **Lead Maintainer:** [Name] - [email]
- **Technical Lead:** [Name] - [email]
- **Community Manager:** [Name] - [email]

### Community Channels
- **GitHub:** https://github.com/asm-cheatsheet/asm-cheatsheet
- **Discord:** https://discord.gg/asm-cheatsheet
- **Email:** community@asm-cheatsheet.org
- **Twitter:** @ASMCheatSheet

### Business Inquiries
- **Partnerships:** partnerships@asm-cheatsheet.org
- **Sponsorship:** sponsors@asm-cheatsheet.org
- **Media:** media@asm-cheatsheet.org

---

**Thank you for contributing to the ASM community! Together, we're making the internet a safer place through better attack surface management.**

*Last updated: January 2025*
