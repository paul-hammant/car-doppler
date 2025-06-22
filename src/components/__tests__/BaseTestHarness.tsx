/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import React, { useState, useEffect, ReactNode } from 'react';

// Common interface for test harness props
export interface BaseTestHarnessProps {
  testName: string;
  children: ReactNode;
  harnessStateContent?: ReactNode;
  additionalSections?: ReactNode;
  initialEventMessage?: string;
}

// Base Test Harness Component - provides common layout and event logging
export const BaseTestHarness: React.FC<BaseTestHarnessProps> = ({ 
  testName,
  children,
  harnessStateContent,
  additionalSections,
  initialEventMessage
}) => {
  const [eventLog, setEventLog] = useState<string[]>([]);

  const logEvent = (event: string) => {
    setEventLog(prev => [...prev, `${new Date().toISOString()}: ${event}`]);
  };

  // Log initial setup event
  useEffect(() => {
    if (initialEventMessage) {
      logEvent(initialEventMessage);
    }
  }, [initialEventMessage]);

  // Expose logEvent function to parent components via a ref or context
  // For now, we'll pass it through React context
  return (
    <TestHarnessContext.Provider value={{ logEvent }}>
      <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '300px' }}>
        <h2 data-testid="test-name">Test: {testName}</h2>
        
        {/* Component Under Test */}
        <div style={{ border: '2px solid #007acc', padding: '10px', margin: '10px 0' }}>
          <h3>Component Under Test</h3>
          {children}
        </div>

        {/* Test Harness State - what we can assert on */}
        {harnessStateContent && (
          <div style={{ border: '2px solid #28a745', padding: '10px', margin: '10px 0' }}>
            <h3>Test Harness State</h3>
            {harnessStateContent}
          </div>
        )}

        {/* Additional sections (e.g., production event simulation controls) */}
        {additionalSections}

        {/* Event Log - traces the event coupling */}
        <div style={{ border: '2px solid #ffc107', padding: '10px', margin: '10px 0' }}>
          <h3>Event Log (Event Coupling Trace)</h3>
          <div data-testid="event-log" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
            {eventLog.length === 0 ? 'No events yet...' : eventLog.map((event, i) => (
              <div key={i} data-testid={`event-${i}`}>{event}</div>
            ))}
          </div>
        </div>
      </div>
    </TestHarnessContext.Provider>
  );
};

// Context for sharing logEvent function with child components
export const TestHarnessContext = React.createContext<{
  logEvent: (event: string) => void;
}>({
  logEvent: () => {}
});

// Hook for using the test harness context
export const useTestHarness = () => {
  const context = React.useContext(TestHarnessContext);
  if (!context) {
    throw new Error('useTestHarness must be used within a BaseTestHarness');
  }
  return context;
};

// Common utility for parsing logs from URL params
export const parseLogsFromParams = <T,>(logs: string | T[]): T[] => {
  return typeof logs === 'string' ? 
    (logs ? JSON.parse(decodeURIComponent(logs)) : []) : 
    logs;
};