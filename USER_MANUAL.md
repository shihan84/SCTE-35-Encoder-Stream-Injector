# 📖 User Manual

## Table of Contents
- [Getting Started](#getting-started)
- [SCTE-35 Encoder Guide](#scte-35-encoder-guide)
- [Stream Injection Guide](#stream-injection-guide)
- [Stream Monitoring Guide](#stream-monitoring-guide)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## 🚀 Getting Started

### System Requirements

#### Minimum Requirements
- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **Node.js**: Version 18.x or higher
- **Memory**: 4GB RAM minimum
- **Storage**: 20GB available space
- **Network**: Stable internet connection

#### Recommended Requirements
- **Operating System**: Latest version of your OS
- **Node.js**: Version 20.x or higher
- **Memory**: 8GB RAM or more
- **Storage**: 50GB SSD or faster
- **Network**: High-speed internet connection

### Installation

#### Step 1: Clone the Repository
```bash
git clone https://github.com/shihan84/SCTE-35-Encoder-Stream-Injector.git
cd SCTE-35-Encoder-Stream-Injector
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Configure Environment
Create a `.env` file in the root directory:
```bash
# Application Configuration
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/scte35"

# Stream Configuration
SRT_INPUT_PORT=9000
SRT_OUTPUT_PORT=9001
RTMP_PORT=1935
HLS_OUTPUT_DIR=/var/www/hls
DASH_OUTPUT_DIR=/var/www/dash

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-encryption-key-here

# Logging Configuration
LOG_LEVEL=info
```

#### Step 4: Start the Application
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

#### Step 5: Access the Application
Open your web browser and navigate to:
```
http://localhost:3000
```

### First-Time Setup

#### Initial Configuration
1. **Navigate to the Home Page**: Familiarize yourself with the interface
2. **Review Features**: Explore the three main sections (Encoder, Stream Injection, Monitor)
3. **Test SCTE-35 Encoding**: Try encoding a simple SCTE-35 cue
4. **Configure Stream Settings**: Set up your first stream configuration
5. **Test Monitoring**: Check the stream monitoring features

#### Basic Workflow
1. **Encode SCTE-35**: Create your first SCTE-35 cue
2. **Configure Stream**: Set up input/output stream parameters
3. **Start Stream**: Begin the streaming process
4. **Inject Cues**: Add SCTE-35 cues to your stream
5. **Monitor Results**: Watch the stream health and injection results

---

## 🎬 SCTE-35 Encoder Guide

### Overview

The SCTE-35 Encoder allows you to create professional SCTE-35 cues for advertisement insertion, program scheduling, and other broadcast automation tasks.

### Navigation

#### Accessing the Encoder
1. Go to the main page (`http://localhost:3000`)
2. Click on the **"SCTE-35 Encoder"** card
3. Alternatively, navigate directly to `http://localhost:3000/encoder`

#### Interface Layout
- **Left Panel**: Configuration options
- **Right Panel**: Output display and controls
- **Top Navigation**: Command type selection
- **Bottom Controls**: Encode and format options

### SCTE-35 Commands

#### 1. Splice Insert Command

**Purpose**: Insert advertisement breaks or program transitions

**Configuration Steps:**
1. **Select Command Type**: Choose "Splice Insert" from the tabs
2. **Configure Splice Info Section**:
   - **Table ID**: Usually 252 (0xFC) for SCTE-35
   - **Protocol Version**: Typically 0
   - **PTS Adjustment**: Adjust presentation timestamp if needed
   - **CW Index**: Control word index (usually 255)

3. **Set Splice Insert Parameters**:
   - **Splice Event ID**: Unique identifier for this event
   - **Out of Network**: Enable for network breaks
   - **Program Splice**: Enable for program-level splices
   - **Duration Flag**: Enable if specifying break duration
   - **Splice Immediate**: Enable for immediate execution
   - **Break Duration**: Duration in 90kHz units
   - **Unique Program ID**: Program identifier
   - **Splice Time PTS**: Presentation timestamp for the splice

**Example Configuration:**
```
Splice Event ID: 1
Out of Network: No
Program Splice: Yes
Duration Flag: No
Splice Immediate: No
Break Duration: 0
Unique Program ID: 1
Splice Time PTS: 0
```

#### 2. Time Signal Command

**Purpose**: Send timing information for synchronization

**Configuration Steps:**
1. **Select Command Type**: Choose "Time Signal" from the tabs
2. **Configure Splice Info Section** (same as Splice Insert)
3. **Set Time Signal Parameters**:
   - **Time Specified**: Enable if providing specific time
   - **PTS**: Presentation timestamp in 90kHz units

**Example Configuration:**
```
Time Specified: Yes
PTS: 90000 (equivalent to 1 second)
```

### Output Formats

#### Base64 Format
- **Use Case**: Web applications, APIs, database storage
- **Advantages**: Compact, widely supported
- **Example**: `/DAiAAAAAAAA///wEAAAAAAAAAABAECAAAAAAAAAAQAAhz83Pw==`

#### Hex Format
- **Use Case**: Low-level systems, debugging, analysis
- **Advantages**: Easy to read, byte-aligned
- **Example**: `FC3022000000000000FFFFF0100000000000000001004080000000000000010000873F373F`

### Encoding Process

#### Step-by-Step Guide
1. **Choose Command Type**: Select Splice Insert or Time Signal
2. **Configure Parameters**: Fill in all required fields
3. **Set Output Format**: Choose Base64 or Hex
4. **Validate Input**: Review configuration for errors
5. **Encode**: Click "Encode SCTE-35" button
6. **Review Output**: Check the encoded result
7. **Copy or Download**: Save the encoded data

#### Validation Features
- **Real-time Validation**: Immediate feedback on input errors
- **Required Field Indicators**: Visual cues for mandatory fields
- **Range Checking**: Parameter value validation
- **Format Verification**: SCTE-35 standard compliance

### Advanced Features

#### Descriptors
- **Purpose**: Add metadata to SCTE-35 cues
- **Types**: Avail Descriptor, DTMF Descriptor, Time Descriptor
- **Configuration**: Add descriptor data in the Descriptors section

#### Custom Parameters
- **PTS Adjustment**: Fine-tune timing synchronization
- **Tier Settings**: Configure stream tier levels
- **Encryption**: Enable packet-level encryption
- **Protocol Extensions**: Extended protocol features

### Common Use Cases

#### Advertisement Insertion
1. **Command**: Splice Insert
2. **Configuration**: Set break duration, program splice
3. **Timing**: Schedule for specific PTS
4. **Output**: Use Base64 for web integration

#### Program Transition
1. **Command**: Splice Insert
2. **Configuration**: Set unique program ID
3. **Timing**: Immediate or scheduled
4. **Output**: Use Hex for broadcast systems

#### Synchronization Signal
1. **Command**: Time Signal
2. **Configuration**: Set specific PTS
3. **Timing**: Precise timing control
4. **Output**: Use format appropriate for target system

---

## 🌊 Stream Injection Guide

### Overview

The Stream Injection system allows you to inject SCTE-35 cues into live video streams in real-time, supporting multiple streaming protocols.

### Navigation

#### Accessing Stream Injection
1. Go to the main page (`http://localhost:3000`)
2. Click on the **"Stream Injection"** card
3. Alternatively, navigate directly to `http://localhost:3000/stream-injection`

#### Interface Layout
- **Stream Config Tab**: Stream configuration and control
- **Injection Points Tab**: Scheduled injection management
- **Monitor Tab**: Real-time stream monitoring
- **Encoder Tab**: Quick SCTE-35 encoding

### Stream Configuration

#### Supported Protocols

#### 1. SRT (Secure Reliable Transport)
- **Best For**: Low-latency, secure live streaming
- **Latency**: Sub-second to 2 seconds
- **Security**: AES-256 encryption
- **Reliability**: Automatic error correction

**Configuration:**
```
Input URL: srt://localhost:9000?streamid=live/input
Output URL: srt://localhost:9001?streamid=live/output
Stream Type: SRT
Bitrate: 5000 kbps
Resolution: 1920x1080
Codec: H.264
```

#### 2. HLS (HTTP Live Streaming)
- **Best For**: Wide compatibility, adaptive streaming
- **Latency**: 6-30 seconds
- **Compatibility**: Works on most devices
- **Adaptive**: Multiple quality levels

**Configuration:**
```
Input URL: http://input-server/live/stream.m3u8
Output URL: /var/www/hls/output/stream.m3u8
Stream Type: HLS
Bitrate: 5000 kbps
Resolution: 1920x1080
Codec: H.264
```

#### 3. DASH (Dynamic Adaptive Streaming)
- **Best For**: Modern browsers, adaptive streaming
- **Latency**: 2-10 seconds
- **Standard**: ISO/IEC 23009-1
- **Efficient**: Segment-based delivery

**Configuration:**
```
Input URL: input.mp4
Output URL: /var/www/dash/output.mpd
Stream Type: DASH
Bitrate: 5000 kbps
Resolution: 1920x1080
Codec: H.265
```

#### 4. RTMP (Real-Time Messaging Protocol)
- **Best For**: Real-time communication, legacy systems
- **Latency**: 1-5 seconds
- **Adoption**: Broad platform support
- **Reliability**: TCP-based delivery

**Configuration:**
```
Input URL: rtmp://localhost:1935/live/stream
Output URL: rtmp://localhost:1935/live/output
Stream Type: RTMP
Bitrate: 6000 kbps
Resolution: 1920x1080
Codec: H.264
```

### Stream Management

#### Starting a Stream

#### Step-by-Step Guide
1. **Navigate to Stream Config Tab**
2. **Select Stream Type**: Choose your protocol (SRT, HLS, DASH, RTMP)
3. **Configure Input URL**: Set the source stream URL
4. **Configure Output URL**: Set the destination stream URL
5. **Set Technical Parameters**:
   - **Bitrate**: Target bitrate in kbps
   - **Resolution**: Video resolution (e.g., 1920x1080)
   - **Codec**: Video codec (H.264, H.265, etc.)
6. **Validate Configuration**: Check for errors
7. **Start Stream**: Click "Start Stream" button
8. **Monitor Status**: Watch the stream status indicator

#### Status Indicators
- **Stopped**: Gray indicator - Stream not running
- **Starting**: Yellow indicator - Stream initializing
- **Running**: Green indicator - Stream active
- **Error**: Red indicator - Stream problems

#### Stopping a Stream
1. **Navigate to Stream Config Tab**
2. **Click "Stop Stream" button**
3. **Confirm Stop**: Verify the stop action
4. **Check Status**: Ensure stream stops gracefully

### Injection Management

#### Types of Injection

#### 1. Scheduled Injection
- **Purpose**: Pre-planned cue insertion
- **Timing**: Based on stream time
- **Management**: Full CRUD operations
- **Best For**: Advertisement breaks, program transitions

**Configuration Steps:**
1. **Navigate to Injection Points Tab**
2. **Click "Add Injection Point"**
3. **Set Injection Time**: Time in seconds from stream start
4. **Add SCTE-35 Data**: Paste encoded SCTE-35 data
5. **Set Description**: Human-readable description
6. **Enable Auto-inject**: Optional automatic injection
7. **Save Injection**: Click "Add Injection Point"

**Example:**
```
Time: 30 seconds
SCTE-35 Data: /DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM=
Description: Advertisement break start
Auto-inject: Enabled
```

#### 2. Manual Injection
- **Purpose**: Immediate, on-demand cue insertion
- **Timing**: Instant execution
- **Control**: User-triggered
- **Best For**: Emergency alerts, immediate actions

**Configuration Steps:**
1. **Navigate to Injection Points Tab**
2. **Prepare SCTE-35 Data**: Have encoded data ready
3. **Click "Inject Now"**: Next to the injection point
4. **Verify Injection**: Check injection confirmation
5. **Monitor Results**: Watch stream status

#### 3. Quick Injection
- **Purpose**: Rapid injection without scheduling
- **Timing**: Immediate execution
- **Workflow**: Encode and inject in one step
- **Best For**: Testing, emergency situations

**Configuration Steps:**
1. **Navigate to Encoder Tab**
2. **Encode SCTE-35**: Create your cue
3. **Click "Inject Now"**: Direct injection
4. **Monitor Results**: Check injection status

### Injection Point Management

#### Managing Scheduled Injections

#### Viewing Injections
1. **Navigate to Injection Points Tab**
2. **Review Injection List**: See all scheduled injections
3. **Check Status**: Active/Inactive indicators
4. **Sort and Filter**: Organize by time or status

#### Editing Injections
1. **Find Injection**: Locate in the injection list
2. **Click Edit**: Modify injection parameters
3. **Update Values**: Change time, data, or description
4. **Save Changes**: Apply modifications

#### Toggling Injections
1. **Find Injection**: Locate in the injection list
2. **Use Toggle**: Enable/disable injection
3. **Confirm Action**: Verify toggle operation
4. **Check Status**: Ensure correct state

#### Deleting Injections
1. **Find Injection**: Locate in the injection list
2. **Click Remove**: Delete injection point
3. **Confirm Deletion**: Verify removal
4. **Update List**: Check remaining injections

### Stream Monitoring

#### Real-time Metrics

#### Stream Status
- **Status**: Current stream state (stopped/starting/running/error)
- **Input Bitrate**: Incoming stream data rate
- **Output Bitrate**: Outgoing stream data rate
- **Viewers**: Active viewer count
- **Uptime**: Stream duration
- **Last Injection**: Most recent injection timestamp

#### Quality Metrics
- **Packet Loss**: Data loss percentage
- **Latency**: Stream delay measurement
- **Bitrate Efficiency**: Input vs output ratio
- **Connection Status**: Stream stability indicator

#### System Health
- **CPU Usage**: Processor utilization
- **Memory Usage**: RAM consumption
- **Disk Usage**: Storage utilization
- **Network Usage**: Network I/O statistics

### Advanced Features

#### Auto-injection Configuration
- **Enable/Disable**: Control automatic injection
- **Timing Precision**: Frame-accurate timing
- **Error Handling**: Graceful failure recovery
- **Logging**: Detailed injection logs

#### Stream Templates
- **Save Configurations**: Store common stream setups
- **Quick Load**: Rapid configuration loading
- **Template Management**: Organize by use case
- **Share Templates**: Export/import configurations

#### Batch Operations
- **Multiple Injections**: Add multiple injection points
- **Bulk Actions**: Enable/disable multiple injections
- **Import/Export**: Batch configuration management
- **Scheduled Operations**: Time-based batch execution

---

## 📊 Stream Monitoring Guide

### Overview

The Stream Monitor provides comprehensive real-time monitoring of your streams, system health, and SCTE-35 activity.

### Navigation

#### Accessing the Monitor
1. Go to the main page (`http://localhost:3000`)
2. Click on the **"Stream Monitor"** card
3. Alternatively, navigate directly to `http://localhost:3000/monitor`

#### Interface Layout
- **Overview Cards**: Key metrics at a glance
- **Stream Quality Section**: Detailed performance metrics
- **System Health Section**: Resource utilization
- **Activity Log**: Event history and analysis

### Monitoring Dashboard

#### Overview Cards

#### Stream Metrics
- **Input Bitrate**: Real-time incoming data rate
- **Output Bitrate**: Real-time outgoing data rate
- **Viewers**: Current active viewer count
- **Uptime**: Stream running time

**Status Indicators:**
- **Green**: Normal operation
- **Yellow**: Warning conditions
- **Red**: Critical issues

#### System Health
- **CPU Usage**: Processor utilization percentage
- **Memory Usage**: RAM consumption percentage
- **Disk Usage**: Storage utilization percentage
- **Network Usage**: Network I/O percentage

**Health Status:**
- **Healthy**: All systems normal
- **Warning**: Resource usage elevated
- **Critical**: System issues detected

### Stream Quality Metrics

#### Performance Indicators

#### Bitrate Analysis
- **Input Bitrate**: Source stream data rate
- **Output Bitrate**: Processed stream data rate
- **Bitrate Efficiency**: Input/output ratio
- **Bitrate Stability**: Consistency over time

#### Quality Metrics
- **Packet Loss**: Data loss percentage
- **Latency**: Stream delay in milliseconds
- **Jitter**: Timing variation
- **Frame Rate**: Video frame rate

#### Connection Status
- **Connection Quality**: Overall connection health
- **Stability**: Connection consistency
- **Throughput**: Data transfer capacity
- **Error Rate**: Error frequency

### System Health Monitoring

#### Resource Utilization

#### CPU Monitoring
- **Current Usage**: Real-time CPU percentage
- **Historical Trends**: Usage over time
- **Process Breakdown**: Per-process usage
- **Alert Thresholds**: Warning and critical levels

#### Memory Monitoring
- **RAM Usage**: Memory consumption
- **Swap Usage**: Virtual memory usage
- **Cache Efficiency**: Cache hit rates
- **Memory Leaks**: Unusual growth patterns

#### Storage Monitoring
- **Disk Usage**: Storage consumption
- **I/O Performance**: Read/write speeds
- **Available Space**: Free storage
- **Disk Health**: Hardware status

#### Network Monitoring
- **Network I/O**: Data transfer rates
- **Connection Count**: Active connections
- **Bandwidth Usage**: Network capacity
- **Latency**: Network delay

### SCTE-35 Activity Tracking

#### Activity Log

#### Event Types
- **Injection**: SCTE-35 cue injection events
- **Detection**: SCTE-35 cue detection events
- **Stream Events**: Stream start/stop events
- **System Events**: Health and status events

#### Event Details
- **Timestamp**: Event occurrence time
- **Event Type**: Category of event
- **Description**: Human-readable description
- **Data**: Associated SCTE-35 data (if applicable)

#### Activity Analysis
- **Frequency**: Event occurrence rate
- **Patterns**: Recurring event patterns
- **Correlations**: Event relationships
- **Trends**: Activity over time

### Alert System

#### Alert Types

#### Critical Alerts
- **Stream Failure**: Complete stream interruption
- **System Overload**: Resource exhaustion
- **Network Failure**: Connectivity loss
- **Service Unavailable**: Application downtime

#### Warning Alerts
- **High Resource Usage**: Elevated resource consumption
- **Quality Degradation**: Stream quality issues
- **Injection Failures**: SCTE-35 injection problems
- **Performance Issues**: Slower than normal operation

#### Information Alerts
- **Stream Status Changes**: Normal state transitions
- **Scheduled Events**: Planned activities
- **System Updates**: Maintenance activities
- **Performance Metrics**: Regular statistics

#### Alert Configuration
- **Threshold Settings**: Custom alert levels
- **Notification Methods**: Email, webhook, in-app
- **Escalation Rules**: Multi-level alert handling
- **Suppression**: Alert grouping and suppression

### Real-time Updates

#### WebSocket Integration

#### Live Data Updates
- **Metrics**: Real-time performance data
- **Health**: System health updates
- **Status**: Stream status changes
- **Activity**: SCTE-35 activity events

#### Update Frequency
- **Metrics**: Every 1 second
- **Health**: Every 5 seconds
- **Status**: Immediate on change
- **Activity**: Real-time as events occur

#### Data Visualization
- **Charts**: Graphical representation of metrics
- **Gauges**: Visual indicators for key metrics
- **Trend Lines**: Historical data visualization
- **Heat Maps**: Activity density visualization

### Advanced Features

#### Custom Dashboards
- **Personalized Views**: Custom metric arrangements
- **Saved Configurations**: Store dashboard layouts
- **Shared Dashboards**: Team collaboration
- **Mobile Views**: Optimized for mobile devices

#### Historical Analysis
- **Trend Analysis**: Long-term pattern recognition
- **Performance Baselines**: Normal operation ranges
- **Anomaly Detection**: Unusual pattern identification
- **Predictive Analytics**: Future performance prediction

#### Export and Reporting
- **Data Export**: CSV, JSON, XML formats
- **Report Generation**: Automated report creation
- **Scheduled Reports**: Regular report delivery
- **Custom Reports**: Tailored report formats

---

## 🔌 API Reference

### Overview

The SCTE-35 Encoder & Stream Injector provides comprehensive REST APIs and WebSocket endpoints for integration with external systems.

### Authentication

#### JWT Authentication
```javascript
// Login to get JWT token
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'your_username',
    password: 'your_password'
  })
});

const { token } = await response.json();

// Use token in subsequent requests
const apiResponse = await fetch('/api/scte35/encode', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(requestData)
});
```

### SCTE-35 Encoding API

#### Encode SCTE-35 Cue

**Endpoint:** `POST /api/scte35/encode`

**Description:** Encode SCTE-35 data from configuration parameters

**Request Body:**
```json
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
  "base64": "/DAiAAAAAAAA///wEAAAAAAAAAABAECAAAAAAAAAAQAAhz83Pw==",
  "hex": "FC3022000000000000FFFFF0100000000000000001004080000000000000010000873F373F",
  "timestamp": "2025-09-05T11:54:28.714Z",
  "encoding": "SCTE-35"
}
```

**Error Response:**
```json
{
  "error": "Missing required fields"
}
```

### Stream Management APIs

#### Start Stream

**Endpoint:** `POST /api/stream/start`

**Description:** Start a new streaming session

**Request Body:**
```json
{
  "streamName": "Test Service",
  "inputUrl": "srt://localhost:9000?streamid=live/stream",
  "outputUrl": "srt://localhost:9001?streamid=live/output",
  "streamType": "srt",
  "videoResolution": "1920x1080",
  "videoCodec": "h264",
  "pcr": "Video Embedded",
  "profileLevel": "High@Auto",
  "gop": 12,
  "bFrames": 5,
  "videoBitrate": 5000,
  "chroma": "4:2:0",
  "aspectRatio": "16:9",
  "audioCodec": "AAC-LC",
  "audioBitrate": 128,
  "audioLKFS": -20,
  "audioSamplingRate": 48000,
  "scteDataPid": 500,
  "nullPid": 8191,
  "latency": 2000,
  "scteSettings": {
    "adDuration": 30,
    "scteEventId": 1000,
    "preRollDuration": 5
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stream \"Test Service\" started successfully",
  "config": {
    "streamName": "Test Service",
    "inputUrl": "srt://localhost:9000?streamid=live/stream",
    "outputUrl": "srt://localhost:9001?streamid=live/output",
    "streamType": "srt"
  },
  "scteEventId": 1000
}
```

#### Stop Stream

**Endpoint:** `POST /api/stream/stop`

**Description:** Stop the currently running stream

**Response:**
```json
{
  "success": true,
  "message": "Stream stopped successfully"
}
```

#### Get Stream Status

**Endpoint:** `GET /api/stream/status`

**Description:** Get current stream status and metrics

**Response:**
```json
{
  "status": "running",
  "inputBitrate": 5123,
  "outputBitrate": 4987,
  "viewers": 25,
  "uptime": 1234,
  "lastInjection": "2025-09-05T11:54:37.530Z"
}
```

#### Inject SCTE-35

**Endpoint:** `POST /api/stream/inject`

**Description:** Inject SCTE-35 data into the current stream

**Request Body:**
```json
{
  "scte35Data": "/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM="
}
```

**Response:**
```json
{
  "success": true,
  "message": "SCTE-35 injection successful",
  "timestamp": "2025-09-05T11:54:37.530Z",
  "dataLength": 84
}
```

#### Get Stream Metrics

**Endpoint:** `GET /api/stream/metrics`

**Description:** Get detailed stream performance metrics

**Response:**
```json
{
  "inputBitrate": 5123,
  "outputBitrate": 4987,
  "viewers": 25,
  "uptime": 1234,
  "packetLoss": 0.1,
  "latency": 45
}
```

#### Get System Health

**Endpoint:** `GET /api/stream/health`

**Description:** Get system health and resource metrics

**Response:**
```json
{
  "status": "healthy",
  "cpu": 45,
  "memory": 67,
  "disk": 34,
  "network": 23
}
```

### WebSocket API

#### Connect to WebSocket

**Endpoint:** `ws://localhost:3000/api/stream/ws`

**Description:** Establish WebSocket connection for real-time updates

**JavaScript Example:**
```javascript
const ws = new WebSocket('ws://localhost:3000/api/stream/ws');

ws.onopen = () => {
  console.log('WebSocket connected');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
  
  switch (data.type) {
    case 'status':
      handleStatusUpdate(data.status);
      break;
    case 'metrics':
      handleMetricsUpdate(data.metrics);
      break;
    case 'health':
      handleHealthUpdate(data.health);
      break;
    case 'activity':
      handleActivityUpdate(data.activity);
      break;
  }
};

ws.onclose = () => {
  console.log('WebSocket disconnected');
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

#### Message Types

##### Status Update
```json
{
  "type": "status",
  "status": {
    "status": "running",
    "inputBitrate": 5123,
    "outputBitrate": 4987,
    "viewers": 25,
    "uptime": 1234,
    "lastInjection": "2025-09-05T11:54:37.530Z"
  }
}
```

##### Metrics Update
```json
{
  "type": "metrics",
  "metrics": {
    "inputBitrate": 5123,
    "outputBitrate": 4987,
    "viewers": 25,
    "uptime": 1234,
    "packetLoss": 0.1,
    "latency": 45
  }
}
```

##### Health Update
```json
{
  "type": "health",
  "health": {
    "status": "healthy",
    "cpu": 45,
    "memory": 67,
    "disk": 34,
    "network": 23
  }
}
```

##### Activity Update
```json
{
  "type": "activity",
  "activity": {
    "timestamp": "2025-09-05T11:54:37.530Z",
    "type": "injection",
    "data": "/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM=",
    "description": "Advertisement break start"
  }
}
```

### Error Handling

#### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource does not exist |
| 500 | Internal Server Error - Application error |

#### Error Response Format
```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": "Additional error details",
  "timestamp": "2025-09-05T11:54:28.714Z"
}
```

### Rate Limiting

#### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

#### Rate Limit Response
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

### Integration Examples

#### Python Integration
```python
import requests
import json
import websocket
import threading

# SCTE-35 Encoding
def encode_scte35():
    url = "http://localhost:3000/api/scte35/encode"
    data = {
        "spliceInfo": {
            "tableId": 252,
            "selectionSyntaxIndicator": False,
            "privateIndicator": False,
            "protocolVersion": 0,
            "encryptedPacket": False,
            "encryptedAlgorithm": 0,
            "ptsAdjustment": 0,
            "cwIndex": 255,
            "tier": 4095,
            "spliceCommandType": 5,
            "descriptors": []
        },
        "command": {
            "spliceEventId": 1,
            "spliceEventCancelIndicator": False,
            "outOfNetworkIndicator": False,
            "programSpliceFlag": True,
            "durationFlag": False,
            "spliceImmediateFlag": False,
            "breakDurationAutoReturn": False,
            "breakDuration": 0,
            "uniqueProgramId": 1,
            "available": 0,
            "expected": 0,
            "spliceTimeSpecified": True,
            "spliceTimePts": 0
        },
        "commandType": "splice-insert"
    }
    
    response = requests.post(url, json=data)
    return response.json()

# WebSocket Connection
def on_message(ws, message):
    data = json.loads(message)
    print(f"Received: {data}")

def on_error(ws, error):
    print(f"Error: {error}")

def on_close(ws, close_status_code, close_msg):
    print("### closed ###")

def on_open(ws):
    print("Opened connection")

def start_websocket():
    ws = websocket.WebSocketApp("ws://localhost:3000/api/stream/ws",
                              on_message=on_message,
                              on_error=on_error,
                              on_close=on_close,
                              on_open=on_open)
    ws.run_forever()

# Start WebSocket in separate thread
threading.Thread(target=start_websocket).start()
```

#### Node.js Integration
```javascript
const fetch = require('node-fetch');
const WebSocket = require('ws');

// SCTE-35 Encoding
async function encodeSCTE35() {
  const response = await fetch('http://localhost:3000/api/scte35/encode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
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
      commandType: 'splice-insert'
    })
  });
  
  return await response.json();
}

