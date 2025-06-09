#!/usr/bin/env node

/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

/**
 * Debug script to test real audio file processing
 * This will help us understand why 28_mph.m4a returns null speed
 */

import { DopplerProcessor } from './src/shared/doppler-processor.js';
import fs from 'fs';

// Mock audio processing for the real file
// We'll need to simulate what the web app does when loading 28_mph.m4a
console.log('🔍 Debug: Testing real audio file processing simulation...');

const processor = new DopplerProcessor();

// Since we can't easily decode M4A in Node.js, let's create audio that mimics
// what a real 28 mph vehicle might sound like based on the console output:
// - 5.74s duration, 44100Hz, 253075 samples
// - Should have Doppler shift pattern for 28 mph = 45 km/h

function generateRealisticVehicleAudio(speedKmh = 45, duration = 5.74, sampleRate = 44100) {
  const speedMs = speedKmh / 3.6;
  const soundSpeed = 343;
  
  // Use a base frequency similar to real vehicle engine/tire noise
  const baseFreq = 800 + (Math.random() - 0.5) * 200; // Real vehicles: 700-1000 Hz
  
  const approachFreq = baseFreq * (soundSpeed / (soundSpeed - speedMs));
  const recedingFreq = baseFreq * (soundSpeed / (soundSpeed + speedMs));
  
  const totalSamples = Math.floor(sampleRate * duration);
  const audioData = new Float32Array(totalSamples);
  
  console.log(`📊 Generating realistic audio: ${baseFreq.toFixed(1)}Hz base, ${approachFreq.toFixed(1)} -> ${recedingFreq.toFixed(1)}Hz`);
  
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const progress = t / duration;
    
    // Realistic frequency transition
    const freq = approachFreq + (recedingFreq - approachFreq) * progress;
    
    // Add multiple harmonics and noise like real vehicle audio
    const fundamental = Math.sin(2 * Math.PI * freq * t) * 0.4;
    const harmonic2 = Math.sin(2 * Math.PI * freq * 1.5 * t) * 0.2;
    const harmonic3 = Math.sin(2 * Math.PI * freq * 2.1 * t) * 0.1;
    const broadband = (Math.random() - 0.5) * 0.05; // Road/wind noise
    
    // Realistic amplitude envelope (closer when louder)
    const distance = Math.abs(progress - 0.5) * 2;
    const amplitude = 0.8 / (1 + distance * 0.5); // Less dramatic than synthetic
    
    // Add some amplitude modulation like real engines
    const modulation = 1 + 0.1 * Math.sin(2 * Math.PI * 30 * t); // 30Hz engine rhythm
    
    audioData[i] = (fundamental + harmonic2 + harmonic3 + broadband) * amplitude * modulation * 0.02;
  }
  
  return { audioData, baseFreq, approachFreq, recedingFreq, totalSamples };
}

// Test with realistic audio
console.log('🎯 Testing with realistic vehicle audio...');
const { audioData, baseFreq, approachFreq, recedingFreq } = generateRealisticVehicleAudio(45, 5.74);

// Process in chunks like the web app does
const chunkSize = 4096;
let processedSamples = 0;

for (let i = 0; i < audioData.length; i += chunkSize) {
  const chunk = audioData.slice(i, i + chunkSize);
  processor.processAudioChunk(Array.from(chunk));
  processedSamples += chunk.length;
  
  if (i % (chunkSize * 20) === 0) {
    console.log(`📈 Processed ${processedSamples}/${audioData.length} samples (${(processedSamples/audioData.length*100).toFixed(1)}%)`);
  }
}

// Add debugging for thresholds
let maxMagnitude = 0;
let maxRMS = 0;
let sampleCount = 0;

