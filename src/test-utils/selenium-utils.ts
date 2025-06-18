import { Builder, By, WebDriver } from 'selenium-webdriver';
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
  options.addArguments('--headless');
  // Attempt to auto-grant microphone permissions or bypass prompts
  // Firefox preferences are different from Chrome's
  options.setPreference('media.navigator.permission.disabled', true);
  options.setPreference('media.navigator.streams.fake', true);

  const driver = await new Builder()
    .forBrowser('firefox')
    .setFirefoxService(service)
    .setFirefoxOptions(options)
    .build();
  return driver;
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
 * Finds an element by its data-testid attribute.
 * @param driver The WebDriver instance.
 * @param testId The data-testid value.
 */
export async function findElementByTestId(driver: WebDriver, testId: string) {
  return driver.findElement(By.css(`[data-testid="${testId}"]`));
}

/**
 * Clicks an element identified by its data-testid attribute.
 * @param driver The WebDriver instance.
 * @param testId The data-testid value.
 */
export async function clickElementByTestId(driver: WebDriver, testId: string): Promise<void> {
  const element = await findElementByTestId(driver, testId);
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
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  const image = await driver.takeScreenshot();
  fs.writeFileSync(filePath, image, 'base64');
  console.log(`Screenshot saved to ${filePath}`);
}
