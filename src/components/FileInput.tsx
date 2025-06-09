/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import React, { useRef, ChangeEvent } from 'react';
import './FileInput.css';

export interface FileInputProps {
  onFileSelect?: (file: File) => void;
  onDownload: () => void;
  disabled?: boolean;
  hasRecording?: boolean;
  'data-testid'?: string;
}

export const FileInput: React.FC<FileInputProps> = ({ 
  onFileSelect, 
  onDownload, 
  disabled = false,
  hasRecording = false,
  'data-testid': testId = 'file-input' 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDownloadClick = () => {
    onDownload();
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-input-container" data-testid={testId}>
      <div className="file-input-section">
        <label htmlFor="audio-file" className="file-input-label">
          Or load audio file:
        </label>
        <input
          ref={fileInputRef}
          type="file"
          id="audio-file"
          accept="audio/*,.wav,.mp3,.m4a"
          onChange={handleFileChange}
          className="file-input-hidden"
          data-testid="file-input-element"
          aria-label="Select audio file for analysis"
        />
        <button
          className="file-input-button"
          onClick={handleFileInputClick}
          disabled={disabled}
          data-testid="file-select-button"
          aria-label="Select audio file for analysis"
        >
          📁 Choose File
        </button>
      </div>
      <button
        className={`download-button ${!hasRecording ? 'disabled' : ''}`}
        onClick={handleDownloadClick}
        disabled={disabled || !hasRecording}
        data-testid="download-button"
        aria-label="Download recorded audio"
        title="Download recorded audio"
      >
        ⬇️ Download
      </button>
    </div>
  );
};