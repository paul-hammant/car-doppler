module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test-utils/selenium-e2e-setup.ts'],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],
  testMatch: [
    "<rootDir>/e2e/**/*.selenium.test.[jt]s?(x)"
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  maxWorkers: 1,
  testTimeout: 60000
};