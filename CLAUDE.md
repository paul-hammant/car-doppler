- Reflection on testing approach: Need to develop unit/integration tests that calculate speed from the sample data itself, rather than extracting from filename
- double check algorithm checks still work

# CRITICAL ARCHITECTURE RULE - NEVER VIOLATE
**SINGLE SOURCE OF TRUTH**: /Car-Speed-Via-Doppler-Library/ is the ONLY Doppler speed detection technology in prod.

## ABSOLUTELY FORBIDDEN:
- NEVER copy/duplicate code FROM /Car-Speed-Via-Doppler-Library/ INTO src/
- NEVER create "ExternalXXX.ts" files that duplicate library functionality 
- NEVER create alternative FFT implementations in src/
- NEVER add duplicate Doppler algorithms anywhere except /Car-Speed-Via-Doppler-Library//
- NEVER create "browser-compatible" versions of library modules
- NEVER make TypeScript adaptations of JavaScript library files
- NO files like: ExternalSpectrumAnalyzer.ts, ExternalDopplerCalculator.ts, etc.

## REQUIRED APPROACH:
- FIX import/bridge issues, DON'T copy code
- Use dynamic import() to load library modules directly
- Fix browser compatibility in the original library files, not copies
- External library must remain single source of truth for ALL Doppler functionality
- If browser can't import library directly, fix the library, don't duplicate it

## EVIDENCE OF VIOLATION:
If you see files like src/lib/ExternalXXX.ts that mirror /Car-Speed-Via-Doppler-Library/non-SIMD/lib/XXX.js, this is a violation that MUST be fixed by deleting the duplicate and fixing the import.

## BANNED FUNCTIONS IN src/lib/:
**Mathematical functions that indicate signal processing duplication:**
- Math.sin(), Math.cos(), Math.tan() - indicates FFT/windowing duplication
- Math.PI usage in audio context - indicates frequency calculations
- Math.log(), Math.log2(), Math.log10() - indicates spectrum analysis
- Math.sqrt() in audio context - indicates power spectrum calculations
- Math.abs() on frequency data - indicates magnitude calculations
- Math.max(), Math.min() on spectrum data - indicates peak detection
- Math.atan2() - indicates phase calculations
- Any windowing functions (Hann, Hamming, Blackman, etc.)

**Audio/Signal processing patterns:**
- FFT calculations or references
- Frequency bin calculations  
- Sample rate conversions
- Audio buffering beyond simple UI needs
- Spectrum magnitude calculations
- Peak detection algorithms
- Doppler shift formulas
- Speed calculation from frequency

**If you see these in src/lib/, it means Doppler functionality was duplicated instead of imported from /Car-Speed-Via-Doppler-Library/.**
- Within the /Car-Speed-Via-Doppler-Library/, WASM with SIMD-disabled is always preferred
