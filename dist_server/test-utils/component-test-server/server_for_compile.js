"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const react_1 = __importDefault(require("react"));
const server_1 = __importDefault(require("react-dom/server"));
const path_1 = __importDefault(require("path")); // Ensure path is imported
const fs_1 = __importDefault(require("fs"));
// This flag helps the server adjust paths if it's running from 'dist_server' or 'src'
const IS_DIST_SERVER = __filename.includes('dist_server');
async function importComponent(componentName, props) {
    var _a;
    try {
        let harnessPath;
        const baseDir = process.cwd(); // /app
        // Construct path to the component file
        if (IS_DIST_SERVER) {
            // Running compiled: server is in /app/dist_server/test-utils/component-test-server/
            // Components are in /app/dist_server/components/__tests__/
            harnessPath = path_1.default.resolve(__dirname, '../../components/__tests__', `${componentName}.js`);
        }
        else {
            // Running with ts-node: server is in /app/src/test-utils/component-test-server/
            // Components are in /app/src/components/__tests__/
            harnessPath = path_1.default.resolve(__dirname, '../../components/__tests__', `${componentName}.tsx`);
        }
        if (!fs_1.default.existsSync(harnessPath)) {
            console.error(`Component harness not found at: ${harnessPath} (IS_DIST_SERVER=${IS_DIST_SERVER})`);
            return { error: `Component harness ${componentName} not found at ${harnessPath}.` };
        }
        const module = await (_a = harnessPath, Promise.resolve().then(() => __importStar(require(_a)))); // Dynamically import .js (compiled) or .tsx (ts-node)
        const ComponentToRender = module[componentName];
        if (!ComponentToRender) {
            // Fallback for default exports if named not found
            if (module.default && typeof module.default === 'function') {
                // console.log("Using default export for", componentName);
                return react_1.default.createElement(module.default, props);
            }
            return { error: `Failed to load ${componentName} from ${harnessPath}. Exported correctly (named or default)? Module keys: ${Object.keys(module).join(', ')}` };
        }
        return react_1.default.createElement(ComponentToRender, props);
    }
    catch (e) {
        console.error(`Error importing component ${componentName} from proposed path. IS_DIST_SERVER=${IS_DIST_SERVER}:`, e);
        return { error: `Error loading component ${componentName}: ${e.message}` };
    }
}
const app = (0, express_1.default)();
const PORT = process.env.COMPONENT_TEST_SERVER_PORT || 3001;
// Serve static files from dist_harness_bundles (where Vite puts ControlsTestHarness.hydrate.js)
// Path from dist_server/test-utils/component-test-server/server_for_compile.js to project_root/dist_harness_bundles
const staticBundlesPath = path_1.default.resolve(IS_DIST_SERVER ? __dirname : process.cwd(), IS_DIST_SERVER ? '../../../dist_harness_bundles' : 'dist_harness_bundles');
console.log("Serving static bundles from:", staticBundlesPath);
app.use('/static_bundles', express_1.default.static(staticBundlesPath));
app.get('/render-component/:componentName', async (req, res) => {
    const { componentName } = req.params;
    const queryProps = req.query;
    const props = {};
    for (const key in queryProps) {
        const value = queryProps[key];
        if (value === 'true')
            props[key] = true;
        else if (value === 'false')
            props[key] = false;
        // Make sure 'value' is not undefined or null before calling Number()
        else if (value && !isNaN(Number(value)))
            props[key] = Number(value);
        else
            props[key] = value;
    }
    console.log(`Server (${IS_DIST_SERVER ? 'compiled' : 'ts-node'}) rendering ${componentName} with props:`, props);
    const componentElementOrError = await importComponent(componentName, props);
    if (react_1.default.isValidElement(componentElementOrError)) {
        const componentHtml = server_1.default.renderToString(componentElementOrError);
        // Escape quotes for HTML data attribute
        const propsString = JSON.stringify(props || {}).replace(/"/g, '&quot;');
        const html = `
            <!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Test: ${componentName}</title>
            <style>body{margin:0;font-family:sans-serif;background-color:#f0f0f0;}.test-harness-container{padding:20px;background-color:#f5f5f5;min-height:300px;}.component-section{border:2px solid #007acc;padding:10px;margin:10px 0;background-color:white;}.harness-state-section{border:2px solid #28a745;padding:10px;margin:10px 0;background-color:white;}.event-log-section{border:2px solid #ffc107;padding:10px;margin:10px 0;background-color:white;}</style>
            </head><body>
                <div id="root-harness" class="test-harness-container" data-props='${propsString}'>${componentHtml}</div>
                <script src="/static_bundles/ControlsTestHarness.hydrate.js"></script>
            </body></html>`;
        res.send(html);
    }
    else {
        res.status(500).send(`<h1>Error rendering component</h1><p>${componentElementOrError.error}</p>`);
    }
});
app.listen(PORT, () => {
    console.log(`Component test server (${IS_DIST_SERVER ? 'compiled' : 'ts-node'}) listening on http://localhost:${PORT}`);
});
exports.default = app;
