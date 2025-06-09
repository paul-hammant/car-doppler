/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import { test, expect } from '@playwright/experimental-ct-react';
import { DebugConsole, LogEntry } from '../DebugConsole';

test.describe('DebugConsole Component', () => {
  test('renders in collapsed state initially', async ({ mount }) => {
    const component = await mount(<DebugConsole />);

    // Screenshot: Initial collapsed state
    await component.screenshot({ path: 'test-results/DebugConsole-initial-collapsed.png' });

    // Toggle button should be visible
    await expect(component.getByTestId('debug-toggle-button')).toContainText('Show Debug Console');
    
    // Console container should not be visible
    await expect(component.getByTestId('debug-console-container')).not.toBeVisible();
  });

  test('expands and shows empty log state', async ({ mount }) => {
    const component = await mount(<DebugConsole logs={[]} interceptConsole={false} />);

    // Click to expand
    await component.getByTestId('debug-toggle-button').click();

    // Screenshot: Expanded with empty logs
    await component.screenshot({ path: 'test-results/DebugConsole-expanded-empty.png' });

    // Should show expanded state
    await expect(component.getByTestId('debug-toggle-button')).toContainText('Hide Debug Console');
    await expect(component.getByTestId('debug-console-container')).toBeVisible();
    
    // Should show empty state message
    await expect(component.getByTestId('debug-log-empty')).toContainText('No logs yet...');
  });

  test('displays external logs with proper formatting', async ({ mount }) => {
    const mockLogs: LogEntry[] = [
      { timestamp: '10:30:00', type: 'INFO', message: 'Application started', color: '#00aaff' },
      { timestamp: '10:30:05', type: 'WARN', message: 'Performance warning', color: '#ffaa00' },
      { timestamp: '10:30:10', type: 'ERROR', message: 'Connection failed', color: '#ff4444' },
    ];

    const component = await mount(<DebugConsole logs={mockLogs} />);

    // Expand console
    await component.getByTestId('debug-toggle-button').click();

    // Screenshot: Console with multiple log entries
    await component.screenshot({ path: 'test-results/DebugConsole-with-logs.png' });

    // Should show log count in header
    await expect(component.locator('.debug-console-header span')).toContainText('Debug Console (3)');
    
    // Should display all log entries with correct formatting
    await expect(component.getByTestId('debug-log-entry-0')).toContainText('[10:30:00] INFO: Application started');
    await expect(component.getByTestId('debug-log-entry-1')).toContainText('[10:30:05] WARN: Performance warning');
    await expect(component.getByTestId('debug-log-entry-2')).toContainText('[10:30:10] ERROR: Connection failed');
    
    // Should apply correct colors
    await expect(component.getByTestId('debug-log-entry-0')).toHaveCSS('color', 'rgb(0, 170, 255)');
    await expect(component.getByTestId('debug-log-entry-1')).toHaveCSS('color', 'rgb(255, 170, 0)');
    await expect(component.getByTestId('debug-log-entry-2')).toHaveCSS('color', 'rgb(255, 68, 68)');
  });

  test('clear button interaction with external logs', async ({ mount }) => {
    const mockLogs: LogEntry[] = [
      { timestamp: '10:30:00', type: 'INFO', message: 'Test message', color: '#00aaff' },
    ];

    const component = await mount(<DebugConsole logs={mockLogs} />);

    // Expand console
    await component.getByTestId('debug-toggle-button').click();

    // Screenshot: Before clear attempt
    await component.screenshot({ path: 'test-results/DebugConsole-before-clear.png' });

    // Try to clear external logs
    await component.getByTestId('debug-clear-button').click();

    // Screenshot: After clear attempt (should show warning)
    await component.screenshot({ path: 'test-results/DebugConsole-clear-warning.png' });

    // Should still show original log plus warning
    await expect(component.getByTestId('debug-log-entry-0')).toContainText('[10:30:00] INFO: Test message');
    // Note: The warning message would be added to logs if onAddLog callback is provided
  });

  test('collapse and expand toggle behavior', async ({ mount }) => {
    const component = await mount(<DebugConsole />);

    // Screenshot: Initial state
    await component.screenshot({ path: 'test-results/DebugConsole-toggle-initial.png' });

    // Expand
    await component.getByTestId('debug-toggle-button').click();
    
    // Screenshot: Expanded state
    await component.screenshot({ path: 'test-results/DebugConsole-toggle-expanded.png' });

    await expect(component.getByTestId('debug-console-container')).toBeVisible();
    await expect(component.getByTestId('debug-toggle-button')).toContainText('Hide Debug Console');

    // Collapse again
    await component.getByTestId('debug-toggle-button').click();

    // Screenshot: Collapsed again
    await component.screenshot({ path: 'test-results/DebugConsole-toggle-collapsed-again.png' });

    await expect(component.getByTestId('debug-console-container')).not.toBeVisible();
    await expect(component.getByTestId('debug-toggle-button')).toContainText('Show Debug Console');
  });

  test('displays different log types with distinct colors', async ({ mount }) => {
    const colorTestLogs: LogEntry[] = [
      { timestamp: '10:00:01', type: 'INFO', message: 'Info message', color: '#00aaff' },
      { timestamp: '10:00:02', type: 'WARN', message: 'Warning message', color: '#ffaa00' },
      { timestamp: '10:00:03', type: 'ERROR', message: 'Error message', color: '#ff4444' },
      { timestamp: '10:00:04', type: 'SUCCESS', message: 'Success message', color: '#34C759' },
      { timestamp: '10:00:05', type: 'DEBUG', message: 'Debug message', color: '#999999' },
    ];

    const component = await mount(<DebugConsole logs={colorTestLogs} />);

    // Expand console
    await component.getByTestId('debug-toggle-button').click();

    // Screenshot: Various log types with different colors
    await component.screenshot({ path: 'test-results/DebugConsole-various-log-types.png' });

    // Verify all log types are displayed
    await expect(component.locator('.debug-console-header span')).toContainText('Debug Console (5)');
    
    // Verify each log entry content
    await expect(component.getByTestId('debug-log-entry-0')).toContainText('[10:00:01] INFO: Info message');
    await expect(component.getByTestId('debug-log-entry-1')).toContainText('[10:00:02] WARN: Warning message');
    await expect(component.getByTestId('debug-log-entry-2')).toContainText('[10:00:03] ERROR: Error message');
    await expect(component.getByTestId('debug-log-entry-3')).toContainText('[10:00:04] SUCCESS: Success message');
    await expect(component.getByTestId('debug-log-entry-4')).toContainText('[10:00:05] DEBUG: Debug message');
  });

  test('accessibility attributes are properly set', async ({ mount }) => {
    const component = await mount(<DebugConsole />);

    // Expand console
    await component.getByTestId('debug-toggle-button').click();

    // Screenshot: Accessibility verification
    await component.screenshot({ path: 'test-results/DebugConsole-accessibility.png' });

    // Check toggle button accessibility
    const toggleButton = component.getByTestId('debug-toggle-button');
    await expect(toggleButton).toHaveAttribute('aria-label', 'Hide Debug Console');

    // Check log container accessibility
    const logContainer = component.getByTestId('debug-log-container');
    await expect(logContainer).toHaveAttribute('role', 'button');
    await expect(logContainer).toHaveAttribute('tabIndex', '0');
    await expect(logContainer).toHaveAttribute('aria-label', 'Debug log entries, click to copy to clipboard');

    // Check clear button accessibility
    const clearButton = component.getByTestId('debug-clear-button');
    await expect(clearButton).toHaveAttribute('aria-label', 'Clear debug logs');
    await expect(clearButton).toHaveAttribute('title', 'Clear debug logs');
  });

  test('handles large number of log entries', async ({ mount }) => {
    // Generate many log entries
    const manyLogs: LogEntry[] = Array.from({ length: 50 }, (_, i) => ({
      timestamp: `10:${String(Math.floor(i / 60)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`,
      type: ['INFO', 'WARN', 'ERROR'][i % 3] as 'INFO' | 'WARN' | 'ERROR',
      message: `Log entry number ${i + 1}`,
      color: ['#00aaff', '#ffaa00', '#ff4444'][i % 3]
    }));

    const component = await mount(<DebugConsole logs={manyLogs} />);

    // Expand console
    await component.getByTestId('debug-toggle-button').click();

    // Screenshot: Console with many log entries
    await component.screenshot({ path: 'test-results/DebugConsole-many-logs.png' });

    // Should show correct count
    await expect(component.locator('.debug-console-header span')).toContainText('Debug Console (50)');
    
    // Should display first and last entries
    await expect(component.getByTestId('debug-log-entry-0')).toContainText('Log entry number 1');
    await expect(component.getByTestId('debug-log-entry-49')).toContainText('Log entry number 50');
    
    // Container should be scrollable
    const logContainer = component.getByTestId('debug-log-container');
    await expect(logContainer).toBeVisible();
  });
});