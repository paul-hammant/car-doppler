import { WebDriver } from 'selenium-webdriver';
import {
  getSharedDriver,
  findElementByTestId,
  getTextByTestId,
  takeScreenshot
} from '../../test-utils/selenium-utils';

describe('Controls Component - Performance Tests', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await getSharedDriver();
    // Navigate to test harness once for all tests
    await driver.get('http://localhost:3001/render-component/ControlsTestHarness?testName=Initial');
    await findElementByTestId(driver, 'test-name');
  });

  test('renders in test harness with initial state visible - 100x with screenshots', async () => {
    const startTime = Date.now();
    
    for (let i = 0; i < 100; i++) {
      await driver.get(`http://localhost:3001/render-component/ControlsTestHarness?testName=${encodeURIComponent(`Initial State Visibility Run ${i + 1}`)}`);
      await findElementByTestId(driver, 'test-name');

      await takeScreenshot(driver, `test-results/selenium/Controls-initial-state-optimized-${i + 1}.png`);

      // Assert on the COMPONENT
      expect(await getTextByTestId(driver, 'record-button')).toContain('Start');
      expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('mph');

      // Assert on the TEST HARNESS state
      expect(await getTextByTestId(driver, 'harness-recording-state')).toContain('Recording: OFF');
      expect(await getTextByTestId(driver, 'harness-units-state')).toContain('Units: METRIC (km/h)');
      expect(await getTextByTestId(driver, 'test-name')).toContain(`Initial State Visibility Run ${i + 1}`);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / 100;
    const testsPerSecond = (100 / (totalTime / 1000)).toFixed(2);
    console.log(`100 iterations with screenshots: ${totalTime}ms total, ${avgTime.toFixed(2)}ms average per test, ${testsPerSecond} tests/sec`);
  });

  test('renders in test harness with initial state visible - 100x without screenshots', async () => {
    const startTime = Date.now();
    
    for (let i = 0; i < 100; i++) {
      await driver.get(`http://localhost:3001/render-component/ControlsTestHarness?testName=${encodeURIComponent(`Initial State Visibility No Screenshot Run ${i + 1}`)}`);
      await findElementByTestId(driver, 'test-name');

      // Assert on the COMPONENT
      expect(await getTextByTestId(driver, 'record-button')).toContain('Start');
      expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('mph');

      // Assert on the TEST HARNESS state
      expect(await getTextByTestId(driver, 'harness-recording-state')).toContain('Recording: OFF');
      expect(await getTextByTestId(driver, 'harness-units-state')).toContain('Units: METRIC (km/h)');
      expect(await getTextByTestId(driver, 'test-name')).toContain(`Initial State Visibility No Screenshot Run ${i + 1}`);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / 100;
    const testsPerSecond = (100 / (totalTime / 1000)).toFixed(2);
    console.log(`100 iterations without screenshots: ${totalTime}ms total, ${avgTime.toFixed(2)}ms average per test, ${testsPerSecond} tests/sec`);
  });
});