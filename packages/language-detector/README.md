# Language Detector Action

Detects programming languages in a repository using the GitHub API and creates a scanner matrix configuration.

## Usage

```yaml
- name: Detect Languages
  id: detect
  uses: ./packages/language-detector
  with:
    repo: 'owner/repo-name'
    languages_config: |
      [
        {
          "language": "java-kotlin",
          "build_mode": "manual",
          "build_command": "./gradlew build",
          "environment": "jdk-21"
        }
      ]

- name: Use Results
  run: |
    echo "Languages: ${{ steps.detect.outputs.languages }}"
    echo "Matrix: ${{ steps.detect.outputs.matrix }}"
```

## Development

### Install Dependencies

```bash
cd packages/language-detector
yarn install
```

### Testing

```bash
# Run tests
yarn test

# Run tests in watch mode
yarn test:watch

# Test CLI scripts directly
yarn detect "owner/repo"
yarn matrix '["javascript", "java"]' '[{"language":"java","build_mode":"manual"}]'
```

### Test with Act (GitHub Actions locally)

```bash
# Test the full action
act workflow_dispatch -W .github/workflows/test-language-detector.yml \
  --input repo=witmicko/lll

# Test with custom config
act workflow_dispatch -W .github/workflows/test-language-detector.yml \
  --input repo=witmicko/lll \
  --input languages_config='[{"language":"java-kotlin","build_mode":"manual","build_command":"./gradlew build"}]'
```

### Test in GitHub Actions

Go to Actions → Test Language Detector → Run workflow

## Architecture

- `src/language-detector.js` - Core language detection and matrix logic
- `src/detect-languages.js` - CLI script for language detection
- `src/create-matrix.js` - CLI script for matrix creation
- `__tests__/` - Jest test suite
- `action.yml` - GitHub Action wrapper

The JavaScript implementation provides:
- ✅ Comprehensive test coverage with Jest
- ✅ Easy integration into CI/CD
- ✅ Better error handling and debugging
- ✅ Type safety with JSDoc
- ✅ Modular, testable code