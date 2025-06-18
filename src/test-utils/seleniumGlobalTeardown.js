module.exports = async () => {
  if (global.__SERVER_PROCESS__) {
    console.log('\nStopping component test server...');
    const killed = global.__SERVER_PROCESS__.kill();
    if (killed) {
        console.log('Component test server stopped.');
    } else {
        console.log('Failed to stop component test server.');
    }
  }
};
