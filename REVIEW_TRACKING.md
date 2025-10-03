# Security Code Scanner Monorepo - Review Tracking

**Review Date:** 2025-10-03
**Status:** In Progress
**Overall Assessment:** 6.5/10 - Solid foundation, needs hardening

---

## 📊 Quick Summary

| Category | Score | Status |
|----------|-------|--------|
| Architecture | 8/10 | ✅ Good |
| Code Quality | 6/10 | ⚠️ Needs Work |
| Documentation | 5/10 | ⚠️ Needs Work |
| Maintainability | 6/10 | ⚠️ Needs Work |
| Production Readiness | 6.5/10 | ⚠️ Needs Work |

---

## 🔴 High Priority Issues

### 1. Module System Inconsistency
**File:** `packages/codeql-action/scripts/generate-config.cjs:1`
**Status:** 🔴 Open
**Severity:** Critical

**Problem:**
- Root package.json has `"type": "module"` (ESM)
- generate-config.cjs uses CommonJS (require/module.exports)
- Mixing `.js` and `.cjs` files inconsistently (default.js vs default.cjs)

**Impact:** May cause import failures in some environments

**Solution:**
```bash
# Option 1: Make everything ESM
mv generate-config.cjs generate-config.js
# Convert to import/export syntax

# Option 2: Keep CJS but remove "type": "module"
# Update repo-configs to use .cjs extension consistently
```

**Assignee:** _________
**Due Date:** _________

---

### 2. Hardcoded Repository Path
**File:** `packages/codeql-action/action.yaml:69`
**Status:** ✅ Complete
**Severity:** Critical

**Problem:**
```yaml
cd ${{ github.workspace }}/security-scanner-monorepo  # ❌ Hardcoded!
```

**Impact:** Will break if repository is renamed or used in different contexts

**Solution Implemented:**
- Added `MONOREPO_PATH` environment variable in workflow (defaults to `.security-scanner`)
- Updated all checkout paths to use `${{ env.MONOREPO_PATH }}`
- Updated action.yaml to use `${MONOREPO_PATH:-.security-scanner}` with bash parameter expansion
- Changed from `security-scanner-monorepo` to cleaner `.security-scanner` path

**Completed:** 2025-10-03
**Files Changed:**
- `.github/workflows/security-scan.yml`
- `packages/codeql-action/action.yaml`

---

### 3. Missing Tests for Core Package
**File:** `packages/codeql-action/`
**Status:** 🔴 Open
**Severity:** High

**Problem:**
- No tests for codeql-action (the core package!)
- Only language-detector has tests
- Placeholder test command: `"test": "echo \"Error: no test specified\" && exit 1"`

**Impact:** No regression protection, hard to validate changes

**Solution:**
- Add Jest configuration
- Create unit tests for generate-config.cjs
- Test config merging, language fallbacks, ignore logic
- Test template rendering

**Assignee:** _________
**Due Date:** _________

---

### 4. Legacy Code Cleanup
**Files:** `current-codeql-setup/`, duplicate `lll.js` configs
**Status:** 🔴 Open
**Severity:** High

**Problem:**
- `current-codeql-setup/` directory suggests old setup still present
- `lll.js` exists in both locations
- Confusion about source of truth

**Impact:** Maintenance confusion, potential for using wrong config

**Solution:**
- Remove `current-codeql-setup/` if truly legacy
- Or add README explaining its purpose
- Consolidate to single source of truth

**Assignee:** _________
**Due Date:** _________

---

### 5. Input Validation & Sanitization
**File:** `packages/codeql-action/scripts/generate-config.cjs`
**Status:** 🔴 Open
**Severity:** High (Security)

**Problem:**
- No input sanitization for paths_ignored/rules_excluded
- GITHUB_OUTPUT written with simple concatenation (injection risk)
- No validation of build commands before execution
- No required field validation

**Impact:** Potential command injection, runtime failures

