/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import React, { useState, useEffect } from 'react';
import { DebugConsole, LogEntry } from '../DebugConsole';
import { BaseTestHarness, useTestHarness, parseLogsFromParams } from './BaseTestHarness';

// Test Harness Component - simulates how DebugConsole would be used in the real app
export const DebugConsoleTestHarness: React.FC<{
  testName: string;
  logs?: string | LogEntry[];
  interceptConsole?: boolean;
}> = ({ 
  testName,
  logs = [],
  interceptConsole = false
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
      <div data-testid="harness-intercept-state">
        Intercept Console: {interceptConsole ? 'YES' : 'NO'}
      </div>
    </>
  );

  const initialEventMessage = `DebugConsole harness initialized with ${harnessLogs.length} logs${interceptConsole ? '. Console interception enabled' : ''}`;

  return (
    <BaseTestHarness 
      testName={testName}
      harnessStateContent={harnessStateContent}
      initialEventMessage={initialEventMessage}
    >
      <DebugConsoleWithLogging
        logs={harnessLogs}
        interceptConsole={interceptConsole}
        onAddLog={handleAddLog}
      />
    </BaseTestHarness>
  );
};

// Wrapper component that uses the test harness context for logging
const DebugConsoleWithLogging: React.FC<{
  logs: LogEntry[];
  interceptConsole: boolean;
  onAddLog: (entry: LogEntry) => void;
}> = ({ logs, interceptConsole, onAddLog }) => {
  const { logEvent } = useTestHarness();

  const handleAddLogWithLogging = (entry: LogEntry) => {
    onAddLog(entry);
    logEvent(`Log added: ${entry.type} - ${entry.message}`);
  };

  return (
    <DebugConsole 
      logs={logs}
      interceptConsole={interceptConsole}
      onAddLog={handleAddLogWithLogging}
    />
  );
};