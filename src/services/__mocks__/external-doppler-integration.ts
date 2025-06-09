/**
 * Mock implementation of external Doppler service for testing
 */

export async function analyzeAudioWithExternalLibrary(
  audioData: Float32Array, 
  sampleRate: number
): Promise<{
  speed: number | null;
  approachFrequency?: number;
  recedeFrequency?: number;
  error?: string;
}> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Mock successful analysis for testing
  const mockSpeed = 50; // 50 km/h
  const mockApproachFreq = 867.6;
  const mockRecedeFreq = 851.9;
  
  return {
    speed: mockSpeed,
    approachFrequency: mockApproachFreq,
    recedeFrequency: mockRecedeFreq
  };
}

export async function checkExternalLibraryStatus(): Promise<{
  available: boolean;
  modules: string[];
  error?: string;
}> {
  return {
    available: true,
    modules: ['AudioAnalyzer', 'SpectrumAnalyzer', 'AudioProcessor']
  };
}