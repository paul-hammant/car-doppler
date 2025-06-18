import { getDriver, takeScreenshot, quitDriver } from './src/test-utils/selenium-utils';
import { WebDriver } from 'selenium-webdriver';

async function debugScreenshot() {
  let driver: WebDriver | null = null;
  try {
    driver = await getDriver();
    await driver.get('http://localhost:3001/render-component/ControlsTestHarness?testName=Debug');
    await takeScreenshot(driver, 'test-results/selenium/debug_failure_screenshot.png');
    console.log('Debug screenshot taken.');
  } catch (e) {
    console.error('Failed to take debug screenshot:', e);
  } finally {
    if (driver) {
      await quitDriver(driver);
    }
  }
}
debugScreenshot();
