import { WebDriver } from 'selenium-webdriver';
import { getDriver, quitDriver } from './selenium-utils';

let globalE2EDriver: WebDriver | null = null;

beforeAll(async () => {
  // Create a single driver instance for all E2E tests
  globalE2EDriver = await getDriver();
  
  // Make driver available globally for E2E tests
  (global as any).__SELENIUM_E2E_DRIVER__ = globalE2EDriver;
}, 60000);

afterAll(async () => {
  if (globalE2EDriver) {
    await quitDriver(globalE2EDriver);
    globalE2EDriver = null;
    (global as any).__SELENIUM_E2E_DRIVER__ = null;
  }
}, 10000);