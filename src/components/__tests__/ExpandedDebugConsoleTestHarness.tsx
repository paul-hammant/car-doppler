/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import React, { useState, useEffect } from 'react';
import { LogEntry } from '../DebugConsole';
import { BaseTestHarness, useTestHarness, parseLogsFromParams } from './BaseTestHarness';
import '../DebugConsole.css';

// Mock FFT Status for expanded console test
const mockFFTStatus = {
  mode: 'test',
  implementation: 'Mock',
  wasmLoaded: true,
  wasmWorking: true,
  simdSize: 4,
  timestamp: Date.now()
};

// Expanded Debug Console Component for Testing
const ExpandedDebugConsole: React.FC<{
  logs: LogEntry[];
  onAddLog?: (entry: LogEntry) => void;
  'data-testid'?: string;
}> = ({ logs, onAddLog, 'data-testid': testId = 'debug-console' }) => {
  const [copyFeedback, setCopyFeedback] = useState(false);

  const addLogEntry = (type: 'LOG' | 'ERROR' | 'WARN' | 'INFO', message: string, color: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const newEntry: LogEntry = { timestamp, type, message, color };
    if (onAddLog) {
      onAddLog(newEntry);
    }
  };

  const copyLogsToClipboard = async () => {
    try {
      const logText = logs.map(log => `[${log.timestamp}] ${log.type}: ${log.message}`).join('\n');
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 200);
      addLogEntry('INFO', '📋 Debug logs copied to clipboard', '#00aaff');
    } catch (error) {
      addLogEntry('ERROR', `Failed to copy logs to clipboard: ${error}`, '#ff4444');
    }
  };

  const clearLogs = () => {
    addLogEntry('INFO', 'Debug console cleared', '#00aaff');
  };

  const formatFFTStatus = (status: typeof mockFFTStatus) => {
    const parts = [
      `Mode: ${status.mode}`,
      `Implementation: ${status.implementation}`
    ];
    if (status.wasmLoaded) {
      parts.push('WASM Loaded');
    }
    if (status.wasmWorking) {
      parts.push('WASM Working');
    }
    if (status.simdSize) {
      parts.push(`SIMD Size: ${status.simdSize}`);
    }
    return parts.join(', ');
  };

  return (
    <div data-testid={testId}>
      {/* Toggle button showing expanded state */}
      <button 
        className="debug-toggle-button" 
        data-testid="debug-toggle-button"
        aria-label="Hide Debug Console"
      >
        Hide Debug Console
      </button>
      
      {/* Expanded console container - always visible in this test harness */}
      <div className="debug-console-container" data-testid="debug-console-container">
        <div className="debug-console-header">
          <span>Debug Console ({logs.length})</span>
          <button 
            className="debug-clear-button" 
            onClick={clearLogs}
            data-testid="debug-clear-button"
            aria-label="Clear debug logs"
            title="Clear debug logs"
          >
            Clear
          </button>
        </div>

        {/* FFT Status section */}
        <div className="debug-fft-status" data-testid="debug-fft-status">
          <div className="debug-fft-status-header">FFT Status</div>
          <div className="debug-fft-status-content">
            <span className={`debug-fft-implementation ${mockFFTStatus.implementation.toLowerCase()}`}>
              {mockFFTStatus.implementation}
            </span>
            <span className="debug-fft-mode">({mockFFTStatus.mode})</span>
            {mockFFTStatus.wasmWorking && (
              <span className="debug-fft-badge wasm-working">WASM</span>
            )}
            {mockFFTStatus.simdSize && (
              <span className="debug-fft-badge simd">SIMD: {mockFFTStatus.simdSize}</span>
            )}
          </div>
        </div>

        {/* Log container */}
        <div 
          className={`debug-log-container ${copyFeedback ? 'copy-feedback' : ''}`}
          onClick={copyLogsToClipboard}
          data-testid="debug-log-container"
          title="Click to copy all logs to clipboard"
          role="button"
          tabIndex={0}
          aria-label="Debug log entries, click to copy to clipboard"
        >
          {logs.length === 0 ? (
            <div className="debug-log-entry debug-log-empty" data-testid="debug-log-empty">
              No logs yet...
            </div>
          ) : (
            logs.map((log, index) => (
              <div 
                key={index}
                className="debug-log-entry" 
                style={{ color: log.color }}
                data-testid={`debug-log-entry-${index}`}
              >
                [{log.timestamp}] {log.type}: {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Test Harness for Expanded Debug Console
export const ExpandedDebugConsoleTestHarness: React.FC<{
  testName: string;
  logs?: string | LogEntry[];
}> = ({ 
  testName,
  logs = []
}) => {
  const parsedLogs = parseLogsFromParams(logs);
  const [harnessLogs, setHarnessLogs] = useState<LogEntry[]>(parsedLogs);

  const handleAddLog = (entry: LogEntry) => {
    setHarnessLogs(prev => [...prev, entry]);
  };

  const harnessStateContent = (
    <>
      <div data-testid="harness-log-count">
        Log Count: {harnessLogs.length}
      </div>
      <div data-testid="harness-expanded-state">
        Debug Console State: EXPANDED (for testing)
      </div>
    </>
  );

  const productionEventControls = (
    <div style={{ border: '2px solid #dc3545', padding: '10px', margin: '10px 0' }}>
      <h3>Production Event Simulation</h3>
      <p style={{ fontSize: '12px', margin: '5px 0' }}>
        Simulate real production events being sent to the debug console:
      </p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <ExpandedDebugLogButtons onAddLog={handleAddLog} />
      </div>
    </div>
  );

  const initialEventMessage = `Expanded DebugConsole harness initialized with ${harnessLogs.length} logs. Console is rendered in expanded state for testing`;

  return (
    <BaseTestHarness 
      testName={testName}
      harnessStateContent={harnessStateContent}
      additionalSections={productionEventControls}
      initialEventMessage={initialEventMessage}
    >
      <ExpandedDebugConsoleWithLogging
        logs={harnessLogs}
        onAddLog={handleAddLog}
      />
    </BaseTestHarness>
  );
};

// Helper component for log buttons with event logging
const ExpandedDebugLogButtons: React.FC<{
  onAddLog: (entry: LogEntry) => void;
}> = ({ onAddLog }) => {
  const { logEvent } = useTestHarness();

  const addInfoLog = () => {
    const timestamp = new Date().toLocaleTimeString();
    const entry = {
      timestamp,
      type: 'INFO' as const,
      message: 'User clicked Info button - simulated production event',
      color: '#00aaff'
    };
    onAddLog(entry);
    logEvent(`Log added: ${entry.type} - ${entry.message}`);
  };

  const addWarningLog = () => {
    const timestamp = new Date().toLocaleTimeString();
    const entry = {
      timestamp,
      type: 'WARN' as const,
      message: 'Performance warning detected - simulated production event',
      color: '#ffaa00'
    };
    onAddLog(entry);
    logEvent(`Log added: ${entry.type} - ${entry.message}`);
  };

  const addErrorLog = () => {
    const timestamp = new Date().toLocaleTimeString();
    const entry = {
      timestamp,
      type: 'ERROR' as const,
      message: 'Connection timeout error - simulated production event',
      color: '#ff4444'
    };
    onAddLog(entry);
    logEvent(`Log added: ${entry.type} - ${entry.message}`);
  };

  const addMultipleLogs = () => {
    const timestamp = new Date().toLocaleTimeString();
    logEvent('Starting batch log operation');
    
    // Add multiple logs in sequence to test batch handling
    const entry1 = {
      timestamp,
      type: 'INFO' as const,
      message: 'Batch operation started',
      color: '#00aaff'
    };
    onAddLog(entry1);
    logEvent(`Log added: ${entry1.type} - ${entry1.message}`);
    
    setTimeout(() => {
      const entry2 = {
        timestamp: new Date().toLocaleTimeString(),
        type: 'WARN' as const,
        message: 'Batch operation warning',
        color: '#ffaa00'
      };
      onAddLog(entry2);
      logEvent(`Log added: ${entry2.type} - ${entry2.message}`);
    }, 100);
    
    setTimeout(() => {
      const entry3 = {
        timestamp: new Date().toLocaleTimeString(),
        type: 'INFO' as const,
        message: 'Batch operation completed',
        color: '#00aaff'
      };
      onAddLog(entry3);
      logEvent(`Log added: ${entry3.type} - ${entry3.message}`);
    }, 200);
  };

  return (
    <>
      <button 
        data-testid="add-info-log"
        onClick={addInfoLog}
        style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px' }}
      >
        Add INFO Log
      </button>
      <button 
        data-testid="add-warning-log"
        onClick={addWarningLog}
        style={{ padding: '5px 10px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '3px' }}
      >
        Add WARNING Log
      </button>
      <button 
        data-testid="add-error-log"
        onClick={addErrorLog}
        style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px' }}
      >
        Add ERROR Log
      </button>
      <button 
        data-testid="add-multiple-logs"
        onClick={addMultipleLogs}
        style={{ padding: '5px 10px', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '3px' }}
      >
        Add Multiple Logs
      </button>
    </>
  );
};

// Wrapper component that uses the test harness context for logging
const ExpandedDebugConsoleWithLogging: React.FC<{
  logs: LogEntry[];
  onAddLog: (entry: LogEntry) => void;
}> = ({ logs, onAddLog }) => {
  const { logEvent } = useTestHarness();

  const handleAddLogWithLogging = (entry: LogEntry) => {
    onAddLog(entry);
    logEvent(`Log added: ${entry.type} - ${entry.message}`);
  };

  return (
    <ExpandedDebugConsole 
      logs={logs}
      onAddLog={handleAddLogWithLogging}
    />
  );
};