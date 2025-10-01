#!/usr/bin/env node

/**
 * CLI script to detect languages for a repository
 * Usage: node detect-languages.js <owner/repo> [github_token]
 */

import { fetchGitHubLanguages, detectLanguages } from './language-detector.js';

async function main() {
  const [repo, token] = process.argv.slice(2);

  if (!repo) {
    console.error('Usage: node detect-languages.js <owner/repo> [github_token]');
    process.exit(1);
  }

  console.error(`Fetching languages for repository: ${repo}`);

  const githubLanguages = await fetchGitHubLanguages(repo, token);
  const detectedLanguages = detectLanguages(githubLanguages);

  // Output JSON to stdout for consumption by GitHub Actions
  console.log(JSON.stringify(detectedLanguages));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}