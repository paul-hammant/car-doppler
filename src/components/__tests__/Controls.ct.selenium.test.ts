import { WebDriver } from 'selenium-webdriver';
import {
  getDriver,
  quitDriver,
  findElementByTestId,
  clickElementByTestId,
  getTextByTestId,
  takeScreenshot
} from '../../test-utils/selenium-utils'; // Assuming this path is correct relative to the test file

// Placeholder URL for where the TestHarness component would be served
// This will need to be replaced with the actual URL once the serving mechanism is set up.
const HARNESS_BASE_URL = 'http://localhost:3001/render-component'; // Example port

describe('Controls Component - Selenium Tests', () => {
  let driver: WebDriver;

  beforeEach(async () => {
    driver = await getDriver();
  });

  afterEach(async () => {
    await quitDriver(driver);
  });

  // Helper function to navigate to the test harness page for a specific test
  const loadTestHarness = async (testName: string, initialProps: Record<string, any> = {}) => {
    // This is a simplified representation. In a real setup, props might be passed via query params
    // or the server would need to render different harnesses based on the path/params.
    // For now, we assume a generic harness page and the test will adapt.
    // A more robust solution would involve a dedicated dev server that can render components on demand.
    const params = new URLSearchParams({ testName, ...initialProps }).toString();
    await driver.get(`${HARNESS_BASE_URL}/ControlsTestHarness?${params}`);
    // Add a small delay to ensure the component is loaded, replace with explicit waits if possible
    await driver.sleep(500);
  };

  test('renders in test harness with initial state visible', async () => {
    await loadTestHarness('Initial State Visibility');

    await takeScreenshot(driver, 'test-results/selenium/Controls-initial-state.png');

    // Assert on the COMPONENT
    expect(await getTextByTestId(driver, 'record-button')).toContain('Start');
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('mph');

    // Assert on the TEST HARNESS state
    expect(await getTextByTestId(driver, 'harness-recording-state')).toContain('Recording: OFF');
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('Units: METRIC (km/h)');
    expect(await getTextByTestId(driver, 'test-name')).toContain('Initial State Visibility');
  });

  test('demonstrates event coupling - recording toggle', async () => {
    await loadTestHarness('Recording Toggle Event Coupling');

    await takeScreenshot(driver, 'test-results/selenium/Controls-recording-toggle-before.png');

    // Initial state assertions
    expect(await getTextByTestId(driver, 'record-button')).toContain('Start');
    expect(await getTextByTestId(driver, 'harness-recording-state')).toContain('OFF');
    expect(await getTextByTestId(driver, 'event-log')).toContain('No events yet...');

    // Click the record button
    await clickElementByTestId(driver, 'record-button');
    await driver.sleep(100); // Allow time for UI update

    await takeScreenshot(driver, 'test-results/selenium/Controls-recording-toggle-started.png');

    // Assert on COMPONENT state change
    expect(await getTextByTestId(driver, 'record-button')).toContain('Stop');
    // Assert on TEST HARNESS state change
    expect(await getTextByTestId(driver, 'harness-recording-state')).toContain('Recording: ON');
    // Assert on EVENT COUPLING trace
    expect(await getTextByTestId(driver, 'event-log')).toContain('Recording started');

    // Toggle back
    await clickElementByTestId(driver, 'record-button');
    await driver.sleep(100); // Allow time for UI update

    await takeScreenshot(driver, 'test-results/selenium/Controls-recording-toggle-stopped.png');

    // Final state assertions
    expect(await getTextByTestId(driver, 'record-button')).toContain('Start');
    expect(await getTextByTestId(driver, 'harness-recording-state')).toContain('Recording: OFF');
    expect(await getTextByTestId(driver, 'event-log')).toContain('Recording stopped');
  });

  test('demonstrates event coupling - units toggle', async () => {
    await loadTestHarness('Units Toggle Event Coupling');

    await takeScreenshot(driver, 'test-results/selenium/Controls-units-toggle-before.png');

    // Initial state
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('mph');
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('METRIC (km/h)');

    // Click to switch to imperial
    await clickElementByTestId(driver, 'unit-toggle-button');
    await driver.sleep(100);

    await takeScreenshot(driver, 'test-results/selenium/Controls-units-toggle-imperial.png');

    // Component updated
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('km/h');
    // Harness state updated
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('IMPERIAL (mph)');
    // Event was logged
    expect(await getTextByTestId(driver, 'event-log')).toContain('Units changed to imperial');

    // Switch back
    await clickElementByTestId(driver, 'unit-toggle-button');
    await driver.sleep(100);

    await takeScreenshot(driver, 'test-results/selenium/Controls-units-toggle-metric.png');

    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('mph');
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('METRIC (km/h)');
    expect(await getTextByTestId(driver, 'event-log')).toContain('Units changed to metric');
  });

  test('shows processing state affecting component', async () => {
    // This test requires passing initial props to the harness.
    // The loadTestHarness function needs to be able to pass these to the rendering server.
    // For now, this test will likely fail or test the default (non-processing) state
    // until the harness serving mechanism is more robust.
    await loadTestHarness('Processing State Test', { initialProcessing: 'true' });

    await takeScreenshot(driver, 'test-results/selenium/Controls-processing-state.png');

    const recordButton = await findElementByTestId(driver, 'record-button');
    const unitToggleButton = await findElementByTestId(driver, 'unit-toggle-button');

    // Check if elements are disabled
    // Selenium's isEnabled() returns true if the element is enabled, false otherwise.
    expect(await recordButton.isEnabled()).toBe(false);
    expect(await unitToggleButton.isEnabled()).toBe(false);

    // Harness shows processing state
    expect(await getTextByTestId(driver, 'harness-processing-state')).toContain('Processing: YES');
  });

  test('complex scenario - multiple interactions with full trace', async () => {
    await loadTestHarness('Complex Multi-Interaction Scenario');

    await takeScreenshot(driver, 'test-results/selenium/Controls-complex-scenario-start.png');

    await clickElementByTestId(driver, 'record-button');
    await driver.sleep(50);
    await clickElementByTestId(driver, 'unit-toggle-button');
    await driver.sleep(50);

    await takeScreenshot(driver, 'test-results/selenium/Controls-complex-scenario-mid.png');

    await clickElementByTestId(driver, 'record-button');
    await driver.sleep(50);
    await clickElementByTestId(driver, 'unit-toggle-button');
    await driver.sleep(50);

    await takeScreenshot(driver, 'test-results/selenium/Controls-complex-scenario-final.png');

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