// WebSocket Connection
const ws = new WebSocket('ws://localhost:3000/api/stream/ws');

ws.on('open', () => {
  console.log('Connected to WebSocket');
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  console.log('Received:', message);
});

ws.on('error', (error) => {
  console.error('WebSocket error:', error);
});

ws.on('close', () => {
  console.log('WebSocket closed');
});
```

---

## 🔧 Troubleshooting

### Common Issues

#### Application Won't Start

##### Symptoms
- Application fails to start
- Error messages in console
- Port already in use

##### Solutions
1. **Check Node.js Version**
   ```bash
   node --version
   # Should be 18.x or higher
   ```

2. **Check Port Availability**
   ```bash
   # Check if port 3000 is available
   netstat -an | grep 3000
   
   # Kill process using port 3000
   lsof -ti:3000 | xargs kill -9
   ```

3. **Verify Dependencies**
   ```bash
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Check System Resources**
   ```bash
   # Check available memory
   free -h
   
   # Check disk space
   df -h
   ```

#### Stream Connection Issues

##### Symptoms
- Stream won't start
- Connection timeout
- Authentication failures

##### Solutions
1. **Verify Stream URLs**
   ```bash
   # Test input URL accessibility
   curl -I your-input-url
   
   # Test output URL permissions
   ls -la /path/to/output/directory
   ```

