# Security Model

## Threat Model

### What We Protect Against

1. **Workflow variable injection**: Input sanitization and proper escaping for `GITHUB_OUTPUT`
2. **Accidental misconfigurations**: Path/rule ID sanitization removes shell metacharacters

### What We Don't Protect Against (By Design)

**Build command injection is intentionally not validated** because:
- Config files (`repo-configs/*.js`) are in this repository
- Workflow files (`.github/workflows/*.yml`) are in this repository
- Both require **write access to this repo** to modify
- **If someone can modify these, they can already run arbitrary code** by editing workflows directly
- The real security boundary is **GitHub repository permissions**, not input validation

### Permission Model

**Workflow-level default:**
```yaml
permissions:
  contents: read  # Minimal default
```

**Job-level permissions** (CodeQL/Semgrep jobs only):
```yaml
permissions:
  actions: read           # Read workflow artifacts
  contents: read          # Checkout code
  security-events: write  # Upload SARIF results
```

**What's explicitly NOT granted:**
- ❌ `secrets: write` - Cannot modify secrets
- ❌ `id-token: write` - Cannot access OIDC tokens
- ❌ `contents: write` - Cannot modify code
- ❌ No `GITHUB_TOKEN` passed to untrusted contexts

### Input Validation

**What we validate:**
- ✅ Required fields (`REPO`, `LANGUAGE`) must be present
- ✅ `GITHUB_OUTPUT` values are escaped (`%`, `\r`, `\n`) to prevent workflow injection
- ✅ Paths are sanitized (removes `[;&|`$(){}[]<>]`) for hygiene
- ✅ Rule IDs are sanitized (alphanumeric + `-/_` only)

**What we DON'T validate:**
- ❌ Build commands - intentionally unrestricted (see threat model above)

### Security for Reusable Workflow

If external repositories use this as a reusable workflow:
- They pass inputs via `workflow_call`
- Scans run in **their runner**, not ours
- Malicious inputs would only affect **their environment**
- SARIF results upload to **their security tab**
- No access to our secrets or tokens

## Best Practices

1. **Review `repo-configs/*.js` changes** - these define build commands
2. **Use branch protection** - require PR reviews for workflow changes
3. **Pin action versions** - use commit SHAs for third-party actions (e.g., `actions/checkout@abc123`)
4. **Monitor security events** - check GitHub Security tab for uploaded SARIF results
