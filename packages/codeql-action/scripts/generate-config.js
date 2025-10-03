import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ejs from 'ejs';
import { loadRepoConfig } from '../src/config-loader.js';

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputFile = process.env.GITHUB_OUTPUT;
const template = fs.readFileSync('config/codeql-template.yml', 'utf8');

const { REPO, LANGUAGE, BUILD_MODE, BUILD_COMMAND, VERSION, DISTRIBUTION, PATHS_IGNORED, RULES_EXCLUDED } = process.env;
const inputs = {
  repo: REPO,
  language: LANGUAGE,
  buildMode: BUILD_MODE,
  buildCommand: BUILD_COMMAND,
  version: VERSION,
  distribution: DISTRIBUTION,
  pathsIgnored: PATHS_IGNORED
    ? PATHS_IGNORED.split('\n').filter((line) => line.trim() !== '')
    : [],
  rulesExcluded: RULES_EXCLUDED
    ? RULES_EXCLUDED.split('\n').filter((line) => line.trim() !== '')
    : [],
};
console.log(`>>>>>inputs: `);
console.log(JSON.stringify(inputs, null, 2));

const debugConfig = (config) => {
  console.log('>>>>> config <<<<<');
  console.log(JSON.stringify(config, null, 2));
};

const applyLanguageConfigFallbacks = (inputs, config) => {
  // If no language is specified, return inputs as-is
  if (!inputs.language) {
    return inputs;
  }

  // Find matching language config from languages_config array
  const languageConfig = config.languages_config?.find(
    langConfig => langConfig.language === inputs.language
  );

  if (!languageConfig) {
    console.log(`No language-specific config found for "${inputs.language}"`);
    return inputs;
  }

  // Note: Ignore checking is now handled by language-detector during matrix creation
  // Languages marked as ignored won't appear in the matrix, so we don't need to check here

  // Apply fallbacks for missing inputs
  const inputsWithFallbacks = { ...inputs };

  if (!inputsWithFallbacks.buildMode && languageConfig.build_mode) {
    inputsWithFallbacks.buildMode = languageConfig.build_mode;
    console.log(`Applied fallback build_mode: ${languageConfig.build_mode}`);
  }

  if (!inputsWithFallbacks.buildCommand && languageConfig.build_command) {
    inputsWithFallbacks.buildCommand = languageConfig.build_command;
    console.log(`Applied fallback build_command: ${languageConfig.build_command}`);
  }

  if (!inputsWithFallbacks.version && languageConfig.version) {
    inputsWithFallbacks.version = languageConfig.version;
    console.log(`Applied fallback version: ${languageConfig.version}`);
  }

  if (!inputsWithFallbacks.distribution && languageConfig.distribution) {
    inputsWithFallbacks.distribution = languageConfig.distribution;
    console.log(`Applied fallback distribution: ${languageConfig.distribution}`);
  }

  return inputsWithFallbacks;
};

// Main execution - use top-level await (Node.js 14.8+)
const config = await loadRepoConfig(inputs.repo, path.join(__dirname, '..', 'repo-configs'));
debugConfig(config);

// Apply language-specific config fallbacks
const finalInputs = applyLanguageConfigFallbacks(inputs, config);
console.log(`>>>>>final inputs after fallbacks: `);
console.log(JSON.stringify(finalInputs, null, 2));

// set languages output
fs.appendFileSync(outputFile, `languages=${config.languages}\n`);

// set resolved values (inputs + fallbacks) as outputs for use in subsequent action steps
fs.appendFileSync(outputFile, `build_mode=${finalInputs.buildMode || ''}\n`);
fs.appendFileSync(outputFile, `build_command=${finalInputs.buildCommand || ''}\n`);
fs.appendFileSync(outputFile, `version=${finalInputs.version || ''}\n`);
fs.appendFileSync(outputFile, `distribution=${finalInputs.distribution || ''}\n`);

const output = ejs.render(template, {
  pathsIgnored: [...config.pathsIgnored, ...finalInputs.pathsIgnored],
  rulesExcluded: [...config.rulesExcluded, ...finalInputs.rulesExcluded],
  queries: config.queries,
});
console.log(output);
fs.writeFileSync('codeql-config-generated.yml', output);
