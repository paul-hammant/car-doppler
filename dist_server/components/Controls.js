"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controls = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 */
const react_1 = __importDefault(require("react"));
// require("./Controls.css"); Commented by build script
const Controls = ({ isRecording, isProcessing, isMetric, onToggleRecording, onToggleUnits, 'data-testid': testId = 'controls' }) => {
    const recordButtonText = isRecording ? 'Stop\nListening' : 'Start\nListening';
    const unitButtonText = isMetric ? 'Switch to\nmph' : 'Switch to\nkm/h';
    return ((0, jsx_runtime_1.jsxs)("div", Object.assign({ className: "controls", "data-testid": testId }, { children: [(0, jsx_runtime_1.jsx)("button", Object.assign({ className: `control-button record-button ${isRecording ? 'recording' : ''}`, onClick: onToggleRecording, disabled: isProcessing, "data-testid": "record-button", "aria-label": recordButtonText.replace('\n', ' ') }, { children: recordButtonText.split('\n').map((line, index) => ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [line, index === 0 && (0, jsx_runtime_1.jsx)("br", {})] }, index))) })), (0, jsx_runtime_1.jsx)("button", Object.assign({ className: "control-button unit-button", onClick: onToggleUnits, disabled: isProcessing, "data-testid": "unit-toggle-button", "aria-label": `Switch to ${isMetric ? 'mph' : 'km/h'}` }, { children: unitButtonText.split('\n').map((line, index) => ((0, jsx_runtime_1.jsxs)(react_1.default.Fragment, { children: [line, index === 0 && (0, jsx_runtime_1.jsx)("br", {})] }, index))) }))] })));
};
exports.Controls = Controls;
