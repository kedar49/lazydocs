# GitHub Configuration

This directory contains all GitHub-specific configuration files for LazyDocs.

## 📁 Directory Structure

```
.github/
├── workflows/              # GitHub Actions workflows
│   ├── ci.yml             # Continuous Integration
│   ├── publish.yml        # NPM Publishing
│   ├── docs.yml           # Auto-documentation
│   ├── release.yml        # Release automation
│   ├── codeql.yml         # Security scanning
│   └── dependency-review.yml
├── ISSUE_TEMPLATE/        # Issue templates
│   ├── bug_report.md
│   └── feature_request.md
├── PULL_REQUEST_TEMPLATE.md
├── dependabot.yml         # Dependency updates
├── FUNDING.yml            # Sponsorship info
└── WORKFLOWS.md           # Workflow documentation
```

## 🚀 Workflows

### Active Workflows

1. **CI** - Tests on multiple platforms and Node versions
2. **Publish** - Automated NPM publishing
3. **Docs** - Auto-generate documentation
4. **Release** - Create GitHub releases
5. **CodeQL** - Security analysis
6. **Dependency Review** - Check dependency security

See [WORKFLOWS.md](./WORKFLOWS.md) for detailed documentation.

## 🔧 Setup Required

### Secrets to Configure

Add these in: Settings → Secrets and variables → Actions

| Secret | Required | Purpose |
|--------|----------|---------|
| `NPM_TOKEN` | Yes (for publishing) | Publish to NPM |
| `GROQ_API_KEY` | Optional | Auto-generate docs |

### How to Get Secrets

**NPM Token:**
```bash
npm login
npm token create
```

**Groq API Key:**
Visit [console.groq.com](https://console.groq.com)

## 📝 Templates

### Issue Templates

- **Bug Report** - Report bugs with structured format
- **Feature Request** - Suggest new features

### Pull Request Template

Standardized PR format with checklist

## 🤖 Dependabot

Automated dependency updates:
- **NPM packages** - Weekly on Mondays
- **GitHub Actions** - Weekly on Mondays
- Groups related updates
- Auto-labels PRs

## 📊 Badges

Add to your README:

```markdown
![CI](https://github.com/kedar49/lazydocs/workflows/CI/badge.svg)
![Publish](https://github.com/kedar49/lazydocs/workflows/Publish%20to%20NPM/badge.svg)
![CodeQL](https://github.com/kedar49/lazydocs/workflows/CodeQL/badge.svg)
```

## 🔒 Security

- **CodeQL** scans for vulnerabilities weekly
- **Dependency Review** checks PRs for security issues
- **Dependabot** keeps dependencies updated

## 📚 Documentation

- [Workflows Documentation](./WORKFLOWS.md) - Detailed workflow guide
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [Changelog](../CHANGELOG.md) - Version history

## 🎯 Quick Start

1. **Fork the repository**
2. **Configure secrets** (if publishing)
3. **Enable workflows** in Actions tab
4. **Create a PR** - workflows run automatically

## 💡 Tips

- Test workflows on feature branches first
- Review Dependabot PRs regularly
- Keep CHANGELOG.md updated
- Use semantic versioning for releases

## 🆘 Support

- Check [WORKFLOWS.md](./WORKFLOWS.md) for troubleshooting
- Review workflow logs in Actions tab
- Open an issue if you need help
