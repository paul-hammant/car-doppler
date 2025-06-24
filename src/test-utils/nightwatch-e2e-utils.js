const APP_BASE_URL = 'http://localhost:3000/car-doppler/';

/**
 * NightWatch utilities for e2e testing
 */
class NightWatchE2EUtils {
  /**
   * Navigate to the main app and wait for it to load
   * @param {object} browser - NightWatch browser instance
   */
  static navigateToApp(browser) {
    return browser
      .url(APP_BASE_URL)
      .waitForElementPresent('h1', 10000);
  }

  /**
   * Reset to homepage (faster than full navigation)
   * @param {object} browser - NightWatch browser instance
   */
  static resetToHomepage(browser) {
    return browser
      .execute(`window.location.replace('${APP_BASE_URL}');`)
      .waitForElementPresent('h1', 5000);
  }

  /**
   * Find element by test ID
   * @param {object} browser - NightWatch browser instance  
   * @param {string} testId - The data-testid value
   */
  static findElementByTestId(browser, testId) {
    return browser.waitForElementPresent(`[data-testid="${testId}"]`, 5000);
  }

  /**
   * Click element by test ID
   * @param {object} browser - NightWatch browser instance
   * @param {string} testId - The data-testid value
   */
  static clickElementByTestId(browser, testId) {
    return browser
      .waitForElementPresent(`[data-testid="${testId}"]`, 5000)
      .waitForElementVisible(`[data-testid="${testId}"]`, 2000)
      .click(`[data-testid="${testId}"]`);
  }

  /**
   * Get text from element by test ID
   * @param {object} browser - NightWatch browser instance
   * @param {string} testId - The data-testid value
   * @param {function} callback - Callback to handle the text
   */
  static getTextByTestId(browser, testId, callback) {
    return browser
      .waitForElementPresent(`[data-testid="${testId}"]`, 5000)
      .getText(`[data-testid="${testId}"]`, callback);
  }

  /**
   * Take screenshot for e2e tests
   * @param {object} browser - NightWatch browser instance
   * @param {string} filename - Screenshot filename
   */
  static takeScreenshot(browser, filename) {
    if (process.env.CI || process.env.SKIP_SCREENSHOTS) {
      return browser;
    }
    return browser.saveScreenshot(`test-results/nightwatch-e2e/${filename}`);
  }

  /**
   * Check if element is enabled
   * @param {object} browser - NightWatch browser instance
   * @param {string} testId - The data-testid value
   * @param {function} callback - Callback to handle the enabled state
   */
  static isElementEnabled(browser, testId, callback) {
    return browser
      .waitForElementPresent(`[data-testid="${testId}"]`, 5000)
      .isEnabled(`[data-testid="${testId}"]`, callback);
  }

  /**
   * Check if element is visible by test ID
   * @param {object} browser - NightWatch browser instance
   * @param {string} testId - The data-testid value
   * @param {function} callback - Callback to handle visibility
   */
  static isElementVisible(browser, testId, callback) {
    return browser
      .waitForElementPresent(`[data-testid="${testId}"]`, 5000)
      .isVisible(`[data-testid="${testId}"]`, callback);
  }

  /**
   * Assert text contains
   * @param {object} browser - NightWatch browser instance
   * @param {string} testId - The data-testid value
   * @param {string} expectedText - Expected text content
   */
  static assertTextContains(browser, testId, expectedText) {
    return browser
      .waitForElementPresent(`[data-testid="${testId}"]`, 5000)
      .assert.textContains(`[data-testid="${testId}"]`, expectedText);
  }

  /**
   * Assert text matches regex
   * @param {object} browser - NightWatch browser instance
   * @param {string} testId - The data-testid value
   * @param {RegExp} pattern - Regex pattern to match
   */
  static assertTextMatches(browser, testId, pattern) {
    return browser
      .waitForElementPresent(`[data-testid="${testId}"]`, 5000)
      .assert.textMatches(`[data-testid="${testId}"]`, pattern);
  }

  /**
   * Wait for page title to contain text
   * @param {object} browser - NightWatch browser instance
   * @param {string} expectedTitle - Expected title text
   */
  static waitForTitle(browser, expectedTitle) {
    return browser.waitUntil(function() {
      return this.getTitle(function(title) {
        return title.includes(expectedTitle);
      });
    }, 5000);
  }

  /**
   * Set window size for responsive testing
   * @param {object} browser - NightWatch browser instance
   * @param {number} width - Window width
   * @param {number} height - Window height
   */
  static setWindowSize(browser, width, height) {
    return browser.windowSize('current', width, height);
  }

  /**
   * Execute JavaScript in browser
   * @param {object} browser - NightWatch browser instance
   * @param {string} script - JavaScript code to execute
   * @param {Array} args - Arguments to pass to script
   */
  static executeScript(browser, script, args = []) {
    return browser.execute(script, args);
  }

  /**
   * Send keys to element
   * @param {object} browser - NightWatch browser instance
   * @param {string} selector - Element selector
   * @param {string|Array} keys - Keys to send
   */
  static sendKeys(browser, selector, keys) {
    return browser
      .waitForElementPresent(selector, 5000)
      .sendKeys(selector, keys);
  }

  /**
   * Wait and pause for UI updates
   * @param {object} browser - NightWatch browser instance
   * @param {number} ms - Milliseconds to pause
   */
  static pause(browser, ms = 500) {
    return browser.pause(ms);
  }
}

module.exports = NightWatchE2EUtils;