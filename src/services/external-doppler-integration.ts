/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 *
 * Integration with the external Doppler analysis service
 * This module provides browser-compatible access to the GitHub Pages deployed service
 */

const BASE_URL = 'https://paul-hammant.github.io/Car-Speed-Via-Doppler-Library';

/**
 * Load and use the external Doppler service for speed calculation
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
  try {
    console.log('🔧 External Service: Loading Doppler analysis modules...');
    
    // Import the external service modules from GitHub Pages
    const AudioAnalyzer = (await import(/* @vite-ignore */  `${BASE_URL}/shared/audio-analyzer.js`)).default;
    const SpectrumAnalyzer = (await import(/* @vite-ignore */  `${BASE_URL}/non-simd/spectrum-analyzer.js`)).default;
    const AudioProcessor = (await import(/* @vite-ignore */  `${BASE_URL}/shared/audio-utils.js`)).default;
    
    console.log('🔧 External Service: Modules loaded successfully');
    
    // Initialize analyzer with recommended settings
    const analyzer = new AudioAnalyzer({
      fftMode: 'wasm-no-simd',
      windowType: 'hamming',
      confidenceThreshold: 0.7
    });
    
    console.log(`🔧 External Service: Processing ${(audioData.length / sampleRate).toFixed(2)}s audio at ${sampleRate}Hz`);
    
    // Convert to format expected by the service
    const samples = Array.from(audioData);
    
    // Step 1: Extract approach and recede sections
    const sections = analyzer.extractSections(samples, sampleRate, 'peak_rms_energy');
    console.log('🔧 External Service: Extracted audio sections:', {
      approaching: sections.approaching?.length || 0,
      receding: sections.receding?.length || 0
    });
    
    if (!sections.approaching || !sections.receding) {
      throw new Error('Unable to extract valid approach/recede sections from audio');
    }
    
    // Step 2: Analyze frequencies using spectrum analyzers
    const approachAnalyzer = new SpectrumAnalyzer(sections.approaching, sampleRate, { windowType: 'hamming' });
    const recedeAnalyzer = new SpectrumAnalyzer(sections.receding, sampleRate, { windowType: 'hamming' });
    
    await approachAnalyzer.calculatePowerSpectrum();
    await recedeAnalyzer.calculatePowerSpectrum();
    
    const approachFreqs = analyzer.filterReasonableFrequencies(approachAnalyzer.getStrongestFrequencies(5));
    const recedeFreqs = analyzer.filterReasonableFrequencies(recedeAnalyzer.getStrongestFrequencies(5));
    
    console.log('🔧 External Service: Frequency analysis:', {
      approachCount: approachFreqs.length,
      recedeCount: recedeFreqs.length
    });
    
    // Step 3: Calculate speed using the service's algorithm
    const speedResult = await analyzer.findBestSpeedCalculation(approachFreqs, recedeFreqs);
    
    console.log('🔧 External Service: Speed calculation:', {
      kmh: speedResult.speedKmh?.toFixed(1),
      mph: speedResult.speedMph?.toFixed(1),
      confidence: speedResult.confidence,
      strategy: speedResult.strategy
    });
    
    return {
      speed: speedResult.speedKmh,
      approachFrequency: approachFreqs[0]?.frequency,
      recedeFrequency: recedeFreqs[0]?.frequency
    };
    
  } catch (error) {
    console.error('🔧 External Service: Analysis failed:', error);
    return {
      speed: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if the external Doppler service is available and working
 */
export async function checkExternalLibraryStatus(): Promise<{
  available: boolean;
  modules: string[];
  error?: string;
}> {
  try {
    console.log('🔧 External Service: Checking service availability...');
    
    // Test loading core modules from the service
    const AudioAnalyzer = (await import(/* @vite-ignore */  `${BASE_URL}/shared/audio-analyzer.js`)).default;
    const SpectrumAnalyzer = (await import(/* @vite-ignore */  `${BASE_URL}/non-simd/spectrum-analyzer.js`)).default;
    const AudioProcessor = (await import(/* @vite-ignore */  `${BASE_URL}/shared/audio-utils.js`)).default;
    
    // Verify modules loaded correctly
    if (AudioAnalyzer && SpectrumAnalyzer && AudioProcessor) {
      console.log('🔧 External Service: All modules loaded successfully');
      return {
        available: true,
        modules: ['AudioAnalyzer', 'SpectrumAnalyzer', 'AudioProcessor']
      };
    } else {
      return {
        available: false,
        modules: [],
        error: 'One or more modules failed to load from external service'
      };
    }
  } catch (error) {
    console.error('🔧 External Service: Service check failed:', error);
    return {
      available: false,
      modules: [],
      error: error instanceof Error ? error.message : 'External service unavailable'
    };
  }
}