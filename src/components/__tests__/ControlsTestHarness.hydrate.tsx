import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { ControlsTestHarness } from './ControlsTestHarness'; // The component to hydrate

const rootElement = document.getElementById('root-harness'); // Target div for hydration

if (rootElement) {
    try {
        const propsString = rootElement.dataset.props;
        let props = {};
        if (propsString) {
            props = JSON.parse(propsString);
            console.log('Hydrating ControlsTestHarness with props:', props);
        } else {
            console.warn('No props found in data-props attribute for hydration. Hydrating with empty props.');
            // Fallback: attempt to hydrate with a default 'testName' if none passed
            // This might be needed if initial render on server for some reason doesn't embed props,
            // though the plan is to ensure server.ts does embed them.
            props = { testName: "Client Hydrated Default Test" };
        }

        // Ensure that the props are what ControlsTestHarness expects.
        // For example, testName is required by ControlsTestHarness.
        if (typeof (props as any).testName !== 'string') {
            console.warn('testName prop missing or not a string, setting default for hydration.');
            (props as any).testName = (props as any).testName || "Client Hydrated Default";
        }

        hydrateRoot(rootElement, <ControlsTestHarness {...props} />);
        console.log('ControlsTestHarness hydration complete.');

    } catch (error) {
        console.error('Error parsing props or hydrating component:', error);
        // Optionally, render a fallback UI or error message
        // rootElement.innerHTML = '<p>Error during hydration. See console.</p>';
    }
} else {
    console.error('Root element #root-harness not found for hydration.');
}
