/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

export interface SpeedData {
  value: number | null;
  display: string;
  color: string;
}

export interface StatusMessage {
  message: string;
  type: 'info' | 'error' | 'success';
}

export interface AppState {
  isRecording: boolean;
  isProcessing: boolean;
  lastDetectedSpeed: number | null;
  isMetric: boolean;
  status: StatusMessage;
  speed: SpeedData;
}

export interface AudioChunk {
  audioData: Float32Array;
  rms?: number;
}

export interface WorkerMessage {
  type: 'init' | 'processAudio' | 'processBatch' | 'stop' | 'reset';
  data?: any;
}

export interface WorkerResponse {
  type: 'initialized' | 'frameProcessed' | 'batchComplete' | 'stopped' | 'resetComplete';
  data?: any;
}

export interface SpeedDetectionFrame {
  timestamp: number;
  spectralCentroid: number;
  rms: number;
  frameIndex: number;
  speed?: number;
}

export interface ErrorCode {
  code: string;
  message: string;
}

export const ERROR_MESSAGES: Record<string, string> = {
  E01: 'Too quiet - no vehicle heard',
  E02: 'Too noisy - background interference',
  E03: 'Recording too short (<3 seconds)',
  E04: 'Vehicle too slow or stationary',
  E05: 'Multiple vehicles detected',
  E06: 'Poor positioning - not perpendicular?',
  E07: 'Electric vehicle? Very quiet audio',
  E08: 'Audio clipped - too close or loud',
  E09: 'No clear Doppler pattern found',
  E10: 'Vehicle passed too quickly'
};