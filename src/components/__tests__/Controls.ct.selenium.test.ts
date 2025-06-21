import { WebDriver } from 'selenium-webdriver';
import {
  getSharedDriver,
  findElementByTestId,
  clickElementByTestId,
  getTextByTestId,
  takeScreenshot
} from '../../test-utils/selenium-utils';

const HARNESS_BASE_URL = 'http://localhost:3001/render-component';

describe('Controls Component - Selenium Tests', () => {
  let driver: WebDriver;

  beforeAll(async () => {
    driver = await getSharedDriver();
    // Navigate once to any test harness page - we'll reuse this browser tab
    await driver.get(`${HARNESS_BASE_URL}/ControlsTestHarness?testName=Initial`);
    await findElementByTestId(driver, 'test-name');
  });

  // Helper function to update the current page instead of full navigation
  const loadTestHarness = async (testName: string, initialProps: Record<string, any> = {}) => {
    const params = new URLSearchParams({ testName, ...initialProps }).toString();
    const newUrl = `${HARNESS_BASE_URL}/ControlsTestHarness?${params}`;
    
    // Use window.location.replace for faster page updates
    await driver.executeScript(`window.location.replace('${newUrl}');`);
    
    // Wait for the new content to load
    await findElementByTestId(driver, 'test-name');
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

    await takeScreenshot(driver, 'test-results/selenium/Controls-recording-toggle-started.png');

    // Assert on COMPONENT state change
    expect(await getTextByTestId(driver, 'record-button')).toContain('Stop');
    // Assert on TEST HARNESS state change
    expect(await getTextByTestId(driver, 'harness-recording-state')).toContain('Recording: ON');
    // Assert on EVENT COUPLING trace
    expect(await getTextByTestId(driver, 'event-log')).toContain('Recording started');

    // Toggle back
    await clickElementByTestId(driver, 'record-button');

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

    await takeScreenshot(driver, 'test-results/selenium/Controls-units-toggle-imperial.png');

    // Component updated
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('km/h');
    // Harness state updated
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('IMPERIAL (mph)');
    // Event was logged
    expect(await getTextByTestId(driver, 'event-log')).toContain('Units changed to imperial');

    // Switch back
    await clickElementByTestId(driver, 'unit-toggle-button');

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

    // Verify initial state
    expect(await getTextByTestId(driver, 'record-button')).toContain('Start');
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('mph');

    await clickElementByTestId(driver, 'record-button');
    await clickElementByTestId(driver, 'unit-toggle-button');

    await takeScreenshot(driver, 'test-results/selenium/Controls-complex-scenario-mid.png');

    await clickElementByTestId(driver, 'record-button');
    await clickElementByTestId(driver, 'unit-toggle-button');

    await takeScreenshot(driver, 'test-results/selenium/Controls-complex-scenario-final.png');

    // Final state should be back to initial
    expect(await getTextByTestId(driver, 'record-button')).toContain('Start');
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('mph');
    expect(await getTextByTestId(driver, 'harness-recording-state')).toContain('OFF');
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('METRIC');
    
    // Verify event log contains all events
    const eventLog = await getTextByTestId(driver, 'event-log');
    expect(eventLog).toContain('Recording started');
    expect(eventLog).toContain('Units changed to imperial');
    expect(eventLog).toContain('Recording stopped');
    expect(eventLog).toContain('Units changed to metric');
  });
});