2. **Check Network Configuration**
   ```bash
   # Test network connectivity
   ping your-stream-server
   
   # Check firewall rules
   sudo ufw status
   ```

3. **Verify Protocol Support**
   ```bash
   # Check SRT support
   srt-live-transmit -v
   
   # Check FFmpeg support
   ffmpeg -protocols | grep -E "(srt|hls|dash|rtmp)"
   ```

#### SCTE-35 Encoding Issues

##### Symptoms
- Encoding fails
- Invalid output format
- Parameter validation errors

##### Solutions
1. **Validate Input Parameters**
   ```javascript
   // Check required fields
   const requiredFields = ['spliceInfo', 'command', 'commandType'];
   const isValid = requiredFields.every(field => field in requestData);
   ```

2. **Verify SCTE-35 Data Format**
   ```bash
   # Test Base64 format
   echo "your-base64-data" | base64 -d | hexdump -C
   
   # Test Hex format
   echo "your-hex-data" | xxd -r -p | base64
   ```

3. **Check Command Configuration**
   ```javascript
   // Validate command type
   const validCommands = ['splice-insert', 'time-signal'];
   if (!validCommands.includes(commandType)) {
     throw new Error('Invalid command type');
   }
   ```

#### Performance Issues

##### Symptoms
- High CPU usage
- Memory leaks
- Slow response times

