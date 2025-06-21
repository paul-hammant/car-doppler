import { Builder, By, WebDriver, until } from 'selenium-webdriver';
import * as firefox from 'selenium-webdriver/firefox';
import * as fs from 'fs';
import * as path from 'path';

// Ensure geckodriver is in the PATH
const geckoDriverPath = require('geckodriver').path;
const service = new firefox.ServiceBuilder(geckoDriverPath);

/**
 * Initializes and returns a new Selenium WebDriver instance for Firefox.
 */
export async function getDriver(): Promise<WebDriver> {
  const options = new firefox.Options();
  if (!process.env.HEADED && !process.env.CI) {
    options.addArguments('--headless');
  }
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  
  // Set Firefox binary path to regular Firefox (not ESR)
  options.setBinary('/usr/bin/firefox');
  
  // Performance optimizations
  options.setPreference('media.navigator.permission.disabled', true);
  options.setPreference('media.navigator.streams.fake', true);
  options.setPreference('dom.webnotifications.enabled', false);
  options.setPreference('dom.push.enabled', false);
  options.setPreference('browser.cache.disk.enable', false);
  options.setPreference('browser.cache.memory.enable', false);
  options.setPreference('browser.sessionstore.max_tabs_undo', 0);
  options.setPreference('browser.sessionstore.max_windows_undo', 0);

  const driver = await new Builder()
    .forBrowser('firefox')
    .setFirefoxService(service)
    .setFirefoxOptions(options)
    .build();
  
  // Set implicit wait for faster element finding
  await driver.manage().setTimeouts({ implicit: 5000 });
  
  return driver;
}

/**
 * Gets the shared driver instance from global scope, or creates one if needed
 */
export async function getSharedDriver(): Promise<WebDriver> {
  if (!(global as any).__SELENIUM_DRIVER__) {
    (global as any).__SELENIUM_DRIVER__ = await getDriver();
  }
  return (global as any).__SELENIUM_DRIVER__;
}

/**
 * Cleans up the shared driver instance
 */
export async function cleanupSharedDriver(): Promise<void> {
  if ((global as any).__SELENIUM_DRIVER__) {
    try {
      await (global as any).__SELENIUM_DRIVER__.quit();
    } catch (error) {
      // Driver may already be closed, ignore the error
      console.log('Driver cleanup: session already closed or invalid');
    } finally {
      (global as any).__SELENIUM_DRIVER__ = null;
    }
  }
}

/**
 * Gets the shared E2E driver instance from global scope
 */
export async function getSharedE2EDriver(): Promise<WebDriver> {
  if (!(global as any).__SELENIUM_E2E_DRIVER__) {
    (global as any).__SELENIUM_E2E_DRIVER__ = await getDriver();
  }
  return (global as any).__SELENIUM_E2E_DRIVER__;
}

/**
 * Cleans up the shared E2E driver instance
 */
export async function cleanupSharedE2EDriver(): Promise<void> {
  if ((global as any).__SELENIUM_E2E_DRIVER__) {
    await (global as any).__SELENIUM_E2E_DRIVER__.quit();
    (global as any).__SELENIUM_E2E_DRIVER__ = null;
  }
}

/**
 * Quits the provided WebDriver instance.
 * @param driver The WebDriver instance to quit.
 */
export async function quitDriver(driver: WebDriver): Promise<void> {
  if (driver) {
    await driver.quit();
  }
}

/**
 * Finds an element by its data-testid attribute with explicit wait.
 * @param driver The WebDriver instance.
 * @param testId The data-testid value.
 */
export async function findElementByTestId(driver: WebDriver, testId: string) {
  const startTime = Date.now();
  const selector = By.css(`[data-testid="${testId}"]`);
  await driver.wait(until.elementLocated(selector), 5000);
  const element = driver.findElement(selector);
  const endTime = Date.now();
  if (process.env.DEBUG_TIMING) {
    console.log(`[TIMING] findElementByTestId(${testId}): ${endTime - startTime}ms`);
  }
  return element;
}

/**
 * Clicks an element identified by its data-testid attribute.
 * @param driver The WebDriver instance.
 * @param testId The data-testid value.
 */
export async function clickElementByTestId(driver: WebDriver, testId: string): Promise<void> {
  const element = await findElementByTestId(driver, testId);
  await driver.wait(until.elementIsEnabled(element), 5000);
  await element.click();
}

/**
 * Gets the text content of an element identified by its data-testid attribute.
 * @param driver The WebDriver instance.
 * @param testId The data-testid value.
 */
export async function getTextByTestId(driver: WebDriver, testId: string): Promise<string> {
  const element = await findElementByTestId(driver, testId);
  return element.getText();
}

/**
 * Checks if an element identified by its data-testid attribute is visible.
 * @param driver The WebDriver instance.
 * @param testId The data-testid value.
 */
export async function isElementVisibleByTestId(driver: WebDriver, testId: string): Promise<boolean> {
  try {
    const element = await findElementByTestId(driver, testId);
    return element.isDisplayed();
  } catch (error) {
    // If element is not found, it's not visible
    return false;
  }
}

/**
 * Takes a screenshot and saves it to the specified file path.
 * Ensures the directory exists before saving.
 * @param driver The WebDriver instance.
 * @param filePath The full path (including filename) where the screenshot should be saved.
 */
export async function takeScreenshot(driver: WebDriver, filePath: string): Promise<void> {
  const startTime = Date.now();
  // Skip screenshots in CI or when SKIP_SCREENSHOTS env var is set
  if (process.env.CI || process.env.SKIP_SCREENSHOTS) {
    return;
  }
  
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  const image = await driver.takeScreenshot();
  fs.writeFileSync(filePath, image, 'base64');
  const endTime = Date.now();
  if (process.env.DEBUG_TIMING) {
    console.log(`[TIMING] takeScreenshot: ${endTime - startTime}ms`);
  }
}

/**
 * Navigate to the test mounter page (only once per test suite)
 */
export async function navigateToTestMounter(driver: WebDriver): Promise<void> {
  await driver.get('http://localhost:3001/test-mounter');
  // Wait for the test mounter to be ready
  await driver.wait(until.elementLocated(By.id('root')), 10000);
  // Wait for the test mounter JavaScript to load
  await driver.wait(async () => {
    return await driver.executeScript('return window.testMounterReady === true;');
  }, 5000);
}

/**
 * Mount a component dynamically using the test mounter
 */
export async function mountComponent(driver: WebDriver, componentName: string, props: Record<string, any> = {}): Promise<void> {
  const propsString = JSON.stringify(props);
  const result = await driver.executeScript(`
    return window.mountComponent('${componentName}', ${propsString});
  `);
  
  if (!result) {
    throw new Error(`Failed to mount component ${componentName}`);
  }
  
  // Wait for the component to be mounted
  await driver.wait(until.elementLocated(By.css('[data-testid="test-name"]')), 5000);
}
