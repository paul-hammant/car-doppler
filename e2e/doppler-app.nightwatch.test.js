const NightWatchE2EUtils = require('../src/test-utils/nightwatch-e2e-utils');

module.exports = {
  '@tags': ['e2e', 'app'],
  
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

  'displays app title and version': function(browser) {
    browser.expect.element('h1').to.be.present;
    browser.expect.element('h1').text.to.contain('Doppler Speed Detector');
    
    browser.expect.element('.version').to.be.present;
    browser.expect.element('.version').text.to.match(/^v(2\.1\.2|\d{8}-\d{4})$/);
  },

  'shows default speed display': function(browser) {
    NightWatchE2EUtils.findElementByTestId(browser, 'speed-display');
    browser.expect.element('[data-testid="speed-display"]').to.be.visible;
    
    NightWatchE2EUtils.findElementByTestId(browser, 'speed-value');
    NightWatchE2EUtils.assertTextContains(browser, 'speed-value', '--');
    
    NightWatchE2EUtils.findElementByTestId(browser, 'speed-unit');
    browser.expect.element('[data-testid="speed-unit"]').text.to.match(/mph|km\/h/);
  },

  'displays controls section': function(browser) {
    NightWatchE2EUtils.findElementByTestId(browser, 'record-button');
    browser.expect.element('[data-testid="record-button"]').to.be.visible;
    
    // Check button text (adjusted for newline)
    browser.getText('[data-testid="record-button"]', function(result) {
      browser.assert.equal(result.value, "Start\nListening");
    });
    
    NightWatchE2EUtils.findElementByTestId(browser, 'unit-toggle-button');
    browser.expect.element('[data-testid="unit-toggle-button"]').to.be.visible;
    browser.expect.element('[data-testid="unit-toggle-button"]').text.to.match(/Switch to\s*(mph|km\/h)/i);
  },

  'can toggle units between metric and imperial': function(browser) {
    const unitToggle = '[data-testid="unit-toggle-button"]';
    const speedUnit = '[data-testid="speed-unit"]';
    
    NightWatchE2EUtils.pause(browser, 2000);
    
    // Get initial states
    browser.getText(speedUnit, function(initialUnitResult) {
      browser.getText(unitToggle, function(initialButtonResult) {
        const initialUnit = initialUnitResult.value;
        const initialButtonText = initialButtonResult.value;
        
        // Click to toggle
        NightWatchE2EUtils.clickElementByTestId(browser, 'unit-toggle-button');
        NightWatchE2EUtils.pause(browser, 500);
        
        // Check states changed
        browser.getText(speedUnit, function(newUnitResult) {
          browser.getText(unitToggle, function(newButtonResult) {
            browser.assert.notEqual(initialUnit, newUnitResult.value);
            browser.assert.notEqual(initialButtonText, newButtonResult.value);
            
            // Toggle back
            NightWatchE2EUtils.clickElementByTestId(browser, 'unit-toggle-button');
            NightWatchE2EUtils.pause(browser, 500);
            
            // Verify back to original
            browser.getText(speedUnit, function(finalResult) {
              browser.assert.equal(finalResult.value, initialUnit);
            });
          });
        });
      });
    });
  },

  'displays status display component': function(browser) {
    NightWatchE2EUtils.findElementByTestId(browser, 'status-display');
    browser.expect.element('[data-testid="status-display"]').to.be.visible;
    
    NightWatchE2EUtils.assertTextContains(browser, 'status-text', 'Ready to start listening');
  },

  'shows positioning guide that can be expanded': function(browser) {
    NightWatchE2EUtils.findElementByTestId(browser, 'positioning-guide');
    browser.expect.element('[data-testid="positioning-guide"]').to.be.visible;
    
    NightWatchE2EUtils.findElementByTestId(browser, 'positioning-toggle');
    NightWatchE2EUtils.assertTextContains(browser, 'positioning-toggle', 'read more...');
    
    // Check details not visible initially
    browser.expect.element('[data-testid="positioning-details"]').to.not.be.present;
    
    // Click to expand
    NightWatchE2EUtils.clickElementByTestId(browser, 'positioning-toggle');
    NightWatchE2EUtils.assertTextContains(browser, 'positioning-toggle', 'collapse');
    
    // Check details now visible
    browser.expect.element('[data-testid="positioning-details"]').to.be.visible;
    NightWatchE2EUtils.assertTextContains(browser, 'positioning-details', 'For accurate readings');
    NightWatchE2EUtils.assertTextContains(browser, 'positioning-details', 'Safety:');
    
    // Click to collapse
    NightWatchE2EUtils.clickElementByTestId(browser, 'positioning-toggle');
    NightWatchE2EUtils.assertTextContains(browser, 'positioning-toggle', 'read more...');
    browser.expect.element('[data-testid="positioning-details"]').to.not.be.present;
  },

  'displays file input section': function(browser) {
    NightWatchE2EUtils.findElementByTestId(browser, 'file-input');
    browser.expect.element('[data-testid="file-input"]').to.be.visible;
    
    NightWatchE2EUtils.findElementByTestId(browser, 'file-select-button');
    browser.expect.element('[data-testid="file-select-button"]').to.be.visible;
    NightWatchE2EUtils.assertTextContains(browser, 'file-select-button', '📁 Choose File');
    
    NightWatchE2EUtils.findElementByTestId(browser, 'download-button');
    browser.expect.element('[data-testid="download-button"]').to.be.visible;
    NightWatchE2EUtils.assertTextContains(browser, 'download-button', '⬇️ Download');
    
    // Download button should be disabled initially
    NightWatchE2EUtils.isElementEnabled(browser, 'download-button', function(result) {
      browser.assert.equal(result.value, false, 'Download button should be disabled initially');
    });
  },

  'shows debug console that can be toggled': function(browser) {
    NightWatchE2EUtils.findElementByTestId(browser, 'debug-console');
    browser.expect.element('[data-testid="debug-console"]').to.be.visible;
    
    NightWatchE2EUtils.findElementByTestId(browser, 'debug-toggle-button');
    NightWatchE2EUtils.assertTextContains(browser, 'debug-toggle-button', 'Show Debug Console');
    
    // Console container should not be present when collapsed
    browser.expect.element('[data-testid="debug-console-container"]').to.not.be.present;
    
    // Click to expand
    NightWatchE2EUtils.clickElementByTestId(browser, 'debug-toggle-button');
    NightWatchE2EUtils.assertTextContains(browser, 'debug-toggle-button', 'Hide Debug Console');
    
    // Console should now be visible
    browser.expect.element('[data-testid="debug-console-container"]').to.be.visible;
    browser.expect.element('[data-testid="debug-log-container"]').to.be.visible;
    
    // Click to collapse
    NightWatchE2EUtils.clickElementByTestId(browser, 'debug-toggle-button');
    NightWatchE2EUtils.assertTextContains(browser, 'debug-toggle-button', 'Show Debug Console');
    browser.expect.element('[data-testid="debug-console-container"]').to.not.be.present;
  },

  'displays privacy notice': function(browser) {
    browser.expect.element('.privacy-notice').to.be.present;
    browser.expect.element('.privacy-notice').text.to.contain('Privacy: All processing happens locally');
  },

  'has proper page title': function(browser) {
    // Wait for title to load properly after page navigation
    browser.waitUntil(function() {
      return this.getTitle(function(title) {
        return title.includes('Doppler');
      });
    }, 5000);
    
    browser.getTitle(function(title) {
      browser.assert.ok(title.includes('Doppler Speed Detector'), 'Page title should contain Doppler Speed Detector');
    });
  },

  'is responsive on mobile viewport': function(browser) {
    NightWatchE2EUtils.setWindowSize(browser, 375, 667); // iPhone SE size
    
    browser.expect.element('.container').to.be.visible;
    browser.expect.element('[data-testid="speed-display"]').to.be.visible;
    browser.expect.element('[data-testid="record-button"]').to.be.visible;
    
    // Reset window size for subsequent tests
    NightWatchE2EUtils.setWindowSize(browser, 1024, 768);
  },

};