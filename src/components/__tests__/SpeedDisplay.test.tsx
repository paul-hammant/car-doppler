/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SpeedDisplay } from '../SpeedDisplay';

describe('SpeedDisplay', () => {
  it('renders speed value and unit correctly', () => {
    render(<SpeedDisplay speed="42" unit="km/h" color="#007AFF" />);
    
    expect(screen.getByTestId('speed-value')).toHaveTextContent('42');
    expect(screen.getByTestId('speed-unit')).toHaveTextContent('km/h');
  });

  it('applies correct color to speed value', () => {
    render(<SpeedDisplay speed="42" unit="km/h" color="#FF3B30" />);
    
    const speedValue = screen.getByTestId('speed-value');
    expect(speedValue).toHaveStyle({ color: '#FF3B30' });
  });

  it('displays calculation indicator', () => {
    render(<SpeedDisplay speed="🧮" unit="km/h" color="#FF9500" />);
    
    expect(screen.getByTestId('speed-value')).toHaveTextContent('🧮');
    expect(screen.getByTestId('speed-value')).toHaveStyle({ color: '#FF9500' });
  });

  it('displays error codes', () => {
    render(<SpeedDisplay speed="E09" unit="km/h" color="#FF3B30" />);
    
    expect(screen.getByTestId('speed-value')).toHaveTextContent('E09');
    expect(screen.getByTestId('speed-value')).toHaveStyle({ color: '#FF3B30' });
  });

  it('displays default state', () => {
    render(<SpeedDisplay speed="--" unit="km/h" color="#007AFF" />);
    
    expect(screen.getByTestId('speed-value')).toHaveTextContent('--');
    expect(screen.getByTestId('speed-unit')).toHaveTextContent('km/h');
  });

  it('supports mph units', () => {
    render(<SpeedDisplay speed="26" unit="mph" color="#007AFF" />);
    
    expect(screen.getByTestId('speed-unit')).toHaveTextContent('mph');
  });

  it('has proper accessibility attributes', () => {
    render(<SpeedDisplay speed="42" unit="km/h" color="#007AFF" />);
    
    const speedValue = screen.getByTestId('speed-value');
    const speedUnit = screen.getByTestId('speed-unit');
    
    expect(speedValue).toHaveAttribute('aria-label', 'Speed: 42 km/h');
    expect(speedUnit).toHaveAttribute('aria-label', 'Unit: km/h');
  });

  it('accepts custom test id', () => {
    render(<SpeedDisplay speed="42" unit="km/h" color="#007AFF" data-testid="custom-speed" />);
    
    expect(screen.getByTestId('custom-speed')).toBeInTheDocument();
  });
});