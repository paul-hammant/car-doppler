/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import React, { useState } from 'react';
import './PositioningGuide.css';

export interface PositioningGuideProps {
  'data-testid'?: string;
}

export const PositioningGuide: React.FC<PositioningGuideProps> = ({ 
  'data-testid': testId = 'positioning-guide' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="positioning-guide" data-testid={testId}>
      <div className="positioning-header">
        <span className="positioning-title">📍 Positioning and Safety Guide</span>
        <button 
          className="positioning-toggle"
          onClick={toggleExpanded}
          data-testid="positioning-toggle"
          aria-label={isExpanded ? 'Collapse positioning guide' : 'Expand positioning guide'}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'collapse' : 'read more...'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="positioning-details" data-testid="positioning-details">
          <div className="positioning-content">
            <strong>Recording tip:</strong> Try to record for <strong>4+ seconds of the approach and 4+ seconds of the recede</strong> for best results.<br/>
            <strong>For accurate readings:</strong> Stand <strong>perpendicular</strong> to traffic, <strong>no more than 5 meters/yards</strong> from the line the center of car travels along. Point device toward vehicles. Use single-lane, quiet areas.
          </div>
          <div className="positioning-safety">
            ⚠️ <strong>Safety:</strong> Maintain safe distance from roadway, preferably behind a physical barrier<br/>
            🚴 <strong>Security & Tip:</strong> Be aware of phone theft by eBike riders - wired Lightning/USB-C microphones work great and keep your phone secure
          </div>
        </div>
      )}
    </div>
  );
};