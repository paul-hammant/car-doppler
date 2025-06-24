module.exports = {
  // Specify which browsers to run tests in
  test_settings: {
    default: {
      // Use geckodriver for Firefox
      webdriver: {
        start_process: true,
        server_path: require('geckodriver').path,
        port: 4444,
        cli_args: ['--log', 'debug']
      },
      
      // Browser capabilities
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
            'network.http.use-cache': false,
            'browser.sessionstore.max_tabs_undo': 0,
            'browser.sessionstore.max_windows_undo': 0
          }
        }
      },
      
      // Test settings
      launch_url: 'http://localhost:3001',
      page_load_timeout: 30000,
      element_timeout: 2000,
      assertion_timeout: 2000,
      
      // Screenshots
      screenshots: {
        enabled: !process.env.CI && !process.env.SKIP_SCREENSHOTS,
        path: 'test-results/nightwatch',
        on_failure: true,
        on_error: true
      }
    },
    
    // Headed mode for debugging
    headed: {
      extends: 'default',
      desiredCapabilities: {
        browserName: 'firefox',
        'moz:firefoxOptions': {
          binary: '/usr/bin/firefox',
          args: []
        }
      }
    }
  },
  
  // Test source
  src_folders: ['src/components/__tests__'],
  
  // Test file pattern - moved to CLI args to avoid circular reference
  
  // Output
  output_folder: 'test-results/nightwatch',
  
  // Parallel execution
  test_workers: {
    enabled: false, // Disable parallel execution to match current setup
    workers: 1
  },
  
  // Plugins
  plugins: ['@nightwatch/react'],
  
  // Globals
  globals_path: 'src/test-utils/nightwatch-globals.js'
};