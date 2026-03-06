module.exports = {
  default: {
    requireModule: ['ts-node/register'],
    require: ['e2e/support/**/*.ts', 'e2e/steps/**/*.ts'],
    paths: ['e2e/features/**/*.feature'],
    format: [
      'progress-bar',
      'html:e2e/results/report.html',
      'json:e2e/results/report.json'
    ],
    formatOptions: { snippetInterface: 'async-await' },
    parallel: 1,
    timeout: 30000
  }
}
