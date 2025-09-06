# Stream Injection Documentation

## Overview

The Stream Injection system provides real-time SCTE-35 cue injection into live video streams across multiple protocols. This enables dynamic ad insertion, program scheduling, and content replacement in broadcast environments.

## Supported Protocols

### SRT (Secure Reliable Transport)

SRT is a secure, reliable transport protocol for delivering high-quality, low-latency video across unpredictable networks.

**Features:**
- Low latency (typically 1-2 seconds)
- AES encryption for security
- Packet loss recovery
- Firewall traversal
- Bandwidth adaptation

**Configuration:**
```javascript
const srtConfig = {
  inputUrl: "srt://source-server:9000?streamid=live/stream",
  outputUrl: "srt://output-server:9001?streamid=live/output",
  streamType: "srt",
  bitrate: 5000,
  resolution: "1920x1080",
  codec: "h264",
  // SRT-specific options
  latency: 2000,
  passphrase: "your-secure-passphrase",
  maxbw: 10000000
};
```

### HLS (HTTP Live Streaming)

HLS is an HTTP-based media streaming protocol that works by breaking the overall stream into a sequence of small HTTP downloads.

**Features:**
- Adaptive bitrate streaming
- Wide device compatibility
- CDN-friendly
- Built-in redundancy
- Subtitle and metadata support

**Configuration:**
```javascript
const hlsConfig = {
  inputUrl: "http://source-server/live/stream.m3u8",
  outputUrl: "http://output-server/live/output.m3u8",
  streamType: "hls",
  bitrate: 5000,
  resolution: "1920x1080",
  codec: "h264",
  // HLS-specific options
  segmentDuration: 6,
  playlistType: "event",
  hlsTime: 6,
  hlsListSize: 0
};
```

### DASH (Dynamic Adaptive Streaming over HTTP)

DASH is an adaptive bitrate streaming technique that enables high-quality streaming of media content over the Internet.

**Features:**
- ISO standard (ISO/IEC 23009-1)
- Multiple codec support
- Adaptive bitrate
- DRM integration
- Live and on-demand support

**Configuration:**
```javascript
const dashConfig = {
  inputUrl: "http://source-server/live/stream.mpd",
  outputUrl: "http://output-server/live/output.mpd",
  streamType: "dash",
  bitrate: 5000,
  resolution: "1920x1080",
  codec: "h264",
  // DASH-specific options
  segDuration: 6,
  fragDuration: 2,
  windowSize: 6,
  extraWindowSize: 6
};
```

### RTMP (Real-Time Messaging Protocol)

RTMP is a protocol for streaming audio, video, and data over the Internet.

**Features:**
- Very low latency (typically < 1 second)
- Real-time communication
- Wide adoption in streaming
- AMF message encoding
- Chunked streaming

**Configuration:**
```javascript
const rtmpConfig = {
  inputUrl: "rtmp://source-server/live/stream",
  outputUrl: "rtmp://output-server/live/output",
  streamType: "rtmp",
  bitrate: 5000,
  resolution: "1920x1080",
  codec: "h264",
  // RTMP-specific options
  flashVer: "FMLE/3.0",
  tcUrl: "rtmp://output-server/live",
  pageUrl: "http://your-site.com"
};
```

## Injection Methods

### 1. Scheduled Injection

Schedule SCTE-35 cues to be injected at specific times during the stream.

**API:**
```javascript
const injection = {
  id: "injection-001",
  time: 30, // 30 seconds from stream start
  scte35Data: "/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM=",
  description: "Ad break start",
  active: true,
  autoInject: true
};

// Add injection point
await fetch('/api/stream/injections', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(injection)
});
```

**Features:**
- Precise timing control
- Multiple injection points
- Enable/disable individual injections
- Automatic injection at scheduled times

### 2. Manual Injection

Inject SCTE-35 cues immediately into the active stream.

**API:**
```javascript
const scte35Data = "/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM=";

// Immediate injection
await fetch('/api/stream/inject', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ scte35Data })
});
```

**Features:**
- Instant injection
- Real-time response
- Error handling
- Injection confirmation

### 3. Conditional Injection

