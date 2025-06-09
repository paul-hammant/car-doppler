/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { DebugConsole, LogEntry } from '../DebugConsole';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

// Mock document.execCommand
document.execCommand = vi.fn();

describe('DebugConsole', () => {
  const mockLogs: LogEntry[] = [
    { timestamp: '10:30:00', type: 'INFO', message: 'Test info message', color: '#00aaff' },
    { timestamp: '10:30:01', type: 'ERROR', message: 'Test error message', color: '#ff4444' },
    { timestamp: '10:30:02', type: 'WARN', message: 'Test warning message', color: '#ffaa00' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders toggle button and is hidden by default', () => {
    render(<DebugConsole />);
    
    const toggleButton = screen.getByTestId('debug-toggle-button');
    expect(toggleButton).toHaveTextContent('Show Debug Console');
    expect(toggleButton).toHaveAttribute('aria-label', 'Show Debug Console');
    expect(screen.queryByTestId('debug-console-container')).not.toBeInTheDocument();
  });

  it('shows console when toggle button is clicked', async () => {
    render(<DebugConsole />);
    
    const toggleButton = screen.getByTestId('debug-toggle-button');
    await userEvent.click(toggleButton);
    
    expect(toggleButton).toHaveTextContent('Hide Debug Console');
    expect(toggleButton).toHaveAttribute('aria-label', 'Hide Debug Console');
    expect(screen.getByTestId('debug-console-container')).toBeInTheDocument();
  });

  it('hides console when toggle button is clicked again', async () => {
    render(<DebugConsole />);
    
    const toggleButton = screen.getByTestId('debug-toggle-button');
    
    // Show console
    await userEvent.click(toggleButton);
    expect(screen.getByTestId('debug-console-container')).toBeInTheDocument();
    
    // Hide console
    await userEvent.click(toggleButton);
    expect(screen.queryByTestId('debug-console-container')).not.toBeInTheDocument();
  });

  it('displays external logs when provided', async () => {
    render(<DebugConsole logs={mockLogs} />);
    
    const toggleButton = screen.getByTestId('debug-toggle-button');
    await userEvent.click(toggleButton);
    
    expect(screen.getByText('Debug Console (3)')).toBeInTheDocument();
    expect(screen.getByTestId('debug-log-entry-0')).toHaveTextContent('[10:30:00] INFO: Test info message');
    expect(screen.getByTestId('debug-log-entry-1')).toHaveTextContent('[10:30:01] ERROR: Test error message');
    expect(screen.getByTestId('debug-log-entry-2')).toHaveTextContent('[10:30:02] WARN: Test warning message');
  });

  it('shows empty state when no logs', async () => {
    render(<DebugConsole logs={[]} interceptConsole={false} />);
    
    const toggleButton = screen.getByTestId('debug-toggle-button');
    await userEvent.click(toggleButton);
    
    expect(screen.getByTestId('debug-log-empty')).toHaveTextContent('No logs yet...');
  });

  it('calls onAddLog when provided', () => {
    const onAddLog = vi.fn();
    render(<DebugConsole onAddLog={onAddLog} interceptConsole={false} />);
    
    // Manually trigger addLogEntry through console interception would be complex,
    // so we'll test the clear logs functionality which also calls addLogEntry
    const toggleButton = screen.getByTestId('debug-toggle-button');
    fireEvent.click(toggleButton);
    
    const clearButton = screen.getByTestId('debug-clear-button');
    fireEvent.click(clearButton);
    
    expect(onAddLog).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'WARN',
        message: 'Cannot clear external logs',
        color: '#ffaa00'
      })
    );
  });

  it('copies logs to clipboard when log container is clicked', async () => {
    const mockWriteText = navigator.clipboard.writeText as any;
    render(<DebugConsole logs={mockLogs} />);
    
    const toggleButton = screen.getByTestId('debug-toggle-button');
    await userEvent.click(toggleButton);
    
    const logContainer = screen.getByTestId('debug-log-container');
    await userEvent.click(logContainer);
    
    const expectedText = mockLogs.map(log => 
      `[${log.timestamp}] ${log.type}: ${log.message}`
    ).join('\n');
    
    expect(mockWriteText).toHaveBeenCalledWith(expectedText);
  });

  it('handles copy with keyboard interaction', async () => {
    const mockWriteText = navigator.clipboard.writeText as any;
    render(<DebugConsole logs={mockLogs} />);
    
    const toggleButton = screen.getByTestId('debug-toggle-button');
    await userEvent.click(toggleButton);
    
    const logContainer = screen.getByTestId('debug-log-container');
    logContainer.focus();
    await userEvent.keyboard('{Enter}');
    
    expect(mockWriteText).toHaveBeenCalled();
  });

  it('clears internal logs when clear button is clicked', async () => {
    render(<DebugConsole interceptConsole={false} />);
    
    const toggleButton = screen.getByTestId('debug-toggle-button');
    await userEvent.click(toggleButton);
    
    const clearButton = screen.getByTestId('debug-clear-button');
    await userEvent.click(clearButton);
    
    // Should show the cleared message and then empty state
    await waitFor(() => {
      expect(screen.getByText('Debug Console (2)')).toBeInTheDocument();
    });
  });

  it('applies correct colors to log entries', async () => {
    render(<DebugConsole logs={mockLogs} />);
    
    const toggleButton = screen.getByTestId('debug-toggle-button');
    await userEvent.click(toggleButton);
    
    expect(screen.getByTestId('debug-log-entry-0')).toHaveStyle({ color: '#00aaff' });
    expect(screen.getByTestId('debug-log-entry-1')).toHaveStyle({ color: '#ff4444' });
    expect(screen.getByTestId('debug-log-entry-2')).toHaveStyle({ color: '#ffaa00' });
  });

  it('has proper accessibility attributes', async () => {
    render(<DebugConsole logs={mockLogs} />);
    
    const toggleButton = screen.getByTestId('debug-toggle-button');
    await userEvent.click(toggleButton);
    
    const logContainer = screen.getByTestId('debug-log-container');
    const clearButton = screen.getByTestId('debug-clear-button');
    
    expect(logContainer).toHaveAttribute('role', 'button');
    expect(logContainer).toHaveAttribute('tabIndex', '0');
    expect(logContainer).toHaveAttribute('aria-label', 'Debug log entries, click to copy to clipboard');
    expect(logContainer).toHaveAttribute('title', 'Click to copy all logs to clipboard');
    expect(clearButton).toHaveAttribute('aria-label', 'Clear debug logs');
    expect(clearButton).toHaveAttribute('title', 'Clear debug logs');
  });

  it('accepts custom test id', () => {
    render(<DebugConsole data-testid="custom-debug-console" />);
    
    expect(screen.getByTestId('custom-debug-console')).toBeInTheDocument();
  });

  it('handles clipboard write failure gracefully', async () => {
    const mockWriteText = navigator.clipboard.writeText as any;
    mockWriteText.mockRejectedValueOnce(new Error('Clipboard failed'));
    
    render(<DebugConsole logs={mockLogs} />);
    
    const toggleButton = screen.getByTestId('debug-toggle-button');
    await userEvent.click(toggleButton);
    
    const logContainer = screen.getByTestId('debug-log-container');
    await userEvent.click(logContainer);
    
    // Should handle the error gracefully
    expect(mockWriteText).toHaveBeenCalled();
  });
});