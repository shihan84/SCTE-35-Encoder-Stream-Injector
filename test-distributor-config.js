#!/usr/bin/env node

const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const tests = [];

// Helper function to make HTTP requests
function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test functions
async function testPageLoad(path, name) {
  try {
    const response = await request(`${BASE_URL}${path}`);
    console.log(`✓ ${name}: Page loads (Status: ${response.statusCode})`);
    return true;
  } catch (error) {
    console.log(`✗ ${name}: Failed to load - ${error.message}`);
    return false;
  }
}

async function testAPI(method, path, data, name) {
  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(data))
      },
      body: JSON.stringify(data)
    };
    
    const response = await request(`${BASE_URL}${path}`, options);
    const result = JSON.parse(response.body);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(`✓ ${name}: API successful (Status: ${response.statusCode})`);
      return true;
    } else {
      console.log(`✗ ${name}: API failed (Status: ${response.statusCode}) - ${result.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`✗ ${name}: Request failed - ${error.message}`);
    return false;
  }
}

async function testGETAPI(path, name) {
  try {
    const response = await request(`${BASE_URL}${path}`);
    const result = JSON.parse(response.body);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(`✓ ${name}: API successful (Status: ${response.statusCode})`);
      return true;
    } else {
      console.log(`✗ ${name}: API failed (Status: ${response.statusCode}) - ${result.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`✗ ${name}: Request failed - ${error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🧪 Testing Distributor Configuration System\n');
  
  let passed = 0;
  let total = 0;
  
  // Test page loads
  console.log('📄 Testing Page Loads:');
  total++; if (await testPageLoad('/distributor', 'Distributor Configuration Page')) passed++;
  
  console.log('\n🔧 Testing Distributor Configuration APIs:');
  total++; if (await testGETAPI('/api/distributor/config', 'Get Distributor Config')) passed++;
  
  const configValidation = {
    streamName: "Test Service",
    videoResolution: "1920x1080",
    videoCodec: "H.264"
  };
  total++; if (await testAPI('POST', '/api/distributor/config', configValidation, 'Validate Distributor Config')) passed++;
  
  console.log('\n🎬 Testing SCTE-35 Encoding APIs:');
  
  const cueOutCommand = {
    command: {
      type: "CUE-OUT",
      eventId: 100023,
      adDuration: 600,
      preRollDuration: 0
    }
  };
  total++; if (await testAPI('POST', '/api/distributor/encode', cueOutCommand, 'SCTE-35 CUE-OUT Encoding')) passed++;
  
  const cueInCommand = {
    command: {
      type: "CUE-IN",
      eventId: 100024
    }
  };
  total++; if (await testAPI('POST', '/api/distributor/encode', cueInCommand, 'SCTE-35 CUE-IN Encoding')) passed++;
  
  const crashOutCommand = {
    command: {
      type: "CRASH-OUT",
      eventId: 100025
    }
  };
  total++; if (await testAPI('POST', '/api/distributor/encode', crashOutCommand, 'SCTE-35 CRASH-OUT Encoding')) passed++;
  
  console.log('\n🌊 Testing Stream APIs:');
  const streamConfig = {
    inputUrl: "srt://localhost:9000?streamid=live/stream",
    outputUrl: "srt://localhost:9001?streamid=live/output",
    config: {
      streamName: "Test Service"
    }
  };
  total++; if (await testAPI('POST', '/api/distributor/stream/start', streamConfig, 'Distributor Stream Start')) passed++;
  
  console.log('\n📋 Testing Specifications Compliance:');
  
  // Test that the config meets distributor requirements
  console.log('📋 Distributor Requirements Check:');
  
  const configResponse = await request(`${BASE_URL}/api/distributor/config`);
  const configData = JSON.parse(configResponse.body);
  
  const requirements = [
    { name: 'Video Resolution', expected: '1920x1080', actual: configData.config.videoResolution },
    { name: 'Video Codec', expected: 'H.264', actual: configData.config.videoCodec },
    { name: 'Video Bitrate', expected: 5000, actual: configData.config.videoBitrate },
    { name: 'GOP', expected: 12, actual: configData.config.gop },
    { name: 'B-Frames', expected: 5, actual: configData.config.bFrames },
    { name: 'Audio Codec', expected: 'AAC-LC', actual: configData.config.audioCodec },
    { name: 'Audio Bitrate', expected: 128, actual: configData.config.audioBitrate },
    { name: 'Audio LKFS', expected: -20, actual: configData.config.audioLKFS },
    { name: 'Audio Sampling Rate', expected: 48000, actual: configData.config.audioSamplingRate },
    { name: 'SCTE Data PID', expected: 500, actual: configData.config.scteDataPID },
    { name: 'Null PID', expected: 8191, actual: configData.config.nullPID },
    { name: 'Latency', expected: 2000, actual: configData.config.latency }
  ];
  
  let requirementsPassed = 0;
  let requirementsTotal = requirements.length;
  
  requirements.forEach(req => {
    if (req.actual === req.expected) {
      console.log(`✓ ${req.name}: ${req.actual} (Compliant)`);
      requirementsPassed++;
    } else {
      console.log(`✗ ${req.name}: Expected ${req.expected}, got ${req.actual} (Non-compliant)`);
    }
  });
  
  total++; 
  if (requirementsPassed === requirementsTotal) {
    console.log('✓ All Distributor Requirements Met');
    passed++;
  } else {
    console.log(`✗ ${requirementsTotal - requirementsPassed} Requirements Not Met`);
  }
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`   Total Tests: ${total}`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${total - passed}`);
  console.log(`   Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('\n🎉 All distributor configuration tests passed!');
    console.log('✅ The system is fully compliant with distributor specifications.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the output above for details.');
  }
  
  process.exit(passed === total ? 0 : 1);
}

// Run the tests
runTests().catch(console.error);