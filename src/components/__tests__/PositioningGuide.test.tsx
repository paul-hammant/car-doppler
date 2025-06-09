/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { PositioningGuide } from '../PositioningGuide';

describe('PositioningGuide', () => {
  it('renders collapsed state by default', () => {
    render(<PositioningGuide />);
    
    const guide = screen.getByTestId('positioning-guide');
    const title = screen.getByText('📍 Positioning and Safety Guide');
    const toggleButton = screen.getByTestId('positioning-toggle');
    
    expect(guide).toBeInTheDocument();
    expect(title).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent('read more...');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(toggleButton).toHaveAttribute('aria-label', 'Expand positioning guide');
    expect(screen.queryByTestId('positioning-details')).not.toBeInTheDocument();
  });

  it('expands when toggle button is clicked', async () => {
    render(<PositioningGuide />);
    
    const toggleButton = screen.getByTestId('positioning-toggle');
    await userEvent.click(toggleButton);
    
    expect(toggleButton).toHaveTextContent('collapse');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(toggleButton).toHaveAttribute('aria-label', 'Collapse positioning guide');
    expect(screen.getByTestId('positioning-details')).toBeInTheDocument();
  });

  it('collapses when toggle button is clicked again', async () => {
    render(<PositioningGuide />);
    
    const toggleButton = screen.getByTestId('positioning-toggle');
    
    // Expand first
    await userEvent.click(toggleButton);
    expect(screen.getByTestId('positioning-details')).toBeInTheDocument();
    
    // Then collapse
    await userEvent.click(toggleButton);
    expect(toggleButton).toHaveTextContent('read more...');
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByTestId('positioning-details')).not.toBeInTheDocument();
  });

  it('displays positioning content when expanded', async () => {
    render(<PositioningGuide />);
    
    const toggleButton = screen.getByTestId('positioning-toggle');
    await userEvent.click(toggleButton);
    
    const details = screen.getByTestId('positioning-details');
    expect(details).toBeInTheDocument();
    expect(details).toHaveTextContent('For accurate readings:');
    expect(details).toHaveTextContent('Stand perpendicular to traffic');
    expect(details).toHaveTextContent('no more than 5 meters/yards from the line');
    expect(details).toHaveTextContent('Safety:');
    expect(details).toHaveTextContent('Maintain safe distance from roadway');
    expect(details).toHaveTextContent('Security & Tip:');
    expect(details).toHaveTextContent('wired Lightning/USB-C microphones');
  });

  it('accepts custom test id', () => {
    render(<PositioningGuide data-testid="custom-guide" />);
    
    expect(screen.getByTestId('custom-guide')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<PositioningGuide />);
    
    const toggleButton = screen.getByTestId('positioning-toggle');
    
    expect(toggleButton).toHaveAttribute('aria-label');
    expect(toggleButton).toHaveAttribute('aria-expanded');
  });

  it('updates accessibility attributes when state changes', async () => {
    render(<PositioningGuide />);
    
    const toggleButton = screen.getByTestId('positioning-toggle');
    
    // Initially collapsed
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    expect(toggleButton).toHaveAttribute('aria-label', 'Expand positioning guide');
    
    // After expanding
    await userEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    expect(toggleButton).toHaveAttribute('aria-label', 'Collapse positioning guide');
  });
});