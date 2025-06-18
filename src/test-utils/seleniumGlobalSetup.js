const { spawn } = require('child_process');
const path = require('path');

module.exports = async () => {
  console.log('\nStarting component test server...');
  // Note: This path assumes the server script has been compiled to dist_server
  const serverPath = path.resolve(__dirname, '../../dist_server/test-utils/component-test-server/server_for_compile.js');
  const server = spawn('node', [serverPath], { stdio: ['ignore', 'pipe', 'pipe'] });

  global.__SERVER_PROCESS__ = server;

  server.stderr.on('data', (data) => {
    console.error(`Server stderr: ${data}`);
  });

  return new Promise((resolve, reject) => {
    server.stdout.on('data', (data) => {
      const output = data.toString();
      // Log server output for debugging, but you can comment this out for cleaner test logs
      // console.log(`Server stdout: ${output}`); 
      if (output.includes('listening on http://localhost:3001')) {
        console.log('Component test server started successfully.');
        resolve();
      }
    });

    server.on('error', (error) => {
      console.error('Failed to start component test server:', error);
      reject(error);
    });

    server.on('close', (code) => {
        if (code !== 0 && code !== null) {
            // This can happen if the server fails to start (e.g., port in use)
            reject(new Error(`Server process exited with code ${code}`));
        }
    });
  });
};
