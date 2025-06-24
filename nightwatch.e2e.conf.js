module.exports = {
  // E2E test configuration for NightWatch
  test_settings: {
    default: {
      // Use geckodriver for Firefox
      webdriver: {
        start_process: true,
        server_path: require('geckodriver').path,
        port: 4445, // Different port from component tests
        cli_args: ['--log', 'debug']
      },
      
      // Browser capabilities for e2e testing
      desiredCapabilities: {
        browserName: 'firefox',
        'moz:firefoxOptions': {
          binary: '/usr/bin/firefox',
          args: process.env.HEADED ? [] : ['--headless'],
          prefs: {
            'media.navigator.permission.disabled': true,
            'media.navigator.streams.fake': true,
            'dom.webnotifications.enabled': false,
            'dom.push.enabled': false,
            'browser.cache.disk.enable': false,
            'browser.cache.memory.enable': false,
            'browser.sessionstore.max_tabs_undo': 0,
            'browser.sessionstore.max_windows_undo': 0,
            'network.http.use-cache': false,
            // E2E specific prefs
            'media.autoplay.default': 0, // Allow autoplay
            'media.autoplay.blocking_policy': 0,
            'permissions.default.microphone': 1 // Allow microphone (1=allow, 2=block)
          }
        }
      },
      
      // Test settings for main app
      launch_url: 'http://localhost:3000',
      page_load_timeout: 30000,
      element_timeout: 5000,
      assertion_timeout: 5000,
      
      // Screenshots for e2e
      screenshots: {
        enabled: !process.env.CI && !process.env.SKIP_SCREENSHOTS,
        path: 'test-results/nightwatch-e2e',
        on_failure: true,
        on_error: true
      }
    },
    
    // Headed mode for debugging e2e tests
    headed: {
      extends: 'default',
      desiredCapabilities: {
        browserName: 'firefox',
        'moz:firefoxOptions': {
          binary: '/usr/bin/firefox',
          args: [],
          prefs: {
            'media.navigator.permission.disabled': true,
            'media.navigator.streams.fake': true,
            'dom.webnotifications.enabled': false,
            'dom.push.enabled': false,
            'browser.cache.disk.enable': false,
            'browser.cache.memory.enable': false,
            'browser.sessionstore.max_tabs_undo': 0,
            'browser.sessionstore.max_windows_undo': 0,
            'media.autoplay.default': 0,
            'media.autoplay.blocking_policy': 0,
            'permissions.default.microphone': 1
          }
        }
      }
    }
  },
  
  // E2E test source
  src_folders: ['e2e'],
  
  // Output
  output_folder: 'test-results/nightwatch-e2e',
  
  // Parallel execution disabled for e2e
  test_workers: {
    enabled: false,
    workers: 1
  },
  
  // Globals
  globals_path: 'src/test-utils/nightwatch-e2e-globals.js'
};