Inject SCTE-35 cues based on specific conditions or events.

**Example:**
```javascript
// Inject based on content analysis
if (contentAnalysis.isCommercialBreak) {
  await injectSCTE35(adBreakStartData);
}

// Inject based on time synchronization
if (shouldInjectAdBreak(currentTime)) {
  await injectSCTE35(adBreakStartData);
}

// Inject based on external triggers
externalTrigger.on('ad-break', async (data) => {
  await injectSCTE35(data.scte35);
});
```

## Stream Configuration

### Basic Configuration

All streams require basic configuration parameters:

```javascript
const baseConfig = {
  inputUrl: "protocol://source:port/path",
  outputUrl: "protocol://destination:port/path",
  streamType: "srt|hls|dash|rtmp",
  bitrate: 5000, // kbps
  resolution: "1920x1080",
  codec: "h264|h265|av1"
};
```

### Advanced Configuration

#### Video Parameters

```javascript
const videoConfig = {
  // Video codec settings
  codec: "h264",
  profile: "high",
  level: "4.1",
  pixelFormat: "yuv420p",
  
  // Rate control
  bitrate: 5000,
  maxBitrate: 8000,
  minBitrate: 2000,
  bufferSize: 10000,
  
  // Frame settings
  frameRate: 30,
  gopSize: 60,
  bFrames: 3,
  
  // Quality settings
  crf: 23,
  preset: "medium",
  tune: "none"
};
```

#### Audio Parameters

```javascript
const audioConfig = {
  // Audio codec settings
  codec: "aac",
  profile: "aac_low",
  sampleRate: 48000,
  channels: 2,
  
  // Audio quality
  bitrate: 128,
  maxBitrate: 192,
  
  // Audio processing
  normalize: true,
  compression: true
};
```

#### Protocol-Specific Settings

```javascript
const protocolSettings = {
  srt: {
    latency: 2000,
    rcvbuf: 8192000,
    sndbuf: 8192000,
    maxbw: 0,
    packetfilter: "",
    messageapi: true,
    streamid: "",
    pbkeylen: 0,
    passphrase: ""
  },
  hls: {
    segmentDuration: 6,
    playlistType: "event",
    hlsTime: 6,
    hlsListSize: 0,
    hlsFlags: "delete_segments+round_durations",
    hlsAllowCache: 1
  },
  dash: {
    segDuration: 6,
    fragDuration: 2,
    windowSize: 6,
    extraWindowSize: 6,
  },
  rtmp: {
    flashVer: "FMLE/3.0",
    tcUrl: "",
    pageUrl: "",
    app: "",
    playpath: ""
  }
};
```

## Monitoring and Analytics

### Stream Metrics

Monitor real-time stream performance:

```javascript
// Get current stream metrics
const response = await fetch('/api/stream/metrics');
const metrics = await response.json();

console.log('Stream Metrics:', {
  inputBitrate: metrics.inputBitrate,
  outputBitrate: metrics.outputBitrate,
  viewers: metrics.viewers,
  uptime: metrics.uptime,
  packetLoss: metrics.packetLoss,
  latency: metrics.latency
});
```

### System Health

Monitor system resource usage:

```javascript
// Get system health
const response = await fetch('/api/stream/health');
const health = await response.json();

console.log('System Health:', {
  status: health.status,
  cpu: health.cpu,
  memory: health.memory,
  disk: health.disk,
  network: health.network
});
```

### SCTE-35 Activity

Track SCTE-35 injection activity:

```javascript
// Get SCTE-35 activity log
const response = await fetch('/api/stream/activity');
const activity = await response.json();

activity.forEach(event => {
  console.log(`${event.timestamp}: ${event.type} - ${event.description}`);
});
```

## WebSocket Integration

For real-time updates, use WebSocket connections:

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3000/api/stream/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'status':
      updateStreamStatus(data.status);
      break;
    case 'metrics':
      updateMetrics(data.metrics);
      break;
    case 'health':
      updateHealth(data.health);
      break;
    case 'activity':
      logActivity(data.activity);
      break;
  }
};

