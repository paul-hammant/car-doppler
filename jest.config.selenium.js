module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: '<rootDir>/src/test-utils/seleniumGlobalSetup.js',
  globalTeardown: '<rootDir>/src/test-utils/seleniumGlobalTeardown.js',
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],
  testMatch: [
    "<rootDir>/e2e/**/*.selenium.test.[jt]s?(x)",
    "<rootDir>/src/components/__tests__/**/*.ct.selenium*.test.ts"
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  maxWorkers: 1,
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/selenium-jest-setup.ts']
};