**Solution:**
```javascript
// Add validation
if (!inputs.repo || !inputs.language) {
  throw new Error('Missing required inputs: repo and language');
}

// Sanitize paths
const sanitizePath = (path) => path.replace(/[;&|`$]/g, '');

// Validate build command
if (buildCommand && buildCommand.includes('rm -rf')) {
  throw new Error('Dangerous build command detected');
}

// Safe GITHUB_OUTPUT writing
import { appendFileSync } from 'fs';
const output = `build_mode=${escapeOutput(finalInputs.buildMode || '')}\n`;
appendFileSync(outputFile, output);
```

**Assignee:** _________
**Due Date:** _________

---

## 🟡 Medium Priority Issues

### 6. Unpinned Custom Query Repository
**File:** `packages/codeql-action/action.yaml:109`
**Status:** 🟡 Open
**Severity:** Medium

**Problem:**
```yaml
ref: main  # ❌ Unstable - any push to main changes behavior
```

**Impact:** Non-reproducible builds, unexpected query changes

**Solution:**
```yaml
ref: abc123def456...  # ✅ Pin to specific SHA
# Or use tagged release: v1.2.3
```

**Assignee:** _________
**Due Date:** _________

---

### 7. Error Handling Gaps
**File:** `packages/codeql-action/scripts/generate-config.cjs:27-36`
**Status:** 🟡 Open
**Severity:** Medium

**Problem:**
- No try-catch around file operations
- Language ignore check exits with error code (exit 1) rather than graceful skip
- No fallback when template rendering fails

**Impact:** Unclear error messages, failed workflows

**Solution:**
```javascript
const loadConfig = (repo) => {
  try {
    const repoName = repo.split('/')[1];
    const repoConfigPath = path.join('./repo-configs/' + repoName + '.js');

    if (!fs.existsSync(repoConfigPath)) {
      console.warn(`No config found for "${repo}", using default config`);
      return require('../repo-configs/default.cjs');
    }

    const config = require(path.join('..', repoConfigPath));
    return config;
  } catch (error) {
    console.error(`Failed to load config: ${error.message}`);
    console.log('Falling back to default configuration');
    return require('../repo-configs/default.cjs');
  }
};
```

**Assignee:** _________
**Due Date:** _________

---

### 8. Config File Format Standardization
**Files:** `packages/codeql-action/repo-configs/`
**Status:** 🟡 Open
**Severity:** Medium

**Problem:**
- Mixing `.js` and `.cjs` extensions
- Inconsistent require() calls
- default.cjs vs lll.js

**Impact:** Confusion, potential import issues

**Solution:**
- Choose one format: `.cjs` for CommonJS or `.mjs` for ESM
- Convert all configs to same format
- Update all require/import statements

**Assignee:** _________
**Due Date:** _________

---

### 9. Documentation Updates
**Files:** `README.md`, `packages/codeql-action/README.md`
**Status:** 🟡 Open
**Severity:** Medium

**Problem:**
- README references non-existent `packages/main-action/`
- CodeQL README has outdated examples
- Template comments like `<username>` still present
- No troubleshooting guide

**Impact:** Confusion for new users/contributors

**Solution:**
- Update all package references to match actual structure
- Add comprehensive troubleshooting section
- Document repo-config schema with examples
- Add migration guide for old setups
- Remove template placeholders

**Assignee:** _________
**Due Date:** _________

---

### 10. Workflow Context Issues
**File:** `.github/workflows/security-scan.yml:267, 286`
**Status:** 🟡 Open
**Severity:** Medium

**Problem:**
- Multiple warnings: "Context access might be invalid: SCAN_RESULT"
- Warnings: "Context access might be invalid: secrets.*"

**Impact:** Workflow may not function as expected

**Solution:**
- Review workflow context usage
- Ensure SCAN_RESULT is properly set before access
- Fix secrets context in workflow_call inputs

**Assignee:** _________
**Due Date:** _________

---

## 🟢 Low Priority Issues

### 11. Git Commit Quality
**Status:** 🟢 Open
**Severity:** Low

**Problem:**
```
1606590 rename script
5f4bed8 rename script  # Duplicate message
59aeb04 kk            # Non-descriptive
c6474e0 aa            # Non-descriptive
```

**Impact:** Difficult to understand project history

**Solution:**
- Adopt conventional commits format
- Use meaningful commit messages
- Consider squashing WIP commits before merging

**Assignee:** _________
**Due Date:** _________

---

### 12. CI/CD Linting Enforcement
**Status:** 🟢 Open
**Severity:** Low

**Problem:**
- Prettier configured but not enforced in CI/CD
- Lint scripts exist but no automation

**Impact:** Code style drift over time

**Solution:**
- Add GitHub Actions workflow to run `yarn lint`
- Fail PRs if linting fails
- Add pre-commit hooks (optional)

**Assignee:** _________
**Due Date:** _________

---

### 13. Workspace Dependency Optimization
**Status:** 🟢 Open
**Severity:** Low

**Problem:**
- Language-detector could be used by codeql-action
- Currently independent but may duplicate logic

**Impact:** Potential code duplication

**Solution:**
- Evaluate if language-detector can be imported by codeql-action
- Create shared utilities package if needed
- Document workspace dependencies

**Assignee:** _________
**Due Date:** _________

---

## ✅ Strengths (Keep Doing)

### Architecture & Organization
- ✅ Well-structured monorepo with Yarn 4 workspaces
- ✅ Clean separation between packages
- ✅ Reusable workflow pattern for consumer repositories
- ✅ Template-based config generation using EJS

### Configuration System
- ✅ Flexible repo-specific configs with fallback to default
- ✅ Per-language configuration support
- ✅ Ignore capability for excluding languages
- ✅ Dynamic input merging - CLI inputs override repo defaults

### CodeQL Implementation
- ✅ Multi-language support with language-specific setup
- ✅ Custom query suites integration
- ✅ Debug outputs at every critical step
- ✅ Path/rule exclusion support

---

## 📋 Progress Tracking

### Sprint 1 (High Priority)
- [ ] Issue #1: Fix Module System Inconsistency
- [x] Issue #2: Remove Hardcoded Repository Path ✅
- [ ] Issue #3: Add Tests for CodeQL Action
- [ ] Issue #4: Clean Up Legacy Code
- [ ] Issue #5: Add Input Validation & Sanitization

### Sprint 2 (Medium Priority)
- [ ] Issue #6: Pin Custom Query Repository
- [ ] Issue #7: Improve Error Handling
- [ ] Issue #8: Standardize Config File Format
- [ ] Issue #9: Update Documentation
- [ ] Issue #10: Fix Workflow Context Issues

### Sprint 3 (Low Priority)
- [ ] Issue #11: Improve Git Commit Quality
- [ ] Issue #12: Add CI/CD Linting Enforcement
- [ ] Issue #13: Optimize Workspace Dependencies

---

## 📈 Metrics

### Current State
- **Test Coverage:** ~33% (1 of 3 packages has tests)
- **Documentation Coverage:** ~60% (exists but outdated)
- **Critical Issues:** 4 (1 completed)
- **Medium Issues:** 5
- **Low Issues:** 3

### Target State
- **Test Coverage:** >80% (all packages)
- **Documentation Coverage:** 100% (accurate & complete)
- **Critical Issues:** 0
- **Medium Issues:** 0
- **Low Issues:** <3

---

## 📝 Notes

### Review Methodology
- Static code analysis
- Documentation review
- Git history analysis
- IDE diagnostics review
- Architecture assessment

### Next Steps
1. Prioritize and assign high priority issues
2. Create GitHub issues for tracking
3. Set up regular sync meetings
4. Define success criteria for each issue

---

**Last Updated:** 2025-10-03
**Next Review:** _________
