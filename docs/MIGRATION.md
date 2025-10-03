# Migration Guide: From Separate Repos to Monorepo

This guide helps you migrate from the individual security scanner repositories to the unified monorepo structure.

## 📋 Migration Overview

### Before (Separate Repos)

```
MetaMask/action-security-code-scanner  →  Main orchestrator
MetaMask/CodeQL-action                 →  CodeQL scanning
MetaMask/semgrep-action               →  Semgrep scanning
```

### After (Monorepo)

```
metamask/security-codescanner-monorepo/
├── packages/main-action/      ←  Former action-security-code-scanner
├── packages/codeql-action/    ←  Former CodeQL-action
└── packages/semgrep-action/   ←  Former semgrep-action
```

## 🔄 Workflow Updates Required

### 1. Update Action References

**Before:**

```yaml
- name: Security Scan
  uses: MetaMask/action-security-code-scanner@v1
  with:
    repo: ${{ github.repository }}
```

**After:**

```yaml
- name: Security Code Scanner
  uses: metamask/security-codescanner-monorepo/packages/main-action@v1
  with:
    repo: ${{ github.repository }}
```

### 2. Individual Action Updates

**Before:**

```yaml
# CodeQL
- uses: MetaMask/CodeQL-action@main

# Semgrep
- uses: MetaMask/Semgrep-action@main
```

**After:**

```yaml
# CodeQL
- uses: metamask/security-codescanner-monorepo/packages/codeql-action@v1

# Semgrep
- uses: metamask/security-codescanner-monorepo/packages/semgrep-action@v1
```

### 3. Reusable Workflows (New Feature)

**New Option - Recommended:**

```yaml
jobs:
  security-scan:
    uses: metamask/security-codescanner-monorepo/.github/workflows/security-scan.yml@v1
    with:
      repo: ${{ github.repository }}
      languages: '["javascript", "python"]'
    permissions:
      actions: read
      contents: read
      security-events: write
```

## 🎯 Key Improvements in Monorepo

### 1. Multi-Language Efficiency

**Before:** Duplicate Semgrep runs for each language

```yaml
strategy:
  matrix:
    language: [javascript, python, java]
# Result: 3 CodeQL + 3 Semgrep = 6 scans
```

**After:** Optimized execution

```yaml
# Result: 3 CodeQL + 1 Semgrep = 4 scans
# 33% fewer scans, same coverage
```

### 2. Improved SARIF Organization

**Before:** Generic categories

- `CodeQL` results
- `Semgrep` results

**After:** Language-specific categories

- `codeql-javascript` results
- `codeql-python` results
- `semgrep` results

### 3. Unified Configuration

**Before:** Separate configurations per repo

**After:** Centralized shared configs

- Consistent linting/formatting
- Shared scripts and utilities
- Unified CI/CD pipeline

## 📝 Step-by-Step Migration

### Step 1: Identify Current Usage

Find all workflows using the old actions:

```bash
# Search your repositories for old action references
grep -r "MetaMask/action-security-code-scanner" .github/
grep -r "MetaMask/CodeQL-action" .github/
grep -r "MetaMask/Semgrep-action" .github/
```

### Step 2: Update Workflow Files

Replace old references with new monorepo paths:

```yaml
# Replace this:
uses: MetaMask/action-security-code-scanner@v1

# With this:
uses: metamask/security-codescanner-monorepo/packages/main-action@v1
```

### Step 3: Consider Reusable Workflows

**Benefits of switching to reusable workflows:**

- Better multi-language support
- Reduced duplicate scans
- Centralized configuration
- Easier maintenance

**Migration example:**

```yaml
# Old approach
jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: metamask/security-codescanner-monorepo/packages/main-action@v1

# New approach (recommended)
jobs:
  security-scan:
    uses: metamask/security-codescanner-monorepo/.github/workflows/security-scan.yml@v1
    with:
      repo: ${{ github.repository }}
      languages: '["javascript", "typescript"]'
```

### Step 4: Update Inputs/Parameters

**New `languages` parameter** (reusable workflows only):

```yaml
# Specify languages explicitly
languages: '["javascript", "typescript", "python"]'
```

**Unchanged parameters:**

- `repo` - Still required
- `paths_ignored` - Same format
- `rules_excluded` - Same format
- `slack_webhook` - Same functionality
- `project_metrics_token` - Same functionality

### Step 5: Test Your Migration

