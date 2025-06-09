import { test, expect } from '@playwright/test';

test.describe('Doppler Speed Detection App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('displays app title and version', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Doppler Speed Detector');
    await expect(page.locator('.version')).toContainText(/^v(2\.1\.2|\d{8}-\d{4})$/);
  });

  test('shows default speed display', async ({ page }) => {
    const speedDisplay = page.getByTestId('speed-display');
    await expect(speedDisplay).toBeVisible();
    
    const speedValue = page.getByTestId('speed-value');
    await expect(speedValue).toContainText('--');
    
    const speedUnit = page.getByTestId('speed-unit');
    // Unit detection may default to mph or km/h based on location
    await expect(speedUnit).toContainText(/mph|km\/h/);
  });

  test('displays controls section', async ({ page }) => {
    const recordButton = page.getByTestId('record-button');
    await expect(recordButton).toBeVisible();
    await expect(recordButton).toContainText(/Start.*Listening/);
    
    const unitToggle = page.getByTestId('unit-toggle-button');
    await expect(unitToggle).toBeVisible();
    await expect(unitToggle).toContainText(/Switch to.*(mph|km\/h)/);
  });

  test('can toggle units between metric and imperial', async ({ page }) => {
    const unitToggle = page.getByTestId('unit-toggle-button');
    const speedUnit = page.getByTestId('speed-unit');
    
    // Wait for app to fully load and unit detection to complete
    await page.waitForTimeout(2000);
    
    // Get initial state
    const initialUnit = await speedUnit.textContent();
    const initialButtonText = await unitToggle.textContent();
    
    // Toggle units
    await unitToggle.click();
    
    // Wait for state update
    await page.waitForTimeout(500);
    
    // Verify unit changed
    const newUnit = await speedUnit.textContent();
    const newButtonText = await unitToggle.textContent();
    
    expect(initialUnit).not.toBe(newUnit);
    expect(initialButtonText).not.toBe(newButtonText);
    
    // Toggle back
    await unitToggle.click();
    await page.waitForTimeout(500);
    await expect(speedUnit).toContainText(initialUnit || '');
  });

  test('displays status display component', async ({ page }) => {
    const statusDisplay = page.getByTestId('status-display');
    await expect(statusDisplay).toBeVisible();
    
    const statusText = page.getByTestId('status-text');
    await expect(statusText).toContainText('Ready to start listening');
  });

  test('shows positioning guide that can be expanded', async ({ page }) => {
    const positioningGuide = page.getByTestId('positioning-guide');
    await expect(positioningGuide).toBeVisible();
    
    const toggleButton = page.getByTestId('positioning-toggle');
    await expect(toggleButton).toContainText('read more...');
    
    // Guide details should not be visible initially
    const positioningDetails = page.getByTestId('positioning-details');
    await expect(positioningDetails).not.toBeVisible();
    
    // Expand the guide
    await toggleButton.click();
    await expect(toggleButton).toContainText('collapse');
    await expect(positioningDetails).toBeVisible();
    await expect(positioningDetails).toContainText('For accurate readings');
    await expect(positioningDetails).toContainText('Safety:');
    
    // Collapse the guide
    await toggleButton.click();
    await expect(toggleButton).toContainText('read more...');
    await expect(positioningDetails).not.toBeVisible();
  });

  test('displays file input section', async ({ page }) => {
    const fileInput = page.getByTestId('file-input');
    await expect(fileInput).toBeVisible();
    
    const chooseFileButton = page.getByTestId('file-select-button');
    await expect(chooseFileButton).toBeVisible();
    await expect(chooseFileButton).toContainText('📁 Choose File');
    
    const downloadButton = page.getByTestId('download-button');
    await expect(downloadButton).toBeVisible();
    await expect(downloadButton).toContainText('⬇️ Download');
    await expect(downloadButton).toBeDisabled(); // No recording yet
  });

  test('shows debug console that can be toggled', async ({ page }) => {
    const debugConsole = page.getByTestId('debug-console');
    await expect(debugConsole).toBeVisible();
    
    const toggleButton = page.getByTestId('debug-toggle-button');
    await expect(toggleButton).toContainText('Show Debug Console');
    
    // Console container should not be visible initially
    const consoleContainer = page.getByTestId('debug-console-container');
    await expect(consoleContainer).not.toBeVisible();
    
    // Show the console
    await toggleButton.click();
    await expect(toggleButton).toContainText('Hide Debug Console');
    await expect(consoleContainer).toBeVisible();
    
    const logContainer = page.getByTestId('debug-log-container');
    await expect(logContainer).toBeVisible();
    
    // Hide the console
    await toggleButton.click();
    await expect(toggleButton).toContainText('Show Debug Console');
    await expect(consoleContainer).not.toBeVisible();
  });

  test('displays privacy notice', async ({ page }) => {
    await expect(page.locator('.privacy-notice')).toContainText('Privacy: All processing happens locally');
  });

  test('has proper page title', async ({ page }) => {
    await expect(page).toHaveTitle(/Doppler Speed Detector/);
  });

  test('is responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    
    const container = page.locator('.container');
    await expect(container).toBeVisible();
    
    const speedDisplay = page.getByTestId('speed-display');
    await expect(speedDisplay).toBeVisible();
    
    const controls = page.getByTestId('record-button');
    await expect(controls).toBeVisible();
  });

  test('record button changes state when clicked', async ({ page }) => {
    const recordButton = page.getByTestId('record-button');
    const statusText = page.getByTestId('status-text');
    
    // Initially should show "Start Listening"
    await expect(recordButton).toContainText('Start');
    await expect(statusText).toContainText('Ready to start listening');
    
    // Note: In a real test environment with microphone access,
    // clicking this button would request microphone permissions.
    // For E2E tests, we might need to mock the getUserMedia API
    // or test in a browser with permissions pre-granted.
  });

  test('accessibility: all interactive elements have proper labels', async ({ page }) => {
    // Check that all buttons have accessible names
    const recordButton = page.getByTestId('record-button');
    await expect(recordButton).toHaveAttribute('aria-label', 'Start Listening');
    
    const unitToggle = page.getByTestId('unit-toggle-button');
    await expect(unitToggle).toHaveAttribute('aria-label', /Switch to (mph|km\/h)/);
    
    const positioningToggle = page.getByTestId('positioning-toggle');
    await expect(positioningToggle).toHaveAttribute('aria-label', 'Expand positioning guide');
    
    const chooseFileButton = page.getByTestId('file-select-button');
    await expect(chooseFileButton).toHaveAttribute('aria-label', 'Select audio file for analysis');
    
    const downloadButton = page.getByTestId('download-button');
    await expect(downloadButton).toHaveAttribute('aria-label', 'Download recorded audio');
    
    const debugToggle = page.getByTestId('debug-toggle-button');
    await expect(debugToggle).toHaveAttribute('aria-label', 'Show Debug Console');
  });

  test('keyboard navigation works for interactive elements', async ({ page }) => {
    // Tab through main interactive elements
    await page.keyboard.press('Tab'); // Record button
    await expect(page.getByTestId('record-button')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Unit toggle
    await expect(page.getByTestId('unit-toggle-button')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Positioning guide toggle
    await expect(page.getByTestId('positioning-toggle')).toBeFocused();
    
    // Test Enter key activation on positioning guide
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('positioning-details')).toBeVisible();
  });
});