const config = {
  verbose: false,
  testEnvironment: "jsdom",
  injectGlobals: true,
  setupFilesAfterEnv: ["./setup-jest.cjs"],
  transform: {
    "^.+\\.js$": [
      "@swc/jest",
      {
        jsc: {
          target: "es2022",
          parser: {
            syntax: "ecmascript",
            jsx: false,
            dynamicImport: true,
            topLevelAwait: true,
          },
        },
        module: {
          type: "es6",
        },
      },
    ],
  },

  modulePaths: ["<rootDir>"],
  modulePathIgnorePatterns: ["<rootDir>/.stryker-tmp"],
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "<rootDir>/src/__mocks__/styleMock.js",
    "^@testing-library/jest-dom/extend-expect$": "@testing-library/jest-dom",
    "^~/(.*)$": "<rootDir>/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@app/(.*)$": "<rootDir>/src/app/$1",
    "^@containers/(.*)$": "<rootDir>/src/containers/$1",
    "^@views/(.*)$": "<rootDir>/src/views/$1",
    "^@constants/(.*)$": "<rootDir>/src/constants/$1",
    "^@css/(.*)$": "<rootDir>/src/css/$1",
    "^@assets/(.*)$": "<rootDir>/src/assets/$1",
    "^@fixtures/(.*)$": "<rootDir>/src/fixtures/$1",
    "^@mocks/(.*)$": "<rootDir>/src/__mocks__/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!**/*.config.{js,cjs,mjs}",
    "!src/app/App.js",
    "!src/app/datepicker.js",
    "!src/__tests__/**",
    "!src/__mocks__/**",
    "!src/fixtures/**",
    "!src/assets/svg/**",
  ],
  coverageReporters: [
    "text",
    "lcov",
    "html",
  ],
  coverageDirectory: "coverage",
  reporters: [
    "default",
    ["./node_modules/jest-html-reporter", {
      pageTitle: "Test Report",
      outputPath: "./test-report.html",
      includeFailureMsg: true,
      includeStackTrace: true,
      sort: "status",
    }],
  ],
};

module.exports = config;
