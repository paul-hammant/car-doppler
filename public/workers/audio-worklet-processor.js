class AudioRecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isRecording = false;
    this.port.onmessage = this.handleMessage.bind(this);
  }

  handleMessage(event) {
    const { command } = event.data;
    if (command === 'start') {
      this.isRecording = true;
    } else if (command === 'stop') {
      this.isRecording = false;
    }
  }

  process(inputs, outputs, parameters) {
    if (!this.isRecording) {
      return true;
    }

    const input = inputs[0];
    if (input && input.length > 0) {
      const audioData = input[0]; // First channel
      
      // Calculate RMS for audio level detection
      let sum = 0;
      for (let i = 0; i < audioData.length; i++) {
        sum += audioData[i] * audioData[i];
      }
      const rms = Math.sqrt(sum / audioData.length);

      // Send audio data and RMS to main thread
      this.port.postMessage({
        audioData: new Float32Array(audioData),
        rms: rms
      });
    }

    return true;
  }
}

registerProcessor('audio-recorder-processor', AudioRecorderProcessor);