ws.onclose = () => {
  // Reconnect logic
  setTimeout(connectWebSocket, 5000);
};
```

## Error Handling

### Common Errors and Solutions

#### Stream Start Failures

**Error**: "Failed to start stream - Connection refused"
**Solution**: Check input URL and ensure source server is accessible

**Error**: "Unsupported stream type"
**Solution**: Verify stream type is one of: srt, hls, dash, rtmp

#### Injection Failures

**Error**: "Invalid SCTE-35 data format"
**Solution**: Validate SCTE-35 Base64 data before injection

**Error**: "No active stream"
**Solution**: Start a stream before attempting injection

#### Performance Issues

**Error**: "High packet loss detected"
**Solution**: Check network conditions and reduce bitrate if necessary

**Error**: "High latency detected"
**Solution**: Optimize network configuration and check server load

### Error Recovery

Implement robust error handling:

```javascript
async function safeInjectSCTE35(scte35Data) {
  try {
    const response = await fetch('/api/stream/inject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scte35Data })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('SCTE-35 injection failed:', error);
    
    // Retry logic
    if (shouldRetry(error)) {
      await delay(1000);
      return safeInjectSCTE35(scte35Data);
    }
    
    throw error;
  }
}
```

## Best Practices

### Stream Configuration

1. **Use Appropriate Bitrates**: Match bitrate to content type and network conditions
2. **Monitor Performance**: Regularly check stream metrics and system health
3. **Plan for Redundancy**: Have backup streams and failover mechanisms
4. **Optimize Protocols**: Choose the right protocol for your use case

### SCTE-35 Injection

1. **Validate Data**: Always validate SCTE-35 data before injection
2. **Time Synchronization**: Ensure accurate timing for scheduled injections
3. **Error Handling**: Implement robust error handling and recovery
4. **Logging**: Maintain detailed logs for debugging and auditing

### Security Considerations

1. **Authentication**: Secure your stream endpoints
2. **Encryption**: Use encrypted protocols (SRT, HTTPS)
3. **Access Control**: Implement proper access controls
4. **Input Validation**: Validate all inputs to prevent injection attacks

## Performance Optimization

### Stream Processing

```javascript
// Optimize stream processing settings
const optimizedConfig = {
  // Buffer optimization
  bufferSize: 8192,
  maxBuffers: 16,
  
  // Thread optimization
  threads: Math.min(os.cpus().length, 8),
  
  // Memory optimization
  maxMemory: 1024 * 1024 * 1024, // 1GB
  
  // Network optimization
  tcpNoDelay: true,
  keepAlive: true,
  keepAliveTimeout: 30000
};
```

### SCTE-35 Processing

```javascript
// Optimize SCTE-35 injection
const injectionOptimization = {
  // Pre-encode common SCTE-35 messages
  preEncodedMessages: {
    adBreakStart: encodeAdBreakStart(),
    adBreakEnd: encodeAdBreakEnd(),
    programStart: encodeProgramStart(),
    programEnd: encodeProgramEnd()
  },
  
  // Batch processing
  batchSize: 10,
  batchTimeout: 1000,
  
  // Caching
  cacheSize: 100,
  cacheTTL: 3600000 // 1 hour
};
```

## Troubleshooting

### Debug Mode

Enable debug logging for detailed troubleshooting:

```javascript
// Enable debug mode
const config = {
  ...streamConfig,
  debug: true,
  logLevel: 'debug'
};
```

### Common Issues

#### Stream Not Starting

1. Check input URL format and accessibility
2. Verify network connectivity
3. Ensure required ports are open
4. Check server logs for detailed errors

#### SCTE-35 Not Injecting

1. Verify SCTE-35 data format
2. Check if stream is active
3. Review injection timing
4. Check WebSocket connection status

#### High Latency

1. Reduce buffer sizes
2. Optimize network settings
3. Check server load
4. Consider using lower bitrate

---

For more detailed information about specific protocols, refer to their respective documentation:
- [SRT Protocol](https://github.com/Haivision/srt)
- [HLS Documentation](https://developer.apple.com/streaming/)
- [DASH Documentation](https://dashif.org/)
- [RTMP Specification](https://rtmp.veriskope.com/pdf/rtmp_specification_1.0.pdf)