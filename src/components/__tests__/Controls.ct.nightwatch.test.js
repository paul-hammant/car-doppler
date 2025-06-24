const NightWatchUtils = require('../../test-utils/nightwatch-utils');

module.exports = {
  '@tags': ['component', 'controls'],
  
  before: function(browser) {
    // Setup initial navigation (equivalent to beforeAll)
    NightWatchUtils.setupInitialNavigation(browser);
  },

  after: function(browser) {
    browser.end();
  },

  'renders in test harness with initial state visible': function(browser) {
    NightWatchUtils.loadTestHarness(browser, 'Initial State Visibility');
    NightWatchUtils.takeScreenshot(browser, 'Controls-initial-state.png');

    // Assert on the COMPONENT
    NightWatchUtils.assertTextContains(browser, 'record-button', 'Start');
    NightWatchUtils.assertTextContains(browser, 'unit-toggle-button', 'mph');

    // Assert on the TEST HARNESS state
    NightWatchUtils.assertTextContains(browser, 'harness-recording-state', 'Recording: OFF');
    NightWatchUtils.assertTextContains(browser, 'harness-units-state', 'Units: METRIC (km/h)');
    NightWatchUtils.assertTextContains(browser, 'test-name', 'Initial State Visibility');
  },

  'demonstrates event coupling - recording toggle': function(browser) {
    NightWatchUtils.loadTestHarness(browser, 'Recording Toggle Event Coupling');
    NightWatchUtils.takeScreenshot(browser, 'Controls-recording-toggle-before.png');

    // Initial state assertions
    NightWatchUtils.assertTextContains(browser, 'record-button', 'Start');
    NightWatchUtils.assertTextContains(browser, 'harness-recording-state', 'OFF');
    NightWatchUtils.assertTextContains(browser, 'event-log', 'No events yet...');

    // Click the record button
    NightWatchUtils.clickElementByTestId(browser, 'record-button');
    NightWatchUtils.takeScreenshot(browser, 'Controls-recording-toggle-started.png');

    // Assert on COMPONENT state change
    NightWatchUtils.assertTextContains(browser, 'record-button', 'Stop');
    // Assert on TEST HARNESS state change
    NightWatchUtils.assertTextContains(browser, 'harness-recording-state', 'Recording: ON');
    // Assert on EVENT COUPLING trace
    NightWatchUtils.assertTextContains(browser, 'event-log', 'Recording started');

    // Toggle back
    NightWatchUtils.clickElementByTestId(browser, 'record-button');
    NightWatchUtils.takeScreenshot(browser, 'Controls-recording-toggle-stopped.png');

    // Final state assertions
    NightWatchUtils.assertTextContains(browser, 'record-button', 'Start');
    NightWatchUtils.assertTextContains(browser, 'harness-recording-state', 'Recording: OFF');
    NightWatchUtils.assertTextContains(browser, 'event-log', 'Recording stopped');
  },

  'demonstrates event coupling - units toggle': function(browser) {
    NightWatchUtils.loadTestHarness(browser, 'Units Toggle Event Coupling');
    NightWatchUtils.takeScreenshot(browser, 'Controls-units-toggle-before.png');

    // Initial state
    NightWatchUtils.assertTextContains(browser, 'unit-toggle-button', 'mph');
    NightWatchUtils.assertTextContains(browser, 'harness-units-state', 'METRIC (km/h)');

    // Click to switch to imperial
    NightWatchUtils.clickElementByTestId(browser, 'unit-toggle-button');
    NightWatchUtils.takeScreenshot(browser, 'Controls-units-toggle-imperial.png');

    // Component updated
    NightWatchUtils.assertTextContains(browser, 'unit-toggle-button', 'km/h');
    // Harness state updated
    NightWatchUtils.assertTextContains(browser, 'harness-units-state', 'IMPERIAL (mph)');
    // Event was logged
    NightWatchUtils.assertTextContains(browser, 'event-log', 'Units changed to imperial');

    // Switch back
    NightWatchUtils.clickElementByTestId(browser, 'unit-toggle-button');
    NightWatchUtils.takeScreenshot(browser, 'Controls-units-toggle-metric.png');

    NightWatchUtils.assertTextContains(browser, 'unit-toggle-button', 'mph');
    NightWatchUtils.assertTextContains(browser, 'harness-units-state', 'METRIC (km/h)');
    NightWatchUtils.assertTextContains(browser, 'event-log', 'Units changed to metric');
  },

  'shows processing state affecting component': function(browser) {
    NightWatchUtils.loadTestHarness(browser, 'Processing State Test', { initialProcessing: 'true' });
    NightWatchUtils.takeScreenshot(browser, 'Controls-processing-state.png');

    // Check if elements are disabled
    NightWatchUtils.isElementEnabled(browser, 'record-button', function(result) {
      browser.assert.equal(result.value, false, 'Record button should be disabled');
    });
    
    NightWatchUtils.isElementEnabled(browser, 'unit-toggle-button', function(result) {
      browser.assert.equal(result.value, false, 'Unit toggle button should be disabled');
    });

    // Harness shows processing state
    NightWatchUtils.assertTextContains(browser, 'harness-processing-state', 'Processing: YES');
  },

  'complex scenario - multiple interactions with full trace': function(browser) {
    NightWatchUtils.loadTestHarness(browser, 'Complex Multi-Interaction Scenario');
    NightWatchUtils.takeScreenshot(browser, 'Controls-complex-scenario-start.png');

    // Verify initial state
    NightWatchUtils.assertTextContains(browser, 'record-button', 'Start');
    NightWatchUtils.assertTextContains(browser, 'unit-toggle-button', 'mph');

    NightWatchUtils.clickElementByTestId(browser, 'record-button');
    NightWatchUtils.clickElementByTestId(browser, 'unit-toggle-button');
    NightWatchUtils.takeScreenshot(browser, 'Controls-complex-scenario-mid.png');

    NightWatchUtils.clickElementByTestId(browser, 'record-button');
    NightWatchUtils.clickElementByTestId(browser, 'unit-toggle-button');
    NightWatchUtils.takeScreenshot(browser, 'Controls-complex-scenario-final.png');

    // Final state should be back to initial
    NightWatchUtils.assertTextContains(browser, 'record-button', 'Start');
    NightWatchUtils.assertTextContains(browser, 'unit-toggle-button', 'mph');
    NightWatchUtils.assertTextContains(browser, 'harness-recording-state', 'OFF');
    NightWatchUtils.assertTextContains(browser, 'harness-units-state', 'METRIC');
    
    // Verify event log contains all events
    NightWatchUtils.assertTextContains(browser, 'event-log', 'Recording started');
    NightWatchUtils.assertTextContains(browser, 'event-log', 'Units changed to imperial');
    NightWatchUtils.assertTextContains(browser, 'event-log', 'Recording stopped');
    NightWatchUtils.assertTextContains(browser, 'event-log', 'Units changed to metric');
  }
};