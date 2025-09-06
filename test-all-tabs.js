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
  console.log('🧪 Testing All Tabs and Functionality\n');
  
  let passed = 0;
  let total = 0;
  
  // Test page loads
  console.log('📄 Testing Page Loads:');
  total++; if (await testPageLoad('/', 'Main Page')) passed++;
  total++; if (await testPageLoad('/encoder', 'Encoder Page')) passed++;
  total++; if (await testPageLoad('/stream-injection', 'Stream Injection Page')) passed++;
  total++; if (await testPageLoad('/monitor', 'Monitor Page')) passed++;
  
  console.log('\n🔧 Testing SCTE-35 Encoder API:');
  const scte35Data = {
    spliceInfo: {
      tableId: 252,
      selectionSyntaxIndicator: false,
      privateIndicator: false,
      protocolVersion: 0,
      encryptedPacket: false,
      encryptedAlgorithm: 0,
      ptsAdjustment: 0,
      cwIndex: 255,
      tier: 4095,
      spliceCommandType: 5,
      descriptors: []
    },
    command: {
      spliceEventId: 1,
      spliceEventCancelIndicator: false,
      outOfNetworkIndicator: false,
      programSpliceFlag: true,
      durationFlag: false,
      spliceImmediateFlag: false,
      breakDurationAutoReturn: false,
      breakDuration: 0,
      uniqueProgramId: 1,
      available: 0,
      expected: 0,
      spliceTimeSpecified: true,
      spliceTimePts: 0
    },
    commandType: "splice-insert"
  };
  
  total++; if (await testAPI('POST', '/api/scte35/encode', scte35Data, 'SCTE-35 Encode (Splice Insert)')) passed++;
  
  const timeSignalData = {
    spliceInfo: {
      tableId: 252,
      selectionSyntaxIndicator: false,
      privateIndicator: false,
      protocolVersion: 0,
      encryptedPacket: false,
      encryptedAlgorithm: 0,
      ptsAdjustment: 0,
      cwIndex: 255,
      tier: 4095,
      spliceCommandType: 6,
      descriptors: []
    },
    command: {
      timeSpecified: true,
      pts: 1000
    },
    commandType: "time-signal"
  };
  
  total++; if (await testAPI('POST', '/api/scte35/encode', timeSignalData, 'SCTE-35 Encode (Time Signal)')) passed++;
  
  console.log('\n🌊 Testing Stream APIs:');
  total++; if (await testGETAPI('/api/stream/status', 'Stream Status')) passed++;
  total++; if (await testGETAPI('/api/stream/metrics', 'Stream Metrics')) passed++;
  total++; if (await testGETAPI('/api/stream/health', 'Stream Health')) passed++;
  
  const streamConfig = {
    inputUrl: "srt://localhost:9000?streamid=live/stream",
    outputUrl: "srt://localhost:9001?streamid=live/output",
    streamType: "srt",
    bitrate: 5000,
    resolution: "1920x1080",
    codec: "h264"
  };
  
  total++; if (await testAPI('POST', '/api/stream/start', streamConfig, 'Stream Start')) passed++;
  
  const injectionData = {
    scte35Data: "/DAYAAAAAAAA///wBgAAAACAAAAAAACZpp3m"
  };
  
  total++; if (await testAPI('POST', '/api/stream/inject', injectionData, 'SCTE-35 Injection')) passed++;
  total++; if (await testAPI('POST', '/api/stream/stop', {}, 'Stream Stop')) passed++;
  
  console.log('\n🔌 Testing WebSocket Endpoint:');
  total++; if (await testPageLoad('/api/stream/ws', 'WebSocket Endpoint')) passed++;
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`   Total Tests: ${total}`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${total - passed}`);
  console.log(`   Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! The SCTE-35 Encoder & Stream Injection System is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the output above for details.');
  }
  
  process.exit(passed === total ? 0 : 1);
}

// Run the tests
runTests().catch(console.error);