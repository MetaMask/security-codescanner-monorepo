const config = {
  languages: ['javascript-typescript', 'typescript', 'go'],
  pathsIgnored: ['test'],
  rulesExcluded: ['js/log-injection'],
  buildCommands: {
    'java-kotlin': './gradlew :coordinator:app:build',
  },
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