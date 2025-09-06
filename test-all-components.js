#!/usr/bin/env node

/**
 * Comprehensive testing script for SCTE-35 Encoder & Stream Injector
 * Tests all components, tabs, and features systematically
 */

const fetch = require('node-fetch');
const WebSocket = require('ws');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const WS_URL = 'ws://localhost:3000/api/stream/ws';

// Test results storage
const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

// Helper function to log test results
function logTest(testName, passed, error = null) {
    const result = {
        name: testName,
        passed: passed,
        error: error,
        timestamp: new Date().toISOString()
    };
    
    testResults.tests.push(result);
    
    if (passed) {
        testResults.passed++;
        console.log(`✅ ${testName}`);
    } else {
        testResults.failed++;
        console.log(`❌ ${testName}`);
        if (error) {
            console.log(`   Error: ${error.message}`);
        }
    }
}

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(`${BASE_URL}${url}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        return {
            status: response.status,
            data: await response.json(),
            ok: response.ok
        };
    } catch (error) {
        return {
            status: 0,
            data: null,
            ok: false,
            error: error
        };
    }
}

// Test 1: Main page loads
async function testMainPage() {
    console.log('\n🧪 Testing Main Page...');
    
    try {
        const response = await makeRequest('/');
        logTest('Main page loads', response.ok && response.status === 200);
    } catch (error) {
        logTest('Main page loads', false, error);
    }
}

// Test 2: Encoder page loads
async function testEncoderPage() {
    console.log('\n🧪 Testing Encoder Page...');
    
    try {
        const response = await makeRequest('/encoder');
        logTest('Encoder page loads', response.ok && response.status === 200);
    } catch (error) {
        logTest('Encoder page loads', false, error);
    }
}

// Test 3: Stream injection page loads
async function testStreamInjectionPage() {
    console.log('\n🧪 Testing Stream Injection Page...');
    
    try {
        const response = await makeRequest('/stream-injection');
        logTest('Stream injection page loads', response.ok && response.status === 200);
    } catch (error) {
        logTest('Stream injection page loads', false, error);
    }
}

// Test 4: Monitor page loads
async function testMonitorPage() {
    console.log('\n🧪 Testing Monitor Page...');
    
    try {
        const response = await makeRequest('/monitor');
        logTest('Monitor page loads', response.ok && response.status === 200);
    } catch (error) {
        logTest('Monitor page loads', false, error);
    }
}

// Test 5: SCTE-35 encoding API
async function testSCTE35Encoding() {
    console.log('\n🧪 Testing SCTE-35 Encoding API...');
    
    try {
        const payload = {
            spliceInfo: {
                tableId: 0xfc,
                selectionSyntaxIndicator: false,
                privateIndicator: false,
                protocolVersion: 0,
                encryptedPacket: false,
                encryptedAlgorithm: 0,
                ptsAdjustment: 0,
                cwIndex: 0xff,
                tier: 0xfff,
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
        
        const response = await makeRequest('/api/scte35/encode', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        logTest('SCTE-35 encoding API', response.ok && response.data && response.data.base64);
    } catch (error) {
        logTest('SCTE-35 encoding API', false, error);
    }
}

// Test 6: Stream start API
async function testStreamStartAPI() {
    console.log('\n🧪 Testing Stream Start API...');
    
    try {
        const payload = {
            inputUrl: "srt://localhost:9000?streamid=test",
            outputUrl: "srt://localhost:9001?streamid=output",
            streamType: "srt",
            bitrate: 5000,
            resolution: "1920x1080",
            codec: "h264"
        };
        
        const response = await makeRequest('/api/stream/start', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        logTest('Stream start API', response.ok || response.status === 200);
    } catch (error) {
        logTest('Stream start API', false, error);
    }
}

// Test 7: Stream status API
async function testStreamStatusAPI() {
    console.log('\n🧪 Testing Stream Status API...');
    
    try {
        const response = await makeRequest('/api/stream/status');
        logTest('Stream status API', response.ok && response.data);
    } catch (error) {
        logTest('Stream status API', false, error);
    }
}

// Test 8: Stream metrics API
async function testStreamMetricsAPI() {
    console.log('\n🧪 Testing Stream Metrics API...');
    
    try {
        const response = await makeRequest('/api/stream/metrics');
        logTest('Stream metrics API', response.ok && response.data);
    } catch (error) {
        logTest('Stream metrics API', false, error);
    }
}

// Test 9: Stream health API
async function testStreamHealthAPI() {
    console.log('\n🧪 Testing Stream Health API...');
    
    try {
        const response = await makeRequest('/api/stream/health');
        logTest('Stream health API', response.ok && response.data);
    } catch (error) {
        logTest('Stream health API', false, error);
    }
}

// Test 10: SCTE-35 injection API
async function testSCTE35InjectionAPI() {
    console.log('\n🧪 Testing SCTE-35 Injection API...');
    
    try {
        const payload = {
            scte35Data: "/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM="
        };
        
        const response = await makeRequest('/api/stream/inject', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        logTest('SCTE-35 injection API', response.ok || response.status === 200);
    } catch (error) {
        logTest('SCTE-35 injection API', false, error);
    }
}

// Test 11: WebSocket connection
async function testWebSocketConnection() {
    console.log('\n🧪 Testing WebSocket Connection...');
    
    return new Promise((resolve) => {
        try {
            const ws = new WebSocket(WS_URL);
            
            ws.on('open', () => {
                logTest('WebSocket connection', true);
                ws.close();
                resolve();
            });
            
            ws.on('error', (error) => {
                logTest('WebSocket connection', false, error);
                resolve();
            });
            
            // Timeout after 5 seconds
            setTimeout(() => {
                logTest('WebSocket connection', false, new Error('Connection timeout'));
                resolve();
            }, 5000);
        } catch (error) {
            logTest('WebSocket connection', false, error);
            resolve();
        }
    });
}

// Test 12: Health check API
async function testHealthCheckAPI() {
    console.log('\n🧪 Testing Health Check API...');
    
    try {
        const response = await makeRequest('/api/health');
        logTest('Health check API', response.ok && response.status === 200);
    } catch (error) {
        logTest('Health check API', false, error);
    }
}

// Test 13: Static assets
async function testStaticAssets() {
    console.log('\n🧪 Testing Static Assets...');
    
    try {
        const favicon = await makeRequest('/favicon.ico');
        const logo = await makeRequest('/logo.svg');
        
        logTest('Static assets', favicon.ok && logo.ok);
    } catch (error) {
        logTest('Static assets', false, error);
    }
}

// Test 14: API error handling
async function testAPIErrorHandling() {
    console.log('\n🧪 Testing API Error Handling...');
    
    try {
        // Test with invalid JSON
        const response = await makeRequest('/api/scte35/encode', {
            method: 'POST',
            body: 'invalid json'
        });
        
        logTest('API error handling', response.status === 400);
    } catch (error) {
        logTest('API error handling', false, error);
    }
}

// Test 15: Component functionality simulation
async function testComponentFunctionality() {
    console.log('\n🧪 Testing Component Functionality...');
    
    try {
        // Test various component endpoints that should exist
        const endpoints = [
            '/api/scte35/validate',
            '/api/scte35/analyze',
            '/api/scte35/convert',
            '/api/distributor/config',
            '/api/distributor/encode',
            '/api/stream/stop',
            '/api/stream/ffmpeg'
        ];
        
        let workingEndpoints = 0;
        
        for (const endpoint of endpoints) {
            try {
                const response = await makeRequest(endpoint);
                if (response.status !== 404) {
                    workingEndpoints++;
                }
            } catch (error) {
                // Endpoint doesn't exist or other error
            }
        }
        
        logTest('Component functionality', workingEndpoints > 0);
    } catch (error) {
        logTest('Component functionality', false, error);
    }
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Comprehensive Component Testing');
    console.log('============================================');
    
    // Run all tests
    await testMainPage();
    await testEncoderPage();
    await testStreamInjectionPage();
    await testMonitorPage();
    await testSCTE35Encoding();
    await testStreamStartAPI();
    await testStreamStatusAPI();
    await testStreamMetricsAPI();
    await testStreamHealthAPI();
    await testSCTE35InjectionAPI();
    await testWebSocketConnection();
    await testHealthCheckAPI();
    await testStaticAssets();
    await testAPIErrorHandling();
    await testComponentFunctionality();
    
    // Print summary
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Total: ${testResults.passed + testResults.failed}`);
    console.log(`🎯 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    
    // Print failed tests
    if (testResults.failed > 0) {
        console.log('\n❌ Failed Tests:');
        testResults.tests
            .filter(test => !test.passed)
            .forEach(test => {
                console.log(`   - ${test.name}: ${test.error?.message || 'Unknown error'}`);
            });
    }
    
    console.log('\n🎉 Testing Complete!');
    
    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = {
    runAllTests,
    testResults,
    logTest
};