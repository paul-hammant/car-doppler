/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import React, { useState } from 'react';
import { Controls } from '../Controls';

// Test Harness Component - simulates how Controls would be used in the real app
export const ControlsTestHarness: React.FC<{
  initialRecording?: boolean;
  initialMetric?: boolean;
  initialProcessing?: boolean;
  testName: string;
}> = ({ 
  initialRecording = false, 
  initialMetric = true, 
  initialProcessing = false,
  testName 
}) => {
  const [isRecording, setIsRecording] = useState(initialRecording);
  const [isMetric, setIsMetric] = useState(initialMetric);
  const [isProcessing, setIsProcessing] = useState(initialProcessing);
  const [eventLog, setEventLog] = useState<string[]>([]);

  const logEvent = (event: string) => {
    setEventLog(prev => [...prev, `${new Date().toISOString()}: ${event}`]);
  };

  const handleToggleRecording = () => {
    const newState = !isRecording;
    setIsRecording(newState);
    logEvent(`Recording ${newState ? 'started' : 'stopped'}`);
  };

  const handleToggleUnits = () => {
    const newState = !isMetric;
    setIsMetric(newState);
    logEvent(`Units changed to ${newState ? 'metric' : 'imperial'}`);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '300px' }}>
      <h2 data-testid="test-name">Test: {testName}</h2>
      
      {/* Component Under Test */}
      <div style={{ border: '2px solid #007acc', padding: '10px', margin: '10px 0' }}>
        <h3>Component Under Test</h3>
        <Controls 
          isRecording={isRecording}
          isProcessing={isProcessing}
          isMetric={isMetric}
          onToggleRecording={handleToggleRecording}
          onToggleUnits={handleToggleUnits}
        />
      </div>

      {/* Test Harness State - what we can assert on */}
      <div style={{ border: '2px solid #28a745', padding: '10px', margin: '10px 0' }}>
        <h3>Test Harness State</h3>
        <div data-testid="harness-recording-state">
          Recording: {isRecording ? 'ON' : 'OFF'}
        </div>
        <div data-testid="harness-units-state">
          Units: {isMetric ? 'METRIC (km/h)' : 'IMPERIAL (mph)'}
        </div>
        <div data-testid="harness-processing-state">
          Processing: {isProcessing ? 'YES' : 'NO'}
        </div>
      </div>

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
  );
};