##### Solutions
1. **Monitor System Resources**
   ```bash
   # Monitor CPU usage
   top -p $(pgrep -f "node.*server")
   
   # Monitor memory usage
   ps aux | grep node
   
   # Monitor network usage
   nethogs
   ```

2. **Optimize Configuration**
   ```javascript
   // Reduce polling frequency
   const POLLING_INTERVAL = 5000; // 5 seconds instead of 1 second
   
   // Enable caching
   const cache = new Map();
   function getCachedData(key) {
     return cache.get(key);
   }
   ```

3. **Scale Resources**
   ```bash
   # Increase Node.js memory limit
   node --max-old-space-size=4096 server.ts
   
   # Use PM2 for process management
   pm2 start server.ts --max-memory-restart 400M
   ```

#### WebSocket Issues

##### Symptoms
- Connection drops
- Real-time updates not working
- High latency

##### Solutions
1. **Check WebSocket Connection**
   ```javascript
   // Test WebSocket connectivity
   const ws = new WebSocket('ws://localhost:3000/api/stream/ws');
   
   ws.onopen = () => {
     console.log('WebSocket connected');
     ws.send(JSON.stringify({ test: 'connection' }));
   };
   ```

2. **Verify Network Configuration**
   ```bash
   # Check WebSocket support
   curl -I -H "Connection: Upgrade" -H "Upgrade: websocket" http://localhost:3000/api/stream/ws
   
   # Check proxy settings
   echo $HTTP_PROXY
   echo $HTTPS_PROXY
   ```

