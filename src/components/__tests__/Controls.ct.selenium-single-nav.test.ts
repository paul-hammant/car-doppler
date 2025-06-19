import { WebDriver } from 'selenium-webdriver';
import {
  getSharedDriver,
  findElementByTestId,
  clickElementByTestId,
  getTextByTestId,
  takeScreenshot
} from '../../test-utils/selenium-utils';

const HARNESS_BASE_URL = 'http://localhost:3001/render-component';

describe('Controls Component - Single Navigation Selenium Tests', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = getSharedDriver();
    // Navigate once to any test harness page - we'll reuse this browser tab
    await driver.get(`${HARNESS_BASE_URL}/ControlsTestHarness?testName=SingleNavigation`);
    await findElementByTestId(driver, 'test-name');
  });

  // Helper function to update the current page instead of navigating
  const updateTestHarness = async (testName: string, initialProps: Record<string, any> = {}) => {
    const params = new URLSearchParams({ testName, ...initialProps }).toString();
    const newUrl = `${HARNESS_BASE_URL}/ControlsTestHarness?${params}`;
    
    // Use window.location.replace to avoid back button issues but still faster than navigate
    await driver.executeScript(`window.location.replace('${newUrl}');`);
    
    // Wait for the new content to load
    await findElementByTestId(driver, 'test-name');
  };

  test('renders in test harness with initial state visible', async () => {
    await updateTestHarness('Initial State Visibility');

    await takeScreenshot(driver, 'test-results/selenium/Controls-initial-state-single-nav.png');

    // Assert on the COMPONENT
    expect(await getTextByTestId(driver, 'record-button')).toContain('Start');
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('mph');

    // Assert on the TEST HARNESS state
    expect(await getTextByTestId(driver, 'harness-recording-state')).toContain('Recording: OFF');
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('Units: METRIC (km/h)');
    expect(await getTextByTestId(driver, 'test-name')).toContain('Initial State Visibility');
  });

  test('demonstrates event coupling - recording toggle', async () => {
    await updateTestHarness('Recording Toggle Event Coupling');

    await takeScreenshot(driver, 'test-results/selenium/Controls-recording-toggle-before-single-nav.png');

    // Initial state assertions
    expect(await getTextByTestId(driver, 'record-button')).toContain('Start');
    expect(await getTextByTestId(driver, 'harness-recording-state')).toContain('OFF');
    expect(await getTextByTestId(driver, 'event-log')).toContain('No events yet...');

    // Click the record button
    await clickElementByTestId(driver, 'record-button');

    await takeScreenshot(driver, 'test-results/selenium/Controls-recording-toggle-started-single-nav.png');

    // Assert on COMPONENT state change
    expect(await getTextByTestId(driver, 'record-button')).toContain('Stop');
    // Assert on TEST HARNESS state change
    expect(await getTextByTestId(driver, 'harness-recording-state')).toContain('Recording: ON');
    // Assert on EVENT COUPLING trace
    expect(await getTextByTestId(driver, 'event-log')).toContain('Recording started');

    // Toggle back
    await clickElementByTestId(driver, 'record-button');

    await takeScreenshot(driver, 'test-results/selenium/Controls-recording-toggle-stopped-single-nav.png');

    // Final state assertions
    expect(await getTextByTestId(driver, 'record-button')).toContain('Start');
    expect(await getTextByTestId(driver, 'harness-recording-state')).toContain('Recording: OFF');
    expect(await getTextByTestId(driver, 'event-log')).toContain('Recording stopped');
  });

  test('demonstrates event coupling - units toggle', async () => {
    await updateTestHarness('Units Toggle Event Coupling');

    await takeScreenshot(driver, 'test-results/selenium/Controls-units-toggle-before-single-nav.png');

    // Initial state
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('mph');
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('METRIC (km/h)');

    // Click to switch to imperial
    await clickElementByTestId(driver, 'unit-toggle-button');

    await takeScreenshot(driver, 'test-results/selenium/Controls-units-toggle-imperial-single-nav.png');

    // Component updated
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('km/h');
    // Harness state updated
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('IMPERIAL (mph)');
    // Event was logged
    expect(await getTextByTestId(driver, 'event-log')).toContain('Units changed to imperial');

    // Switch back
    await clickElementByTestId(driver, 'unit-toggle-button');

    await takeScreenshot(driver, 'test-results/selenium/Controls-units-toggle-metric-single-nav.png');

    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('mph');
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('METRIC (km/h)');
    expect(await getTextByTestId(driver, 'event-log')).toContain('Units changed to metric');
  });

  test('shows processing state affecting component', async () => {
    await updateTestHarness('Processing State Test', { initialProcessing: 'true' });

    await takeScreenshot(driver, 'test-results/selenium/Controls-processing-state-single-nav.png');

    const recordButton = await findElementByTestId(driver, 'record-button');
    const unitToggleButton = await findElementByTestId(driver, 'unit-toggle-button');

    // Check if elements are disabled
    expect(await recordButton.isEnabled()).toBe(false);
    expect(await unitToggleButton.isEnabled()).toBe(false);

    // Harness shows processing state
    expect(await getTextByTestId(driver, 'harness-processing-state')).toContain('Processing: YES');
  });

  test('complex scenario - multiple interactions with full trace', async () => {
    await updateTestHarness('Complex Multi-Interaction Scenario');

    await takeScreenshot(driver, 'test-results/selenium/Controls-complex-scenario-start-single-nav.png');

    await clickElementByTestId(driver, 'record-button');
    await clickElementByTestId(driver, 'unit-toggle-button');

    await takeScreenshot(driver, 'test-results/selenium/Controls-complex-scenario-mid-single-nav.png');

    await clickElementByTestId(driver, 'record-button');
    await clickElementByTestId(driver, 'unit-toggle-button');

    await takeScreenshot(driver, 'test-results/selenium/Controls-complex-scenario-final-single-nav.png');

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