// Monkey patch processFrame to capture debug info
const originalProcessFrame = processor.processFrame;
processor.processFrame = function(frame) {
  // Apply window function
  for (let i = 0; i < frame.length; i++) {
    frame[i] *= this.window[i];
  }

  const spectrum = this.simpleFFT(frame);
  const peakData = this.findPeakFrequency(spectrum);
  const rms = this.calculateRMS(frame);
  
  maxMagnitude = Math.max(maxMagnitude, peakData.magnitude);
  maxRMS = Math.max(maxRMS, rms);
  sampleCount++;
  
  if (sampleCount % 100 === 0) {
    console.log(`🔊 Frame ${this.frameCounter}: Peak ${peakData.frequency.toFixed(1)}Hz, Mag ${peakData.magnitude.toFixed(1)}, RMS ${rms.toFixed(4)}`);
  }
  
  // Call original logic
  originalProcessFrame.call(this, frame);
};

// Reset and reprocess to get debug info
processor.reset();
for (let i = 0; i < audioData.length; i += chunkSize) {
  const chunk = audioData.slice(i, i + chunkSize);
  processor.processAudioChunk(Array.from(chunk));
}

console.log(`\n📊 Processing complete:`);
console.log(`   Frames processed: ${processor.frameCounter}`);
console.log(`   Spectral history: ${processor.spectralHistory.length}`);
console.log(`   Base frequency: ${processor.baseFrequency ? processor.baseFrequency.toFixed(1) + 'Hz' : 'none'}`);
console.log(`   Max magnitude seen: ${maxMagnitude.toFixed(1)} (threshold: 20)`);
console.log(`   Max RMS seen: ${maxRMS.toFixed(4)} (threshold: 0.001)`);

if (processor.spectralHistory.length > 0) {
  const frequencies = processor.spectralHistory.map(f => f.peakFrequency);
  const smoothedFreqs = processor.smoothData(frequencies, 5);
  const maxFreq = Math.max(...smoothedFreqs);
  const minFreq = Math.min(...smoothedFreqs);
  const freqShift = maxFreq - minFreq;
  
  const firstQuarter = smoothedFreqs.slice(0, Math.floor(smoothedFreqs.length / 4));
  const lastQuarter = smoothedFreqs.slice(-Math.floor(smoothedFreqs.length / 4));
  const firstAvg = firstQuarter.reduce((a, b) => a + b) / firstQuarter.length;
  const lastAvg = lastQuarter.reduce((a, b) => a + b) / lastQuarter.length;
  const freqDecrease = firstAvg - lastAvg;
  
  console.log(`\n🔍 Analysis:`);
  console.log(`   Frequency range: ${minFreq.toFixed(1)} - ${maxFreq.toFixed(1)} Hz`);
  console.log(`   Frequency shift: ${freqShift.toFixed(1)} Hz (need >50)`);
  console.log(`   Frequency decrease: ${freqDecrease.toFixed(1)} Hz (need >30)`);
  console.log(`   Expected: ${approachFreq.toFixed(1)} -> ${recedingFreq.toFixed(1)} Hz (${(approachFreq-recedingFreq).toFixed(1)} Hz shift)`);
  
  // Check each validation step
  console.log(`\n✅ Validation checks:`);
  console.log(`   History length >= 20: ${processor.spectralHistory.length >= 20} (${processor.spectralHistory.length})`);
  console.log(`   Base frequency set: ${!!processor.baseFrequency} (${processor.baseFrequency?.toFixed(1)}Hz)`);
  console.log(`   Frequency shift >= 50: ${freqShift >= 50} (${freqShift.toFixed(1)}Hz)`);
  console.log(`   Frequency decrease >= 30: ${freqDecrease >= 30} (${freqDecrease.toFixed(1)}Hz)`);
}

// Try to get speed estimate
const finalSpeed = processor.estimateSpeed();
console.log(`\n🚗 Final result: ${finalSpeed ? finalSpeed.toFixed(1) + ' km/h' : 'null'}`);

if (finalSpeed) {
  const error = Math.abs(finalSpeed - 45) / 45;
  console.log(`   Expected: 45 km/h, Error: ${(error * 100).toFixed(1)}%`);
} else {
  console.log(`   ❌ Speed detection failed - this simulates the web app issue`);
}

console.log('\n🔧 This shows us what might be wrong with real audio processing.');