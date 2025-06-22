const { quitDriver } = require('./selenium-utils');

module.exports = async () => {
  // Stop global Selenium driver
  if (global.__SELENIUM_DRIVER__) {
    console.log('\nStopping global Selenium driver...');
    try {
      await quitDriver(global.__SELENIUM_DRIVER__);
      global.__SELENIUM_DRIVER__ = null;
      console.log('Global Selenium driver stopped.');
    } catch (error) {
      console.error('Error stopping global Selenium driver:', error);
    }
  }

  // Stop component test server
  if (global.__SERVER_PROCESS__) {
    console.log('Stopping component test server...');
    const killed = global.__SERVER_PROCESS__.kill();
    if (killed) {
        console.log('Component test server stopped.');
    } else {
        console.log('Failed to stop component test server.');
    }
  }
};
