/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Set FFT mode BEFORE any external library imports
// This must be set before the car-speed-via-doppler-analysis library is imported
console.log('🔧 Setting FFT_MODE=FALLBACK at application startup for browser compatibility');
(globalThis as any).FFT_MODE = 'FALLBACK';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
