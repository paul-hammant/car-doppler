import { defineConfig } from 'cypress';
import { devServer } from '@cypress/webpack-dev-server';

export default defineConfig({
  component: { // Keep existing component config
    devServer(cypressDevServerConfig) {
      return devServer(cypressDevServerConfig, {
        // @ts-ignore
        webpackConfig: require('./webpack.config.js'),
      });
    },
    specPattern: 'src/components/__tests__/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
    indexHtmlFile: 'cypress/support/component-index.html',
  },
  e2e: {
    baseUrl: 'http://localhost:3000', // Same as Playwright E2E
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      // this is a good place to add plugin configurations
    },
  },
  // Other global configurations
  // video: false, // Example: disable video recording to save resources
  // screenshotOnRunFailure: true,
});
