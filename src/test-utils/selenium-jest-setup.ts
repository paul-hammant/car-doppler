import { WebDriver } from 'selenium-webdriver';
import { getDriver, quitDriver } from './selenium-utils';

let globalDriver: WebDriver | null = null;

beforeAll(async () => {
  // Create a single driver instance for all tests
  globalDriver = await getDriver();
  
  // Make driver available globally
  (global as any).__SELENIUM_DRIVER__ = globalDriver;
}, 10000);

afterAll(async () => {
  if (globalDriver) {
    await quitDriver(globalDriver);
    globalDriver = null;
    (global as any).__SELENIUM_DRIVER__ = null;
  }
}, 5000);