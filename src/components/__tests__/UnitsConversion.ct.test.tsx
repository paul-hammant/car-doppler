/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import { test, expect } from '@playwright/experimental-ct-react';
import { ControlsTestHarness } from './ControlsTestHarness';

test.describe('Units Conversion - Paul Hammant Pattern', () => {
  test('demonstrates mph → km/h → mph conversion cycle with full visibility', async ({ mount, page }) => {
    const component = await mount(
      <ControlsTestHarness testName="Units Conversion Cycle: mph → km/h → mph" />
    );

    // Screenshot: Initial metric state
    await component.screenshot({ path: 'test-results/UnitsConversion-cycle-initial-metric.png' });

    // === INITIAL STATE: mph (metric mode, showing imperial target) ===
    await expect(component.getByTestId('test-name')).toContainText('Units Conversion Cycle: mph → km/h → mph');
    
    // Component shows: "Switch to mph" (because we're in metric mode)
    await expect(component.getByTestId('unit-toggle-button')).toContainText('Switch to');
    await expect(component.getByTestId('unit-toggle-button')).toContainText('mph');
    
    // Harness state shows: METRIC (km/h) 
    await expect(component.getByTestId('harness-units-state')).toContainText('Units: METRIC (km/h)');
    
    // Event log is empty
    await expect(component.getByTestId('event-log')).toContainText('No events yet...');

    // === FIRST CLICK: mph → km/h (metric to imperial) ===
    await component.getByTestId('unit-toggle-button').click();
    
    // Screenshot: After switching to imperial
    await component.screenshot({ path: 'test-results/UnitsConversion-cycle-switched-imperial.png' });

    // Component now shows: "Switch to km/h" (because we're in imperial mode)
    await expect(component.getByTestId('unit-toggle-button')).toContainText('Switch to');
    await expect(component.getByTestId('unit-toggle-button')).toContainText('km/h');
    
    // Harness state updated via event coupling
    await expect(component.getByTestId('harness-units-state')).toContainText('Units: IMPERIAL (mph)');
    
    // Event was logged
    await expect(component.getByTestId('event-log')).toContainText('Units changed to imperial');

    // === SECOND CLICK: km/h → mph (imperial back to metric) ===
    await component.getByTestId('unit-toggle-button').click();
    
    // Screenshot: Back to metric with full event trace
    await component.screenshot({ path: 'test-results/UnitsConversion-cycle-back-to-metric.png' });

    // Component back to showing: "Switch to mph" (metric mode again)
    await expect(component.getByTestId('unit-toggle-button')).toContainText('Switch to');
    await expect(component.getByTestId('unit-toggle-button')).toContainText('mph');
    
    // Harness state back to original
    await expect(component.getByTestId('harness-units-state')).toContainText('Units: METRIC (km/h)');
    
    // Both events logged
    await expect(component.getByTestId('event-log')).toContainText('Units changed to imperial');
    await expect(component.getByTestId('event-log')).toContainText('Units changed to metric');
  });

  test('demonstrates units state with initial imperial mode', async ({ mount, page }) => {
    const component = await mount(
      <ControlsTestHarness 
        testName="Starting in Imperial Mode" 
        initialMetric={false}
      />
    );

    // Screenshot: Initial imperial state
    await component.screenshot({ path: 'test-results/UnitsConversion-initial-imperial.png' });

    // Initial state: imperial mode (showing metric target)
    await expect(component.getByTestId('unit-toggle-button')).toContainText('km/h');
    await expect(component.getByTestId('harness-units-state')).toContainText('IMPERIAL (mph)');

    // Click to switch to metric
    await component.getByTestId('unit-toggle-button').click();
    
    // Screenshot: After switching to metric from imperial
    await component.screenshot({ path: 'test-results/UnitsConversion-imperial-to-metric.png' });

    // Now in metric mode
    await expect(component.getByTestId('unit-toggle-button')).toContainText('mph');
    await expect(component.getByTestId('harness-units-state')).toContainText('METRIC (km/h)');
    await expect(component.getByTestId('event-log')).toContainText('Units changed to metric');
  });

  test('demonstrates units toggle with processing state', async ({ mount, page }) => {
    const component = await mount(
      <ControlsTestHarness 
        testName="Units Toggle - Processing State Demo" 
        initialProcessing={true}
      />
    );

    // Screenshot: Processing state with disabled units toggle
    await component.screenshot({ path: 'test-results/UnitsConversion-processing-disabled.png' });

    // When processing, button should be disabled
    await expect(component.getByTestId('unit-toggle-button')).toBeDisabled();
    await expect(component.getByTestId('harness-processing-state')).toContainText('Processing: YES');

    // Try to click (should not work due to disabled state)
    await component.getByTestId('unit-toggle-button').click({ force: true });
    
    // Screenshot: After attempted click (should show no change)
    await component.screenshot({ path: 'test-results/UnitsConversion-processing-no-change.png' });

    // State should remain unchanged
    await expect(component.getByTestId('harness-units-state')).toContainText('METRIC (km/h)');
    await expect(component.getByTestId('event-log')).toContainText('No events yet...');
  });
});