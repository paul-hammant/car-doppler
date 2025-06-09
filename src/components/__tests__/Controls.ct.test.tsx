/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import { test, expect } from '@playwright/experimental-ct-react';
import { ControlsTestHarness } from './ControlsTestHarness';

test.describe('Controls Component - Paul Hammant Pattern', () => {
  test('renders in test harness with initial state visible', async ({ mount }) => {
    const component = await mount(
      <ControlsTestHarness testName="Initial State Visibility" />
    );

    // Screenshot: Initial state
    await component.screenshot({ path: 'test-results/Controls-initial-state.png' });

    // Assert on the COMPONENT (traditional component testing)
    await expect(component.getByTestId('record-button')).toContainText('Start');
    await expect(component.getByTestId('unit-toggle-button')).toContainText('mph');

    // Assert on the TEST HARNESS (Paul Hammant's additional assertion)
    await expect(component.getByTestId('harness-recording-state')).toContainText('Recording: OFF');
    await expect(component.getByTestId('harness-units-state')).toContainText('Units: METRIC (km/h)');
    await expect(component.getByTestId('test-name')).toContainText('Initial State Visibility');
  });

  test('demonstrates event coupling - recording toggle', async ({ mount, page }) => {
    const component = await mount(
      <ControlsTestHarness testName="Recording Toggle Event Coupling" />
    );

    // Screenshot: Before interaction
    await component.screenshot({ path: 'test-results/Controls-recording-toggle-before.png' });

    // Initial state assertions
    await expect(component.getByTestId('record-button')).toContainText('Start');
    await expect(component.getByTestId('harness-recording-state')).toContainText('OFF');
    await expect(component.getByTestId('event-log')).toContainText('No events yet...');

    // Click the record button
    await component.getByTestId('record-button').click();
    
    // Screenshot: After first click (recording started)
    await component.screenshot({ path: 'test-results/Controls-recording-toggle-started.png' });

    // Assert on COMPONENT state change
    await expect(component.getByTestId('record-button')).toContainText('Stop');
    
    // Assert on TEST HARNESS state change (coupled via events)
    await expect(component.getByTestId('harness-recording-state')).toContainText('Recording: ON');
    
    // Assert on EVENT COUPLING trace
    await expect(component.getByTestId('event-log')).toContainText('Recording started');

    // Toggle back
    await component.getByTestId('record-button').click();
    
    // Screenshot: After second click (recording stopped)
    await component.screenshot({ path: 'test-results/Controls-recording-toggle-stopped.png' });

    // Final state assertions
    await expect(component.getByTestId('record-button')).toContainText('Start');
    await expect(component.getByTestId('harness-recording-state')).toContainText('Recording: OFF');
    await expect(component.getByTestId('event-log')).toContainText('Recording stopped');
  });

  test('demonstrates event coupling - units toggle', async ({ mount, page }) => {
    const component = await mount(
      <ControlsTestHarness testName="Units Toggle Event Coupling" />
    );

    // Screenshot: Before units toggle
    await component.screenshot({ path: 'test-results/Controls-units-toggle-before.png' });

    // Initial state
    await expect(component.getByTestId('unit-toggle-button')).toContainText('mph');
    await expect(component.getByTestId('harness-units-state')).toContainText('METRIC (km/h)');

    // Click to switch to imperial
    await component.getByTestId('unit-toggle-button').click();
    
    // Screenshot: After switching to imperial
    await component.screenshot({ path: 'test-results/Controls-units-toggle-imperial.png' });

    // Component updated
    await expect(component.getByTestId('unit-toggle-button')).toContainText('km/h');
    
    // Harness state updated via event coupling
    await expect(component.getByTestId('harness-units-state')).toContainText('IMPERIAL (mph)');
    
    // Event was logged
    await expect(component.getByTestId('event-log')).toContainText('Units changed to imperial');

    // Switch back
    await component.getByTestId('unit-toggle-button').click();
    
    // Screenshot: After switching back to metric
    await component.screenshot({ path: 'test-results/Controls-units-toggle-metric.png' });

    await expect(component.getByTestId('unit-toggle-button')).toContainText('mph');
    await expect(component.getByTestId('harness-units-state')).toContainText('METRIC (km/h)');
    await expect(component.getByTestId('event-log')).toContainText('Units changed to metric');
  });

  test('shows processing state affecting component', async ({ mount }) => {
    const component = await mount(
      <ControlsTestHarness 
        testName="Processing State Test" 
        initialProcessing={true}
      />
    );

    // Screenshot: Processing state with disabled controls
    await component.screenshot({ path: 'test-results/Controls-processing-state.png' });

    // Component should be disabled when processing
    await expect(component.getByTestId('record-button')).toBeDisabled();
    await expect(component.getByTestId('unit-toggle-button')).toBeDisabled();
    
    // Harness shows processing state
    await expect(component.getByTestId('harness-processing-state')).toContainText('Processing: YES');
  });

  test('complex scenario - multiple interactions with full trace', async ({ mount, page }) => {
    const component = await mount(
      <ControlsTestHarness testName="Complex Multi-Interaction Scenario" />
    );

    // Screenshot: Initial state before complex scenario
    await component.screenshot({ path: 'test-results/Controls-complex-scenario-start.png' });

    // Perform a sequence of actions
    await component.getByTestId('record-button').click();
    await component.getByTestId('unit-toggle-button').click();
    
    // Screenshot: Mid-scenario (recording + imperial)
    await component.screenshot({ path: 'test-results/Controls-complex-scenario-mid.png' });
    
    await component.getByTestId('record-button').click();
    await component.getByTestId('unit-toggle-button').click();

    // Screenshot: Final state with complete event trace
    await component.screenshot({ path: 'test-results/Controls-complex-scenario-final.png' });

    // Verify final component state
    await expect(component.getByTestId('record-button')).toContainText('Start');
    await expect(component.getByTestId('unit-toggle-button')).toContainText('mph');

    // Verify final harness state
    await expect(component.getByTestId('harness-recording-state')).toContainText('OFF');
    await expect(component.getByTestId('harness-units-state')).toContainText('METRIC');

    // Verify complete event trace
    await expect(component.getByTestId('event-log')).toContainText('Recording started');
    await expect(component.getByTestId('event-log')).toContainText('Units changed to imperial');
    await expect(component.getByTestId('event-log')).toContainText('Recording stopped');
    await expect(component.getByTestId('event-log')).toContainText('Units changed to metric');
  });
});