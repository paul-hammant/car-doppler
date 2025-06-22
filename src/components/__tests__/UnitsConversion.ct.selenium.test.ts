import { WebDriver } from 'selenium-webdriver';
import {
  getSharedDriver,
  findElementByTestId,
  clickElementByTestId,
  getTextByTestId,
  takeScreenshot
} from '../../test-utils/selenium-utils';

const HARNESS_BASE_URL = 'http://localhost:3001/render-component';

describe('Units Conversion - Selenium Tests', () => {
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

  beforeEach(async () => {
    await loadTestHarness('Initial');
  });

  test('demonstrates mph → km/h → mph conversion cycle with full visibility', async () => {

    await takeScreenshot(driver, 'test-results/selenium/UnitsConversion-cycle-initial-metric.png');

    // === INITIAL STATE: mph (metric mode, showing imperial target) ===
    expect(await getTextByTestId(driver, 'test-name')).toContain('Initial');
    
    // Component shows: "Switch to mph" (because we're in metric mode)
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('Switch to');
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('mph');
    
    // Harness state shows: METRIC (km/h) 
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('Units: METRIC (km/h)');
    
    // Event log is empty
    expect(await getTextByTestId(driver, 'event-log')).toContain('No events yet...');

    // === FIRST CLICK: mph → km/h (metric to imperial) ===
    const unitToggleButton = await findElementByTestId(driver, 'unit-toggle-button');
    await unitToggleButton.click();
    
    await takeScreenshot(driver, 'test-results/selenium/UnitsConversion-cycle-switched-imperial.png');

    // Component now shows: "Switch to km/h" (because we're in imperial mode)
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('Switch to');
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('km/h');
    
    // Harness state updated via event coupling
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('Units: IMPERIAL (mph)');
    
    // Event was logged
    expect(await getTextByTestId(driver, 'event-log')).toContain('Units changed to imperial');

    // === SECOND CLICK: km/h → mph (imperial back to metric) ===
    await unitToggleButton.click();
    
    await takeScreenshot(driver, 'test-results/selenium/UnitsConversion-cycle-back-to-metric.png');

    // Component back to showing: "Switch to mph" (metric mode again)
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('Switch to');
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('mph');
    
    // Harness state back to original
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('Units: METRIC (km/h)');
    
    // Both events logged
    expect(await getTextByTestId(driver, 'event-log')).toContain('Units changed to imperial');
    expect(await getTextByTestId(driver, 'event-log')).toContain('Units changed to metric');
  });

  test('demonstrates units state with initial imperial mode', async () => {
    await loadTestHarness('Starting in Imperial Mode', { initialMetric: 'false' });

    await takeScreenshot(driver, 'test-results/selenium/UnitsConversion-initial-imperial.png');

    // Initial state: imperial mode (showing metric target)
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('km/h');
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('IMPERIAL (mph)');

    // Click to switch to metric
    await clickElementByTestId(driver, 'unit-toggle-button');
    
    await takeScreenshot(driver, 'test-results/selenium/UnitsConversion-imperial-to-metric.png');

    // Now in metric mode
    expect(await getTextByTestId(driver, 'unit-toggle-button')).toContain('mph');
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('METRIC (km/h)');
    expect(await getTextByTestId(driver, 'event-log')).toContain('Units changed to metric');
  });

  test('demonstrates units toggle with processing state', async () => {
    await loadTestHarness('Units Toggle - Processing State Demo', { initialProcessing: 'true' });

    await takeScreenshot(driver, 'test-results/selenium/UnitsConversion-processing-disabled.png');

    // When processing, button should be disabled
    const unitToggleButton = await findElementByTestId(driver, 'unit-toggle-button');
    expect(await unitToggleButton.isEnabled()).toBe(false);
    expect(await getTextByTestId(driver, 'harness-processing-state')).toContain('Processing: YES');

    // Try to click (should not work due to disabled state)
    try {
      await clickElementByTestId(driver, 'unit-toggle-button');
    } catch (error) {
      // Expected to fail due to disabled state
    }
    
    await takeScreenshot(driver, 'test-results/selenium/UnitsConversion-processing-no-change.png');

    // State should remain unchanged
    expect(await getTextByTestId(driver, 'harness-units-state')).toContain('METRIC (km/h)');
    expect(await getTextByTestId(driver, 'event-log')).toContain('No events yet...');
  });
});
