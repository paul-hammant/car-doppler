/**
 * Mock implementation of FFT Status Service for testing
 */

import { useState, useEffect } from 'react';

export interface FFTStatus {
  mode: string;
  implementation: string;
  wasmLoaded: boolean;
  wasmWorking: boolean;
  simdSize?: number | string;
  timestamp: number;
}

export interface FFTStatusCallback {
  (status: FFTStatus): void;
}

// Mock FFT status for testing
const mockFFTStatus: FFTStatus = {
  mode: 'test',
  implementation: 'Mock',
  wasmLoaded: true,
  wasmWorking: true,
  simdSize: 4,
  timestamp: Date.now()
};

class MockFFTStatusService {
  private callbacks: Set<FFTStatusCallback> = new Set();
  private currentStatus: FFTStatus = mockFFTStatus;

  async getStatus(): Promise<FFTStatus> {
    return this.currentStatus;
  }

  subscribe(callback: FFTStatusCallback): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  startPolling(): void {
    // No-op for mock
  }

  stopPolling(): void {
    // No-op for mock
  }
}

const mockService = new MockFFTStatusService();

// React hook for FFT status (mock version)
export function useFFTStatus(): FFTStatus | null {
  const [status, setStatus] = useState<FFTStatus | null>(mockFFTStatus);

  useEffect(() => {
    // Return mock status immediately for server-side rendering
    setStatus(mockFFTStatus);
  }, []);

  return status;
}

export default mockService;