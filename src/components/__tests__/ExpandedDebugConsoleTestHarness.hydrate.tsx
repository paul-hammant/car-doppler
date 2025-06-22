import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { ExpandedDebugConsoleTestHarness } from './ExpandedDebugConsoleTestHarness'; // The component to hydrate

const rootElement = document.getElementById('root-harness'); // Target div for hydration

if (rootElement) {
    try {
        const propsString = rootElement.dataset.props;
        let props = {};
        if (propsString) {
            props = JSON.parse(propsString);
            console.log('Hydrating ExpandedDebugConsoleTestHarness with props:', props);
        } else {
            console.warn('No props found in data-props attribute for hydration. Hydrating with empty props.');
            // Fallback: attempt to hydrate with a default 'testName' if none passed
            props = { testName: "Client Hydrated Default Test" };
        }

        // Ensure that the props are what ExpandedDebugConsoleTestHarness expects.
        // For example, testName is required by ExpandedDebugConsoleTestHarness.
        if (typeof (props as any).testName !== 'string') {
            console.warn('testName prop missing or not a string, setting default for hydration.');
            (props as any).testName = (props as any).testName || "Client Hydrated Default";
        }

        hydrateRoot(rootElement, <ExpandedDebugConsoleTestHarness {...props} />);
        console.log('ExpandedDebugConsoleTestHarness hydration complete.');

    } catch (error) {
        console.error('Error parsing props or hydrating component:', error);
        // Optionally, render a fallback UI or error message
        // rootElement.innerHTML = '<p>Error during hydration. See console.</p>';
    }
} else {
    console.error('Root element #root-harness not found for hydration.');
}