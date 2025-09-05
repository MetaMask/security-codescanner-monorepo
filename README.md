# Security Code Scanner Monorepo

> Unified repository for security code scanning tools

## 🏗️ Architecture

This monorepo consolidates three previously separate security scanning tools:

- **`packages/main-action/`** - Main security scanner orchestrator (formerly `action-security-code-scanner`)
- **`packages/codeql-action/`** - Custom CodeQL analysis wrapper (formerly `CodeQL-action`)
- **`packages/semgrep-action/`** - Semgrep pattern-based scanner (formerly `semgrep-action`)

## 🚀 Quick Start

### For End Users (Using the Scanner)

**Recommended: Reusable Workflows**

```yaml
# .github/workflows/security.yml
name: 'Security Scan'
on: [push, pull_request]

jobs:
  security-scan:
    uses: witmicko/security-scanner-monorepo/.github/workflows/security-scan.yml@v1
    with:
      repo: ${{ github.repository }}
      languages: '["javascript", "typescript", "python"]'
    permissions:
      actions: read
      contents: read
      security-events: write
```

**Alternative: Direct Action Usage**

```yaml
- name: Security Code Scanner
  uses: witmicko/security-scanner-monorepo/packages/main-action@v1
  with:
    repo: ${{ github.repository }}
    slack_webhook: ${{ secrets.APPSEC_BOT_SLACK_WEBHOOK }}
```

### For Contributors (Developing the Scanner)

```bash
# Install all dependencies
yarn install

# Run linting across all packages
yarn lint

# Validate all GitHub Actions
yarn validate

# Check package configurations
yarn check

# Clean build artifacts
yarn clean
```

## 📦 Package Structure

```
security-scanner-monorepo/
├── packages/
│   ├── main-action/          # Main orchestrator
│   ├── codeql-action/        # CodeQL scanning
│   └── semgrep-action/       # Semgrep scanning
├── shared/                   # Common utilities
│   ├── configs/              # Shared configurations
│   ├── scripts/              # Common scripts
│   └── types/                # Shared TypeScript types
├── .github/workflows/        # Reusable workflows
└── docs/                     # Documentation
```

## 🔧 Available Scripts

### Quality & Validation

- `yarn lint` - Run linting and formatting checks across all packages
- `yarn lint:fix` - Auto-fix linting and formatting issues
- `yarn validate` - Validate all GitHub Action files for syntax and completeness
- `yarn check` - Validate package configurations and required fields

### Development

- `yarn build` - Build all packages
- `yarn test` - Run tests across all packages
- `yarn clean` - Clean build artifacts and temporary files
- `yarn install:all` - Install dependencies with immutable lockfile

### Workspace Management

- `yarn workspace <name> <command>` - Run command in specific package
- `yarn workspaces foreach run <command>` - Run command in all packages

## 📚 Usage

### For Repository Scanning

Use the main security scanner action in your workflow:

```yaml
- name: Security Code Scanner
  uses: witmicko/security-scanner-monorepo/packages/main-action@v1
  with:
    repo: ${{ github.repository }}
    slack_webhook: ${{ secrets.APPSEC_BOT_SLACK_WEBHOOK }}
```

### Individual Scanners

You can also use individual scanners directly:

```yaml
# CodeQL only
- uses: witmicko/security-scanner-monorepo/packages/codeql-action@v1

# Semgrep only
- uses: witmicko/security-scanner-monorepo/packages/semgrep-action@v1
```

## 🏗️ Development

This monorepo uses Yarn workspaces for dependency management and package coordination.

### Adding Dependencies

```bash
# Add to root (affects all packages)
yarn add -D <package>

# Add to specific package
yarn workspace @witmicko/main-action add <package>
```

### Running Package-Specific Commands

```bash
# Run command in specific package
yarn workspace @witmicko/main-action <command>

# Run command in all packages
yarn workspaces foreach run <command>
```

## 📚 Documentation

- **[Usage Guide](./docs/USAGE.md)** - Comprehensive usage instructions and examples
- **[Migration Guide](./docs/MIGRATION.md)** - How to migrate from separate repositories
- **[Migration Status](./MIGRATION_STATUS.md)** - Current migration progress and status

### Package Documentation

- [Main Action README](./packages/main-action/README.md) - Security scanner orchestrator
- [CodeQL Action README](./packages/codeql-action/README.md) - Custom CodeQL analysis
- [Semgrep Action README](./packages/semgrep-action/README.md) - Pattern-based security analysis

## 🎯 Key Features

### ✅ Multi-Language Support

- **CodeQL:** JavaScript, TypeScript, Python, Java, C#, C/C++, Go, Ruby
- **Semgrep:** Language-agnostic pattern matching

### ✅ Optimized Execution

- **Before:** 3 languages = 6 scans (3 CodeQL + 3 Semgrep)
- **After:** 3 languages = 4 scans (3 CodeQL + 1 Semgrep) - 33% reduction

### ✅ Advanced Workflows

- **Reusable workflows** for better maintainability
- **Language-specific SARIF** categorization (`codeql-javascript`, `codeql-python`, etc.)
- **Parallel execution** for faster results

### ✅ Enterprise Features

- Slack notifications on scan failures
- Metrics and analytics integration
- Customizable path and rule exclusions
- Repository-specific configurations

## 📄 License

ISC

## 🤝 Contributing

This monorepo uses Yarn workspaces and follows conventional patterns. See individual package READMEs for specific contribution guidelines.
