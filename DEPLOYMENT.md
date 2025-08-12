# NMC Total - Deployment and Security Guide

## 🚀 Deployment Instructions

### Prerequisites
- Node.js 16+ installed
- Git installed
- GitHub account with repository access
- npm 8+ installed

### Initial Setup

1. **Run Security Setup**
   ```bash
   npm run security-check
   npm audit --audit-level moderate
   ```

2. **Initialize Git Repository**
   ```bash
   # Run the setup script
   setup-git.bat
   
   # Or manually:
   git init
   git remote add origin https://github.com/maxiusofmaximus/NMC-Total.git
   git add .
   git commit -m "Initial commit: NMC Total"
   git branch -M main
   git push -u origin main
   ```

3. **Install Dependencies Securely**
   ```bash
   npm ci --audit
   npm run audit
   ```

### GitHub Repository Configuration

#### 1. Enable Security Features
- Go to repository Settings → Security
- Enable:
  - Dependency graph
  - Dependabot alerts
  - Dependabot security updates
  - Code scanning alerts
  - Secret scanning alerts

#### 2. Branch Protection Rules
- Protect `main` branch
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- Include administrators

#### 3. Repository Secrets
Add these secrets in Settings → Secrets and variables → Actions:
- `NPM_TOKEN` (if publishing to npm)
- `CODECOV_TOKEN` (for code coverage)

### Security Configurations

#### NPM Security
- `.npmrc` configured with security settings
- Audit level set to moderate
- Package-lock enforced
- Scripts disabled for untrusted packages

#### GitHub Actions Security
- Dependabot configured for weekly updates
- CodeQL analysis enabled
- Security audit workflow
- Dependency review on PRs

#### Content Security Policy
- CSP configuration in `csp.config.js`
- Different policies for development/production
- XSS protection enabled
- Mixed content blocked

### Build and Release

#### Development Build
```bash
npm start                 # Start React development server
npm run electron-dev      # Start Electron in development mode
```

#### Production Build
```bash
npm run build            # Build React app
npm run dist             # Create Electron distribution
```

#### Security Checks Before Release
```bash
npm run security-check   # Run all security checks
npm audit --audit-level moderate
npm test                 # Run tests
```

### Monitoring and Maintenance

#### Weekly Tasks
- Review Dependabot PRs
- Check security alerts
- Update dependencies
- Review audit logs

#### Monthly Tasks
- Security audit review
- Update documentation
- Review access permissions
- Backup configurations

### Security Best Practices

#### Code Security
1. **Input Validation**
   - Validate all user inputs
   - Sanitize data before processing
   - Use parameterized queries

2. **Authentication & Authorization**
   - Implement proper access controls
   - Use secure session management
   - Regular permission reviews

3. **Data Protection**
   - Encrypt sensitive data
   - Secure data transmission
   - Regular backups

#### Infrastructure Security
1. **Network Security**
   - Use HTTPS everywhere
   - Implement proper firewall rules
   - Regular network monitoring

2. **System Security**
   - Keep systems updated
   - Use antivirus software
   - Regular security patches

### Compliance Checklist

- [ ] Commercial license applied
- [ ] Security policy documented
- [ ] Dependency scanning enabled
- [ ] Code scanning configured
- [ ] Branch protection rules set
- [ ] Security headers implemented
- [ ] Input validation in place
- [ ] Error handling secure
- [ ] Logging configured
- [ ] Backup strategy defined

### Troubleshooting

#### Common Security Issues

1. **NPM Audit Failures**
   ```bash
   npm audit fix
   npm audit --audit-level moderate
   ```

2. **Dependency Vulnerabilities**
   - Check Dependabot alerts
   - Update vulnerable packages
   - Consider alternative packages

3. **CSP Violations**
   - Check browser console
   - Update CSP configuration
   - Test in different environments

### Support and Contact

- **Security Issues**: maxiusofmaximus@github.com
- **GitHub Repository**: https://github.com/maxiusofmaximus/NMC-Total
- **Documentation**: See README.md and SECURITY.md

---

**Remember**: Security is an ongoing process, not a one-time setup. Regular reviews and updates are essential for maintaining a secure application.