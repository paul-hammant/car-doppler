"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlsTestHarness = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */
const react_1 = require("react");
const Controls_1 = require("../Controls"); // Corrected to named import
// Test Harness Component - simulates how Controls would be used in the real app
const ControlsTestHarness = ({ initialRecording = false, initialMetric = true, initialProcessing = false, testName }) => {
    const [isRecording, setIsRecording] = (0, react_1.useState)(initialRecording);
    const [isMetric, setIsMetric] = (0, react_1.useState)(initialMetric);
    const [isProcessing, setIsProcessing] = (0, react_1.useState)(initialProcessing);
    const [eventLog, setEventLog] = (0, react_1.useState)([]);
    const logEvent = (event) => {
        setEventLog(prev => [...prev, `${new Date().toISOString()}: ${event}`]);
    };
    const handleToggleRecording = () => {
        const newState = !isRecording;
        setIsRecording(newState);
        logEvent(`Recording ${newState ? 'started' : 'stopped'}`);
    };
    const handleToggleUnits = () => {
        const newState = !isMetric;
        setIsMetric(newState);
        logEvent(`Units changed to ${newState ? 'metric' : 'imperial'}`);
    };
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ style: { padding: '20px', backgroundColor: '#f5f5f5', minHeight: '300px' } }, { children: [(0, jsx_runtime_1.jsxs)("h2", Object.assign({ "data-testid": "test-name" }, { children: ["Test: ", testName] })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ style: { border: '2px solid #007acc', padding: '10px', margin: '10px 0' } }, { children: [(0, jsx_runtime_1.jsx)("h3", { children: "Component Under Test" }), (0, jsx_runtime_1.jsx)(Controls_1.Controls, { isRecording: isRecording, isProcessing: isProcessing, isMetric: isMetric, onToggleRecording: handleToggleRecording, onToggleUnits: handleToggleUnits })] })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ style: { border: '2px solid #28a745', padding: '10px', margin: '10px 0' } }, { children: [(0, jsx_runtime_1.jsx)("h3", { children: "Test Harness State" }), (0, jsx_runtime_1.jsxs)("div", Object.assign({ "data-testid": "harness-recording-state" }, { children: ["Recording: ", isRecording ? 'ON' : 'OFF'] })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ "data-testid": "harness-units-state" }, { children: ["Units: ", isMetric ? 'METRIC (km/h)' : 'IMPERIAL (mph)'] })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ "data-testid": "harness-processing-state" }, { children: ["Processing: ", isProcessing ? 'YES' : 'NO'] }))] })), (0, jsx_runtime_1.jsxs)("div", Object.assign({ style: { border: '2px solid #ffc107', padding: '10px', margin: '10px 0' } }, { children: [(0, jsx_runtime_1.jsx)("h3", { children: "Event Log (Event Coupling Trace)" }), (0, jsx_runtime_1.jsx)("div", Object.assign({ "data-testid": "event-log", style: { fontFamily: 'monospace', fontSize: '12px' } }, { children: eventLog.length === 0 ? 'No events yet...' : eventLog.map((event, i) => ((0, jsx_runtime_1.jsx)("div", Object.assign({ "data-testid": `event-${i}` }, { children: event }), i))) }))] }))] })));
};
exports.ControlsTestHarness = ControlsTestHarness;
