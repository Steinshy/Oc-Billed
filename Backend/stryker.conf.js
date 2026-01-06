/**
 * Stryker Mutation Testing Configuration
 * Run mutation tests to verify test quality
 */

export default {
  packageManager: "npm",
  reporters: ["html", "clear-text", "progress", "json"],
  htmlReporter: {
    fileName: "reports/mutation.html",
  },
  testRunner: "jest",
  coverageAnalysis: "perTest",
  mutate: ["src/**/*.js", "!**/*.config.{js,cjs,mjs}", "!src/App.js", "!public/**", "!database/**"],
  thresholds: {
    high: 80,
    low: 70,
    break: 60,
  },
  timeoutMS: 60000,
  concurrency: 4,
  maxTestRunnerReuse: 25,
  ignoreStatic: true,
  logLevel: "info",
  plugins: ["@stryker-mutator/jest-runner"],
  cleanTempDir: true,
  incremental: false,
};
