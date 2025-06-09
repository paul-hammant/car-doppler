/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { Controls } from '../Controls';

describe('Controls', () => {
  const defaultProps = {
    isRecording: false,
    isProcessing: false,
    isMetric: true,
    onToggleRecording: vi.fn(),
    onToggleUnits: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders start recording button when not recording', () => {
    render(<Controls {...defaultProps} />);
    
    const recordButton = screen.getByTestId('record-button');
    expect(recordButton).toHaveTextContent('Start');
    expect(recordButton).toHaveTextContent('Listening');
    expect(recordButton).not.toHaveClass('recording');
  });

  it('renders stop recording button when recording', () => {
    render(<Controls {...defaultProps} isRecording={true} />);
    
    const recordButton = screen.getByTestId('record-button');
    expect(recordButton).toHaveTextContent('Stop');
    expect(recordButton).toHaveTextContent('Listening');
    expect(recordButton).toHaveClass('recording');
  });

  it('calls onToggleRecording when record button is clicked', async () => {
    render(<Controls {...defaultProps} />);
    
    const recordButton = screen.getByTestId('record-button');
    await userEvent.click(recordButton);
    
    expect(defaultProps.onToggleRecording).toHaveBeenCalledTimes(1);
  });

  it('disables record button when processing', () => {
    render(<Controls {...defaultProps} isProcessing={true} />);
    
    const recordButton = screen.getByTestId('record-button');
    expect(recordButton).toBeDisabled();
  });

  it('renders metric unit toggle button', () => {
    render(<Controls {...defaultProps} isMetric={true} />);
    
    const unitButton = screen.getByTestId('unit-toggle-button');
    expect(unitButton).toHaveTextContent('Switch to');
    expect(unitButton).toHaveTextContent('mph');
  });

  it('renders imperial unit toggle button', () => {
    render(<Controls {...defaultProps} isMetric={false} />);
    
    const unitButton = screen.getByTestId('unit-toggle-button');
    expect(unitButton).toHaveTextContent('Switch to');
    expect(unitButton).toHaveTextContent('km/h');
  });

  it('calls onToggleUnits when unit button is clicked', async () => {
    render(<Controls {...defaultProps} />);
    
    const unitButton = screen.getByTestId('unit-toggle-button');
    await userEvent.click(unitButton);
    
    expect(defaultProps.onToggleUnits).toHaveBeenCalledTimes(1);
  });

  it('disables unit button when processing', () => {
    render(<Controls {...defaultProps} isProcessing={true} />);
    
    const unitButton = screen.getByTestId('unit-toggle-button');
    expect(unitButton).toBeDisabled();
  });

  it('has proper accessibility attributes', () => {
    render(<Controls {...defaultProps} />);
    
    const recordButton = screen.getByTestId('record-button');
    const unitButton = screen.getByTestId('unit-toggle-button');
    
    expect(recordButton).toHaveAttribute('aria-label', 'Start Listening');
    expect(unitButton).toHaveAttribute('aria-label', 'Switch to mph');
  });

  it('updates accessibility labels based on state', () => {
    const { rerender } = render(<Controls {...defaultProps} />);
    
    let recordButton = screen.getByTestId('record-button');
    expect(recordButton).toHaveAttribute('aria-label', 'Start Listening');
    
    rerender(<Controls {...defaultProps} isRecording={true} />);
    recordButton = screen.getByTestId('record-button');
    expect(recordButton).toHaveAttribute('aria-label', 'Stop Listening');
  });
});