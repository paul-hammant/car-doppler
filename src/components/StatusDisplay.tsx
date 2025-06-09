/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import React from 'react';
import './StatusDisplay.css';

export interface StatusDisplayProps {
  isRecording: boolean;
  isProcessing: boolean;
  processingProgress?: string;
  error?: string;
  'data-testid'?: string;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  isRecording,
  isProcessing,
  processingProgress,
  error,
  'data-testid': testId = 'status-display'
}) => {
  const getStatusText = () => {
    if (error) return error;
    if (isProcessing) return processingProgress || 'Processing...';
    if (isRecording) return 'Listening for vehicle...';
    return 'Ready to start listening';
  };

  const getStatusClass = () => {
    if (error) return 'status-error';
    if (isProcessing) return 'status-processing';
    if (isRecording) return 'status-recording';
    return 'status-ready';
  };

  return (
    <div className={`status-display ${getStatusClass()}`} data-testid={testId}>
      <span 
        className="status-text"
        data-testid="status-text"
        aria-live="polite"
        aria-label={`Status: ${getStatusText()}`}
      >
        {getStatusText()}
      </span>
    </div>
  );
};