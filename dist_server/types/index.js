"use strict";
/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGES = void 0;
exports.ERROR_MESSAGES = {
    E01: 'Too quiet - no vehicle heard',
    E02: 'Too noisy - background interference',
    E03: 'Recording too short (<3 seconds)',
    E04: 'Vehicle too slow or stationary',
    E05: 'Multiple vehicles detected',
    E06: 'Poor positioning - not perpendicular?',
    E07: 'Electric vehicle? Very quiet audio',
    E08: 'Audio clipped - too close or loud',
    E09: 'No clear Doppler pattern found',
    E10: 'Vehicle passed too quickly'
};
