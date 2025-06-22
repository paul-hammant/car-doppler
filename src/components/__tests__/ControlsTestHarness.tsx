/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import React, { useState } from 'react';
import { Controls } from '../Controls';
import { BaseTestHarness, useTestHarness } from './BaseTestHarness';

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

  const harnessStateContent = (
    <>
      <div data-testid="harness-recording-state">
        Recording: {isRecording ? 'ON' : 'OFF'}
      </div>
      <div data-testid="harness-units-state">
        Units: {isMetric ? 'METRIC (km/h)' : 'IMPERIAL (mph)'}
      </div>
      <div data-testid="harness-processing-state">
        Processing: {isProcessing ? 'YES' : 'NO'}
      </div>
    </>
  );

  const initialEventMessage = `Controls harness initialized - Recording: ${isRecording ? 'ON' : 'OFF'}, Units: ${isMetric ? 'METRIC' : 'IMPERIAL'}`;

  return (
    <BaseTestHarness 
      testName={testName}
      harnessStateContent={harnessStateContent}
      initialEventMessage={initialEventMessage}
    >
      <ControlsWithLogging
        isRecording={isRecording}
        isProcessing={isProcessing}
        isMetric={isMetric}
        onRecordingChange={setIsRecording}
        onUnitsChange={setIsMetric}
      />
    </BaseTestHarness>
  );
};

// Wrapper component that uses the test harness context for logging
const ControlsWithLogging: React.FC<{
  isRecording: boolean;
  isProcessing: boolean;
  isMetric: boolean;
  onRecordingChange: (state: boolean) => void;
  onUnitsChange: (state: boolean) => void;
}> = ({ isRecording, isProcessing, isMetric, onRecordingChange, onUnitsChange }) => {
  const { logEvent } = useTestHarness();

  const handleToggleRecording = () => {
    const newState = !isRecording;
    onRecordingChange(newState);
    logEvent(`Recording ${newState ? 'started' : 'stopped'}`);
  };

  const handleToggleUnits = () => {
    const newState = !isMetric;
    onUnitsChange(newState);
    logEvent(`Units changed to ${newState ? 'metric' : 'imperial'}`);
  };

  return (
    <Controls 
      isRecording={isRecording}
      isProcessing={isProcessing}
      isMetric={isMetric}
      onToggleRecording={handleToggleRecording}
      onToggleUnits={handleToggleUnits}
    />
  );
};