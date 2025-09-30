const config = {
  languages: ['javascript-typescript', 'typescript', 'go'],
  pathsIgnored: ['test'],
  rulesExcluded: ['js/log-injection'],
  languages_config: [
    {
      "language": "java-kotlin",
      "build_mode": "manual",
      "build_command": "./gradlew :coordinator:app:build",
      "environment": "jdk-21"
    }
  ],
  queries: [
    {
      name: 'queries for linea',
      uses: './query-suites/linea-monorepo.qls',
    },
    {
      name: 'Security Code Scanner Custom Queries',
      uses: './custom-queries/query-suites/custom-queries.qls',
    },
  ],
};
module.exports = config;