1. **Commit workflow changes** to a feature branch
2. **Run security scan** to verify functionality
3. **Check SARIF uploads** in GitHub Security tab
4. **Verify notifications** (if configured)
5. **Merge to main** once verified

## 🔧 Migration Helpers

### Automated Search & Replace

Use these commands to help migrate your workflows:

```bash
# Update main action references
find .github -name "*.yml" -exec sed -i 's|MetaMask/action-security-code-scanner@v1|metamask/security-codescanner-monorepo/packages/main-action@v1|g' {} +

# Update CodeQL action references
find .github -name "*.yml" -exec sed -i 's|MetaMask/CodeQL-action@main|metamask/security-codescanner-monorepo/packages/codeql-action@v1|g' {} +

# Update Semgrep action references
find .github -name "*.yml" -exec sed -i 's|MetaMask/Semgrep-action@main|metamask/security-codescanner-monorepo/packages/semgrep-action@v1|g' {} +
```

### Validation Script

Create a script to validate your migration:

```bash
#!/bin/bash
# validate-migration.sh

echo "🔍 Checking for old action references..."

OLD_REFS=$(grep -r "MetaMask/.*action" .github/ | wc -l)
if [ $OLD_REFS -gt 0 ]; then
  echo "❌ Found $OLD_REFS old action references:"
  grep -r "MetaMask/.*action" .github/
  exit 1
else
  echo "✅ No old action references found"
fi

echo "🔍 Checking for new action references..."
NEW_REFS=$(grep -r "metamask/security-codescanner-monorepo" .github/ | wc -l)
if [ $NEW_REFS -gt 0 ]; then
  echo "✅ Found $NEW_REFS new action references"
else
  echo "⚠️  No new action references found - migration may be incomplete"
fi

echo "🔍 Checking workflow syntax..."
for file in .github/workflows/*.yml; do
  if ! yamllint "$file" > /dev/null 2>&1; then
    echo "❌ Syntax error in $file"
    exit 1
  fi
done
echo "✅ All workflow files have valid syntax"

echo "🎉 Migration validation complete!"
```

## 🚨 Breaking Changes

### Version References

**Before:** `@v1`, `@main`  
**After:** Use specific versions like `@v1.0.0` or `@v1`

### Action Names

Action names in logs will change:

- `Security Code Scanner - CodeQL` (instead of `MetaMask AppSec CodeQL`)
- `Security Code Scanner - Semgrep` (instead of `Code Scanning (Semgrep)`)

### Repository Structure

If you were directly referencing files in the old repos, update paths:

```yaml
# Before
config-file: .github/codeql-config.yml
# After
# Config is now handled internally by the action
```

## 🕒 Migration Timeline

### Immediate (Required)

- Update action references to prevent workflow failures
- Test updated workflows in development branches

### Short-term (Recommended)

- Migrate to reusable workflows for better efficiency
- Update documentation and team guidelines

### Long-term (Optional)

- Customize configurations for specific repositories
- Integrate with additional tools and notifications

## 🆘 Troubleshooting Migration

### Common Issues

1. **Workflow not found errors**
   - Ensure correct repository and path references
   - Check version tags exist

2. **Permission errors**
   - Verify `security-events: write` permission
   - Check repository has GitHub Advanced Security enabled

3. **Missing language support**
   - Add languages explicitly in reusable workflow calls
   - Verify language files exist in repository

4. **SARIF upload failures**
   - Check action outputs are properly configured
   - Verify SARIF file paths are correct

### Getting Help

1. **Check examples:** See [example-usage.yml](../.github/workflows/example-usage.yml)
2. **Review documentation:** [USAGE.md](./USAGE.md)
3. **Test incrementally:** Migrate one workflow at a time
4. **Monitor results:** Check GitHub Security tab after migration

## ✅ Migration Checklist

- [ ] Identified all workflows using old actions
- [ ] Updated action references to monorepo paths
- [ ] Tested workflows in feature branch
- [ ] Verified SARIF uploads work correctly
- [ ] Updated team documentation
- [ ] Considered migrating to reusable workflows
- [ ] Validated with migration script
- [ ] Merged changes to main branch

## 🎉 Post-Migration Benefits

After migration, you'll enjoy:

- **Better Performance:** Fewer duplicate scans
- **Improved Organization:** Language-specific SARIF categories
- **Easier Maintenance:** Centralized configuration
- **Enhanced Features:** Multi-language support
- **Future-Proof:** Unified development and releases
