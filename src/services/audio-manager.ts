/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

export class AudioManager {
  private audioContext: AudioContext | null = null;
  public mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private audioWorkletNode: AudioWorkletNode | null = null;
  private isRecording: boolean = false;
  private onAudioData: ((audioData: Float32Array, sampleRate: number) => void) | null = null;
  private recordedChunks: Blob[] = [];
  private mediaRecorder: MediaRecorder | null = null;
  private supportsAudioWorklet: boolean = false;

  public readonly sampleRate: number = 44100;
  private readonly bufferSize: number = 2048;

  async initialize(): Promise<boolean> {
    // Don't create AudioContext here - defer until user interaction
    // This prevents iOS "AudioContext was not allowed to start" errors
    return true;
  }

  private async ensureAudioContext(): Promise<boolean> {
    if (this.audioContext) {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      return true;
    }

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.sampleRate
      });

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Try to load AudioWorklet for modern browsers
      try {
        await this.audioContext.audioWorklet.addModule('./workers/audio-worklet-processor.js');
        this.supportsAudioWorklet = true;
        console.log('AudioWorklet supported and loaded');
      } catch (workletError) {
        console.log('AudioWorklet not supported, falling back to ScriptProcessor');
        this.supportsAudioWorklet = false;
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
      return false;
    }
  }

  async requestMicrophoneAccess(): Promise<boolean> {
    try {
      console.log('Requesting microphone access...');

      // Initialize AudioContext on user interaction
      const audioContextReady = await this.ensureAudioContext();
      if (!audioContextReady) {
        throw new Error('Failed to initialize AudioContext');
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported in this browser');
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: this.sampleRate,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });

      console.log('MediaStream obtained:', this.mediaStream);
      
      if (!this.audioContext) {
        throw new Error('AudioContext not initialized');
      }

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      console.log('Source node created:', this.sourceNode);

      // Set up MediaRecorder for saving audio
      this.recordedChunks = [];
      
      // Find supported MIME type for iOS compatibility
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        // Try common iOS-supported formats
        const fallbackTypes = [
          'audio/mp4',
          'audio/mp4;codecs=mp4a.40.2',
          'audio/webm',
          'audio/wav'
        ];
        
        for (const type of fallbackTypes) {
          if (MediaRecorder.isTypeSupported(type)) {
            mimeType = type;
            break;
          }
        }
      }
      
      console.log('Using MediaRecorder MIME type:', mimeType);
      this.mediaRecorder = new MediaRecorder(this.mediaStream, { mimeType });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
          console.log(`🎤 Audio chunk recorded: ${event.data.size} bytes`);
        }
      };

      return true;
    } catch (error) {
      console.error('Failed to access microphone:', error);
      return false;
    }
  }

  startRecording(onAudioDataCallback: (audioData: Float32Array, sampleRate: number) => void): void {
    if (!this.audioContext || !this.sourceNode) {
      throw new Error('Audio not initialized');
    }

    console.log('Starting audio recording...');
    this.onAudioData = onAudioDataCallback;

    if (this.supportsAudioWorklet) {
      this.startRecordingWithWorklet();
    } else {
      this.startRecordingWithScriptProcessor();
    }

    this.isRecording = true;
    console.log('Audio recording started, isRecording:', this.isRecording);
  }

  private startRecordingWithWorklet(): void {
    if (!this.audioContext || !this.sourceNode) return;

    console.log('Using AudioWorklet for recording');
    this.audioWorkletNode = new AudioWorkletNode(this.audioContext, 'audio-recorder-processor');

    this.audioWorkletNode.port.onmessage = (event) => {
      if (this.isRecording && this.onAudioData) {
        const { audioData, rms } = event.data;
        if (rms > 0.001) {
          console.log('Audio detected (WorkletNode), RMS:', rms.toFixed(6));
        }
        this.onAudioData(audioData, this.sampleRate);
      }
    };

    this.sourceNode.connect(this.audioWorkletNode);
    this.audioWorkletNode.connect(this.audioContext.destination);
    this.audioWorkletNode.port.postMessage({ command: 'start' });
  }

  private startRecordingWithScriptProcessor(): void {
    if (!this.audioContext || !this.sourceNode) return;

    console.log('Using ScriptProcessor for recording');
    this.scriptProcessor = this.audioContext.createScriptProcessor(this.bufferSize, 1, 1);
    console.log('Script processor created with buffer size:', this.bufferSize);

    this.scriptProcessor.onaudioprocess = (event) => {
      if (this.isRecording && this.onAudioData) {
        const inputBuffer = event.inputBuffer;
        const channelData = inputBuffer.getChannelData(0);

        const audioData = new Float32Array(channelData.length);
        audioData.set(channelData);

        // Add RMS check to see if we're getting audio
        const rms = Math.sqrt(audioData.reduce((sum, val) => sum + val * val, 0) / audioData.length);
        if (rms > 0.001) {
          console.log('Audio detected (ScriptProcessor), RMS:', rms.toFixed(6));
        }

        this.onAudioData(audioData, this.sampleRate);
      }
    };

    this.sourceNode.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext.destination);

    // Start MediaRecorder for file saving
    if (this.mediaRecorder) {
      this.mediaRecorder.start(100); // 100ms chunks
      console.log('🎤 MediaRecorder started for file saving');
    }
  }

  stopRecording(): void {
    this.isRecording = false;

    // Stop MediaRecorder
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      console.log('🎤 MediaRecorder stopped');
    }

    if (this.audioWorkletNode) {
      this.audioWorkletNode.port.postMessage({ command: 'stop' });
      this.audioWorkletNode.disconnect();
      this.audioWorkletNode = null;
    }

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }

    if (this.sourceNode) {
      this.sourceNode.disconnect();
    }
  }

  downloadRecording(): boolean {
    if (this.recordedChunks.length === 0) {
      console.warn('No recorded audio to download');
      return false;
    }

    // Get the MIME type from the MediaRecorder
    const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
    const blob = new Blob(this.recordedChunks, { type: mimeType });
    
    // Determine file extension based on MIME type
    let extension = 'webm';
    if (mimeType.includes('mp4')) {
      extension = 'mp4';
    } else if (mimeType.includes('wav')) {
      extension = 'wav';
    }
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `doppler-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`💾 Downloaded recording: ${(blob.size / 1024).toFixed(1)} KB`);
    return true;
  }

  async loadAudioFile(file: File): Promise<{ data: Float32Array; sampleRate: number; duration: number }> {
    const audioContextReady = await this.ensureAudioContext();
    if (!audioContextReady) {
      throw new Error('Failed to initialize AudioContext');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);

          const channelData = audioBuffer.getChannelData(0);
          const audioData = new Float32Array(channelData.length);
          audioData.set(channelData);

          resolve({
            data: audioData,
            sampleRate: audioBuffer.sampleRate,
            duration: audioBuffer.duration
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  cleanup(): void {
    this.stopRecording();

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}