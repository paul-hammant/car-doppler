module.exports = {
  // Global setup for e2e tests - runs once before all tests
  before: function(done) {
    console.log('Setting up NightWatch E2E test environment...');
    console.log('Target app URL: http://localhost:3000/car-doppler/');
    done();
  },

  // Global teardown - runs once after all tests
  after: function(done) {
    console.log('Tearing down NightWatch E2E test environment...');
    done();
  },

  // Before each test
  beforeEach: function(browser, done) {
    // Set timeouts for e2e testing
    browser.timeouts('implicit', 2000);
    browser.timeouts('pageLoad', 30000);
    done();
  },

  // After each test
  afterEach: function(browser, done) {
    done();
  }
};