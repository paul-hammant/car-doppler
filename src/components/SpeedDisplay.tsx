/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import React from 'react';
import './SpeedDisplay.css';

interface SpeedDisplayProps {
  speed: string;
  unit: string;
  color: string;
  'data-testid'?: string;
}

export const SpeedDisplay: React.FC<SpeedDisplayProps> = ({ 
  speed, 
  unit, 
  color, 
  'data-testid': testId = 'speed-display' 
}) => {
  // Check if this is an error code (starts with E and followed by digits)
  const isErrorCode = /^E\d+$/.test(speed);
  const errorPageUrl = isErrorCode ? `/car-doppler/errors/${speed.toLowerCase()}/` : null;

  const speedElement = isErrorCode ? (
    <a 
      href={errorPageUrl}
      className="speed-value error-link" 
      style={{ color, textDecoration: 'none' }} 
      data-testid="speed-value"
      aria-label={`Error code ${speed}: Click for help`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {speed}
    </a>
  ) : (
    <span 
      className="speed-value" 
      style={{ color }} 
      data-testid="speed-value"
      aria-label={`Speed: ${speed} ${unit}`}
    >
      {speed}
    </span>
  );

  return (
    <div className="speed-display" data-testid={testId}>
      {speedElement}
      <span 
        className="speed-unit" 
        data-testid="speed-unit"
        aria-label={isErrorCode ? "Error code" : `Unit: ${unit}`}
      >
        {isErrorCode ? "Error" : unit}
      </span>
    </div>
  );
};

export default SpeedDisplay;