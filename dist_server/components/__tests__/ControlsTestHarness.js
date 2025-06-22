"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlsTestHarness = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */
const react_1 = require("react");
const Controls_1 = require("../Controls");
const BaseTestHarness_1 = require("./BaseTestHarness");
// Test Harness Component - simulates how Controls would be used in the real app
const ControlsTestHarness = ({ initialRecording = false, initialMetric = true, initialProcessing = false, testName }) => {
    const [isRecording, setIsRecording] = (0, react_1.useState)(initialRecording);
    const [isMetric, setIsMetric] = (0, react_1.useState)(initialMetric);
    const [isProcessing, setIsProcessing] = (0, react_1.useState)(initialProcessing);
    const harnessStateContent = ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", Object.assign({ "data-testid": "harness-recording-state" }, { children: ["Recording: ", isRecording ? 'ON' : 'OFF'] })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ "data-testid": "harness-units-state" }, { children: ["Units: ", isMetric ? 'METRIC (km/h)' : 'IMPERIAL (mph)'] })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ "data-testid": "harness-processing-state" }, { children: ["Processing: ", isProcessing ? 'YES' : 'NO'] }))] }));
    const initialEventMessage = `Controls harness initialized - Recording: ${isRecording ? 'ON' : 'OFF'}, Units: ${isMetric ? 'METRIC' : 'IMPERIAL'}`;
    return ((0, jsx_runtime_1.jsx)(BaseTestHarness_1.BaseTestHarness, Object.assign({ testName: testName, harnessStateContent: harnessStateContent, initialEventMessage: initialEventMessage }, { children: (0, jsx_runtime_1.jsx)(ControlsWithLogging, { isRecording: isRecording, isProcessing: isProcessing, isMetric: isMetric, onRecordingChange: setIsRecording, onUnitsChange: setIsMetric }) })));
};
exports.ControlsTestHarness = ControlsTestHarness;
// Wrapper component that uses the test harness context for logging
const ControlsWithLogging = ({ isRecording, isProcessing, isMetric, onRecordingChange, onUnitsChange }) => {
    const { logEvent } = (0, BaseTestHarness_1.useTestHarness)();
    const handleToggleRecording = () => {
        const newState = !isRecording;
        onRecordingChange(newState);
        logEvent(`Recording ${newState ? 'started' : 'stopped'}`);
    };
    const handleToggleUnits = () => {
        const newState = !isMetric;
        onUnitsChange(newState);
        logEvent(`Units changed to ${newState ? 'metric' : 'imperial'}`);
    };
    return ((0, jsx_runtime_1.jsx)(Controls_1.Controls, { isRecording: isRecording, isProcessing: isProcessing, isMetric: isMetric, onToggleRecording: handleToggleRecording, onToggleUnits: handleToggleUnits }));
};
