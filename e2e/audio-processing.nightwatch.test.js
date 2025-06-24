const NightWatchE2EUtils = require('../src/test-utils/nightwatch-e2e-utils');

module.exports = {
  '@tags': ['e2e', 'audio'],
  
  before: function(browser) {
    // Navigate once to the app for all tests
    NightWatchE2EUtils.navigateToApp(browser);
  },

  after: function(browser) {
    browser.end();
  },

  beforeEach: function(browser) {
    // Reset to homepage for each test (much faster than full navigation)
    NightWatchE2EUtils.resetToHomepage(browser);
  },

  'handles file upload for offline analysis': function(browser) {
    // This test was migrated from Playwright and simplified for Selenium limitations
    // We can click the button but verifying the native file chooser dialog is tricky
    NightWatchE2EUtils.findElementByTestId(browser, 'file-select-button');
    browser.expect.element('[data-testid="file-select-button"]').to.be.visible;
    
    // Click the file select button - this would open native file dialog
    NightWatchE2EUtils.clickElementByTestId(browser, 'file-select-button');
    
    // We can't easily assert the dialog opened with NightWatch
    // This is a limitation of browser automation with native dialogs
    // The test passes if the click doesn't throw an error
  },

  'debug console captures audio processing logs': function(browser) {
    NightWatchE2EUtils.clickElementByTestId(browser, 'debug-toggle-button');
    
    browser.expect.element('[data-testid="debug-log-container"]').to.be.visible;
    
    // Check for initial debug message
    NightWatchE2EUtils.assertTextContains(browser, 'debug-log-container', 'Debug console ready');
  },

  'maintains state during unit conversion': function(browser) {
    // This test checks that unit conversion works with the default speed display
    // Instead of trying to inject a value, we'll test the unit toggle functionality

    // Get initial unit and toggle
    browser.getText('[data-testid="speed-unit"]', function(initialUnitResult) {
      const initialUnit = initialUnitResult.value;
      
      NightWatchE2EUtils.clickElementByTestId(browser, 'unit-toggle-button');
      NightWatchE2EUtils.pause(browser, 100);

      browser.getText('[data-testid="speed-unit"]', function(newUnitResult) {
        const newUnit = newUnitResult.value;
        browser.assert.notEqual(initialUnit, newUnit, 'Unit should change after toggle');
        browser.assert.ok(newUnit.match(/mph|km\/h/), 'New unit should be mph or km/h');
        
        // Toggle back to verify state persistence
        NightWatchE2EUtils.clickElementByTestId(browser, 'unit-toggle-button');
        NightWatchE2EUtils.pause(browser, 100);
        
        browser.getText('[data-testid="speed-unit"]', function(finalUnitResult) {
          browser.assert.equal(finalUnitResult.value, initialUnit, 'Unit should return to original after second toggle');
        });
      });
    });
  },

  'positioning guide provides helpful instructions': function(browser) {
    NightWatchE2EUtils.clickElementByTestId(browser, 'positioning-toggle');
    NightWatchE2EUtils.pause(browser, 100);

    browser.expect.element('[data-testid="positioning-details"]').to.be.visible;
    
    // Check for specific content from the positioning guide
    NightWatchE2EUtils.assertTextContains(browser, 'positioning-details', 'perpendicular');
    NightWatchE2EUtils.assertTextContains(browser, 'positioning-details', '5 meters');
    NightWatchE2EUtils.assertTextContains(browser, 'positioning-details', 'Safety:');
    NightWatchE2EUtils.assertTextContains(browser, 'positioning-details', 'wired Lightning/USB-C microphones');
  },

};