3. **Implement Reconnection Logic**
   ```javascript
   function connectWebSocket() {
     const ws = new WebSocket('ws://localhost:3000/api/stream/ws');
     
     ws.onclose = () => {
       setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
     };
     
     return ws;
   }
   ```

### Debug Mode

#### Enable Debug Logging
```bash
# Set debug environment variable
export DEBUG=scte35:*

# Start application with debug logging
npm run dev
```

#### Log Files
```bash
# Check application logs
tail -f logs/app.log

# Check error logs
tail -f logs/error.log

# Check access logs
tail -f logs/access.log
```

#### Browser Developer Tools
1. **Network Tab**: Monitor API requests and responses
2. **Console Tab**: Check for JavaScript errors
3. **Performance Tab**: Analyze page load performance
4. **Application Tab**: Inspect WebSocket connections

### Getting Help

#### Documentation Resources
- **README.md**: Project overview and setup
- **FEATURES.md**: Detailed feature documentation
- **USER_MANUAL.md**: This user manual
- **API Reference**: Complete API documentation

#### Community Support
- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and share knowledge
- **Stack Overflow**: Get help from the community
- **Discord/Slack**: Real-time community support

#### Professional Support
- **Email Support**: Direct contact with development team
- **Priority Support**: Expedited issue resolution
- **Custom Development**: Tailored solutions for specific needs
- **Training Services**: On-site training and consultation

