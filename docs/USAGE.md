# Security Code Scanner Usage Guide

## 🚀 Quick Start

### Using the Main Security Scanner Action

```yaml
name: 'Security Scan'

on:
  push:
    branches: [main]
  pull_request:

jobs:
  security-scan:
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    steps:
      - name: Security Code Scanner
        uses: metamask/security-codescanner-monorepo/packages/main-action@v1
        with:
          repo: ${{ github.repository }}
          slack_webhook: ${{ secrets.APPSEC_BOT_SLACK_WEBHOOK }}
```

### Using Reusable Workflows (Recommended)

```yaml
name: 'Security Scan'

on:
  push:
    branches: [main]
  pull_request:

jobs:
  security-scan:
    uses: metamask/security-codescanner-monorepo/.github/workflows/security-scan.yml@v1
    with:
      repo: ${{ github.repository }}
      languages: '["javascript", "typescript", "python"]'
      paths_ignored: |
        node_modules/
        test/
        dist/
      project_metrics_token: ${{ secrets.SECURITY_SCAN_METRICS_TOKEN }}
      slack_webhook: ${{ secrets.APPSEC_BOT_SLACK_WEBHOOK }}
    permissions:
      actions: read
      contents: read
      security-events: write
```

## 📦 Available Packages

### 1. Main Action (`packages/main-action/`)

**Purpose:** Orchestrates security scanning by calling CodeQL and Semgrep actions.

**Inputs:**

- `repo` (required): Repository to scan
- `paths_ignored` (optional): Paths to ignore during scanning
- `rules_excluded` (optional): Rules to exclude from scanning
- `slack_webhook` (optional): Slack webhook for notifications
- `project_metrics_token` (optional): Analytics token

### 2. CodeQL Action (`packages/codeql-action/`)

**Purpose:** Custom CodeQL analysis with dynamic configuration.

**Inputs:**

- `repo` (required): Repository to scan
- `language` (required): Programming language
- `paths_ignored` (optional): Paths to ignore
- `rules_excluded` (optional): Rules to exclude

### 3. Semgrep Action (`packages/semgrep-action/`)

**Purpose:** Pattern-based security analysis using Semgrep.

**Inputs:**

- `paths_ignored` (optional): Paths to ignore during scanning

## 🔧 Reusable Workflows

### Security Scan Workflow

**Location:** `.github/workflows/security-scan.yml`

**Features:**

- Multi-language support with matrix strategy
- Parallel execution of CodeQL per language
- Single Semgrep scan (language-agnostic)
- Automated SARIF upload with proper categorization
- Slack notifications on failure
- Metrics logging support

**Usage:**

```yaml
jobs:
  security-scan:
    uses: metamask/security-codescanner-monorepo/.github/workflows/security-scan.yml@v1
    with:
      repo: ${{ github.repository }}
      languages: '["javascript", "python", "java"]'
      paths_ignored: 'test/,docs/'
      rules_excluded: 'rule1,rule2'
      slack_webhook: ${{ secrets.SLACK_WEBHOOK }}
```

### CodeQL Workflow

**Location:** `.github/workflows/reusable-codeql.yml`

**Usage:**

```yaml
jobs:
  codeql:
    uses: metamask/security-codescanner-monorepo/.github/workflows/reusable-codeql.yml@v1
    with:
      languages: '["javascript", "typescript"]'
      repo: ${{ github.repository }}
```

### Semgrep Workflow

**Location:** `.github/workflows/reusable-semgrep.yml`

**Usage:**

```yaml
jobs:
  semgrep:
    uses: metamask/security-codescanner-monorepo/.github/workflows/reusable-semgrep.yml@v1
    with:
      repo: ${{ github.repository }}
      paths_ignored: 'test/,docs/'
```

## 🔍 Language Support

### Supported Languages

**CodeQL:**

- JavaScript/TypeScript
- Python
- Java
- C/C++
- C#
- Go
- Ruby

**Semgrep:**

- Language-agnostic pattern matching
- Extensive rule sets for multiple languages

### Language Configuration

```yaml
# Single language
languages: '["javascript"]'

# Multiple languages
languages: '["javascript", "typescript", "python", "java"]'

# All supported languages
languages: '["javascript", "typescript", "python", "java", "csharp", "cpp", "go", "ruby"]'
```

## 🚫 Path Exclusions

### Common Exclusions

```yaml
paths_ignored: |
  node_modules/
  .git/
  dist/
  build/
  coverage/
  test/
  tests/
  spec/
  __tests__/
  '**/*.test.js'
  '**/*.spec.ts'
  '**/__snapshots__/'
  docs/
  .storybook/
```

### Format Options

```yaml
# Single line
paths_ignored: 'node_modules/,test/,dist/'

# Multi-line YAML
paths_ignored: |
  node_modules/
  test/
  dist/

# JSON array format
paths_ignored: '["node_modules/", "test/", "dist/"]'
```

## 🔧 Rule Exclusions

### Excluding Specific Rules

```yaml
rules_excluded: |
  js/log-injection
  py/sql-injection
  java/unsafe-deserialization
```

### Finding Rule IDs

Rule IDs can be found in:

- SARIF output files
- GitHub Security tab
- CodeQL documentation
- Semgrep rule documentation

## 🔔 Notifications

### Slack Integration

```yaml
# Enable Slack notifications
slack_webhook: ${{ secrets.APPSEC_BOT_SLACK_WEBHOOK }}
```

**Notification triggers:**

- Scan failures
- Security issues found
- Critical vulnerabilities detected

### Metrics & Analytics

```yaml
# Enable metrics logging
project_metrics_token: ${{ secrets.SECURITY_SCAN_METRICS_TOKEN }}
```

## 🛠️ Advanced Configuration

### Custom CodeQL Queries

Place custom queries in your repository and reference them in the CodeQL configuration.

### Custom Semgrep Rules

Add custom rules to `packages/semgrep-action/rules/src/` directory.

### Repository-Specific Configuration

Create repository-specific configurations in `packages/codeql-action/repo-configs/`.

## 🐛 Troubleshooting

### Common Issues

1. **Missing Permissions**

   ```yaml
   permissions:
     actions: read
     contents: read
     security-events: write
   ```

2. **Language Not Detected**
   - Ensure language is properly specified in `languages` input
   - Check that the repository contains files in the specified language

3. **Path Exclusions Not Working**
   - Use forward slashes `/` in paths
   - Ensure proper YAML formatting
   - Test exclusion patterns

4. **SARIF Upload Failures**
   - Check repository has GitHub Advanced Security enabled
   - Verify proper permissions are set
   - Ensure SARIF files are properly formatted

### Debug Mode

Enable debug logging by setting `ACTIONS_STEP_DEBUG=true` in repository secrets.

## 📚 Examples

See [example-usage.yml](.github/workflows/example-usage.yml) for complete working examples.

## 🤝 Contributing

See individual package README files for contribution guidelines:

- [Main Action README](../packages/main-action/README.md)
- [CodeQL Action README](../packages/codeql-action/README.md)
- [Semgrep Action README](../packages/semgrep-action/README.md)
