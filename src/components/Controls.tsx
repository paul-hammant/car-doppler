/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */
import React from 'react';
import './Controls.css';

interface ControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  isMetric: boolean;
  onToggleRecording: () => void;
  onToggleUnits: () => void;
  'data-testid'?: string;
}

export const Controls: React.FC<ControlsProps> = ({ 
  isRecording, 
  isProcessing, 
  isMetric, 
  onToggleRecording, 
  onToggleUnits,
  'data-testid': testId = 'controls'
}) => {
  const recordButtonText = isRecording ? 'Stop\nListening' : 'Start\nListening';
  const unitButtonText = isMetric ? 'Switch to\nmph' : 'Switch to\nkm/h';

  return (
    <div className="controls" data-testid={testId}>
      <button
        className={`control-button record-button ${isRecording ? 'recording' : ''}`}
        onClick={onToggleRecording}
        disabled={isProcessing}
        data-testid="record-button"
        aria-label={recordButtonText.replace('\n', ' ')}
      >
        {recordButtonText.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index === 0 && <br />}
          </React.Fragment>
        ))}
      </button>
      
      <button
        className="control-button unit-button"
        onClick={onToggleUnits}
        disabled={isProcessing}
        data-testid="unit-toggle-button"
        aria-label={`Switch to ${isMetric ? 'mph' : 'km/h'}`}
      >
        {unitButtonText.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index === 0 && <br />}
          </React.Fragment>
        ))}
      </button>
    </div>
  );
};

// Removed default export: export default Controls;