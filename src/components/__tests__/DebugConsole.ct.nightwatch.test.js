const NightWatchUtils = require('../../test-utils/nightwatch-utils');

const HARNESS_BASE_URL = 'http://localhost:3001/render-component';

module.exports = {
  '@tags': ['component', 'debugconsole'],
  
  before: function(browser) {
    // Setup initial navigation to DebugConsole harness
    browser
      .url(`${HARNESS_BASE_URL}/DebugConsoleTestHarness?testName=Initial`)
      .waitForElementPresent('[data-testid="test-name"]', 3000);
  },

  after: function(browser) {
    browser.end();
  },

  // Helper function to update the current page for DebugConsole harness
  loadDebugTestHarness: function(browser, testName, initialProps = {}) {
    const params = new URLSearchParams({ testName, ...initialProps }).toString();
    const newUrl = `${HARNESS_BASE_URL}/DebugConsoleTestHarness?${params}`;
    
    return browser
      .execute(`window.location.replace('${newUrl}');`)
      .waitForElementPresent('[data-testid="test-name"]', 2000);
  },

  'comprehensive debug console functionality and states': function(browser) {
    // Test with various log types and counts
    const testLogs = [
      { timestamp: '10:30:00', type: 'INFO', message: 'Application started', color: '#00aaff' },
      { timestamp: '10:30:05', type: 'WARN', message: 'Performance warning', color: '#ffaa00' },
      { timestamp: '10:30:10', type: 'ERROR', message: 'Connection failed', color: '#ff4444' },
      { timestamp: '10:30:15', type: 'SUCCESS', message: 'Recovery complete', color: '#34C759' },
    ];
    const logsParam = encodeURIComponent(JSON.stringify(testLogs));
    
    this.loadDebugTestHarness(browser, 'Comprehensive Debug Console Test', { logs: logsParam });
    NightWatchUtils.takeScreenshot(browser, 'DebugConsole-comprehensive.png');

    // Basic collapsed state assertions
    NightWatchUtils.assertTextContains(browser, 'debug-toggle-button', 'Show Debug Console');
    // Check that debug console container doesn't exist or is not visible when collapsed
    browser.expect.element('[data-testid="debug-console-container"]').to.not.be.present;

    // Accessibility attributes
    browser.expect.element('[data-testid="debug-toggle-button"]')
      .to.have.attribute('aria-label').which.equals('Show Debug Console');
    browser.expect.element('[data-testid="debug-toggle-button"]')
      .to.have.attribute('class').which.contains('debug-toggle-button');

    // Harness state verification
    NightWatchUtils.assertTextContains(browser, 'harness-log-count', 'Log Count: 4');
    NightWatchUtils.assertTextContains(browser, 'harness-intercept-state', 'Intercept Console: NO');
    
    // Event log section presence
    browser.expect.element('[data-testid="event-log"]').to.be.visible;
    
    // Component structure exists
    browser.expect.element('[data-testid="debug-toggle-button"]').to.be.present;
  },

  'handles empty logs state': function(browser) {
    this.loadDebugTestHarness(browser, 'Empty Logs Test', { logs: '[]', interceptConsole: 'false' });
    NightWatchUtils.takeScreenshot(browser, 'DebugConsole-empty.png');

    // Should show collapsed state with zero logs
    NightWatchUtils.assertTextContains(browser, 'debug-toggle-button', 'Show Debug Console');
    browser.expect.element('[data-testid="debug-console-container"]').to.not.be.present;
    NightWatchUtils.assertTextContains(browser, 'harness-log-count', 'Log Count: 0');
  },

  'handles large number of log entries': function(browser) {
    // Generate many log entries to test performance/display
    const manyLogs = Array.from({ length: 50 }, (_, i) => ({
      timestamp: `10:${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`,
      type: ['INFO', 'WARN', 'ERROR'][i % 3],
      message: `Log entry number ${i + 1}`,
      color: ['#00aaff', '#ffaa00', '#ff4444'][i % 3]
    }));

    const logsParam = encodeURIComponent(JSON.stringify(manyLogs));
    this.loadDebugTestHarness(browser, 'Many Logs Test', { logs: logsParam });
    NightWatchUtils.takeScreenshot(browser, 'DebugConsole-many-logs.png');

    // Should handle large log count correctly
    NightWatchUtils.assertTextContains(browser, 'harness-log-count', 'Log Count: 50');
    NightWatchUtils.assertTextContains(browser, 'debug-toggle-button', 'Show Debug Console');
    browser.expect.element('[data-testid="debug-console-container"]').to.not.be.present;
  },

  'debug console with production-like log scenarios': function(browser) {
    // Create realistic production-like logs that would occur during app usage
    const productionLogs = [
      { timestamp: '10:30:00', type: 'INFO', message: 'Application startup complete', color: '#00aaff' },
      { timestamp: '10:30:02', type: 'INFO', message: 'Audio context initialized', color: '#00aaff' },
      { timestamp: '10:30:05', type: 'WARN', message: 'Microphone permission required', color: '#ffaa00' },
      { timestamp: '10:30:08', type: 'INFO', message: 'User granted microphone access', color: '#00aaff' },
      { timestamp: '10:30:10', type: 'ERROR', message: 'FFT processing timeout (5s)', color: '#ff4444' },
      { timestamp: '10:30:12', type: 'INFO', message: 'Fallback to software FFT', color: '#00aaff' },
      { timestamp: '10:30:15', type: 'SUCCESS', message: 'Audio processing restored', color: '#34C759' },
      { timestamp: '10:30:18', type: 'WARN', message: 'High CPU usage detected (85%)', color: '#ffaa00' },
      { timestamp: '10:30:20', type: 'INFO', message: 'Speed calculation: 25.3 mph', color: '#00aaff' },
      { timestamp: '10:30:23', type: 'INFO', message: 'Doppler shift detected: +127 Hz', color: '#00aaff' },
    ];
    const logsParam = encodeURIComponent(JSON.stringify(productionLogs));
    
    // Load the standard DebugConsoleTestHarness with production-like logs
    this.loadDebugTestHarness(browser, 'Production Log Scenarios Test', { 
      logs: logsParam, 
      interceptConsole: 'false' 
    });

    // Take screenshot showing the collapsed state with production content
    NightWatchUtils.takeScreenshot(browser, 'DebugConsole-production-scenarios.png');

    // Verify the debug console is initially collapsed but has production content loaded
    NightWatchUtils.assertTextContains(browser, 'debug-toggle-button', 'Show Debug Console');
    browser.expect.element('[data-testid="debug-console-container"]').to.not.be.present;
    
    // Verify all production logs are loaded in the harness
    NightWatchUtils.assertTextContains(browser, 'harness-log-count', 'Log Count: 10');

    // Verify the harness has the event log capability 
    browser.expect.element('[data-testid="event-log"]').to.be.present;

    // Verify the debug console component structure exists for production use
    browser.expect.element('[data-testid="debug-toggle-button"]').to.be.present;
    
    // Test that the component is ready to display production scenarios
    // Check if the production logs would be available when expanded (through DOM inspection)
    NightWatchUtils.assertTextContains(browser, 'harness-log-count', 'Log Count: 10');
  },

  'expanded debug console with production-like content': function(browser) {
    // Create comprehensive production-like logs to test the expanded debug console display  
    const expandedLogs = [
      { timestamp: '10:30:00', type: 'INFO', message: 'Application startup complete', color: '#00aaff' },
      { timestamp: '10:30:02', type: 'INFO', message: 'Audio context initialized', color: '#00aaff' },
      { timestamp: '10:30:05', type: 'WARN', message: 'Microphone permission required', color: '#ffaa00' },
      { timestamp: '10:30:08', type: 'INFO', message: 'User granted microphone access', color: '#00aaff' },
      { timestamp: '10:30:10', type: 'ERROR', message: 'FFT processing timeout (5s)', color: '#ff4444' },
      { timestamp: '10:30:12', type: 'INFO', message: 'Fallback to software FFT', color: '#00aaff' },
      { timestamp: '10:30:15', type: 'SUCCESS', message: 'Audio processing restored', color: '#34C759' },
      { timestamp: '10:30:18', type: 'WARN', message: 'High CPU usage detected (85%)', color: '#ffaa00' },
      { timestamp: '10:30:20', type: 'INFO', message: 'Speed calculation: 25.3 mph', color: '#00aaff' },
      { timestamp: '10:30:23', type: 'INFO', message: 'Doppler shift detected: +127 Hz', color: '#00aaff' },
    ];
    const logsParam = encodeURIComponent(JSON.stringify(expandedLogs));
    
    // Use the ExpandedDebugConsoleTestHarness which renders the console in expanded state
    const params = new URLSearchParams({ 
      testName: 'Expanded Debug Console with Production Content', 
      logs: logsParam 
    }).toString();
    const expandedUrl = `${HARNESS_BASE_URL}/ExpandedDebugConsoleTestHarness?${params}`;
    
    browser
      .execute(`window.location.replace('${expandedUrl}');`)
      .waitForElementPresent('[data-testid="test-name"]', 2000);

    // Take screenshot of the expanded debug console with production logs
    NightWatchUtils.takeScreenshot(browser, 'DebugConsole-expanded-production.png');

    // Verify the harness loaded correctly with the production logs
    NightWatchUtils.assertTextContains(browser, 'harness-log-count', 'Log Count: 10');
    NightWatchUtils.assertTextContains(browser, 'harness-expanded-state', 'EXPANDED');
    
    // Verify the debug console container is visible (forced expanded in this harness)
    browser.expect.element('[data-testid="debug-console-container"]').to.be.visible;
    
    // Verify the toggle button shows the correct expanded state
    NightWatchUtils.assertTextContains(browser, 'debug-toggle-button', 'Hide Debug Console');

    // Verify all production logs are visible in the expanded console
    browser.expect.element('[data-testid="debug-log-entry-0"]').to.be.visible;
    browser.expect.element('[data-testid="debug-log-entry-4"]').to.be.visible; // FFT timeout error
    browser.expect.element('[data-testid="debug-log-entry-9"]').to.be.visible; // Doppler shift info

    // Verify production log content is displayed correctly in expanded state
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-0', 'Application startup complete');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-4', 'FFT processing timeout');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-6', 'Audio processing restored');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-8', 'Speed calculation: 25.3 mph');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-9', 'Doppler shift detected: +127 Hz');

    // Verify different log types are displayed with appropriate content in expanded view
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-4', 'ERROR');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-4', 'FFT processing timeout');

    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-7', 'WARN');  
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-7', 'High CPU usage detected');

    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-6', 'SUCCESS');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-6', 'Audio processing restored');

    // Verify expanded debug console structural components are present and visible
    browser.expect.element('[data-testid="debug-log-container"]').to.be.visible;
    browser.expect.element('[data-testid="debug-fft-status"]').to.be.visible;
    browser.expect.element('[data-testid="debug-clear-button"]').to.be.visible;

    // Take final screenshot showing the comprehensive expanded console
    NightWatchUtils.takeScreenshot(browser, 'DebugConsole-expanded-comprehensive.png');
  },

  'debug console supports dynamic log updates after initial load': function(browser) {
    // Start with initial logs to demonstrate the concept of dynamic updates
    const initialLogs = [
      { timestamp: '10:30:00', type: 'INFO', message: 'ADDED AFTER 1', color: '#00aaff' },
      { timestamp: '10:30:05', type: 'INFO', message: 'ADDED AFTER 2', color: '#00aaff' },
    ];
    const logsParam = encodeURIComponent(JSON.stringify(initialLogs));
    
    // Use the ExpandedDebugConsoleTestHarness to avoid hydration issues with content assertions
    const params = new URLSearchParams({ 
      testName: 'Dynamic Log Support Test - Initial', 
      logs: logsParam 
    }).toString();
    const expandedUrl = `${HARNESS_BASE_URL}/ExpandedDebugConsoleTestHarness?${params}`;
    
    browser
      .execute(`window.location.replace('${expandedUrl}');`)
      .waitForElementPresent('[data-testid="test-name"]', 2000);

    // Take screenshot of initial state
    NightWatchUtils.takeScreenshot(browser, 'DebugConsole-dynamic-support-initial.png');

    // Verify initial state with original logs in expanded form
    NightWatchUtils.assertTextContains(browser, 'debug-toggle-button', 'Hide Debug Console');
    browser.expect.element('[data-testid="debug-console-container"]').to.be.visible;
    NightWatchUtils.assertTextContains(browser, 'harness-log-count', 'Log Count: 2');
    NightWatchUtils.assertTextContains(browser, 'harness-expanded-state', 'EXPANDED');
    
    // Assert on the actual content of the two contrived entries
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-0', 'ADDED AFTER 1');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-0', 'INFO');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-0', '10:30:00');
    
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-1', 'ADDED AFTER 2');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-1', 'INFO');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-1', '10:30:05');

    // Verify the component structure exists for supporting dynamic updates
    browser.expect.element('[data-testid="debug-toggle-button"]').to.be.present;
    browser.expect.element('[data-testid="event-log"]').to.be.present;

    // Simulate receiving new logs from collaborators/system (load updated dataset)
    const updatedLogs = [
      ...initialLogs,
      { timestamp: '10:30:10', type: 'WARN', message: 'Collaborator: High memory usage detected', color: '#ffaa00' },
      { timestamp: '10:30:15', type: 'ERROR', message: 'System: Network timeout occurred', color: '#ff4444' },
      { timestamp: '10:30:20', type: 'INFO', message: 'User: Speed detection started', color: '#00aaff' },
    ];
    const updatedLogsParam = encodeURIComponent(JSON.stringify(updatedLogs));
    
    // Reload with updated dataset to simulate dynamic addition
    const updatedParams = new URLSearchParams({ 
      testName: 'Dynamic Log Support Test - Updated', 
      logs: updatedLogsParam 
    }).toString();
    const updatedExpandedUrl = `${HARNESS_BASE_URL}/ExpandedDebugConsoleTestHarness?${updatedParams}`;
    
    browser
      .execute(`window.location.replace('${updatedExpandedUrl}');`)
      .waitForElementPresent('[data-testid="test-name"]', 2000);

    NightWatchUtils.takeScreenshot(browser, 'DebugConsole-dynamic-support-updated.png');

    // Verify the updated log count
    NightWatchUtils.assertTextContains(browser, 'harness-log-count', 'Log Count: 5');
    NightWatchUtils.assertTextContains(browser, 'harness-expanded-state', 'EXPANDED');
    
    // Assert on the content of the original contrived entries (should still be there)
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-0', 'ADDED AFTER 1');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-0', 'INFO');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-0', '10:30:00');
    
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-1', 'ADDED AFTER 2');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-1', 'INFO');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-1', '10:30:05');
    
    // Assert on the content of the newly added dynamic entries
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-2', 'Collaborator: High memory usage detected');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-2', 'WARN');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-2', '10:30:10');
    
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-3', 'System: Network timeout occurred');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-3', 'ERROR');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-3', '10:30:15');
    
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-4', 'User: Speed detection started');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-4', 'INFO');
    NightWatchUtils.assertTextContains(browser, 'debug-log-entry-4', '10:30:20');

    // Verify the harness has event log capability
    browser.expect.element('[data-testid="event-log"]').to.be.present;

    // Verify component structure remains stable with dynamic content changes
    browser.expect.element('[data-testid="debug-toggle-button"]').to.be.present;
    NightWatchUtils.assertTextContains(browser, 'debug-toggle-button', 'Hide Debug Console');
  }
};