---

## 🎯 Best Practices

### SCTE-35 Encoding Best Practices

#### Parameter Configuration
1. **Use Standard Values**: Follow SCTE-35 standard recommendations
2. **Validate Input Data**: Always validate before encoding
3. **Test Output**: Verify encoded data with multiple parsers
4. **Document Configuration**: Keep records of encoding parameters

#### Timing and Synchronization
1. **Use PTS Timing**: Prefer PTS over wall-clock timing
2. **Synchronize Sources**: Ensure all sources use same timebase
3. **Account for Latency**: Consider processing and network delays
4. **Test Timing**: Verify timing accuracy with test streams

#### Error Handling
1. **Validate Inputs**: Check all parameters before encoding
2. **Handle Errors Gracefully**: Provide meaningful error messages
3. **Log Errors**: Record encoding errors for debugging
4. **Recovery Strategies**: Implement fallback procedures

### Stream Management Best Practices

#### Stream Configuration
1. **Match Source and Destination**: Ensure compatible formats
2. **Optimize Bitrates**: Balance quality and bandwidth
3. **Use Appropriate Codecs**: Choose codecs based on use case
4. **Test Connectivity**: Verify network paths before streaming

#### Protocol Selection
1. **SRT**: Use for low-latency, secure applications
2. **HLS**: Use for wide compatibility and adaptive streaming
3. **DASH**: Use for modern browsers and standards compliance
4. **RTMP**: Use for legacy systems and real-time communication

