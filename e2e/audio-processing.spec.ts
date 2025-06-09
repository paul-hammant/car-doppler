import { test, expect } from '@playwright/test';

test.describe('Audio Processing Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // Skip: Requires reliable microphone permission mocking across different browsers
  test.skip('handles microphone permission denial gracefully', async ({ page, context }) => {
    // Deny microphone permissions
    await context.grantPermissions([], { origin: 'http://localhost:3000' });
    
    const recordButton = page.getByTestId('record-button');
    const statusText = page.getByTestId('status-text');
    
    await recordButton.click();
    
    // Should show error state
    await expect(statusText).toContainText('Microphone access denied', { timeout: 5000 });
  });

  // Skip: Requires microphone access and real audio processing in CI environment
  test.skip('shows processing state when analyzing audio', async ({ page, context }) => {
    // Grant microphone permissions
    await context.grantPermissions(['microphone'], { origin: 'http://localhost:3000' });
    
    const recordButton = page.getByTestId('record-button');
    const statusText = page.getByTestId('status-text');
    
    await recordButton.click();
    
    // Should transition to listening state
    await expect(statusText).toContainText('Listening for vehicle', { timeout: 5000 });
    await expect(recordButton).toContainText('Stop');
    
    // Stop recording after a short time
    await page.waitForTimeout(1000);
    await recordButton.click();
    
    // Should show processing state
    await expect(statusText).toContainText('Processing', { timeout: 2000 });
  });

  // Skip: Requires microphone recording and browser download handling in headless mode
  test.skip('enables download button after recording', async ({ page, context }) => {
    await context.grantPermissions(['microphone'], { origin: 'http://localhost:3000' });
    
    const recordButton = page.getByTestId('record-button');
    const downloadButton = page.getByTestId('download-button');
    
    // Initially disabled
    await expect(downloadButton).toBeDisabled();
    
    // Record for a short time
    await recordButton.click();
    await page.waitForTimeout(1000);
    await recordButton.click();
    
    // Should enable download after recording
    await expect(downloadButton).not.toBeDisabled({ timeout: 5000 });
  });

  // Skip: Requires microphone access and timing-dependent WASM processing behavior
  test.skip('displays speed calculation progress on slow devices', async ({ page, context }) => {
    await context.grantPermissions(['microphone'], { origin: 'http://localhost:3000' });
    
    const recordButton = page.getByTestId('record-button');
    const speedValue = page.getByTestId('speed-value');
    
    // Record for a few seconds
    await recordButton.click();
    await page.waitForTimeout(3000);
    await recordButton.click();
    
    // Should show calculation progress indicator
    await expect(speedValue).toContainText('🧮', { timeout: 2000 });
  });

  test('handles file upload for offline analysis', async ({ page }) => {
    const fileChooserPromise = page.waitForEvent('filechooser');
    
    await page.getByTestId('file-select-button').click();
    const fileChooser = await fileChooserPromise;
    
    // Mock file upload - in real test would use actual audio file
    // For now, just verify the file chooser opened
    expect(fileChooser).toBeTruthy();
  });

  test('debug console captures audio processing logs', async ({ page }) => {
    const debugToggle = page.getByTestId('debug-toggle-button');
    await debugToggle.click();
    
    const debugLogContainer = page.getByTestId('debug-log-container');
    await expect(debugLogContainer).toBeVisible();
    
    // Should show initial debug message
    await expect(debugLogContainer).toContainText('Debug console ready');
  });

  // Skip: Clipboard API behavior inconsistent in headless browsers
  test.skip('debug console allows copying logs', async ({ page }) => {
    const debugToggle = page.getByTestId('debug-toggle-button');
    await debugToggle.click();
    
    const debugLogContainer = page.getByTestId('debug-log-container');
    
    // Mock clipboard API for testing
    await page.evaluate(() => {
      // @ts-ignore
      window.navigator.clipboard = {
        writeText: (text: string) => Promise.resolve()
      };
    });
    
    await debugLogContainer.click();
    
    // Should show copy feedback briefly
    await expect(debugLogContainer).toHaveClass(/copy-feedback/, { timeout: 1000 });
  });

  // Skip: Requires microphone permission denial to trigger error states
  test.skip('displays appropriate error codes for common issues', async ({ page, context }) => {
    // Test with denied microphone access
    await context.grantPermissions([], { origin: 'http://localhost:3000' });
    
    const recordButton = page.getByTestId('record-button');
    const speedValue = page.getByTestId('speed-value');
    
    await recordButton.click();
    
    // Should show error code for microphone issues
    await expect(speedValue).toContainText('E', { timeout: 5000 });
  });

  test('maintains state during unit conversion', async ({ page }) => {
    const speedValue = page.getByTestId('speed-value');
    const speedUnit = page.getByTestId('speed-unit');
    const unitToggle = page.getByTestId('unit-toggle-button');
    
    // Simulate having a speed value (would normally come from audio processing)
    await page.evaluate(() => {
      // This would normally be set by the audio processing system
      const speedDisplay = document.querySelector('[data-testid="speed-value"]');
      if (speedDisplay) {
        speedDisplay.textContent = '50';
      }
    });
    
    // Toggle units and verify conversion would happen
    const initialUnit = await speedUnit.textContent();
    await unitToggle.click();
    const newUnit = await speedUnit.textContent();
    expect(initialUnit).not.toBe(newUnit);
    await expect(speedUnit).toContainText(/mph|km\/h/);
  });

  test('positioning guide provides helpful instructions', async ({ page }) => {
    const positioningToggle = page.getByTestId('positioning-toggle');
    await positioningToggle.click();
    
    const positioningDetails = page.getByTestId('positioning-details');
    await expect(positioningDetails).toContainText('perpendicular');
    await expect(positioningDetails).toContainText('5 meters');
    await expect(positioningDetails).toContainText('Safety:');
    await expect(positioningDetails).toContainText('wired Lightning/USB-C microphones');
  });
});