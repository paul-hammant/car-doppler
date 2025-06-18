module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  // By using testMatch, we explicitly define what a unit test is,
  // rather than relying on ignoring other test types.
  // All unit tests in this project are .tsx files, so we match those.
  // Selenium and other e2e/component tests are .ts files and will be ignored.
  testMatch: [
    // The previous glob pattern was not matching files correctly.
    // This more explicit pattern ensures all .test.tsx files under src/ are found.
    "<rootDir>/src/**/*.test.tsx"
  ],
  // We no longer need the complex ignore patterns for different test types,
  // but we should still ignore node_modules and dist.
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  }
};
