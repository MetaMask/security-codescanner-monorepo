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
**Status:** ✅ Complete (Fully Resolved with ESM Migration)
**Severity:** Critical

**Problem:**
- Root package.json has `"type": "module"` (ESM)
- generate-config.cjs uses CommonJS (require/module.exports)
- Mixing `.js` and `.cjs` files inconsistently (default.js vs default.cjs)

**Impact:** May cause import failures in some environments

**Solution Implemented (Final):**
- **Migrated entire codebase to ESM** (2025-10-03)
- Converted all `.cjs` files to `.js` with ESM syntax
- Using `import/export` throughout
- Using top-level `await` in scripts
- Using dynamic `import()` for config loading
- No more CommonJS/ESM mixing or `createRequire` bridges

**Completed:** 2025-10-03 (Initial), Fully resolved 2025-10-03 (ESM migration)
**Related to:** Issue #8 (Config File Format Standardization)
**Files Converted to ESM:**
- `packages/codeql-action/scripts/generate-config.cjs` → `.js`
- `packages/codeql-action/src/config-loader.cjs` → `.js`
- `packages/codeql-action/repo-configs/default.cjs` → `.js`
- `packages/codeql-action/repo-configs/lll.cjs` → `.js`
- `packages/language-detector/src/job-configurator.js` (removed createRequire)

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
**Status:** ✅ Complete
**Severity:** High

**Problem:**
- `current-codeql-setup/` directory suggests old setup still present
- `lll.js` exists in both locations
- Confusion about source of truth

**Impact:** Maintenance confusion, potential for using wrong config

**Solution Implemented:**
- Removed `current-codeql-setup/` directory
- Single source of truth: `packages/codeql-action/repo-configs/`

**Completed:** 2025-10-03

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
**Status:** ✅ Resolved - Won't Fix
**Severity:** Medium

**Problem:**
```yaml
ref: main  # ❌ Unstable - any push to main changes behavior
```

**Impact:** Non-reproducible builds, unexpected query changes

**Resolution:**
- This is the team's own repository (metamask/CodeQL-Queries)
- Release process will be implemented for the queries repo
- Using `main` is intentional for latest queries
- Not a concern for internal tooling

**Resolved:** 2025-10-03

---

### 7. Error Handling Gaps
**File:** `packages/codeql-action/scripts/generate-config.cjs:27-36`
**Status:** ✅ Complete (via architecture refactoring)
**Severity:** Medium

**Problem:**
- No try-catch around file operations
- Language ignore check exits with error code (exit 1) rather than graceful skip
- No fallback when template rendering fails

**Impact:** Unclear error messages, failed workflows

**Solution Implemented:**
- Created shared `config-loader.cjs` module with proper error handling
- Moved ignore checking to language-detector (matrix creation)
- Removed exit(1) behavior from CodeQL action
- Config loader has try-catch with fallback to default config
- Ignored languages never appear in matrix (cleaner approach)

**Completed:** 2025-10-03
**Related to:** Architecture refactoring - Single Source of Truth for Config
**Files Changed:**
- NEW: `packages/codeql-action/src/config-loader.js` (shared by both packages, ESM)
- `packages/codeql-action/scripts/generate-config.cjs`
- `packages/codeql-action/action.yaml` (removed ignore check step)
- `packages/language-detector/src/job-configurator.js` (imports shared config-loader)
- `packages/language-detector/action.yml`
- `.github/workflows/security-scan.yml`

---

### 8. Config File Format Standardization
**Files:** `packages/codeql-action/repo-configs/`
**Status:** ✅ Complete
**Severity:** Medium

**Problem:**
- Mixing `.js` and `.cjs` extensions
- Inconsistent require() calls
- default.cjs vs lll.js

**Impact:** Confusion, potential import issues

**Solution Implemented:**
- Standardized on `.cjs` extension for all CommonJS config files
- Renamed `lll.js` → `lll.cjs`
- Updated `generate-config.cjs` to load `.cjs` files (line 30)
- All repo configs now consistently use `.cjs` extension

**Completed:** 2025-10-03
**Files Changed:**
- `packages/codeql-action/repo-configs/lll.js` → `lll.cjs`
- `packages/codeql-action/scripts/generate-config.cjs`

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

## 🎉 Recent Improvements

### ESM Standardization: Complete Migration to ES Modules (2025-10-03)

