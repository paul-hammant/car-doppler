/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 *
 * Simple Audio Collection Worker - No Doppler Processing
 * All Doppler analysis is done in main thread via external library
 */

// Simplified worker code that only collects audio data
const workerCode = `
console.log('🔧 Worker: Audio collector initialized (no Doppler processing)');

class AudioCollector {
  constructor() {
    this.isActive = false;
    this.audioBuffer = [];
    this.sampleRate = 44100;
    this.processingStartTime = Date.now();
    this.frameCounter = 0;
  }

  processAudioChunk(audioData) {
    if (!this.isActive) return;
    
    this.audioBuffer.push(...audioData);
    this.frameCounter++;
    
    // Send periodic updates to main thread
    if (this.frameCounter % 20 === 0) {
      const timeSinceStart = (Date.now() - this.processingStartTime) / 1000;
      
      self.postMessage({
        type: 'audioCollected',
        data: {
          frameCount: this.frameCounter,
          bufferSize: this.audioBuffer.length,
          processingTime: timeSinceStart
        }
      });
    }
  }

  getCollectedAudio() {
    return new Float32Array(this.audioBuffer);
  }

  reset() {
    this.audioBuffer = [];
    this.frameCounter = 0;
    this.processingStartTime = Date.now();
  }

  start() {
    this.isActive = true;
    this.reset();
  }

  stop() {
    this.isActive = false;
    return this.getCollectedAudio();
  }
}

// Create collector instance
const collector = new AudioCollector();

self.onmessage = function(event) {
  const { type, data } = event.data;
  
  try {
    console.log('🔧 Worker: Received message, type: ' + type);
    
    switch (type) {
      case 'init':
        collector.sampleRate = data.sampleRate || 44100;
        console.log('🔧 Worker: Initialized with sample rate: ' + collector.sampleRate);
        self.postMessage({ type: 'initialized' });
        break;
        
      case 'startCollection':
        collector.start();
        console.log('🔧 Worker: Started audio collection');
        self.postMessage({ type: 'collectionStarted' });
        break;
        
      case 'processAudio':
        collector.processAudioChunk(data.audioData);
        break;
        
      case 'stopCollection':
        const collectedAudio = collector.stop();
        console.log('🔧 Worker: Stopped collection, collected ' + collectedAudio.length + ' samples');
        
        // Send collected audio to main thread for Doppler processing
        self.postMessage({
          type: 'collectionComplete',
          data: {
            audioData: collectedAudio,
            sampleRate: collector.sampleRate,
            duration: collectedAudio.length / collector.sampleRate,
            frameCount: collector.frameCounter
          }
        });
        break;
        
      case 'reset':
        collector.reset();
        self.postMessage({ type: 'resetComplete' });
        break;
        
      default:
        console.log('🔧 Worker: Unknown message type: ' + type);
    }
  } catch (error) {
    console.error('🔧 Worker: Error processing message:', error);
    self.postMessage({
      type: 'error',
      data: { message: error.message }
    });
  }
};

console.log('🔧 Worker: Audio collector ready');
self.postMessage({ type: 'workerReady' });
`;

export function createDopplerWorker(): Worker {
  console.log('🔧 Main: Creating simple audio collection worker...');
  
  try {
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    
    if (worker.addEventListener) {
      worker.addEventListener('message', () => {
        URL.revokeObjectURL(workerUrl);
      }, { once: true });
    } else {
      // Fallback for test environments
      setTimeout(() => URL.revokeObjectURL(workerUrl), 1000);
    }
    
    console.log('🔧 Main: Audio collection worker created successfully');
    return worker;
  } catch (error) {
    console.error('🔧 Main: Failed to create audio collection worker:', error);
    throw error;
  }
}