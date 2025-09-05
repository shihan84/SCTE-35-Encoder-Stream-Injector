# SCTE-35 Encoder & Stream Injector - User Manual

## Table of Contents
- [Introduction](#introduction)
- [Getting Started](#getting-started)
- [SCTE-35 Encoder](#scte-35-encoder)
- [Stream Injection](#stream-injection)
- [Stream Monitoring](#stream-monitoring)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)

## Introduction

The SCTE-35 Encoder & Stream Injector is a professional web-based application designed for creating SCTE-35 cues and injecting them into live video streams. This manual provides comprehensive instructions for using all features of the system.

### What is SCTE-35?

SCTE-35 is a standard for cueing advertisements in digital video streams. It's widely used in broadcast television and streaming media to signal:
- Advertisement breaks
- Program start/end times
- Emergency alerts
- Content ratings
- Closed captioning triggers

### System Overview

The application consists of three main components:

1. **SCTE-35 Encoder**: Create and encode SCTE-35 messages
2. **Stream Injection**: Inject SCTE-35 cues into live streams
3. **Stream Monitor**: Monitor stream health and performance

## Getting Started

### System Requirements

#### Browser Requirements
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

#### Network Requirements
- Stable internet connection
- Access to streaming endpoints
- WebSocket support for real-time updates

### Accessing the Application

1. **Open your web browser**
2. **Navigate to the application URL**
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.com`

3. **You will see the main dashboard** with three main sections:
   - SCTE-35 Encoder
   - Stream Injection
   - Stream Monitor

### Navigation

- **Main Page**: Overview and quick access to all features
- **Encoder Page**: Detailed SCTE-35 encoding interface
- **Stream Injection Page**: Stream configuration and injection control
- **Monitor Page**: Real-time monitoring and analytics

## SCTE-35 Encoder

### Overview

The SCTE-35 Encoder allows you to create SCTE-35 messages with various parameters and encode them into different formats.

### Accessing the Encoder

1. **From the main page**, click on the "SCTE-35 Encoder" card
2. **Or navigate directly** to `/encoder`

### Encoder Interface

The encoder interface consists of two main sections:
- **Left Panel**: Configuration options
- **Right Panel**: Encoded output

### Splice Info Section Configuration

The Splice Info Section contains the header information for SCTE-35 messages:

| Field | Description | Default Value |
|-------|-------------|---------------|
| **Table ID** | Identifies the table type (0xFC for SCTE-35) | 252 |
| **Protocol Version** | SCTE-35 protocol version | 0 |
| **PTS Adjustment** | Presentation Time Stamp adjustment | 0 |
| **CW Index** | Control Word index | 255 |
| **Tier** | Stream tier level | 4095 |
| **Encrypted Packet** | Whether the packet is encrypted | False |

### Command Types

#### Splice Insert

The Splice Insert command is used to signal advertisement breaks or program changes.

**Configuration Fields:**

| Field | Description | Usage |
|-------|-------------|-------|
| **Splice Event ID** | Unique identifier for the event | Required |
| **Out of Network** | Indicates if content is out of network | Ad breaks |
| **Program Splice** | Splice affects the entire program | Usually checked |
| **Duration Flag** | Include break duration | For ad breaks |
| **Splice Immediate** | Execute immediately | For immediate breaks |
| **Break Duration** | Length of the break | In 90kHz units |
| **Unique Program ID** | Program identifier | Required |
| **Splice Time PTS** | When to execute the splice | In 90kHz units |

#### Time Signal

The Time Signal command is used to signal timing events without content changes.

**Configuration Fields:**

| Field | Description | Usage |
|-------|-------------|-------|
| **Time Specified** | Whether time is specified | Usually checked |
| **PTS** | Presentation Time Stamp | In 90kHz units |

### Encoding Process

1. **Configure the Splice Info Section** (usually defaults are fine)
2. **Select the Command Type** (Splice Insert or Time Signal)
3. **Configure the Command Parameters**
4. **Choose Output Format** (Base64 or Hex)
5. **Click "Encode SCTE-35"**

### Output Formats

#### Base64
- Most common format for SCTE-35
- Used in many streaming protocols
- Example: `/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM=`

#### Hexadecimal
- Useful for debugging and analysis
- Shows raw byte values
- Example: `FC3060000000000000FFFFF00F0000000000000001004080000000000000010000873F373F`

### Copying and Downloading

#### Copy to Clipboard
1. **Click the "Copy" button** in the output panel
2. **The encoded data is copied** to your clipboard

#### Download File
1. **Click the "Download" button** in the output panel
2. **A text file** is downloaded with the encoded data

### Common Use Cases

#### Advertisement Break Start
```javascript
// Configuration for 30-second ad break
{
  spliceEventId: 1,
  outOfNetworkIndicator: true,
  programSpliceFlag: true,
  durationFlag: true,
  breakDuration: 2700000, // 30 seconds in 90kHz units
  uniqueProgramId: 1,
  spliceTimeSpecified: true,
  spliceTimePts: 0
}
```

#### Program Start
```javascript
// Configuration for program start
{
  spliceEventId: 2,
  outOfNetworkIndicator: false,
  programSpliceFlag: true,
  durationFlag: false,
  uniqueProgramId: 1,
  spliceTimeSpecified: true,
  spliceTimePts: 0
}
```

#### Emergency Alert
```javascript
// Configuration for emergency alert
{
  spliceEventId: 999,
  outOfNetworkIndicator: false,
  programSpliceFlag: true,
  durationFlag: false,
  uniqueProgramId: 1,
  spliceTimeSpecified: true,
  spliceTimePts: 0
}
```

## Stream Injection

### Overview

The Stream Injection feature allows you to inject SCTE-35 cues into live video streams in real-time. It supports multiple streaming protocols and provides comprehensive monitoring.

### Accessing Stream Injection

1. **From the main page**, click on the "Stream Injection" card
2. **Or navigate directly** to `/stream-injection`

### Stream Injection Interface

The interface is organized into four tabs:
- **Stream Config**: Configure input and output streams
- **Injection Points**: Manage SCTE-35 injection scheduling
- **Monitor**: Real-time stream monitoring
- **SCTE-35 Encoder**: Quick encoder for injection

### Stream Configuration

#### Protocol Selection

The system supports four streaming protocols:

| Protocol | Description | Use Case |
|----------|-------------|----------|
| **SRT** | Secure Reliable Transport | Low-latency, secure streaming |
| **HLS** | HTTP Live Streaming | Adaptive bitrate streaming |
| **DASH** | Dynamic Adaptive Streaming | MPEG-DASH standard |
| **RTMP** | Real-Time Messaging Protocol | Traditional streaming |

#### Configuration Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Input URL** | Source stream URL | `srt://localhost:9000?streamid=live/input` |
| **Output URL** | Destination stream URL | `srt://localhost:9001?streamid=live/output` |
| **Stream Type** | Protocol to use | `srt`, `hls`, `dash`, `rtmp` |
| **Bitrate** | Target bitrate in kbps | `5000` |
| **Resolution** | Video resolution | `1920x1080` |
| **Codec** | Video codec | `h264`, `h265`, `av1` |

#### URL Formats by Protocol

**SRT URLs:**
```
Input: srt://hostname:port?streamid=your-stream-id
Output: srt://hostname:port?streamid=your-output-id
```

**HLS URLs:**
```
Input: http://hostname:port/input/stream.m3u8
Output: /var/www/hls/output/stream.m3u8
```

**DASH URLs:**
```
Input: http://hostname:port/input/stream.mpd
Output: /var/www/dash/output/stream.mpd
```

**RTMP URLs:**
```
Input: rtmp://hostname:port/live/stream
Output: rtmp://hostname:port/live/output
```

### Starting and Stopping Streams

#### Starting a Stream

1. **Configure your stream settings** in the Stream Config tab
2. **Click "Start Stream"** button
3. **Monitor the status** in the Stream Status panel

#### Stopping a Stream

1. **Click "Stop Stream"** button
2. **Confirm the action** if prompted
3. **Wait for the stream** to stop gracefully

### Stream Status Monitoring

The Stream Status panel shows real-time information:

| Metric | Description | Normal Range |
|--------|-------------|---------------|
| **Status** | Current stream state | Running, Starting, Stopped, Error |
| **Input Bitrate** | Source stream bitrate | Varies by content |
| **Output Bitrate** | Output stream bitrate | Should match input closely |
| **Viewers** | Number of connected viewers | 0 to thousands |
| **Uptime** | Stream running time | HH:MM:SS format |
| **Last Injection** | Last SCTE-35 injection time | Timestamp |

### Injection Points Management

#### Adding Injection Points

1. **Go to the "Injection Points" tab**
2. **Configure the injection**:
   - **Time**: When to inject (in seconds from stream start)
   - **SCTE-35 Data**: The encoded SCTE-35 cue
   - **Description**: Human-readable description
3. **Choose injection mode**:
   - **Auto-inject**: Automatically inject at scheduled time
   - **Manual**: Inject manually when needed
4. **Click "Add Injection Point"**

#### Managing Injection Points

The Scheduled Injections panel shows all configured injection points:

| Action | Description |
|--------|-------------|
| **Toggle** | Enable/disable the injection point |
| **Inject** | Manually trigger the injection now |
| **Remove** | Delete the injection point |

#### Manual Injection

1. **Paste SCTE-35 data** in the "SCTE-35 Data" field
2. **Click "Inject Now"** for immediate injection
3. **Monitor the result** in the status panel

### Real-time Monitoring

#### Monitor Tab Features

The Monitor tab provides comprehensive stream analytics:

**Stream Quality Metrics:**
- Input/Output bitrates
- Packet loss percentage
- Latency measurements
- Connection stability

**System Health:**
- CPU usage
- Memory usage
- Disk usage
- Network usage

**SCTE-35 Activity:**
- Recent injection events
- Detection events
- Activity timeline

### Quick Encoder

The built-in quick encoder allows you to generate SCTE-35 cues without leaving the stream injection interface:

1. **Select Event Type** from dropdown
2. **Set Duration** if applicable
3. **Enter Cue ID**
4. **Click "Generate SCTE-35"**
5. **Copy or inject** the generated cue

## Stream Monitoring

### Overview

The Stream Monitor page provides comprehensive real-time monitoring of stream health, performance, and SCTE-35 activity.

### Accessing the Monitor

1. **From the main page**, click on the "Stream Monitor" card
2. **Or navigate directly** to `/monitor`

### Monitor Dashboard

The dashboard is organized into several sections:

#### Stream Status Overview

Four key metrics displayed at the top:
- **Input Bitrate**: Source stream bitrate
- **Output Bitrate**: Output stream bitrate  
- **Viewers**: Current viewer count
- **Uptime**: Stream running time

#### System Health

Visual representation of system resources:
- **CPU Usage**: Percentage of CPU utilization
- **Memory Usage**: RAM usage percentage
- **Disk Usage**: Storage usage percentage
- **Network Usage**: Network utilization percentage

#### Stream Quality Metrics

Detailed quality measurements:
- **Packet Loss**: Percentage of lost packets
- **Latency**: Network delay in milliseconds
- **Bitrate Efficiency**: Output vs input bitrate ratio
- **Connection Status**: Network stability indicator

#### SCTE-35 Activity

Recent SCTE-35 events:
- **Injection Events**: Successful cue injections
- **Detection Events**: Cue detections in streams
- **Timestamps**: Event timing information

### Real-time Updates

The monitor uses WebSocket connections for real-time updates:
- **Metrics update every second**
- **Health checks every 5 seconds**
- **Activity logging in real-time**

### Alert System

The monitor includes automatic alerts for:

#### Critical Alerts (Red)
- CPU usage > 90%
- Memory usage > 90%
- Disk usage > 90%
- Packet loss > 10%

#### Warning Alerts (Yellow)
- CPU usage > 70%
- Memory usage > 70%
- Disk usage > 70%
- Latency > 1000ms

#### Information Alerts (Blue)
- Stream status changes
- SCTE-35 injection events
- Viewer count changes

## Advanced Features

### WebSocket Integration

The system uses WebSocket connections for real-time data:

#### Connection Status
- **Green dot**: Connected and receiving updates
- **Red dot**: Disconnected or connection issues

#### Real-time Data Types
- **Status Updates**: Stream state changes
- **Metrics**: Performance data
- **Health**: System resource usage
- **Activity**: SCTE-35 events

### API Integration

The system provides RESTful APIs for integration:

#### Authentication
- Include JWT token in Authorization header
- Use API keys for external integrations

#### Rate Limiting
- 100 requests per minute per IP
- Burst protection enabled

#### Webhook Support
- Configure webhooks for event notifications
- Receive real-time updates via HTTP POST

### Custom SCTE-35 Descriptors

You can add custom descriptors to SCTE-35 messages:

#### Avail Descriptor
```javascript
{
  tag: 1,
  data: "43554549", // "CUEI" in hex
  name: "Avail Descriptor"
}
```

#### DTMF Descriptor
```javascript
{
  tag: 1,
  data: "43554549", // "CUEI" in hex
  name: "DTMF Descriptor",
  preRoll: 177,
  dtmfCount: 4,
  dtmfChars: 4186542473
}
```

### Stream Profiles

Create predefined stream configurations:

#### High Quality Profile
```javascript
{
  bitrate: 8000,
  resolution: "1920x1080",
  codec: "h265",
  keyframeInterval: 2
}
```

#### Low Latency Profile
```javascript
{
  bitrate: 3000,
  resolution: "1280x720",
  codec: "h264",
  keyframeInterval: 1
}
```

## Troubleshooting

### Common Issues and Solutions

#### Encoder Issues

**Problem: Encoding fails with error message**
- **Solution**: Check all required fields are filled
- **Solution**: Verify PTS values are within valid range
- **Solution**: Ensure command type matches configuration

**Problem: Output format is incorrect**
- **Solution**: Select the correct output format (Base64/Hex)
- **Solution**: Verify input parameters are valid
- **Solution**: Try encoding with default values

#### Stream Issues

**Problem: Stream won't start**
- **Solution**: Verify input URL is accessible
- **Solution**: Check network connectivity
- **Solution**: Ensure ports are open and available

**Problem: Stream stops unexpectedly**
- **Solution**: Check system resource usage
- **Solution**: Verify network stability
- **Solution**: Review application logs for errors

**Problem: Injection fails**
- **Solution**: Verify SCTE-35 data format is valid
- **Solution**: Check stream is running
- **Solution**: Ensure injection time is in the future

#### Monitor Issues

**Problem: Real-time updates not working**
- **Solution**: Check WebSocket connection status
- **Solution**: Verify network connectivity
- **Solution**: Refresh the browser page

**Problem: Metrics show zero values**
- **Solution**: Ensure stream is running
- **Solution**: Check API endpoints are accessible
- **Solution**: Verify monitoring configuration

### Browser Issues

**Problem: Page won't load**
- **Solution**: Clear browser cache
- **Solution**: Check JavaScript is enabled
- **Solution**: Try a different browser

**Problem: Buttons not responsive**
- **Solution**: Refresh the page
- **Solution**: Check browser console for errors
- **Solution**: Verify internet connection

### Performance Issues

**Problem: Application is slow**
- **Solution**: Check system resource usage
- **Solution**: Close unused browser tabs
- **Solution**: Restart the application

**Problem: High latency**
- **Solution**: Check network connectivity
- **Solution**: Reduce stream bitrate
- **Solution**: Optimize network configuration

## Best Practices

### SCTE-35 Encoding Best Practices

#### Cue Design
- **Use unique event IDs** for each cue
- **Set appropriate PTS values** for timing accuracy
- **Include duration** for advertisement breaks
- **Use consistent naming** for cue descriptions

#### Timing Considerations
- **Allow sufficient lead time** for advertisement breaks
- **Account for network latency** in timing calculations
- **Use UTC timestamps** for consistency
- **Test timing** in development environment

#### Error Handling
- **Validate all input parameters** before encoding
- **Handle encoding errors** gracefully
- **Log encoding attempts** for debugging
- **Provide feedback** to users on encoding results

### Stream Injection Best Practices

#### Stream Configuration
- **Match input and output configurations** when possible
- **Use appropriate bitrates** for your content type
- **Test stream stability** before production use
- **Monitor resource usage** during streaming

#### Injection Strategy
- **Test injection timing** in development
- **Use auto-injection** for scheduled breaks
- **Keep manual injection** for emergency situations
- **Monitor injection results** in real-time

#### Performance Optimization
- **Use efficient codecs** (H.265 for HD content)
- **Optimize bitrate** for your target audience
- **Monitor network conditions** continuously
- **Scale resources** based on demand

### Monitoring Best Practices

#### Alert Configuration
- **Set appropriate thresholds** for alerts
- **Use different severity levels** for different issues
- **Configure notification channels** for critical alerts
- **Test alert system** regularly

#### Log Management
- **Enable comprehensive logging** for debugging
- **Rotate logs** to manage disk space
- **Archive logs** for future analysis
- **Monitor log files** for unusual activity

#### Security Practices
- **Use strong authentication** for admin access
- **Implement rate limiting** for API endpoints
- **Monitor access logs** for suspicious activity
- **Keep software updated** with security patches

## API Reference

### SCTE-35 Encoding API

#### Encode SCTE-35
```http
POST /api/scte35/encode
Content-Type: application/json

{
  "spliceInfo": {
    "tableId": 252,
    "selectionSyntaxIndicator": false,
    "privateIndicator": false,
    "protocolVersion": 0,
    "encryptedPacket": false,
    "encryptedAlgorithm": 0,
    "ptsAdjustment": 0,
    "cwIndex": 255,
    "tier": 4095,
    "spliceCommandType": 5,
    "descriptors": []
  },
  "command": {
    "spliceEventId": 1,
    "spliceEventCancelIndicator": false,
    "outOfNetworkIndicator": false,
    "programSpliceFlag": true,
    "durationFlag": false,
    "spliceImmediateFlag": false,
    "breakDurationAutoReturn": false,
    "breakDuration": 0,
    "uniqueProgramId": 1,
    "available": 0,
    "expected": 0,
    "spliceTimeSpecified": true,
    "spliceTimePts": 0
  },
  "commandType": "splice-insert"
}
```

**Response:**
```json
{
  "base64": "/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM=",
  "hex": "FC3060000000000000FFFFF00F0000000000000001004080000000000000010000873F373F"
}
```

### Stream Management API

#### Start Stream
```http
POST /api/stream/start
Content-Type: application/json

{
  "inputUrl": "srt://localhost:9000?streamid=live/stream",
  "outputUrl": "srt://localhost:9001?streamid=live/output",
  "streamType": "srt",
  "bitrate": 5000,
  "resolution": "1920x1080",
  "codec": "h264"
}
```

#### Stop Stream
```http
POST /api/stream/stop
```

#### Inject SCTE-35
```http
POST /api/stream/inject
Content-Type: application/json

{
  "scte35Data": "/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM="
}
```

### Monitoring API

#### Get Stream Status
```http
GET /api/stream/status
```

**Response:**
```json
{
  "status": "running",
  "inputBitrate": 5000,
  "outputBitrate": 4950,
  "viewers": 25,
  "uptime": 3600,
  "lastInjection": "2025-01-01T12:00:00.000Z"
}
```

#### Get Stream Metrics
```http
GET /api/stream/metrics
```

**Response:**
```json
{
  "inputBitrate": 5000,
  "outputBitrate": 4950,
  "viewers": 25,
  "uptime": 3600,
  "packetLoss": 0.1,
  "latency": 150
}
```

#### Get System Health
```http
GET /api/stream/health
```

**Response:**
```json
{
  "status": "healthy",
  "cpu": 25,
  "memory": 45,
  "disk": 30,
  "network": 15
}
```

### WebSocket API

#### Connect to WebSocket
```javascript
const ws = new WebSocket('ws://your-domain.com/api/stream/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

#### Message Types

**Status Update:**
```json
{
  "type": "status",
  "status": {
    "status": "running",
    "inputBitrate": 5000,
    "outputBitrate": 4950,
    "viewers": 25,
    "uptime": 3600
  }
}
```

**Metrics Update:**
```json
{
  "type": "metrics",
  "metrics": {
    "inputBitrate": 5000,
    "outputBitrate": 4950,
    "packetLoss": 0.1,
    "latency": 150
  }
}
```

**Health Update:**
```json
{
  "type": "health",
  "health": {
    "status": "healthy",
    "cpu": 25,
    "memory": 45,
    "disk": 30,
    "network": 15
  }
}
```

**Activity Update:**
```json
{
  "type": "activity",
  "activity": {
    "timestamp": "2025-01-01T12:00:00.000Z",
    "type": "injection",
    "data": "SCTE-35 injection successful",
    "description": "Ad break start"
  }
}
```

This user manual provides comprehensive guidance for using all features of the SCTE-35 Encoder & Stream Injector system. For additional support or questions, please refer to the deployment guide or contact the development team.