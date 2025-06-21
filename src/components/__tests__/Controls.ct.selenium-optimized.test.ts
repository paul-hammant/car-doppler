import { WebDriver } from 'selenium-webdriver';
import {
  getSharedDriver,
  findElementByTestId,
  clickElementByTestId,
  getTextByTestId,
  takeScreenshot
} from '../../test-utils/selenium-utils';

describe('Controls Component - Optimized Selenium Tests', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await getSharedDriver();
    // Navigate to test harness once for all tests
    await driver.get('http://localhost:3001/render-component/ControlsTestHarness?testName=Initial');
    await findElementByTestId(driver, 'test-name');
  });

  test('renders in test harness with initial state visible', async () => {
    await driver.get(`http://localhost:3001/render-component/ControlsTestHarness?testName=${encodeURIComponent('Initial State Visibility')}`);
    await findElementByTestId(driver, 'test-name');

    await takeScreenshot(driver, 'test-results/selenium/Controls-initial-state-optimized.png');

    // Assert on the COMPONENT
    expect(await getTextByTestId(driver, 'record-button')).toContain('Start');
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('mph');

    // Assert on the TEST HARNESS state
    expect(await getTextByTestId(driver, 'harness-recording-state')).toContain('Recording: OFF');
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('Units: METRIC (km/h)');
    expect(await getTextByTestId(driver, 'test-name')).toContain('Initial State Visibility');
  });

  test('demonstrates event coupling - recording toggle', async () => {
    await driver.get(`http://localhost:3001/render-component/ControlsTestHarness?testName=${encodeURIComponent('Recording Toggle Event Coupling')}`);
    await findElementByTestId(driver, 'test-name');

    await takeScreenshot(driver, 'test-results/selenium/Controls-recording-toggle-before-optimized.png');

    // Initial state assertions
    expect(await getTextByTestId(driver, 'record-button')).toContain('Start');
    expect(await getTextByTestId(driver, 'harness-recording-state')).toContain('OFF');
    expect(await getTextByTestId(driver, 'event-log')).toContain('No events yet...');

    // Click the record button
    await clickElementByTestId(driver, 'record-button');

    await takeScreenshot(driver, 'test-results/selenium/Controls-recording-toggle-started-optimized.png');

    // Assert on COMPONENT state change
    expect(await getTextByTestId(driver, 'record-button')).toContain('Stop');
    // Assert on TEST HARNESS state change
    expect(await getTextByTestId(driver, 'harness-recording-state')).toContain('Recording: ON');
    // Assert on EVENT COUPLING trace
    expect(await getTextByTestId(driver, 'event-log')).toContain('Recording started');

    // Toggle back
    await clickElementByTestId(driver, 'record-button');

    await takeScreenshot(driver, 'test-results/selenium/Controls-recording-toggle-stopped-optimized.png');

    // Final state assertions
    expect(await getTextByTestId(driver, 'record-button')).toContain('Start');
    expect(await getTextByTestId(driver, 'harness-recording-state')).toContain('Recording: OFF');
    expect(await getTextByTestId(driver, 'event-log')).toContain('Recording stopped');
  });

  test('demonstrates event coupling - units toggle', async () => {
    await driver.get(`http://localhost:3001/render-component/ControlsTestHarness?testName=${encodeURIComponent('Units Toggle Event Coupling')}`);
    await findElementByTestId(driver, 'test-name');

    await takeScreenshot(driver, 'test-results/selenium/Controls-units-toggle-before-optimized.png');

    // Initial state
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('mph');
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('METRIC (km/h)');

    // Click to switch to imperial
    await clickElementByTestId(driver, 'unit-toggle-button');

    await takeScreenshot(driver, 'test-results/selenium/Controls-units-toggle-imperial-optimized.png');

    // Component updated
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('km/h');
    // Harness state updated
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('IMPERIAL (mph)');
    // Event was logged
    expect(await getTextByTestId(driver, 'event-log')).toContain('Units changed to imperial');

    // Switch back
    await clickElementByTestId(driver, 'unit-toggle-button');

    await takeScreenshot(driver, 'test-results/selenium/Controls-units-toggle-metric-optimized.png');

    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('mph');
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('METRIC (km/h)');
    expect(await getTextByTestId(driver, 'event-log')).toContain('Units changed to metric');
  });

  test('shows processing state affecting component', async () => {
    await driver.get(`http://localhost:3001/render-component/ControlsTestHarness?testName=${encodeURIComponent('Processing State Test')}&initialProcessing=true`);
    await findElementByTestId(driver, 'test-name');

    await takeScreenshot(driver, 'test-results/selenium/Controls-processing-state-optimized.png');

    const recordButton = await findElementByTestId(driver, 'record-button');
    const unitToggleButton = await findElementByTestId(driver, 'unit-toggle-button');

    // Check if elements are disabled
    expect(await recordButton.isEnabled()).toBe(false);
    expect(await unitToggleButton.isEnabled()).toBe(false);

    // Harness shows processing state
    expect(await getTextByTestId(driver, 'harness-processing-state')).toContain('Processing: YES');
  });

  test('complex scenario - multiple interactions with full trace', async () => {
    await driver.get(`http://localhost:3001/render-component/ControlsTestHarness?testName=${encodeURIComponent('Complex Multi-Interaction Scenario')}`);
    await findElementByTestId(driver, 'test-name');

    await takeScreenshot(driver, 'test-results/selenium/Controls-complex-scenario-start-optimized.png');

    await clickElementByTestId(driver, 'record-button');
    await clickElementByTestId(driver, 'unit-toggle-button');

    await takeScreenshot(driver, 'test-results/selenium/Controls-complex-scenario-mid-optimized.png');

    await clickElementByTestId(driver, 'record-button');
    await clickElementByTestId(driver, 'unit-toggle-button');

    await takeScreenshot(driver, 'test-results/selenium/Controls-complex-scenario-final-optimized.png');

    expect(await getTextByTestId(driver, 'record-button')).toContain('Start');
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('mph');
    expect(await getTextByTestId(driver, 'harness-recording-state')).toContain('OFF');
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('METRIC');
    expect(await getTextByTestId(driver, 'event-log')).toContain('Recording started');
    expect(await getTextByTestId(driver, 'event-log')).toContain('Units changed to imperial');
    expect(await getTextByTestId(driver, 'event-log')).toContain('Recording stopped');
    expect(await getTextByTestId(driver, 'event-log')).toContain('Units changed to metric');
  });
});