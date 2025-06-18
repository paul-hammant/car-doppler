/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import { ControlsTestHarness } from './ControlsTestHarness';

describe('Controls Component - Paul Hammant Pattern', () => {
  it('renders in test harness with initial state visible', () => {
    cy.mount(<ControlsTestHarness testName="Initial State Visibility" />);

    // Assert on the COMPONENT (traditional component testing)
    cy.get('[data-testid="record-button"]').should('contain.text', 'Start');
    cy.get('[data-testid="unit-toggle-button"]').should('contain.text', 'mph');

    // Assert on the TEST HARNESS (Paul Hammant's additional assertion)
    cy.get('[data-testid="harness-recording-state"]').should('contain.text', 'Recording: OFF');
    cy.get('[data-testid="harness-units-state"]').should('contain.text', 'Units: METRIC (km/h)');
    cy.get('[data-testid="test-name"]').should('contain.text', 'Initial State Visibility');
  });

  it('demonstrates event coupling - recording toggle', () => {
    cy.mount(<ControlsTestHarness testName="Recording Toggle Event Coupling" />);

    // Initial state assertions
    cy.get('[data-testid="record-button"]').should('contain.text', 'Start');
    cy.get('[data-testid="harness-recording-state"]').should('contain.text', 'OFF');
    cy.get('[data-testid="event-log"]').should('contain.text', 'No events yet...');

    // Click the record button
    cy.get('[data-testid="record-button"]').click();
    
    // Assert on COMPONENT state change
    cy.get('[data-testid="record-button"]').should('contain.text', 'Stop');
    
    // Assert on TEST HARNESS state change (coupled via events)
    cy.get('[data-testid="harness-recording-state"]').should('contain.text', 'Recording: ON');
    
    // Assert on EVENT COUPLING trace
    cy.get('[data-testid="event-log"]').should('contain.text', 'Recording started');

    // Toggle back
    cy.get('[data-testid="record-button"]').click();

    // Final state assertions
    cy.get('[data-testid="record-button"]').should('contain.text', 'Start');
    cy.get('[data-testid="harness-recording-state"]').should('contain.text', 'Recording: OFF');
    cy.get('[data-testid="event-log"]').should('contain.text', 'Recording stopped');
  });

  it('demonstrates event coupling - units toggle', () => {
    cy.mount(<ControlsTestHarness testName="Units Toggle Event Coupling" />);

    // Initial state
    cy.get('[data-testid="unit-toggle-button"]').should('contain.text', 'mph');
    cy.get('[data-testid="harness-units-state"]').should('contain.text', 'METRIC (km/h)');

    // Click to switch to imperial
    cy.get('[data-testid="unit-toggle-button"]').click();
    
    // Component updated
    cy.get('[data-testid="unit-toggle-button"]').should('contain.text', 'km/h');
    
    // Harness state updated via event coupling
    cy.get('[data-testid="harness-units-state"]').should('contain.text', 'IMPERIAL (mph)');
    
    // Event was logged
    cy.get('[data-testid="event-log"]').should('contain.text', 'Units changed to imperial');

    // Switch back
    cy.get('[data-testid="unit-toggle-button"]').click();

    cy.get('[data-testid="unit-toggle-button"]').should('contain.text', 'mph');
    cy.get('[data-testid="harness-units-state"]').should('contain.text', 'METRIC (km/h)');
    cy.get('[data-testid="event-log"]').should('contain.text', 'Units changed to metric');
  });

  it('shows processing state affecting component', () => {
    cy.mount(
      <ControlsTestHarness 
        testName="Processing State Test" 
        initialProcessing={true}
      />
    );

    // Component should be disabled when processing
    cy.get('[data-testid="record-button"]').should('be.disabled');
    cy.get('[data-testid="unit-toggle-button"]').should('be.disabled');
    
    // Harness shows processing state
    cy.get('[data-testid="harness-processing-state"]').should('contain.text', 'Processing: YES');
  });

  it('complex scenario - multiple interactions with full trace', () => {
    cy.mount(<ControlsTestHarness testName="Complex Multi-Interaction Scenario" />);

    // Perform a sequence of actions
    cy.get('[data-testid="record-button"]').click();
    cy.get('[data-testid="unit-toggle-button"]').click();
    cy.get('[data-testid="record-button"]').click();
    cy.get('[data-testid="unit-toggle-button"]').click();

    // Verify final component state
    cy.get('[data-testid="record-button"]').should('contain.text', 'Start');
    cy.get('[data-testid="unit-toggle-button"]').should('contain.text', 'mph');

    // Verify final harness state
    cy.get('[data-testid="harness-recording-state"]').should('contain.text', 'OFF');
    cy.get('[data-testid="harness-units-state"]').should('contain.text', 'METRIC');

    // Verify complete event trace
    cy.get('[data-testid="event-log"]').should('contain.text', 'Recording started');
    cy.get('[data-testid="event-log"]').should('contain.text', 'Units changed to imperial');
    cy.get('[data-testid="event-log"]').should('contain.text', 'Recording stopped');
    cy.get('[data-testid="event-log"]').should('contain.text', 'Units changed to metric');
  });
});