**Problem Solved:**
- Had mixed module systems: ESM (root `"type": "module"`) but CJS files (`.cjs`)
- Used `createRequire` bridge to load CJS from ESM
- Inconsistent file extensions and import/require patterns
- Confusion about which module system to use

**Solution Implemented:**
- **Converted entire codebase to ESM**
- All scripts now use `import/export` syntax
- Config files use `export default` instead of `module.exports`
- Using top-level `await` in scripts (Node.js 14.8+)
- Using dynamic `import()` for runtime config loading
- Removed all `createRequire` workarounds

**Benefits:**
- ✅ Single module system (ESM) throughout monorepo
- ✅ Consistent with modern JavaScript standards
- ✅ No CJS/ESM bridging needed
- ✅ Cleaner, simpler code
- ✅ Better tree-shaking potential
- ✅ Aligns with `"type": "module"` in package.json

**Files Converted:**
- `packages/codeql-action/scripts/generate-config.cjs` → `.js`
- `packages/codeql-action/src/config-loader.cjs` → `.js`
- `packages/codeql-action/repo-configs/default.cjs` → `.js`
- `packages/codeql-action/repo-configs/lll.cjs` → `.js`
- `packages/language-detector/src/job-configurator.js` (removed createRequire)
- `packages/codeql-action/action.yaml` (updated script reference)

---

### Architecture Refactoring: Single Source of Truth for Config (2025-10-03)

**Problem Solved:**
- Had dual config systems: workflow input AND file-based configs
- CodeQL action redundantly checked ignore flag after matrix already filtered it
- Wasted workflow runs for ignored languages (created matrix entry, then exited)

**Solution Implemented:**
- Language detector now reads repo config files from `repo-configs/*.cjs`
- Filters ignored languages during matrix creation (fail fast)
- Workflow input `languages_config` becomes optional override
- Removed redundant ignore checking from CodeQL action
- Created shared config-loader modules (CJS and ESM versions)

**Benefits:**
- ✅ Single source of truth (repo config files)
- ✅ Fail fast - no wasted workflow runs
- ✅ Cleaner architecture - language detector is authoritative
- ✅ Better error handling with try-catch and fallbacks
- ✅ Workflow input overrides file config (flexible)

**Files Modified:**
- NEW: `packages/codeql-action/src/config-loader.js` (shared by both packages, ESM)
- `packages/codeql-action/scripts/generate-config.cjs`
- `packages/codeql-action/action.yaml`
- `packages/language-detector/src/job-configurator.js` (imports shared config-loader)
- `packages/language-detector/action.yml`
- `.github/workflows/security-scan.yml`

---

## ✅ Strengths (Keep Doing)

### Architecture & Organization
- ✅ Well-structured monorepo with Yarn 4 workspaces
- ✅ Clean separation between packages
- ✅ Reusable workflow pattern for consumer repositories
- ✅ Template-based config generation using EJS
- ✅ **NEW:** Single source of truth for configuration

### Configuration System
- ✅ Flexible repo-specific configs with fallback to default
- ✅ Per-language configuration support
- ✅ Ignore capability for excluding languages
- ✅ Dynamic input merging - CLI inputs override repo defaults
- ✅ **NEW:** Pure ESM module system (no CJS mixing)

### CodeQL Implementation
- ✅ Multi-language support with language-specific setup
- ✅ Custom query suites integration
- ✅ Debug outputs at every critical step
- ✅ Path/rule exclusion support

---

## 📋 Progress Tracking

### Sprint 1 (High Priority)
- [x] Issue #1: Fix Module System Inconsistency ✅
- [x] Issue #2: Remove Hardcoded Repository Path ✅
- [ ] Issue #3: Add Tests for CodeQL Action
- [x] Issue #4: Clean Up Legacy Code ✅
- [ ] Issue #5: Add Input Validation & Sanitization

### Sprint 2 (Medium Priority)
- [x] Issue #6: Pin Custom Query Repository ✅ (Won't Fix - Intentional)
- [x] Issue #7: Improve Error Handling ✅ (via architecture refactoring)
- [x] Issue #8: Standardize Config File Format ✅
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
- **Critical Issues:** 2 (3 completed)
- **Medium Issues:** 2 (3 completed, 1 resolved)
- **Low Issues:** 3
- **Architecture Quality:** Significantly improved with config refactoring ⬆️

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
