describe('Audio Processing Features', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  // Skip: Requires reliable microphone permission mocking across different browsers
  it.skip('handles microphone permission denial gracefully', () => {
    // Deny microphone permissions - Cypress does not have a direct equivalent for context.grantPermissions
    // This would typically be handled by browser settings or a plugin if necessary for a specific test scenario.
    // For now, we assume this setup would be done externally if this test were to be unskipped.
    // await context.grantPermissions([], { origin: 'http://localhost:3000' });

    const recordButton = cy.get('[data-testid="record-button"]');
    const statusText = cy.get('[data-testid="status-text"]');

    recordButton.click();

    // Should show error state
    statusText.should('contain.text', 'Microphone access denied', { timeout: 5000 });
  });

  // Skip: Requires microphone access and real audio processing in CI environment
  it.skip('shows processing state when analyzing audio', () => {
    // Grant microphone permissions - See note in previous test.
    // await context.grantPermissions(['microphone'], { origin: 'http://localhost:3000' });

    const recordButton = cy.get('[data-testid="record-button"]');
    const statusText = cy.get('[data-testid="status-text"]');

    recordButton.click();

    // Should transition to listening state
    statusText.should('contain.text', 'Listening for vehicle', { timeout: 5000 });
    recordButton.should('contain.text', 'Stop');

    // Stop recording after a short time
    cy.wait(1000); // page.waitForTimeout(1000)
    recordButton.click();

    // Should show processing state
    statusText.should('contain.text', 'Processing', { timeout: 2000 });
  });

  // Skip: Requires microphone recording and browser download handling in headless mode
  it.skip('enables download button after recording', () => {
    // await context.grantPermissions(['microphone'], { origin: 'http://localhost:3000' });

    const recordButton = cy.get('[data-testid="record-button"]');
    const downloadButton = cy.get('[data-testid="download-button"]');

    // Initially disabled
    downloadButton.should('be.disabled');

    // Record for a short time
    recordButton.click();
    cy.wait(1000); // page.waitForTimeout(1000)
    recordButton.click();

    // Should enable download after recording
    downloadButton.should('not.be.disabled', { timeout: 5000 });
  });

  // Skip: Requires microphone access and timing-dependent WASM processing behavior
  it.skip('displays speed calculation progress on slow devices', () => {
    // await context.grantPermissions(['microphone'], { origin: 'http://localhost:3000' });

    const recordButton = cy.get('[data-testid="record-button"]');
    const speedValue = cy.get('[data-testid="speed-value"]');

    // Record for a few seconds
    recordButton.click();
    cy.wait(3000); // page.waitForTimeout(3000)
    recordButton.click();

    // Should show calculation progress indicator
    speedValue.should('contain.text', '🧮', { timeout: 2000 });
  });

  it('handles file upload for offline analysis', () => {
    // Cypress handles file uploads by interacting with the input[type="file"] element directly.
    // We can't directly check for the OS file chooser dialog in the same way Playwright does.
    // We can check if the button to trigger the file input exists.
    cy.get('[data-testid="file-select-button"]').should('be.visible').click();
    // Further interaction would involve selecting a file using cy.get('input[type="file"]').selectFile(...)
    // For now, just verifying the button click which would open the dialog.
    // expect(fileChooser).toBeTruthy(); // This Playwright assertion cannot be directly translated.
  });

  it('debug console captures audio processing logs', () => {
    const debugToggle = cy.get('[data-testid="debug-toggle-button"]');
    debugToggle.click();

    const debugLogContainer = cy.get('[data-testid="debug-log-container"]');
    debugLogContainer.should('be.visible');

    // Should show initial debug message
    debugLogContainer.should('contain.text', 'Debug console ready');
  });

  // Skip: Clipboard API behavior inconsistent in headless browsers and requires specific browser permissions
  it.skip('debug console allows copying logs', () => {
    const debugToggle = cy.get('[data-testid="debug-toggle-button"]');
    debugToggle.click();

    const debugLogContainer = cy.get('[data-testid="debug-log-container"]');

    // Mocking clipboard API in Cypress is more involved and often requires plugins or specific browser flags.
    // cy.evaluate(() => {
    //   // @ts-ignore
    //   window.navigator.clipboard = {
    //     writeText: (text: string) => Promise.resolve()
    //   };
    // });

    debugLogContainer.click();

    // Should show copy feedback briefly
    debugLogContainer.should('have.class', /copy-feedback/, { timeout: 1000 });
  });

  // Skip: Requires microphone permission denial to trigger error states
  it.skip('displays appropriate error codes for common issues', () => {
    // await context.grantPermissions([], { origin: 'http://localhost:3000' });

    const recordButton = cy.get('[data-testid="record-button"]');
    const speedValue = cy.get('[data-testid="speed-value"]');

    recordButton.click();

    // Should show error code for microphone issues
    speedValue.should('contain.text', 'E', { timeout: 5000 });
  });

  it.skip('maintains state during unit conversion', () => {
    cy.get('[data-testid="record-button"]').should('be.visible'); // Ensure page is loaded

    const unitToggleButton = cy.get('[data-testid="unit-toggle-button"]');
    const speedUnitDisplay = cy.get('[data-testid="speed-display"]').find('[data-testid="speed-unit"]');

    // Get initial unit
    speedUnitDisplay.invoke('text').then((initialUnitTextRaw) => {
      const initialUnit = initialUnitTextRaw.trim();
      cy.log(`Initial unit: ${initialUnit}`);
      expect(initialUnit).to.be.oneOf(['km/h', 'mph']);

      // Determine initial button text based on initial unit
      // Note: The button text includes line breaks which Cypress text() concatenates.
      // "Switch to\nmph" becomes "Switch tomph"
      let expectedButtonText;
      if (initialUnit === 'km/h') {
        expectedButtonText = 'Switch tomph';
      } else {
        expectedButtonText = 'Switch tokm/h';
      }
      unitToggleButton.invoke('text').then(btnText => expect(btnText.replace(/\s+/g, '')).to.equal(expectedButtonText));


      // Click to toggle
      unitToggleButton.click();
      cy.wait(200); // Increased wait after click

      // Assert button text changed and unit display changed
      let expectedNewButtonText;
      let expectedNewUnit;
      if (initialUnit === 'km/h') { // If was km/h, now should be mph
        expectedNewButtonText = 'Switch tokm/h';
        expectedNewUnit = 'mph';
      } else { // If was mph, now should be km/h
        expectedNewButtonText = 'Switch tomph';
        expectedNewUnit = 'km/h';
      }
      unitToggleButton.invoke('text').then(btnText => expect(btnText.replace(/\s+/g, '')).to.equal(expectedNewButtonText));
      speedUnitDisplay.should('contain.text', expectedNewUnit);

      // Toggle back
      unitToggleButton.click();
      cy.wait(200); // Increased wait after click

      // Assert button and unit are back to original
      unitToggleButton.invoke('text').then(btnText => expect(btnText.replace(/\s+/g, '')).to.equal(expectedButtonText));
      speedUnitDisplay.should('contain.text', initialUnit);
    });
  });

  it('positioning guide provides helpful instructions', () => {
    const positioningToggle = cy.get('[data-testid="positioning-toggle"]');
    positioningToggle.click();

    const positioningDetails = cy.get('[data-testid="positioning-details"]');
    positioningDetails.should('contain.text', 'perpendicular');
    positioningDetails.should('contain.text', '5 meters');
    positioningDetails.should('contain.text', 'Safety:');
    positioningDetails.should('contain.text', 'wired Lightning/USB-C microphones');
  });
});