#### Quality Assurance
1. **Monitor Continuously**: Track stream health and quality
2. **Set Alerts**: Configure notifications for critical issues
3. **Test Redundancy**: Implement backup streams and failover
4. **Document Procedures**: Keep operational procedures updated

### Injection Best Practices

#### Timing and Scheduling
1. **Plan Ahead**: Schedule injections well in advance
2. **Test Timing**: Verify injection timing with test streams
3. **Use Relative Timing**: Base timing on stream time, not wall clock
4. **Account for Processing**: Consider encoding and injection delays

#### Data Management
1. **Validate SCTE-35 Data**: Ensure data format compliance
2. **Backup Configurations**: Save injection schedules and settings
3. **Version Control**: Track changes to injection configurations
4. **Test Thoroughly**: Validate injections in test environment

#### Monitoring and Validation
1. **Monitor Injections**: Track injection success and timing
2. **Verify Results**: Confirm SCTE-35 cues are properly inserted
3. **Log Everything**: Maintain detailed injection logs
4. **Audit Regularly**: Review injection accuracy and timing

### Security Best Practices

#### Application Security
1. **Use Authentication**: Implement proper user authentication
2. **Validate Inputs**: Sanitize all user inputs
3. **Use HTTPS**: Encrypt all communications in production
4. **Regular Updates**: Keep dependencies and systems updated

