# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within NMC Total, please send an email to maxiusofmaximus@github.com. All security vulnerabilities will be promptly addressed.

### What to include in your report:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)

### Response Timeline:

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Release**: Within 30 days (depending on complexity)

## Security Measures

### Code Security
- Regular dependency updates via Dependabot
- Automated security scanning with CodeQL
- NPM audit checks on all dependencies
- Strict Content Security Policy (CSP)

### Build Security
- Signed releases
- Reproducible builds
- Minimal attack surface
- No unnecessary dependencies

### Runtime Security
- Principle of least privilege
- Input validation and sanitization
- Secure defaults
- Regular security audits

## Security Best Practices for Users

1. **Keep Updated**: Always use the latest version
2. **Run as Non-Admin**: When possible, avoid running with administrator privileges
3. **Network Security**: Use firewall rules to restrict network access
4. **Audit Logs**: Regularly review application logs
5. **Backup**: Maintain regular backups of your configuration

## Known Security Considerations

- This application requires network access to monitor connections
- Administrative privileges may be needed for some features
- PowerShell execution is required for advanced monitoring
- Local file system access is needed for cleaning operations

## Compliance

NMC Total follows security best practices and guidelines from:
- OWASP Top 10
- NIST Cybersecurity Framework
- CIS Controls

## Contact

For security-related questions or concerns, contact:
- Email: maxiusofmaximus@github.com
- GitHub: @maxiusofmaximus

---

**Note**: Please do not report security vulnerabilities through public GitHub issues.