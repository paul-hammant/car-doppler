module.exports = {
  // Global setup - runs once before all tests
  before: function(done) {
    console.log('Setting up NightWatch test environment...');
    done();
  },

  // Global teardown - runs once after all tests
  after: function(done) {
    console.log('Tearing down NightWatch test environment...');
    done();
  },

  // Before each test
  beforeEach: function(browser, done) {
    // Implicit wait for faster element finding
    browser.timeouts('implicit', 1000);
    done();
  },

  // After each test
  afterEach: function(browser, done) {
    done();
  }
};