/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './DebugConsole.css';
import { useFFTStatus, FFTStatus } from '../services/fft-status';

export interface LogEntry {
  timestamp: string;
  type: 'LOG' | 'ERROR' | 'WARN' | 'INFO';
  message: string;
  color: string;
}

export interface DebugConsoleProps {
  logs?: LogEntry[];
  onAddLog?: (entry: LogEntry) => void;
  interceptConsole?: boolean;
  'data-testid'?: string;
}

export const DebugConsole: React.FC<DebugConsoleProps> = ({ 
  logs: externalLogs,
  onAddLog,
  interceptConsole = true,
  'data-testid': testId = 'debug-console' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [internalLogs, setInternalLogs] = useState<LogEntry[]>([]);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const originalConsole = useRef<any>({});
  const isAddingLogRef = useRef(false);
  const fftStatus = useFFTStatus();

  const logs = externalLogs || internalLogs;

  const addLogEntry = useCallback((type: LogEntry['type'], message: string, color: string) => {
    // Prevent infinite recursion by checking if we're already adding a log entry
    if (isAddingLogRef.current) return;
    
    isAddingLogRef.current = true;
    
    try {
      const timestamp = new Date().toLocaleTimeString();
      const newEntry: LogEntry = { timestamp, type, message, color };
      
      if (onAddLog) {
        onAddLog(newEntry);
      } else {
        setInternalLogs(prevLogs => {
          const newLogs = [...prevLogs, newEntry];
          return newLogs.length > 50 ? newLogs.slice(-50) : newLogs;
        });
      }
    } finally {
      isAddingLogRef.current = false;
    }
  }, [onAddLog]);

  useEffect(() => {
    if (!interceptConsole) return;

    originalConsole.current = {
      log: console.log,
      error: console.error,
      warn: console.warn
    };

    console.log = (...args: any[]) => {
      originalConsole.current.log(...args);
      addLogEntry('LOG', args.join(' '), '#00ff00');
    };

    console.error = (...args: any[]) => {
      originalConsole.current.error(...args);
      addLogEntry('ERROR', args.join(' '), '#ff4444');
    };

    console.warn = (...args: any[]) => {
      originalConsole.current.warn(...args);
      addLogEntry('WARN', args.join(' '), '#ffaa00');
    };

    addLogEntry('INFO', 'Debug console ready - user-friendly messages enabled', '#00aaff');

    return () => {
      console.log = originalConsole.current.log;
      console.error = originalConsole.current.error;
      console.warn = originalConsole.current.warn;
    };
  }, [interceptConsole, addLogEntry]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Log FFT status changes
  useEffect(() => {
    if (fftStatus) {
      const statusMessage = formatFFTStatus(fftStatus);
      addLogEntry('INFO', `FFT Status: ${statusMessage}`, '#00aaff');
    }
  }, [fftStatus, addLogEntry]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const copyLogsToClipboard = async () => {
    try {
      const logText = logs.map(log => 
        `[${log.timestamp}] ${log.type}: ${log.message}`
      ).join('\n');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(logText);
        addLogEntry('INFO', '📋 Debug logs copied to clipboard', '#00aaff');
        showCopyFeedback();
      } else {
        fallbackCopyToClipboard(logText);
      }
    } catch (error) {
      addLogEntry('ERROR', `Failed to copy logs to clipboard: ${error}`, '#ff4444');
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      addLogEntry('INFO', '📋 Debug logs copied to clipboard (fallback)', '#00aaff');
      showCopyFeedback();
    } catch (error) {
      addLogEntry('ERROR', `Fallback copy failed: ${error}`, '#ff4444');
    }

    document.body.removeChild(textArea);
  };

  const showCopyFeedback = () => {
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 200);
  };

  const formatFFTStatus = (status: FFTStatus): string => {
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

  const clearLogs = () => {
    if (onAddLog) {
      // Can't clear external logs
      addLogEntry('WARN', 'Cannot clear external logs', '#ffaa00');
    } else {
      setInternalLogs([]);
      addLogEntry('INFO', 'Debug console cleared', '#00aaff');
    }
  };

  return (
    <div data-testid={testId}>
      <button
        className="debug-toggle-button"
        onClick={toggleVisibility}
        data-testid="debug-toggle-button"
        aria-label={isVisible ? 'Hide Debug Console' : 'Show Debug Console'}
      >
        {isVisible ? 'Hide Debug Console' : 'Show Debug Console'}
      </button>

      {isVisible && (
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
          
          {fftStatus && (
            <div className="debug-fft-status" data-testid="debug-fft-status">
              <div className="debug-fft-status-header">FFT Status</div>
              <div className="debug-fft-status-content">
                <span className={`debug-fft-implementation ${fftStatus.implementation.toLowerCase()}`}>
                  {fftStatus.implementation}
                </span>
                <span className="debug-fft-mode">({fftStatus.mode})</span>
                {fftStatus.wasmWorking && <span className="debug-fft-badge wasm-working">WASM</span>}
                {fftStatus.simdSize && <span className="debug-fft-badge simd">SIMD: {fftStatus.simdSize}</span>}
              </div>
            </div>
          )}
          <div
            ref={logContainerRef}
            className={`debug-log-container ${copyFeedback ? 'copy-feedback' : ''}`}
            onClick={copyLogsToClipboard}
            data-testid="debug-log-container"
            title="Click to copy all logs to clipboard"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                copyLogsToClipboard();
              }
            }}
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
      )}
    </div>
  );
};