/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusDisplay } from '../StatusDisplay';

describe('StatusDisplay', () => {
  const defaultProps = {
    isRecording: false,
    isProcessing: false,
  };

  it('renders ready state correctly', () => {
    render(<StatusDisplay {...defaultProps} />);
    
    const statusDisplay = screen.getByTestId('status-display');
    const statusText = screen.getByTestId('status-text');
    
    expect(statusDisplay).toHaveClass('status-display', 'status-ready');
    expect(statusText).toHaveTextContent('Ready to start listening');
    expect(statusText).toHaveAttribute('aria-label', 'Status: Ready to start listening');
  });

  it('renders recording state correctly', () => {
    render(<StatusDisplay {...defaultProps} isRecording={true} />);
    
    const statusDisplay = screen.getByTestId('status-display');
    const statusText = screen.getByTestId('status-text');
    
    expect(statusDisplay).toHaveClass('status-display', 'status-recording');
    expect(statusText).toHaveTextContent('Listening for vehicle...');
    expect(statusText).toHaveAttribute('aria-label', 'Status: Listening for vehicle...');
  });

  it('renders processing state correctly', () => {
    render(<StatusDisplay {...defaultProps} isProcessing={true} />);
    
    const statusDisplay = screen.getByTestId('status-display');
    const statusText = screen.getByTestId('status-text');
    
    expect(statusDisplay).toHaveClass('status-display', 'status-processing');
    expect(statusText).toHaveTextContent('Processing...');
    expect(statusText).toHaveAttribute('aria-label', 'Status: Processing...');
  });

  it('renders processing state with custom progress', () => {
    render(<StatusDisplay {...defaultProps} isProcessing={true} processingProgress="Calculating... 3s" />);
    
    const statusText = screen.getByTestId('status-text');
    
    expect(statusText).toHaveTextContent('Calculating... 3s');
    expect(statusText).toHaveAttribute('aria-label', 'Status: Calculating... 3s');
  });

  it('renders error state correctly', () => {
    render(<StatusDisplay {...defaultProps} error="E09: No clear pattern detected" />);
    
    const statusDisplay = screen.getByTestId('status-display');
    const statusText = screen.getByTestId('status-text');
    
    expect(statusDisplay).toHaveClass('status-display', 'status-error');
    expect(statusText).toHaveTextContent('E09: No clear pattern detected');
    expect(statusText).toHaveAttribute('aria-label', 'Status: E09: No clear pattern detected');
  });

  it('prioritizes error over other states', () => {
    render(<StatusDisplay {...defaultProps} isRecording={true} isProcessing={true} error="Error occurred" />);
    
    const statusDisplay = screen.getByTestId('status-display');
    const statusText = screen.getByTestId('status-text');
    
    expect(statusDisplay).toHaveClass('status-display', 'status-error');
    expect(statusText).toHaveTextContent('Error occurred');
  });

  it('prioritizes processing over recording', () => {
    render(<StatusDisplay {...defaultProps} isRecording={true} isProcessing={true} />);
    
    const statusDisplay = screen.getByTestId('status-display');
    const statusText = screen.getByTestId('status-text');
    
    expect(statusDisplay).toHaveClass('status-display', 'status-processing');
    expect(statusText).toHaveTextContent('Processing...');
  });

  it('accepts custom test id', () => {
    render(<StatusDisplay {...defaultProps} data-testid="custom-status" />);
    
    expect(screen.getByTestId('custom-status')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<StatusDisplay {...defaultProps} />);
    
    const statusText = screen.getByTestId('status-text');
    
    expect(statusText).toHaveAttribute('aria-live', 'polite');
    expect(statusText).toHaveAttribute('aria-label');
  });
});