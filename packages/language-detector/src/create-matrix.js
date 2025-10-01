#!/usr/bin/env node

/**
 * CLI script to create scanner matrix
 * Usage: node create-matrix.js <detected_languages_json> [languages_config_json]
 */

import { createMatrix } from './language-detector.js';

function main() {
  const [detectedLanguagesJson, languagesConfigJson] = process.argv.slice(2);

  if (!detectedLanguagesJson) {
    console.error('Usage: node create-matrix.js <detected_languages_json> [languages_config_json]');
    console.error('Example: node create-matrix.js \'["javascript", "java"]\' \'[{"language":"java","build_mode":"manual"}]\'');
    process.exit(1);
  }

  try {
    const detectedLanguages = JSON.parse(detectedLanguagesJson);
    const languagesConfig = languagesConfigJson ? JSON.parse(languagesConfigJson) : [];

    const matrix = createMatrix(detectedLanguages, languagesConfig);

    // Output JSON to stdout for consumption by GitHub Actions
    console.log(JSON.stringify(matrix));
  } catch (error) {
    console.error('Error parsing JSON input:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}