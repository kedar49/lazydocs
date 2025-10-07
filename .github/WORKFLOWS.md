# GitHub Workflows Documentation

This document describes all GitHub Actions workflows configured for LazyDocs.

## Workflows Overview

### 1. CI (Continuous Integration)
**File:** `.github/workflows/ci.yml`  
**Triggers:** Push to main/develop, Pull Requests

**Purpose:** Run tests and build on multiple platforms and Node.js versions.

**Matrix:**
- OS: Ubuntu, Windows, macOS
- Node.js: 18.x, 20.x, 21.x

**Steps:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run tests
5. Build project
6. Upload coverage (Ubuntu + Node 20 only)

### 2. Publish to NPM
**File:** `.github/workflows/publish.yml`  
**Triggers:** Release created, Manual workflow dispatch

**Purpose:** Publish package to NPM registry.

**Required Secrets:**
- `NPM_TOKEN`: Your NPM authentication token

**Steps:**
1. Run full test suite
2. Build project
3. Update version (if manual)
4. Publish to NPM
5. Create GitHub release (if manual)

**Manual Trigger:**
```bash
# Via GitHub UI: Actions → Publish to NPM → Run workflow
# Enter version: 1.0.1
```

### 3. Update Documentation
**File:** `.github/workflows/docs.yml`  
**Triggers:** Push to main (src changes), Manual dispatch

**Purpose:** Auto-generate documentation using LazyDocs itself.

**Required Secrets:**
- `GROQ_API_KEY`: Your Groq API key for AI generation

**Steps:**
1. Build LazyDocs
2. Run LazyDocs on itself to generate README
3. Create PR if changes detected

### 4. Release
**File:** `.github/workflows/release.yml`  
**Triggers:** Git tags matching `v*.*.*`

**Purpose:** Create GitHub releases with changelog and assets.

**Steps:**
1. Run tests and build
2. Extract version from tag
3. Generate changelog for version
4. Create GitHub release
5. Package distribution files
6. Upload release assets

**Usage:**
```bash
git tag v1.0.1
git push origin v1.0.1
```

### 5. CodeQL Security Analysis
**File:** `.github/workflows/codeql.yml`  
**Triggers:** Push, Pull Requests, Weekly schedule

**Purpose:** Automated security vulnerability scanning.

**Schedule:** Every Monday at midnight UTC

### 6. Dependency Review
**File:** `.github/workflows/dependency-review.yml`  
**Triggers:** Pull Requests to main

**Purpose:** Review dependency changes for security issues.

**Features:**
- Fails on moderate+ severity vulnerabilities
- Posts summary in PR comments

## Setup Instructions

### 1. Configure NPM Token

1. Generate NPM token:
   ```bash
   npm login
   npm token create
   ```

2. Add to GitHub Secrets:
   - Go to: Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your NPM token

### 2. Configure Groq API Key (Optional)

For auto-documentation workflow:

1. Get API key from [console.groq.com](https://console.groq.com)
2. Add to GitHub Secrets:
   - Name: `GROQ_API_KEY`
   - Value: Your Groq API key

### 3. Enable Workflows

1. Go to: Actions tab in your repository
2. Enable workflows if prompted
3. Workflows will run automatically on triggers

## Release Process

### Standard Release

1. **Update version and changelog:**
   ```bash
   npm version patch  # or minor, major
   # Update CHANGELOG.md
   git add .
   git commit -m "chore: release v1.0.1"
   ```

2. **Create and push tag:**
   ```bash
   git tag v1.0.1
   git push origin main --tags
   ```

3. **Workflows automatically:**
   - Create GitHub release
   - Publish to NPM (if configured)
   - Generate release notes

### Manual NPM Publish

1. Go to: Actions → Publish to NPM
2. Click "Run workflow"
3. Enter version number
4. Click "Run workflow"

## Monitoring

### Check Workflow Status

- **All workflows:** Actions tab
- **Latest runs:** Badge in README
- **Failed runs:** Email notifications (if enabled)

### Workflow Badges

Add to README.md:

```markdown
![CI](https://github.com/kedar49/lazydocs/workflows/CI/badge.svg)
![Publish](https://github.com/kedar49/lazydocs/workflows/Publish%20to%20NPM/badge.svg)
![CodeQL](https://github.com/kedar49/lazydocs/workflows/CodeQL/badge.svg)
```

## Troubleshooting

### Workflow Fails on Test

1. Check test output in workflow logs
2. Run tests locally: `npm test`
3. Fix issues and push

### NPM Publish Fails

1. Verify `NPM_TOKEN` is set correctly
2. Check NPM token hasn't expired
3. Verify package name is available
4. Check package.json version

### Documentation Workflow Fails

1. Verify `GROQ_API_KEY` is set
2. Check API key is valid
3. Review Groq API rate limits

## Best Practices

1. **Always run tests locally** before pushing
2. **Update CHANGELOG.md** for each release
3. **Use semantic versioning** (major.minor.patch)
4. **Review dependency updates** from Dependabot
5. **Monitor security alerts** from CodeQL

## Customization

### Add New Workflow

1. Create file in `.github/workflows/`
2. Define triggers and jobs
3. Test with manual trigger first
4. Document in this file

### Modify Existing Workflow

1. Edit workflow YAML file
2. Test changes on feature branch
3. Review workflow run results
4. Merge when confirmed working

## Support

For workflow issues:
1. Check [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Review workflow logs
3. Open issue in repository
