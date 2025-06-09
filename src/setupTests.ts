/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Web Audio API for tests
class MockAudioContext {
  createGain() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      gain: { value: 1 }
    };
  }
  
  createAnalyser() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      fftSize: 2048,
      getFloatTimeDomainData: vi.fn(),
      getByteFrequencyData: vi.fn()
    };
  }
  
  createScriptProcessor() {
    return {
      connect: vi.fn(),
      disconnect: vi.fn(),
      onaudioprocess: null
    };
  }
  
  addModule() {
    return Promise.resolve();
  }
  
  createMediaRecorder() {
    return {
      start: vi.fn(),
      stop: vi.fn(),
      ondataavailable: null,
      onstop: null,
      state: 'inactive'
    };
  }
  
  close() {
    return Promise.resolve();
  }
  
  resume() {
    return Promise.resolve();
  }
  
  suspend() {
    return Promise.resolve();
  }
  
  state = 'running';
  sampleRate = 44100;
  destination = { connect: vi.fn(), disconnect: vi.fn() };
}

// Mock getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: vi.fn().mockReturnValue([{
        stop: vi.fn(),
        kind: 'audio',
        enabled: true
      }])
    })
  }
});

// Mock MediaRecorder
global.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  ondataavailable: null,
  onstop: null,
  onerror: null,
  state: 'inactive',
  mimeType: 'audio/webm'
})) as any;

// Mock AudioContext
global.AudioContext = MockAudioContext as any;
global.webkitAudioContext = MockAudioContext as any;

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = vi.fn();

// Mock Worker
global.Worker = vi.fn().mockImplementation(() => ({
  postMessage: vi.fn(),
  terminate: vi.fn(),
  onmessage: null,
  onerror: null
})) as any;
