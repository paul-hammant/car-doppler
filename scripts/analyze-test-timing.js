#!/usr/bin/env node

/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 * 
 * Analyze component test timing to quantify per-test speeds
 * and ignore startup overhead
 */

const fs = require('fs');
const path = require('path');

function analyzeTestTiming() {
  const resultsPath = path.join(__dirname, '../test-results/component-test-results.json');
  
  if (!fs.existsSync(resultsPath)) {
    console.error('❌ Component test results not found. Run: npm run test:ct');
    console.error('   This generates test-results/component-test-results.json');
    process.exit(1);
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  
  if (!results.suites || results.suites.length === 0) {
    console.error('❌ No test suites found in results');
    process.exit(1);
  }

  console.log('🔍 Component Test Timing Analysis\n');
  console.log('='.repeat(50));

  let totalTests = 0;
  let totalDuration = 0;
  let testDetails = [];

  // Analyze each test suite
  results.suites.forEach(suite => {
    if (suite.tests) {
      suite.tests.forEach(test => {
        totalTests++;
        const durationMs = test.results[0]?.duration || 0;
        totalDuration += durationMs;
        
        testDetails.push({
          title: test.title,
          file: suite.title,
          duration: durationMs,
          durationSeconds: (durationMs / 1000).toFixed(2)
        });
      });
    }
  });

  // Sort by duration
  testDetails.sort((a, b) => b.duration - a.duration);

  // Display individual test timings
  console.log('\n📊 Individual Test Timings (excluding startup):');
  console.log('-'.repeat(80));
  testDetails.forEach((test, index) => {
    const rank = index + 1;
    console.log(`${rank.toString().padStart(2)}. ${test.durationSeconds}s - ${test.title}`);
    console.log(`    ${test.file}`);
  });

  // Calculate statistics
  const avgDurationMs = totalDuration / totalTests;
  const avgDurationSeconds = avgDurationMs / 1000;
  const testsPerSecond = totalTests > 0 ? (1 / avgDurationSeconds).toFixed(2) : '0';

  console.log('\n📈 Summary Statistics:');
  console.log('-'.repeat(30));
  console.log(`Total tests: ${totalTests}`);
  console.log(`Total duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`Average per test: ${avgDurationSeconds.toFixed(2)}s`);
  console.log(`Tests per second: ${testsPerSecond}`);

  // Find fastest and slowest
  if (testDetails.length > 0) {
    const fastest = testDetails[testDetails.length - 1];
    const slowest = testDetails[0];
    
    console.log(`Fastest test: ${fastest.durationSeconds}s`);
    console.log(`Slowest test: ${slowest.durationSeconds}s`);
    console.log(`Speed variance: ${(slowest.duration / fastest.duration).toFixed(1)}x`);
  }

  // Performance assessment
  console.log('\n🎯 Performance Assessment:');
  console.log('-'.repeat(30));
  if (avgDurationSeconds < 2) {
    console.log('✅ Excellent: < 2s per test (fast feedback)');
  } else if (avgDurationSeconds < 5) {
    console.log('✅ Good: 2-5s per test (acceptable for CI)');
  } else if (avgDurationSeconds < 15) {
    console.log('⚠️  Moderate: 5-15s per test (may need optimization)');
  } else {
    console.log('❌ Slow: > 15s per test (optimization recommended)');
  }

  console.log('\n💡 Notes:');
  console.log('- Timings exclude Playwright browser startup overhead');
  console.log('- Component tests include screenshot capture');
  console.log('- First test in each suite may include component compilation');
  console.log('- Run multiple times for consistent measurements');
}

if (require.main === module) {
  analyzeTestTiming();
}

module.exports = { analyzeTestTiming };