import express from 'express';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import path from 'path';
import fs from 'fs';

async function importComponent(componentName: string, props: any, distServer: boolean) {
    try {
        let harnessPath;
        // When compiled, paths might be relative to the compiled file in dist_server
        // The key is that the original .tsx files are NOT in dist_server.
        // We need to resolve paths back to the src directory.
        // process.cwd() should be the project root.
        const baseDir = process.cwd(); // Or determine relative path from __dirname if needed

        if (distServer) {
            // Path from ./dist_server/test-utils/component-test-server/server.js
            // to src/components/__tests__
            // This assumes 'src' is at the same level as 'dist_server' in the project root
             harnessPath = path.resolve(baseDir, 'src/components/__tests__', `${componentName}.tsx`);
        } else {
            // Path from src/test-utils/component-test-server/server.ts (when run with ts-node)
            // to src/components/__tests__
            harnessPath = path.resolve(baseDir, 'src/components/__tests__', `${componentName}.tsx`);
        }

        if (!fs.existsSync(harnessPath)) {
            console.error(`Component harness not found at: ${harnessPath}`);
            return { error: `Component harness ${componentName} not found at ${harnessPath}.` };
        }

        // For runtime execution (compiled server or ts-node), we need to import .tsx
        // and rely on the execution environment (ts-node or a pre-compilation step for dependencies)
        // to handle the .tsx. If this server.js is compiled, it will still try to require .tsx
        // which means we need ts-node/register or similar if those .tsx files aren't also compiled
        // OR ensure tsconfig.server.json compiles all dependent .tsx to .js in dist_server too.
        // The latter is safer. The current tsconfig.server.json tries to include them.

        const module = await import(harnessPath); // Dynamic import of TSX
        const ComponentToRender = module[componentName];

        if (!ComponentToRender) {
            return { error: `Failed to load ${componentName} from ${harnessPath}. Exported correctly?` };
        }
        return React.createElement(ComponentToRender, props);
    } catch (e: any) {
        console.error(`Error importing component ${componentName}:`, e);
        return { error: `Error loading component ${componentName}: ${e.message}` };
    }
}

const app = express();
const PORT = process.env.COMPONENT_TEST_SERVER_PORT || 3001;
// A flag to tell the server if it's running in its compiled 'dist_server' form
const IS_DIST_SERVER = __filename.includes('dist_server');

// Serve the test mounter HTML page
app.get('/test-mounter', (req, res) => {
    const testMounterPath = path.resolve(__dirname, 'test-mounter.html');
    if (fs.existsSync(testMounterPath)) {
        res.sendFile(testMounterPath);
    } else {
        res.status(404).send('Test mounter not found');
    }
});

app.get('/render-component/:componentName', async (req, res) => {
    const { componentName } = req.params;
    const queryProps = req.query;
    const props: Record<string, any> = {};
    for (const key in queryProps) {
        const value = queryProps[key] as string;
        if (value === 'true') props[key] = true;
        else if (value === 'false') props[key] = false;
        // Make sure 'value' is not undefined or null before calling Number()
        else if (value && !isNaN(Number(value))) props[key] = Number(value);
        else props[key] = value;
    }

    console.log(`Server (${IS_DIST_SERVER ? 'compiled' : 'ts-node'}) rendering ${componentName} with props:`, props);
    const componentElementOrError = await importComponent(componentName, props, IS_DIST_SERVER);

    if (React.isValidElement(componentElementOrError)) {
        const componentHtml = ReactDOMServer.renderToString(componentElementOrError);
        const html = `
            <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Test: ${componentName}</title>
            <style>body{margin:0;font-family:sans-serif;background-color:#f0f0f0;}.test-harness-container{padding:20px;background-color:#f5f5f5;min-height:300px;}.component-section{border:2px solid #007acc;padding:10px;margin:10px 0;background-color:white;}.harness-state-section{border:2px solid #28a745;padding:10px;margin:10px 0;background-color:white;}.event-log-section{border:2px solid #ffc107;padding:10px;margin:10px 0;background-color:white;}</style>
            </head><body><div id="root" class="test-harness-container">${componentHtml}</div></body></html>`;
        res.send(html);
    } else {
        res.status(500).send(`<h1>Error rendering component</h1><p>${(componentElementOrError as any).error}</p>`);
    }
});

// New endpoint for fragment rendering (just the component HTML, no full page)
app.get('/render-component-fragment/:componentName', async (req, res) => {
    const { componentName } = req.params;
    const queryProps = req.query;
    const props: Record<string, any> = {};
    for (const key in queryProps) {
        const value = queryProps[key] as string;
        if (value === 'true') props[key] = true;
        else if (value === 'false') props[key] = false;
        else if (value && !isNaN(Number(value))) props[key] = Number(value);
        else props[key] = value;
    }

    console.log(`Server rendering fragment ${componentName} with props:`, props);
    const componentElementOrError = await importComponent(componentName, props, IS_DIST_SERVER);

    if (React.isValidElement(componentElementOrError)) {
        const componentHtml = ReactDOMServer.renderToString(componentElementOrError);
        res.send(componentHtml);
    } else {
        res.status(500).send(`<div>Error rendering component: ${(componentElementOrError as any).error}</div>`);
    }
});

app.listen(PORT, () => {
    console.log(`Component test server (${IS_DIST_SERVER ? 'compiled' : 'ts-node'}) listening on http://localhost:${PORT}`);
});
export default app;
