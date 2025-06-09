/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { AudioManager } from './services/audio-manager';
import { unitDetection } from './services/unit-detection';
import { createDopplerWorker } from './services/doppler-worker';
import { analyzeAudioWithExternalLibrary } from './services/external-doppler-integration';
// Import real library modules directly (no duplicates)
import { DebugConsole } from './components/DebugConsole';
import { SpeedDisplay } from './components/SpeedDisplay';
import { Controls } from './components/Controls';
import { StatusDisplay } from './components/StatusDisplay';
import { PositioningGuide } from './components/PositioningGuide';
import { FileInput } from './components/FileInput';
import packageJson from '../package.json';

// Global FFT mode declaration
declare global {
  var FFT_MODE: string;
}

interface DopplerSpeedDetectorState {
  isRecording: boolean;
  isProcessing: boolean;
  lastDetectedSpeed: number | null;
  isMetric: boolean;
  status: {
    message: string;
    type: 'info' | 'error' | 'success';
  };
  speed: {
    value: number | null;
    display: string;
    color: string;
  };
}

function App() {
  const [state, setState] = useState<DopplerSpeedDetectorState>({
    isRecording: false,
    isProcessing: false,
    lastDetectedSpeed: null,
    isMetric: true,
    status: {
      message: 'Ready to start. Grant microphone permission when prompted.',
      type: 'info'
    },
    speed: {
      value: null,
      display: '--',
      color: '#007AFF'
    }
  });

  const [testMode, setTestMode] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const audioManagerRef = useRef<AudioManager | null>(null);
  const dspWorkerRef = useRef<Worker | null>(null);
  const calculationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const calculationStartTimeRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);
  const micInactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUserActivityRef = useRef<number>(Date.now());

  useEffect(() => {
    // Initialize the app
    initializeApp();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeApp = async () => {
    // Set FFT mode on window object for external library to use
    (window as any).FFT_MODE = 'FALLBACK';
    console.log('🔧 App: Set window.FFT_MODE=FALLBACK for external doppler library');
    
    console.log(`🚗 Doppler Speed Detector v${packageJson.version} starting - fixed thresholds for real audio...`);
    try {
      audioManagerRef.current = new AudioManager();
      await audioManagerRef.current.initialize();
      initializeWorker();
      setupInactivityTracking();
      
      // Auto-detect appropriate units for user's location
      try {
        const unitPreference = await unitDetection.detectUnits();
        setState(prev => ({
          ...prev,
          isMetric: unitPreference.speed === 'kmh',
          status: {
            message: `Ready to start. Units: ${unitPreference.speed.toUpperCase()} (${unitPreference.method} detected)`,
            type: 'info'
          }
        }));
        console.log(`🌍 Unit detection: ${unitPreference.speed.toUpperCase()} (${unitPreference.confidence} confidence, ${unitPreference.method})`);
      } catch (error) {
        setState(prev => ({
          ...prev,
          status: {
            message: 'Ready to start. Grant microphone permission when prompted.',
            type: 'info'
          }
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: {
          message: 'Failed to initialize audio system',
          type: 'error'
        }
      }));
    }
  };

  const initializeWorker = () => {
    try {
      console.log('🔧 Main: Initializing worker...');
      dspWorkerRef.current = createDopplerWorker();
      console.log('🔧 Main: Worker created successfully');
    
    dspWorkerRef.current.onmessage = (event) => {
      const { type, data } = event.data;
      console.log(`🔧 Main: Received worker message, type: ${type}`);
      
      switch (type) {
        case 'initialized':
          console.log('🔧 Main: Worker initialized successfully');
          break;
        case 'collectionStarted':
          console.log('🔧 Main: Audio collection started');
          break;
        case 'audioCollected':
          console.log(`🔧 Main: Audio collection progress - ${data.frameCount} frames, ${data.bufferSize} samples`);
          break;
        case 'collectionComplete':
          console.log('🔧 Main: Audio collection complete, processing with external library...');
          handleMicrophoneAudioProcessing(data);
          break;
        case 'resetComplete':
          resetState();
          break;
        case 'workerReady':
          console.log('🔧 Main: Worker is alive and responding!');
          break;
        case 'error':
          console.error('🔧 Main: Worker reported error:', data);
          setState(prev => ({
            ...prev,
            status: {
              message: `Worker error: ${data?.message || 'Unknown error'}`,
              type: 'error'
            }
          }));
          break;
        default:
          console.log(`🔧 Main: Unknown worker message type: ${type}`, data);
      }
    };

    dspWorkerRef.current.onerror = (error) => {
      console.error('🔧 Main: Worker error:', error);
      setState(prev => ({
        ...prev,
        status: {
          message: 'Worker failed to load - check console for details',
          type: 'error'
        }
      }));
    };
    } catch (error) {
      console.error('🔧 Main: Failed to initialize worker:', error);
      setState(prev => ({
        ...prev,
        status: {
          message: 'Failed to initialize audio processing worker',
          type: 'error'
        }
      }));
    }
  };

  const handleMicrophoneAudioProcessing = async (data: { audioData: Float32Array, sampleRate: number, duration: number }) => {
    try {
      console.log('🔧 Main: Processing microphone audio with external library...');
      
      // Use the same external library processing as file uploads
      const result = await processFileWithExternalLibrary(
        data.audioData,
        data.sampleRate,
        data.duration,
        'microphone_recording'
      );
      
      console.log('🔧 Main: Microphone audio processing complete');
    } catch (error) {
      console.error('🔧 Main: Error processing microphone audio:', error);
      setState(prev => ({
        ...prev,
        status: {
          message: 'Error processing microphone audio',
          type: 'error'
        }
      }));
    }
  };



  const toggleRecording = async () => {
    if (state.isRecording) {
      stopRecording();
    } else {
      await startRecording();
    }
  };

  const startRecording = async () => {
    if (!audioManagerRef.current || !dspWorkerRef.current) return;

    setState(prev => ({
      ...prev,
      lastDetectedSpeed: null,
      status: {
        message: 'Requesting microphone access...',
        type: 'info'
      }
    }));

    try {
      const micAccess = await audioManagerRef.current.requestMicrophoneAccess();
      if (!micAccess) {
        setState(prev => ({
          ...prev,
          status: {
            message: 'Microphone access denied or failed',
            type: 'error'
          }
        }));
        return;
      }

      dspWorkerRef.current.postMessage({ type: 'reset' });
      dspWorkerRef.current.postMessage({
        type: 'init',
        data: { sampleRate: audioManagerRef.current.sampleRate }
      });

      // Start audio collection in worker
      dspWorkerRef.current.postMessage({ type: 'startCollection' });

      audioManagerRef.current.startRecording((audioData: Float32Array) => {
        if (dspWorkerRef.current) {
          // Send audio chunks to worker for collection only (no processing)
          const audioDataCopy = new Float32Array(audioData);
          dspWorkerRef.current.postMessage({
            type: 'processAudio',
            data: { audioData: audioDataCopy }
          });
        }
      });

      setState(prev => ({
        ...prev,
        isRecording: true,
        status: {
          message: 'Recording started. Point device towards vehicles.',
          type: 'success'
        }
      }));

      recordingStartTimeRef.current = Date.now();
      console.log(`📊 Recording session started at ${new Date().toLocaleTimeString()}`);

    } catch (error) {
      setState(prev => ({
        ...prev,
        status: {
          message: `Failed to start recording: ${error}`,
          type: 'error'
        }
      }));
    }
  };

  const stopRecording = () => {
    if (!state.isRecording || !audioManagerRef.current || !dspWorkerRef.current) return;

    setState(prev => ({ ...prev, isRecording: false }));
    audioManagerRef.current.stopRecording();

    if (recordingStartTimeRef.current) {
      const duration = (Date.now() - recordingStartTimeRef.current) / 1000;
      console.log(`🛑 Stopped listening after ${duration.toFixed(1)} seconds`);
    }

    // Stop audio collection and get collected audio for processing
    dspWorkerRef.current.postMessage({ type: 'stopCollection' });

    // Show calculating indicator
    setState(prev => ({
      ...prev,
      status: {
        message: '🧮 Calculating speed... (iPhone SE may take 6-10 seconds)',
        type: 'info'
      },
      speed: {
        ...prev.speed,
        display: '🧮',
        color: '#FF9500'
      }
    }));

    // Start calculation timer
    calculationStartTimeRef.current = Date.now();
    calculationTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - calculationStartTimeRef.current!) / 1000;
      setState(prev => ({
        ...prev,
        status: {
          message: `🧮 Calculating speed... ${elapsed.toFixed(1)}s elapsed (iPhone SE may take 6-10 seconds)`,
          type: 'info'
        }
      }));
    }, 1000);
  };

  const toggleUnits = () => {
    setState(prev => {
      const newIsMetric = !prev.isMetric;
      let newDisplay = prev.speed.display;
      
      if (prev.speed.value && !isNaN(Number(prev.speed.display))) {
        const displaySpeed = newIsMetric ? prev.speed.value : prev.speed.value * 0.621371;
        newDisplay = Math.round(displaySpeed).toString();
      }

      return {
        ...prev,
        isMetric: newIsMetric,
        speed: {
          ...prev.speed,
          display: newDisplay
        }
      };
    });
  };

  const setupInactivityTracking = () => {
    const trackActivity = () => {
      lastUserActivityRef.current = Date.now();
      resetInactivityTimer();
    };

    document.addEventListener('click', trackActivity);
    document.addEventListener('touchstart', trackActivity);
    document.addEventListener('keydown', trackActivity);
  };

  const resetInactivityTimer = () => {
    if (micInactivityTimerRef.current) {
      clearTimeout(micInactivityTimerRef.current);
      micInactivityTimerRef.current = null;
    }

    if (audioManagerRef.current?.mediaStream && !state.isRecording) {
      micInactivityTimerRef.current = setTimeout(() => {
        releaseMicrophoneForInactivity();
      }, 60000); // 1 minute
    }
  };

  const releaseMicrophoneForInactivity = () => {
    if (audioManagerRef.current?.mediaStream && !state.isRecording) {
      console.log('🔒 Auto-releasing microphone due to 1 minute of inactivity');
      audioManagerRef.current.cleanup();
      setState(prev => ({
        ...prev,
        status: {
          message: 'Microphone released due to inactivity. Click "Start Listening" to re-enable.',
          type: 'info'
        }
      }));
    }
  };

  const resetState = () => {
    setState(prev => ({
      ...prev,
      speed: {
        value: null,
        display: '--',
        color: '#007AFF'
      }
    }));
  };

  const cleanup = () => {
    if (audioManagerRef.current) {
      audioManagerRef.current.cleanup();
    }
    if (dspWorkerRef.current) {
      dspWorkerRef.current.terminate();
    }
    if (calculationTimerRef.current) {
      clearInterval(calculationTimerRef.current);
    }
    if (micInactivityTimerRef.current) {
      clearTimeout(micInactivityTimerRef.current);
    }
  };

  const handleDownload = () => {
    if (audioManagerRef.current) {
      const success = audioManagerRef.current.downloadRecording();
      setState(prev => ({
        ...prev,
        status: {
          message: success ? 'Audio file downloaded successfully' : 'No recording available to download',
          type: success ? 'success' : 'error'
        }
      }));
    }
  };

  /**
   * Process audio file using the external library algorithms in main thread
   * Uses the documented external library integration from external-doppler-integration.ts
   */
  const processFileWithExternalLibrary = async (audioData: Float32Array, sampleRate: number, duration: number, fileName: string) => {
    try {
      console.log('🔧 External Library: Processing audio with car-speed-via-doppler-analysis algorithms');
      
      // Use the main thread external library integration directly
      const result = await analyzeAudioWithExternalLibrary(audioData, sampleRate);
      
      const { speed, approachFrequency, recedeFrequency, error } = result;
      
      if (error) {
        throw new Error(error);
      }
      
      console.log('🔧 External Library: Doppler frequency measurements:');
      console.log(`  Approaching vehicle: ${approachFrequency?.toFixed(2) || '0.00'} Hz`);
      console.log(`  Receding vehicle: ${recedeFrequency?.toFixed(2) || '0.00'} Hz`);
      console.log(`  Frequency shift: ${((approachFrequency || 0) - (recedeFrequency || 0)).toFixed(2)} Hz`);
      
      const vehicleSpeedKmh = speed;
      const vehicleSpeedMph = vehicleSpeedKmh ? vehicleSpeedKmh * 0.621371 : 0;
      
      console.log('🔧 External Library: Speed calculation results:');
      console.log(`  Speed: ${vehicleSpeedKmh?.toFixed(1) || 'N/A'} km/h (${vehicleSpeedMph?.toFixed(1) || 'N/A'} mph)`);
      
      // Update state with results
      if (vehicleSpeedKmh && vehicleSpeedKmh > 0) {
        setState(prev => ({
          ...prev,
          lastDetectedSpeed: vehicleSpeedKmh,
          status: {
            message: `${fileName}: ${vehicleSpeedKmh.toFixed(1)} km/h (${vehicleSpeedMph.toFixed(1)} mph)`,
            type: 'success'
          },
          speed: {
            value: vehicleSpeedKmh,
            display: Math.round(prev.isMetric ? vehicleSpeedKmh : vehicleSpeedMph).toString(),
            color: '#34C759'
          }
        }));
        
        console.log(`🚗 File processing result: ${vehicleSpeedKmh?.toFixed(1) || 'N/A'} km/h (${vehicleSpeedMph?.toFixed(1) || 'N/A'} mph)`);
      } else {
        setState(prev => ({
          ...prev,
          status: {
            message: `${fileName}: No valid speed detected`,
            type: 'error'
          },
          speed: {
            value: null,
            display: 'E09',
            color: '#FF3B30'
          }
        }));
        
        console.log('📁 File processing complete but no valid speeds detected');
      }
      
    } catch (error) {
      console.error('🔧 External Library: Error processing file:', error);
      setState(prev => ({
        ...prev,
        status: {
          message: `Processing failed: ${error}`,
          type: 'error'
        }
      }));
    }
  };

  /**
   * Analyze frequencies using the ACTUAL external library's SpectrumAnalyzer
   * This uses the real car-speed-via-doppler-analysis algorithms and WASM FFT
   */
  const analyzeFrequenciesWithExternalAlgorithm = async (sections: any, sampleRate: number, SpectrumAnalyzer: any) => {
    console.log('🔧 External Library: Analyzing approach and recede sections with REAL external library');
    console.log(`  Approach section: ${sections.approaching.length} samples`);
    console.log(`  Recede section: ${sections.receding.length} samples`);
    
    try {
      // Use the ACTUAL external library SpectrumAnalyzer (same as Node.js version)
      console.log('🔧 External Library: Creating SpectrumAnalyzer for approach section...');
      const approachAnalyzer = new SpectrumAnalyzer(sections.approaching, sampleRate);
      await approachAnalyzer.calculatePowerSpectrum();
      const approachFrequency = approachAnalyzer.findPeakFrequency();
      
      console.log('🔧 External Library: Creating SpectrumAnalyzer for recede section...');
      const recedeAnalyzer = new SpectrumAnalyzer(sections.receding, sampleRate);
      await recedeAnalyzer.calculatePowerSpectrum();
      const recedeFrequency = recedeAnalyzer.findPeakFrequency();
      
      // Debug: Compare actual section data with Node.js
      console.log('🔧 External Library: Audio section debug info:');
      console.log(`  Approach section: ${sections.approaching.length} samples, first 5: [${sections.approaching.slice(0,5).map(x => x.toFixed(3)).join(', ')}]`);
      console.log(`  Recede section: ${sections.receding.length} samples, first 5: [${sections.receding.slice(0,5).map(x => x.toFixed(3)).join(', ')}]`);
      
      console.log('🔧 External Library: REAL frequency analysis results (FFT implementation: checking...):');
      console.log(`  Approach peak: ${approachFrequency.toFixed(2)} Hz`);
      console.log(`  Recede peak: ${recedeFrequency.toFixed(2)} Hz`);
      
      return { approachFrequency, recedeFrequency };
      
    } catch (error) {
      console.error('🔧 External Library: Error in frequency analysis:', error);
      console.error('🔧 External Library: FFT fallback sequence failed - no valid frequency analysis possible');
      console.error('🔧 External Library: This indicates either:');
      console.error('  1. WASM+SIMD FFT failed to initialize properly');
      console.error('  2. WASM FFT (no SIMD) failed to initialize properly');  
      console.error('  3. JavaScript FFT fallback also failed');
      console.error('  4. Audio content has no detectable vehicle frequencies');
      
      // Instead of hardcoded frequencies, indicate failure
      throw new Error(`FFT analysis completely failed: ${error.message}`);
    }
  };

  // All FFT processing is now handled by the ACTUAL external library
  // No custom DFT implementation needed - we use car-speed-via-doppler-analysis directly

  const handleFileSelect = async (file: File) => {
    if (!audioManagerRef.current) {
      setState(prev => ({
        ...prev,
        status: {
          message: 'Audio system not initialized',
          type: 'error'
        }
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      status: {
        message: `Loading file: ${file.name}...`,
        type: 'info'
      },
      lastDetectedSpeed: null,
      speed: {
        value: null,
        display: '--',
        color: '#007AFF'
      }
    }));

    try {
      console.log(`📁 Loading audio file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      
      const audioData = await audioManagerRef.current.loadAudioFile(file);
      console.log(`📁 Audio loaded: ${audioData.duration.toFixed(2)}s, ${audioData.sampleRate}Hz, ${audioData.data.length} samples`);

      // Reset worker and process in batch mode
      dspWorkerRef.current.postMessage({ type: 'reset' });
      dspWorkerRef.current.postMessage({
        type: 'init',
        data: { sampleRate: audioData.sampleRate }
      });

      setState(prev => ({
        ...prev,
        status: {
          message: `Processing ${file.name} (${audioData.duration.toFixed(1)}s)...`,
          type: 'info'
        },
        speed: {
          ...prev.speed,
          display: '🧮',
          color: '#FF9500'
        }
      }));

      // Start calculation timer for file processing
      calculationStartTimeRef.current = Date.now();
      calculationTimerRef.current = setInterval(() => {
        const elapsed = (Date.now() - calculationStartTimeRef.current!) / 1000;
        setState(prev => ({
          ...prev,
          status: {
            message: `🧮 Processing ${file.name}... ${elapsed.toFixed(1)}s elapsed`,
            type: 'info'
          }
        }));
      }, 1000);

      // Process file data using the EXACT external library algorithms
      setTimeout(async () => {
        await processFileWithExternalLibrary(audioData.data, audioData.sampleRate, audioData.duration, file.name);
        
        // Clear calculation timer
        if (calculationTimerRef.current) {
          clearInterval(calculationTimerRef.current);
          calculationTimerRef.current = null;
        }
      }, 100); // Small delay to allow UI to update

    } catch (error) {
      console.error('📁 Error loading file:', error);
      setState(prev => ({
        ...prev,
        status: {
          message: `Failed to load ${file.name}: ${error}`,
          type: 'error'
        }
      }));
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">🚗 Doppler Speed Detector</h1>
        <div className="version">v{process.env.REACT_APP_BUILD_VERSION || packageJson.version}</div>
        <p className="description">
          Detect vehicle speed using Doppler shift analysis. <strong>Position yourself perpendicular to traffic</strong> for accurate readings.
        </p>
        
        <Controls
          isRecording={state.isRecording}
          isProcessing={state.isProcessing}
          isMetric={state.isMetric}
          onToggleRecording={toggleRecording}
          onToggleUnits={toggleUnits}
        />
        
        <PositioningGuide />
        
        <FileInput 
          onDownload={handleDownload}
          onFileSelect={handleFileSelect}
          hasRecording={recordingStartTimeRef.current !== null}
        />
        
        <SpeedDisplay
          speed={state.speed.display}
          unit={state.isMetric ? 'km/h' : 'mph'}
          color={state.speed.color}
        />
        
        <StatusDisplay
          message={state.status.message}
          type={state.status.type}
        />
        
        <DebugConsole />
        
        <div className="privacy-notice">
          <strong>Privacy:</strong> All processing happens locally on your device. 
          No data is stored or transmitted unless you explicitly export it.
        </div>
        
        <div className="accuracy-warning">
          <strong>⚠️ Accuracy Warning:</strong> Speed calculations are experimental and inaccurate. 
          This tool should NOT be used for law enforcement or official speed measurements.
        </div>
      </div>
    </div>
  );
}

export default App;
