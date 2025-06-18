/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import App from './App';

test('renders Doppler Speed Detector app title', async () => {
  await act(async () => {
    render(<App />);
  });
  const titleElement = screen.getByText(/Doppler Speed Detector/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders accuracy warning', async () => {
  await act(async () => {
    render(<App />);
  });
  const warningElement = screen.getByText(/Speed calculations are experimental and inaccurate/i);
  expect(warningElement).toBeInTheDocument();
});

test('renders privacy notice', async () => {
  await act(async () => {
    render(<App />);
  });
  const privacyElement = screen.getByText(/All processing happens locally on your device/i);
  expect(privacyElement).toBeInTheDocument();
});
