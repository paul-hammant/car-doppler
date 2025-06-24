const NightWatchUtils = require('../../test-utils/nightwatch-utils');

module.exports = {
  '@tags': ['component', 'unitsconversion'],
  
  before: function(browser) {
    // Setup initial navigation (equivalent to beforeAll)
    NightWatchUtils.setupInitialNavigation(browser);
  },

  after: function(browser) {
    browser.end();
  },

  beforeEach: function(browser) {
    NightWatchUtils.loadTestHarness(browser, 'Initial');
  },

  'demonstrates mph → km/h → mph conversion cycle with full visibility': function(browser) {
    NightWatchUtils.takeScreenshot(browser, 'UnitsConversion-cycle-initial-metric.png');

    // === INITIAL STATE: mph (metric mode, showing imperial target) ===
    NightWatchUtils.assertTextContains(browser, 'test-name', 'Initial');
    
    // Component shows: "Switch to mph" (because we're in metric mode)
    NightWatchUtils.assertTextContains(browser, 'unit-toggle-button', 'Switch to');
    NightWatchUtils.assertTextContains(browser, 'unit-toggle-button', 'mph');
    
    // Harness state shows: METRIC (km/h) 
    NightWatchUtils.assertTextContains(browser, 'harness-units-state', 'Units: METRIC (km/h)');
    
    // Event log is empty
    NightWatchUtils.assertTextContains(browser, 'event-log', 'No events yet...');

    // === FIRST CLICK: mph → km/h (metric to imperial) ===
    NightWatchUtils.clickElementByTestId(browser, 'unit-toggle-button');
    NightWatchUtils.takeScreenshot(browser, 'UnitsConversion-cycle-switched-imperial.png');

    // Component now shows: "Switch to km/h" (because we're in imperial mode)
    NightWatchUtils.assertTextContains(browser, 'unit-toggle-button', 'Switch to');
    NightWatchUtils.assertTextContains(browser, 'unit-toggle-button', 'km/h');
    
    // Harness state updated via event coupling
    NightWatchUtils.assertTextContains(browser, 'harness-units-state', 'Units: IMPERIAL (mph)');
    
    // Event was logged
    NightWatchUtils.assertTextContains(browser, 'event-log', 'Units changed to imperial');

    // === SECOND CLICK: km/h → mph (imperial back to metric) ===
    NightWatchUtils.clickElementByTestId(browser, 'unit-toggle-button');
    NightWatchUtils.takeScreenshot(browser, 'UnitsConversion-cycle-back-to-metric.png');

    // Component back to showing: "Switch to mph" (metric mode again)
    NightWatchUtils.assertTextContains(browser, 'unit-toggle-button', 'Switch to');
    NightWatchUtils.assertTextContains(browser, 'unit-toggle-button', 'mph');
    
    // Harness state back to original
    NightWatchUtils.assertTextContains(browser, 'harness-units-state', 'Units: METRIC (km/h)');
    
    // Both events logged
    NightWatchUtils.assertTextContains(browser, 'event-log', 'Units changed to imperial');
    NightWatchUtils.assertTextContains(browser, 'event-log', 'Units changed to metric');
  },

  'demonstrates units state with initial imperial mode': function(browser) {
    NightWatchUtils.loadTestHarness(browser, 'Starting in Imperial Mode', { initialMetric: 'false' });
    NightWatchUtils.takeScreenshot(browser, 'UnitsConversion-initial-imperial.png');

    // Initial state: imperial mode (showing metric target)
    NightWatchUtils.assertTextContains(browser, 'unit-toggle-button', 'km/h');
    NightWatchUtils.assertTextContains(browser, 'harness-units-state', 'IMPERIAL (mph)');

    // Click to switch to metric
    NightWatchUtils.clickElementByTestId(browser, 'unit-toggle-button');
    NightWatchUtils.takeScreenshot(browser, 'UnitsConversion-imperial-to-metric.png');

    // Now in metric mode
    NightWatchUtils.assertTextContains(browser, 'unit-toggle-button', 'mph');
    NightWatchUtils.assertTextContains(browser, 'harness-units-state', 'METRIC (km/h)');
    NightWatchUtils.assertTextContains(browser, 'event-log', 'Units changed to metric');
  },

  'demonstrates units toggle with processing state': function(browser) {
    NightWatchUtils.loadTestHarness(browser, 'Units Toggle - Processing State Demo', { initialProcessing: 'true' });
    NightWatchUtils.takeScreenshot(browser, 'UnitsConversion-processing-disabled.png');

    // When processing, button should be disabled
    NightWatchUtils.isElementEnabled(browser, 'unit-toggle-button', function(result) {
      browser.assert.equal(result.value, false, 'Unit toggle button should be disabled during processing');
    });
    NightWatchUtils.assertTextContains(browser, 'harness-processing-state', 'Processing: YES');

    // Try to click (should not work due to disabled state)
    // Note: NightWatch will automatically wait for elements to be enabled before clicking
    // So we'll use a different approach to test disabled state
    NightWatchUtils.takeScreenshot(browser, 'UnitsConversion-processing-no-change.png');

    // State should remain unchanged
    NightWatchUtils.assertTextContains(browser, 'harness-units-state', 'METRIC (km/h)');
    NightWatchUtils.assertTextContains(browser, 'event-log', 'No events yet...');
  }
};