#### Stream Security
1. **Secure Connections**: Use encrypted protocols (SRT, HTTPS)
2. **Access Control**: Implement proper access controls
3. **Monitor Access**: Track stream access and usage
4. **Backup Data**: Regular backup of configurations and data

#### Network Security
1. **Firewall Configuration**: Properly configure firewall rules
2. **Network Segmentation**: Separate streaming networks
3. **Intrusion Detection**: Monitor for suspicious activity
4. **Regular Audits**: Conduct regular security assessments

### Performance Best Practices

#### System Optimization
1. **Resource Allocation**: Ensure adequate system resources
2. **Load Balancing**: Distribute load across multiple servers
3. **Caching**: Implement caching for frequently accessed data
4. **Monitoring**: Continuously monitor system performance

#### Stream Optimization
1. **Bitrate Management**: Optimize bitrates for quality and efficiency
2. **Protocol Selection**: Choose appropriate protocols for use cases
3. **Network Optimization**: Optimize network paths and configurations
4. **Quality Control**: Implement quality monitoring and control

#### Code Optimization
1. **Efficient Algorithms**: Use optimized encoding algorithms
2. **Memory Management**: Proper memory usage and garbage collection
3. **Asynchronous Operations**: Use async/await for I/O operations
4. **Code Review**: Regular code review and optimization

### Monitoring and Maintenance

#### Regular Maintenance
1. **System Updates**: Keep systems and dependencies updated
2. **Log Rotation**: Manage log files and storage
3. **Performance Tuning**: Regular performance optimization
4. **Security Audits**: Conduct regular security assessments

#### Documentation
1. **Keep Documentation Updated**: Maintain current documentation
2. **Document Changes**: Record all changes and updates
3. **User Training**: Provide training for new features
4. **Knowledge Base**: Build and maintain knowledge base

#### Backup and Recovery
1. **Regular Backups**: Implement regular backup procedures
2. **Test Recovery**: Verify backup and recovery procedures
3. **Disaster Recovery**: Prepare for disaster scenarios
4. **Business Continuity**: Ensure business continuity planning

---

This comprehensive user manual provides detailed guidance for using all features of the SCTE-35 Encoder & Stream Injector system. For additional support, please refer to the project documentation or contact the development team.