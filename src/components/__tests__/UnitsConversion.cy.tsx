/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import { ControlsTestHarness } from './ControlsTestHarness';

describe('Units Conversion - Paul Hammant Pattern', () => {
  it('demonstrates mph → km/h → mph conversion cycle with full visibility', () => {
    cy.mount(
      <ControlsTestHarness testName="Units Conversion Cycle: mph → km/h → mph" />
    );

    // === INITIAL STATE: mph (metric mode, showing imperial target) ===
    cy.get('[data-testid="test-name"]').should('contain.text', 'Units Conversion Cycle: mph → km/h → mph');
    
    // Component shows: "Switch to mph" (because we're in metric mode)
    cy.get('[data-testid="unit-toggle-button"]').should('contain.text', 'Switch to');
    cy.get('[data-testid="unit-toggle-button"]').should('contain.text', 'mph');
    
    // Harness state shows: METRIC (km/h) 
    cy.get('[data-testid="harness-units-state"]').should('contain.text', 'Units: METRIC (km/h)');
    
    // Event log is empty
    cy.get('[data-testid="event-log"]').should('contain.text', 'No events yet...');

    // === FIRST CLICK: mph → km/h (metric to imperial) ===
    cy.get('[data-testid="unit-toggle-button"]').click();

    // Component now shows: "Switch to km/h" (because we're in imperial mode)
    cy.get('[data-testid="unit-toggle-button"]').should('contain.text', 'Switch to');
    cy.get('[data-testid="unit-toggle-button"]').should('contain.text', 'km/h');
    
    // Harness state updated via event coupling
    cy.get('[data-testid="harness-units-state"]').should('contain.text', 'Units: IMPERIAL (mph)');
    
    // Event was logged
    cy.get('[data-testid="event-log"]').should('contain.text', 'Units changed to imperial');

    // === SECOND CLICK: km/h → mph (imperial back to metric) ===
    cy.get('[data-testid="unit-toggle-button"]').click();

    // Component back to showing: "Switch to mph" (metric mode again)
    cy.get('[data-testid="unit-toggle-button"]').should('contain.text', 'Switch to');
    cy.get('[data-testid="unit-toggle-button"]').should('contain.text', 'mph');
    
    // Harness state back to original
    cy.get('[data-testid="harness-units-state"]').should('contain.text', 'Units: METRIC (km/h)');
    
    // Both events logged
    cy.get('[data-testid="event-log"]').should('contain.text', 'Units changed to imperial');
    cy.get('[data-testid="event-log"]').should('contain.text', 'Units changed to metric');
  });

  it('demonstrates units state with initial imperial mode', () => {
    cy.mount(
      <ControlsTestHarness 
        testName="Starting in Imperial Mode" 
        initialMetric={false}
      />
    );

    // Initial state: imperial mode (showing metric target)
    cy.get('[data-testid="unit-toggle-button"]').should('contain.text', 'km/h');
    cy.get('[data-testid="harness-units-state"]').should('contain.text', 'IMPERIAL (mph)');

    // Click to switch to metric
    cy.get('[data-testid="unit-toggle-button"]').click();

    // Now in metric mode
    cy.get('[data-testid="unit-toggle-button"]').should('contain.text', 'mph');
    cy.get('[data-testid="harness-units-state"]').should('contain.text', 'METRIC (km/h)');
    cy.get('[data-testid="event-log"]').should('contain.text', 'Units changed to metric');
  });

  it('demonstrates units toggle with processing state', () => {
    cy.mount(
      <ControlsTestHarness 
        testName="Units Toggle - Processing State Demo" 
        initialProcessing={true}
      />
    );

    // When processing, button should be disabled
    cy.get('[data-testid="unit-toggle-button"]').should('be.disabled');
    cy.get('[data-testid="harness-processing-state"]').should('contain.text', 'Processing: YES');

    // Try to click (should not work due to disabled state)
    cy.get('[data-testid="unit-toggle-button"]').click({ force: true });

    // State should remain unchanged
    cy.get('[data-testid="harness-units-state"]').should('contain.text', 'METRIC (km/h)');
    cy.get('[data-testid="event-log"]').should('contain.text', 'No events yet...');
  });
});