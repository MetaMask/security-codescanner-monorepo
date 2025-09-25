const config = {
  languages: ['javascript-typescript', 'typescript'],
  pathsIgnored: ['test'],
  rulesExcluded: ['js/log-injection'],
  queries: [
    {
      name: 'Security-extended queries for JavaScript',
      uses: '../packages/codeql-action/query-suites/base.qls',
    },
    {
      name: 'Security Code Scanner Custom Queries',
      uses: '../custom-queries/query-suites/custom-queries.qls',
    },
  ],
};
module.exports = config;
