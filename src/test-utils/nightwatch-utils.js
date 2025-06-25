const HARNESS_BASE_URL = 'http://localhost:3001/render-component';

/**
 * NightWatch utilities for component testing
 */
class NightWatchUtils {
  /**
   * Navigate to test harness with parameters
   * @param {object} browser - NightWatch browser instance
   * @param {string} testName - Name of the test
   * @param {object} initialProps - Initial props for the component
   */
  static loadTestHarness(browser, testName, initialProps = {}) {
    const params = new URLSearchParams({ testName, ...initialProps }).toString();
    const newUrl = `${HARNESS_BASE_URL}/ControlsTestHarness?${params}`;
    
    return browser
      .execute(`window.location.replace('${newUrl}');`)
      .waitForElementPresent('[data-testid="test-name"]', 2000);
  }

  /**
   * Find element by test ID
   * @param {object} browser - NightWatch browser instance  
   * @param {string} testId - The data-testid value
   */
  static findElementByTestId(browser, testId) {
    return browser.waitForElementPresent(`[data-testid="${testId}"]`, 2000);
  }

  /**
   * Click element by test ID
   * @param {object} browser - NightWatch browser instance
   * @param {string} testId - The data-testid value
   */
  static clickElementByTestId(browser, testId) {
    return browser
      .waitForElementPresent(`[data-testid="${testId}"]`, 2000)
      .waitForElementVisible(`[data-testid="${testId}"]`, 1000)
      .click(`[data-testid="${testId}"]`).execute();
  }

  /**
   * Get text from element by test ID
   * @param {object} browser - NightWatch browser instance
   * @param {string} testId - The data-testid value
   * @param {function} callback - Callback to handle the text
   */
  static getTextByTestId(browser, testId, callback) {
    return browser
      .waitForElementPresent(`[data-testid="${testId}"]`, 2000)
      .getText(`[data-testid="${testId}"]`, callback);
  }

  /**
   * Take screenshot
   * @param {object} browser - NightWatch browser instance
   * @param {string} filename - Screenshot filename
   */
  static takeScreenshot(browser, filename) {
    if (process.env.CI || process.env.SKIP_SCREENSHOTS) {
      return browser;
    }
    return browser.saveScreenshot(`test-results/nightwatch/${filename}`);
  }

  /**
   * Check if element is enabled
   * @param {object} browser - NightWatch browser instance
   * @param {string} testId - The data-testid value
   * @param {function} callback - Callback to handle the enabled state
   */
  static isElementEnabled(browser, testId, callback) {
    return browser
      .waitForElementPresent(`[data-testid="${testId}"]`, 2000)
      .isEnabled(`[data-testid="${testId}"]`, callback);
  }

  /**
   * Assert text contains
   * @param {object} browser - NightWatch browser instance
   * @param {string} testId - The data-testid value
   * @param {string} expectedText - Expected text content
   */
  static assertTextContains(browser, testId, expectedText) {
    return browser
      .waitForElementPresent(`[data-testid="${testId}"]`, 2000)
      .assert.textContains(`[data-testid="${testId}"]`, expectedText);
  }

  static assertTextEquals(browser, testId, expectedText) {
    return browser
      .waitForElementPresent(`[data-testid="${testId}"]`, 2000)
      .assert.textEquals(`[data-testid="${testId}"]`, expectedText);
  }

  /**
   * Navigate to initial harness page (equivalent to beforeAll setup)
   * @param {object} browser - NightWatch browser instance
   */
  static setupInitialNavigation(browser) {
    return browser
      .url(`${HARNESS_BASE_URL}/ControlsTestHarness?testName=Initial`)
      .waitForElementPresent('[data-testid="test-name"]', 3000);
  }
}

module.exports = NightWatchUtils;