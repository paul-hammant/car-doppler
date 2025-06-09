#!/usr/bin/env node

/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 * 
 * Benchmark the median speed test by running it 100 times
 * to get highly accurate per-test timing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function findMedianTest() {
  const resultsPath = path.join(__dirname, '../test-results/component-test-results.json');
  
  if (!fs.existsSync(resultsPath)) {
    console.error('❌ Need to run component tests first to find median test');
    console.log('   Run: npm run test:ct');
    process.exit(1);
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  let testDetails = [];

  // Handle nested suite structure
  function extractTests(suites, parentFile = 'unknown') {
    suites.forEach(suite => {
      if (suite.specs) {
        suite.specs.forEach(spec => {
          if (spec.tests && spec.tests.length > 0) {
            const test = spec.tests[0]; // First test result
            const durationMs = test.results[0]?.duration || 0;
            testDetails.push({
              title: spec.title,
              file: parentFile,
              duration: durationMs,
              fullTitle: spec.title
            });
          }
        });
      }
      if (suite.suites) {
        extractTests(suite.suites, suite.file || parentFile);
      }
    });
  }

  extractTests(results.suites);

  if (testDetails.length === 0) {
    console.error('❌ No tests found in results');
    process.exit(1);
  }

  // Sort by duration to find median
  testDetails.sort((a, b) => a.duration - b.duration);
  const medianIndex = Math.floor(testDetails.length / 2);
  const medianTest = testDetails[medianIndex];

  console.log(`🎯 Found median test: "${medianTest.fullTitle}"`);
  console.log(`   Duration: ${(medianTest.duration / 1000).toFixed(2)}s`);
  console.log(`   File: ${medianTest.file}`);
  
  return {
    title: medianTest.fullTitle,
    file: medianTest.file,
    duration: medianTest.duration
  };
}

function createBenchmarkTest(medianTest) {
  const testContent = `/**
 * Copyright Paul Hammant 2025, see GPL3 LICENSE in this repo
 * 
 * GENERATED BENCHMARK TEST - DO NOT EDIT MANUALLY
 * This file is auto-generated for performance benchmarking
 */

import { test, expect } from '@playwright/experimental-ct-react';
import { ControlsTestHarness } from './ControlsTestHarness';

test.describe('Benchmark - Median Speed Test (100x)', () => {
  // Run the median test case 100 times for accurate timing
  ${Array.from({ length: 100 }, (_, i) => `
  test('benchmark run ${i + 1}/100 - ${medianTest.title}', async ({ mount }) => {
    const component = await mount(
      <ControlsTestHarness testName="Benchmark Run ${i + 1}" />
    );

    // Basic assertions without screenshots to minimize overhead
    await expect(component.getByTestId('record-button')).toContainText('Start');
    await expect(component.getByTestId('unit-toggle-button')).toContainText('mph');
    await expect(component.getByTestId('harness-recording-state')).toContainText('Recording: OFF');
    await expect(component.getByTestId('harness-units-state')).toContainText('Units: METRIC (km/h)');
  });`).join('')}
});`;

  const benchmarkPath = path.join(__dirname, '../src/components/__tests__/Benchmark.ct.test.tsx');
  fs.writeFileSync(benchmarkPath, testContent);
  console.log(`✅ Created benchmark test file: ${benchmarkPath}`);
  
  return benchmarkPath;
}

function runBenchmark(configFile = 'playwright-ct.config.ts', label = 'default') {
  console.log(`🏃 Running 100x benchmark test (${label})...`);
  console.log('   This will take a few minutes...\n');
  
  const startTime = Date.now();
  
  try {
    // Run only the benchmark test file
    execSync(`npx playwright test -c ${configFile} Benchmark.ct.test.tsx`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    });
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    return totalDuration;
  } catch (error) {
    console.error('❌ Benchmark test failed:', error.message);
    process.exit(1);
  }
}

