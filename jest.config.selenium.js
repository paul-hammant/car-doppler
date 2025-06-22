module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: '<rootDir>/src/test-utils/seleniumGlobalSetup.js',
  globalTeardown: '<rootDir>/src/test-utils/seleniumGlobalTeardown.js',
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],
  modulePathIgnorePatterns: [
    "<rootDir>/dist_server/"
  ],
  testMatch: [
    "<rootDir>/e2e/**/*.selenium.test.[jt]s?(x)",
    "<rootDir>/src/components/__tests__/**/*.ct.selenium*.test.ts"
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  maxWorkers: 1,
  forceExit: true,
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/selenium-jest-setup.ts'],
  // Disable module cache clearing to preserve global state
  clearMocks: false,
  resetMocks: false,
  restoreMocks: false,
  resetModules: false
};
