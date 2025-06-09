/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { FileInput } from '../FileInput';

describe('FileInput', () => {
  const defaultProps = {
    onFileSelect: vi.fn(),
    onDownload: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders file input and download button', () => {
    render(<FileInput {...defaultProps} />);
    
    expect(screen.getByText('Or load audio file:')).toBeInTheDocument();
    expect(screen.getByTestId('file-select-button')).toHaveTextContent('📁 Choose File');
    expect(screen.getByTestId('download-button')).toHaveTextContent('⬇️ Download');
  });

  it('calls onFileSelect when file is selected', async () => {
    render(<FileInput {...defaultProps} />);
    
    const file = new File(['test'], 'test.wav', { type: 'audio/wav' });
    const fileInput = screen.getByTestId('file-input-element');
    
    await userEvent.upload(fileInput, file);
    
    expect(defaultProps.onFileSelect).toHaveBeenCalledWith(file);
  });

  it('calls onDownload when download button is clicked', async () => {
    render(<FileInput {...defaultProps} hasRecording={true} />);
    
    const downloadButton = screen.getByTestId('download-button');
    await userEvent.click(downloadButton);
    
    expect(defaultProps.onDownload).toHaveBeenCalledTimes(1);
  });

  it('opens file dialog when choose file button is clicked', async () => {
    render(<FileInput {...defaultProps} />);
    
    const fileInput = screen.getByTestId('file-input-element');
    const chooseFileButton = screen.getByTestId('file-select-button');
    
    const clickSpy = vi.spyOn(fileInput, 'click');
    
    await userEvent.click(chooseFileButton);
    
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('disables download button when no recording', () => {
    render(<FileInput {...defaultProps} hasRecording={false} />);
    
    const downloadButton = screen.getByTestId('download-button');
    expect(downloadButton).toBeDisabled();
    expect(downloadButton).toHaveClass('disabled');
  });

  it('enables download button when has recording', () => {
    render(<FileInput {...defaultProps} hasRecording={true} />);
    
    const downloadButton = screen.getByTestId('download-button');
    expect(downloadButton).not.toBeDisabled();
    expect(downloadButton).not.toHaveClass('disabled');
  });

  it('disables all buttons when disabled prop is true', () => {
    render(<FileInput {...defaultProps} disabled={true} />);
    
    const chooseFileButton = screen.getByTestId('file-select-button');
    const downloadButton = screen.getByTestId('download-button');
    
    expect(chooseFileButton).toBeDisabled();
    expect(downloadButton).toBeDisabled();
  });

  it('has correct file input attributes', () => {
    render(<FileInput {...defaultProps} />);
    
    const fileInput = screen.getByTestId('file-input-element');
    
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept', 'audio/*,.wav,.mp3,.m4a');
    expect(fileInput).toHaveAttribute('aria-label', 'Select audio file for analysis');
  });

  it('has proper accessibility attributes', () => {
    render(<FileInput {...defaultProps} />);
    
    const chooseFileButton = screen.getByTestId('file-select-button');
    const downloadButton = screen.getByTestId('download-button');
    
    expect(chooseFileButton).toHaveAttribute('aria-label', 'Select audio file for analysis');
    expect(downloadButton).toHaveAttribute('aria-label', 'Download recorded audio');
    expect(downloadButton).toHaveAttribute('title', 'Download recorded audio');
  });

  it('accepts custom test id', () => {
    render(<FileInput {...defaultProps} data-testid="custom-file-input" />);
    
    expect(screen.getByTestId('custom-file-input')).toBeInTheDocument();
  });

  it('does not call onFileSelect when no file is selected', async () => {
    render(<FileInput {...defaultProps} />);
    
    const fileInput = screen.getByTestId('file-input-element');
    
    // Simulate clicking but not selecting a file
    await userEvent.click(fileInput);
    
    expect(defaultProps.onFileSelect).not.toHaveBeenCalled();
  });

  it('handles onFileSelect being undefined', () => {
    render(<FileInput onDownload={defaultProps.onDownload} />);
    
    const fileInput = screen.getByTestId('file-input-element');
    const file = new File(['test'], 'test.wav', { type: 'audio/wav' });
    
    // Should not throw error when onFileSelect is undefined
    expect(() => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    }).not.toThrow();
  });
});