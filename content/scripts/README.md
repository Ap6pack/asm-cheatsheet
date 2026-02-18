# ASM Automation Scripts

This directory contains practical automation scripts for Attack Surface Management tasks. These scripts are designed to work with the workflows and methodologies described in our comprehensive ASM guides.

## 🔗 Related Resources

- **[Getting Started Guide](../GETTING_STARTED.md)** - Learn the basics before using these scripts
- **[Practical Workflows](../examples/practical_workflows.md)** - See these scripts in action
- **[Security Considerations](../resources/security_considerations.md)** - Important legal and ethical guidelines
- **[Learning Guide](../resources/learning_guide.md)** - Structured learning path for ASM automation

## Available Scripts

### 🔍 basic_asm_scan.sh
**Purpose:** Complete ASM workflow automation  
**Usage:** `./basic_asm_scan.sh domain.com`

**What it does:**
1. Discovers subdomains using Amass (passive)
2. Finds live web services with httpx
3. Performs basic port scanning with nmap
4. Takes screenshots with gowitness
5. Organizes results in timestamped directory

**Requirements:**
- amass
- httpx
- nmap
- gowitness

**Example:**
```bash
chmod +x basic_asm_scan.sh
./basic_asm_scan.sh example.com
```

### 📊 monitor_changes.py
**Purpose:** Website change detection and monitoring  
**Usage:** `python3 monitor_changes.py urls.txt`

**What it does:**
1. Monitors websites for content changes
2. Maintains baseline hashes
3. Detects and reports differences
4. Tracks content length changes

**Requirements:**
- Python 3.x
- requests library (`pip install requests`)

**Setup:**
```bash
# Create URLs file
echo "https://example.com" > urls.txt
echo "https://api.example.com/status" >> urls.txt

# Run monitoring
python3 monitor_changes.py urls.txt

# Schedule with cron for continuous monitoring
# Add to crontab: 0 */6 * * * /path/to/monitor_changes.py /path/to/urls.txt
```

## Installation Guide

### Quick Setup (Ubuntu/Debian)
```bash
# Install Go tools
go install github.com/owasp-amass/amass/v4/...@master
go install github.com/projectdiscovery/httpx/cmd/httpx@latest
go install github.com/sensepost/gowitness@latest

# Install system tools
sudo apt update
sudo apt install nmap python3 python3-pip

# Install Python dependencies
pip3 install requests
```

### Quick Setup (macOS)
```bash
# Install Go tools (same as above)
go install github.com/owasp-amass/amass/v4/...@master
go install github.com/projectdiscovery/httpx/cmd/httpx@latest
go install github.com/sensepost/gowitness@latest

# Install system tools
brew install nmap python3

# Install Python dependencies
pip3 install requests
```

## Usage Examples

### Basic Domain Assessment
```bash
# Run complete scan
./basic_asm_scan.sh target.com

# Results will be in: asm_results_YYYYMMDD_HHMMSS/
```

### Continuous Monitoring Setup
```bash
# Create monitoring list
cat > monitor_urls.txt << EOF
https://company.com
https://app.company.com
https://api.company.com
https://admin.company.com
EOF

# Initial baseline
python3 monitor_changes.py monitor_urls.txt

# Set up daily monitoring (add to crontab)
0 9 * * * cd /path/to/asm-cheatsheet/scripts && python3 monitor_changes.py monitor_urls.txt
```

### Integration with Existing Workflows
```bash
# Use with existing subdomain lists
httpx -l existing_subdomains.txt -o live_hosts.txt
gowitness file -f live_hosts.txt

# Monitor specific endpoints
echo "https://target.com/admin" > critical_urls.txt
python3 monitor_changes.py critical_urls.txt critical_baseline.json critical_changes.json
```

## Output Formats

### basic_asm_scan.sh Output
```
asm_results_20250601_223000/
├── subdomains.txt          # Discovered subdomains
├── live_hosts.txt          # Live web services
├── hosts_for_nmap.txt      # Cleaned hostnames for nmap
├── nmap_scan.nmap          # Port scan results
├── nmap_scan.xml           # XML format results
└── screenshots/            # Website screenshots
    ├── gowitness.db
    └── *.png
```

### monitor_changes.py Output
```json
{
  "url": "https://example.com",
  "change_detected": true,
  "old_hash": "abc123...",
  "new_hash": "def456...",
  "old_timestamp": "2025-01-01T12:00:00",
  "new_timestamp": "2025-01-01T18:00:00",
  "content_length_change": 150
}
```

## Security Considerations

- **Rate Limiting:** Scripts include delays to avoid overwhelming targets
- **User Agents:** Identify your scans appropriately
- **Scope:** Only scan domains you own or have permission to test
- **Logging:** Monitor script execution and results for anomalies

## Troubleshooting

### Common Issues

**"Command not found" errors:**
- Ensure Go tools are in your PATH: `export PATH=$PATH:$(go env GOPATH)/bin`
- Verify installations: `which amass httpx gowitness nmap`

**Permission denied:**
- Make scripts executable: `chmod +x *.sh *.py`
- Run nmap with sudo if needed for SYN scans

**Python import errors:**
- Install requests: `pip3 install requests`
- Use virtual environment if needed

**No results found:**
- Check domain spelling and DNS resolution
- Verify network connectivity
- Try with known working domains first

## Advanced Usage

### Integration with Workflows

These scripts are designed to work with the workflows described in [Practical Workflows](../examples/practical_workflows.md):

- **New Domain Assessment** - Use `basic_asm_scan.sh` for initial discovery
- **Continuous Monitoring** - Use `monitor_changes.py` for ongoing surveillance
- **Incident Response** - Rapid asset discovery during security incidents
- **Bug Bounty Reconnaissance** - Efficient target enumeration

### Enterprise Deployment

For enterprise use, consider:

1. **Containerization** - Deploy scripts in Docker containers
2. **Orchestration** - Use Kubernetes for scale
3. **CI/CD Integration** - Automate with GitHub Actions or Jenkins
4. **Monitoring** - Integrate with SIEM and alerting systems

See our [Case Studies](../examples/case_studies.md) for real-world enterprise implementations.

### Security Best Practices

⚠️ **Important**: Always follow our [Security Considerations](../resources/security_considerations.md):

- Only scan assets you own or have explicit permission to test
- Implement proper rate limiting to avoid overwhelming targets
- Use secure credential management for API keys
- Follow responsible disclosure practices for any findings

## Contributing

We welcome script contributions! See our [Contributing Guide](../CONTRIBUTING.md) for detailed information.

### Script Contribution Guidelines

1. **Follow naming convention**: `purpose_description.ext`
2. **Include comprehensive documentation** with usage examples
3. **Implement proper error handling** and logging
4. **Add security considerations** and rate limiting
5. **Test with safe targets** before submitting
6. **Update this README** with your script documentation

### High-Priority Script Needs

- **Cloud asset enumeration** automation
- **Threat intelligence integration** scripts
- **Report generation** and visualization tools
- **Multi-tool orchestration** frameworks
- **Compliance checking** automation

### Testing Requirements

All scripts must be tested with:
- Valid inputs and expected scenarios
- Invalid inputs and error conditions
- Rate limiting and timeout scenarios
- Different operating systems (Linux, macOS, Windows)
- Various network conditions

For detailed testing guidelines, see our [Contributing Guide](../CONTRIBUTING.md#testing-standards).
