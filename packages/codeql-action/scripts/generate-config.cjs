const fs = require('fs');
const path = require('path');
const ejs = require('ejs');
const { log, debug } = require('console');

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

const loadConfig = (repo) => {
  console.log(`>>>>>repo ${repo}`);
  const repoName = repo.split('/')[1];
  const repoConfigPath = path.join('./repo-configs/' + repoName + '.js');
  if (!fs.existsSync(repoConfigPath)) {
    console.warn(`No config found for "${repo}", using default config`);
    return require('../repo-configs/default.cjs');
  }
  const config = require(path.join('..', repoConfigPath));
  return config;
};

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

const config = loadConfig(inputs.repo);
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
