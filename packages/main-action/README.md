# Main Security Code Scanner Action

## Overview

The Security Code Scanner GitHub Action is designed to enhance the security of your repositories by
performing thorough code scans. Currently, it utilizes the Appsec CodeQL scanner,
but the scope is planned to expand to include other security actions,
providing a more comprehensive security analysis.

## Inputs

- **`repo`**: (Required) The name of the repository you want to scan.
- **`slack_webhook`**: (Required) Slack webhook URL.

- **`project_metrics_token`**: (optional) Token belonging to a mixpanel project that is used to track build passes & failures.
- **`paths_ignored`**: (optional) Code paths which are to be ignored. Each should be listed on a new line.
- **`rules_excluded`**: (optional) Code scanning rules to exclude. Each should be listed on a new line.

## Setup

To use the Security Code Scanner, create a `security-code-scanner.yml` file in your repository's `.github/workflows/` folder:

```yaml
name: 'Security Code Scanner'

on:
  push:
    branches:
      - main
  pull_request:
  workflow_dispatch:

jobs:
  run-security-scan:
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write
    steps:
      - name: Security Code Scanner
        uses: witmicko/security-scanner-monorepo/packages/main-action@v1
        with:
          repo: ${{ github.repository }}
          paths_ignored: |
            .storybook/
            '**/__snapshots__/'
            '**/*.snap'
            '**/*.stories.js'
            '**/*.stories.tsx'
            '**/*.test.browser.ts*'
            '**/*.test.js*'
            '**/*.test.ts*'
            '**/fixtures/'
            '**/jest.config.js'
            '**/jest.environment.js'
            '**/mocks/'
            '**/test*/'
            docs/
            e2e/
            merged-packages/
            node_modules
            storybook/
            test*/
          rules_excluded: |
            rule1
          project_metrics_token: ${{ secrets.SECURITY_SCAN_METRICS_TOKEN }}
          slack_webhook: ${{ secrets.APPSEC_BOT_SLACK_WEBHOOK }}
```

## Secrets

The following secrets can be passed to the scanner for logging and monitoring:

- SECURITY_SCAN_METRICS_TOKEN
- APPSEC_BOT_SLACK_WEBHOOK

## Features

- **CodeQL Analysis**: Leverages the custom CodeQL action, a wrapper around GitHub's [CodeQL engine](https://codeql.github.com/), to identify vulnerabilities in the codebase.
- **Semgrep Analysis**: Uses Semgrep for pattern-based security analysis.

## Disclaimer

This action orchestrates multiple security scanning tools to provide comprehensive code analysis.
