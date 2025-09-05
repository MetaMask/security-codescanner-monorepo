# Security Code Scanner Monorepo

> Unified repository for security code scanning tools

## 🏗️ Architecture

This monorepo consolidates three previously separate security scanning tools:

- **`packages/main-action/`** - Main security scanner orchestrator (formerly `action-security-code-scanner`)
- **`packages/codeql-action/`** - Custom CodeQL analysis wrapper (formerly `CodeQL-action`)
- **`packages/semgrep-action/`** - Semgrep pattern-based scanner (formerly `semgrep-action`)

## 🚀 Quick Start

```bash
# Install all dependencies
yarn install

# Run linting across all packages
yarn lint

# Build all packages
yarn build

# Run tests across all packages
yarn test
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

- `yarn lint` - Run linting across all packages
- `yarn lint:fix` - Fix linting issues across all packages
- `yarn build` - Build all packages
- `yarn test` - Run tests across all packages
- `yarn clean` - Clean build artifacts

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

## 🔄 Migration Status

This is an active migration from separate repositories. See [MIGRATION_STATUS.md](./MIGRATION_STATUS.md) for current progress.

## 📄 License

ISC

## 🤝 Contributing

See individual package READMEs for specific contribution guidelines.

---

**🚧 Migration in Progress:** This monorepo is currently being set up. Some packages may not be fully functional until migration is complete.