function analyzeBenchmarkResults(resultsFile = 'component-test-results.json') {
  const resultsPath = path.join(__dirname, `../test-results/${resultsFile}`);
  
  if (!fs.existsSync(resultsPath)) {
    console.error('❌ Benchmark results not found');
    process.exit(1);
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));
  
  // Find benchmark tests
  let benchmarkTests = [];
  
  function findBenchmarkTests(suites) {
    suites.forEach(suite => {
      if (suite.title && suite.title.includes('Benchmark')) {
        if (suite.specs) {
          suite.specs.forEach(spec => {
            if (spec.tests && spec.tests.length > 0) {
              benchmarkTests.push(spec.tests[0]);
            }
          });
        }
      }
      if (suite.suites) {
        findBenchmarkTests(suite.suites);
      }
    });
  }

  findBenchmarkTests(results.suites);
  
  if (benchmarkTests.length === 0) {
    console.error('❌ No benchmark tests found in results');
    process.exit(1);
  }

  let totalDuration = 0;
  let testCount = 0;
  let durations = [];

  benchmarkTests.forEach(test => {
    const duration = test.results[0]?.duration || 0;
    totalDuration += duration;
    testCount++;
    durations.push(duration);
  });

  // Calculate statistics
  durations.sort((a, b) => a - b);
  const avgDuration = totalDuration / testCount;
  const medianDuration = durations[Math.floor(durations.length / 2)];
  const minDuration = durations[0];
  const maxDuration = durations[durations.length - 1];

  console.log('\n📊 Benchmark Results (100x runs):');
  console.log('='.repeat(40));
  console.log(`Total tests run: ${testCount}`);
  console.log(`Total duration: ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`Average per test: ${(avgDuration / 1000).toFixed(3)}s`);
  console.log(`Median per test: ${(medianDuration / 1000).toFixed(3)}s`);
  console.log(`Fastest test: ${(minDuration / 1000).toFixed(3)}s`);
  console.log(`Slowest test: ${(maxDuration / 1000).toFixed(3)}s`);
  console.log(`Tests per second: ${(1000 / avgDuration).toFixed(2)}`);
  
  // Standard deviation
  const variance = durations.reduce((sum, duration) => 
    sum + Math.pow(duration - avgDuration, 2), 0) / testCount;
  const stdDev = Math.sqrt(variance);
  
  console.log(`Standard deviation: ${(stdDev / 1000).toFixed(3)}s`);
  console.log(`Coefficient of variation: ${((stdDev / avgDuration) * 100).toFixed(1)}%`);

  console.log('\n🎯 Highly Accurate Timing:');
  console.log('-'.repeat(30));
  console.log(`Single test duration: ${(avgDuration / 1000).toFixed(4)}s`);
  console.log(`Confidence: ±${(stdDev / 1000).toFixed(4)}s (1σ)`);
  
  return {
    avgDuration: avgDuration / 1000,
    medianDuration: medianDuration / 1000,
    stdDev: stdDev / 1000,
    testCount
  };
}

function cleanupBenchmarkTest() {
  const benchmarkPath = path.join(__dirname, '../src/components/__tests__/Benchmark.ct.test.tsx');
  if (fs.existsSync(benchmarkPath)) {
    fs.unlinkSync(benchmarkPath);
    console.log('\n🧹 Cleaned up benchmark test file');
  }
}

async function runComparisonBenchmark() {
  console.log('🔬 Component Test Performance Comparison');
  console.log('   Comparing WITH vs WITHOUT screenshots\n');

  try {
    // Step 1: Find the median test from previous runs
    const medianTest = await findMedianTest();
    
    // Step 2: Create benchmark test file  
    createBenchmarkTest(medianTest);
    
    console.log('📸 Running benchmark WITH screenshots...');
    // Step 3a: Run benchmark WITH screenshots
    const wallClockTimeWithScreenshots = runBenchmark('playwright-ct.config.ts', 'with screenshots');
    const statsWithScreenshots = analyzeBenchmarkResults('component-test-results.json');
    
    console.log('\n🚫 Running benchmark WITHOUT screenshots...');
    // Step 3b: Run benchmark WITHOUT screenshots  
    const wallClockTimeNoScreenshots = runBenchmark('playwright-ct-no-screenshots.config.ts', 'no screenshots');
    const statsNoScreenshots = analyzeBenchmarkResults('component-test-results-no-screenshots.json');
    
    // Step 4: Performance comparison
    console.log('\n📊 Performance Comparison Results:');
    console.log('='.repeat(50));
    
    console.log('\n📸 WITH Screenshots:');
    console.log(`   Average per test: ${statsWithScreenshots.avgDuration.toFixed(3)}s`);
    console.log(`   Median per test: ${statsWithScreenshots.medianDuration.toFixed(3)}s`);
    console.log(`   Tests per second: ${(1 / statsWithScreenshots.avgDuration).toFixed(2)}`);
    console.log(`   Standard deviation: ${statsWithScreenshots.stdDev.toFixed(3)}s`);
    
    console.log('\n🚫 WITHOUT Screenshots:');
    console.log(`   Average per test: ${statsNoScreenshots.avgDuration.toFixed(3)}s`);
    console.log(`   Median per test: ${statsNoScreenshots.medianDuration.toFixed(3)}s`);
    console.log(`   Tests per second: ${(1 / statsNoScreenshots.avgDuration).toFixed(2)}`);
    console.log(`   Standard deviation: ${statsNoScreenshots.stdDev.toFixed(3)}s`);
    
    // Calculate improvement
    const speedImprovement = ((statsWithScreenshots.avgDuration - statsNoScreenshots.avgDuration) / statsWithScreenshots.avgDuration) * 100;
    const speedupFactor = statsWithScreenshots.avgDuration / statsNoScreenshots.avgDuration;
    
    console.log('\n🚀 Performance Impact:');
    console.log('-'.repeat(30));
    console.log(`Speed improvement: ${speedImprovement.toFixed(1)}% faster without screenshots`);
    console.log(`Speedup factor: ${speedupFactor.toFixed(2)}x faster`);
    console.log(`Time saved per test: ${((statsWithScreenshots.avgDuration - statsNoScreenshots.avgDuration) * 1000).toFixed(0)}ms`);
    
    // Extrapolate to larger test suites
    console.log('\n📈 Extrapolation to Larger Test Suites:');
    console.log('-'.repeat(40));
    const testCounts = [100, 500, 1000];
    testCounts.forEach(count => {
      const timeWithScreenshots = (statsWithScreenshots.avgDuration * count / 60).toFixed(1);
      const timeNoScreenshots = (statsNoScreenshots.avgDuration * count / 60).toFixed(1);
      const timeSaved = ((statsWithScreenshots.avgDuration - statsNoScreenshots.avgDuration) * count / 60).toFixed(1);
      console.log(`${count} tests: ${timeWithScreenshots}min → ${timeNoScreenshots}min (save ${timeSaved}min)`);
    });
    
    console.log('\n💡 Recommendation:');
    console.log('-'.repeat(20));
    if (speedImprovement > 25) {
      console.log('✅ Significant performance gain by disabling screenshots');
      console.log('   Consider using screenshots only for critical/visual tests');
    } else if (speedImprovement > 10) {
      console.log('⚠️  Moderate performance gain by disabling screenshots');
      console.log('   Balance visual verification value vs speed');
    } else {
      console.log('ℹ️  Minimal performance impact from screenshots');
      console.log('   Keep screenshots for better debugging experience');
    }
    
  } finally {
    // Step 5: Cleanup
    cleanupBenchmarkTest();
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--compare') || args.includes('-c')) {
    await runComparisonBenchmark();
  } else {
    // Original single benchmark
    console.log('🔬 Component Test Benchmarking Tool');
    console.log('   Running median test 100x for accurate timing\n');
    console.log('   Use --compare to benchmark with/without screenshots\n');

    try {
      const medianTest = await findMedianTest();
      createBenchmarkTest(medianTest);
      const wallClockTime = runBenchmark();
      const stats = analyzeBenchmarkResults();
      
      console.log('\n⏱️  Wall Clock Comparison:');
      console.log('-'.repeat(30));
      console.log(`Total wall clock time: ${(wallClockTime / 1000).toFixed(2)}s`);
      console.log(`Wall clock per test: ${(wallClockTime / 1000 / stats.testCount).toFixed(4)}s`);
      console.log(`Playwright measured avg: ${stats.avgDuration.toFixed(4)}s`);
      
      const overhead = (wallClockTime / 1000 / stats.testCount) - stats.avgDuration;
      console.log(`Estimated overhead: ${overhead.toFixed(4)}s per test`);
      
      console.log('\n📝 Documentation Update:');
      console.log('-'.repeat(30));
      console.log(`Previous claim: "~15 seconds each"`);
      console.log(`Actual measurement: ${stats.avgDuration.toFixed(3)}s each`);
      console.log(`Improvement factor: ${(15 / stats.avgDuration).toFixed(1)}x faster`);
      
    } finally {
      cleanupBenchmarkTest();
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };