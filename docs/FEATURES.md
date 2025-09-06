# SCTE-35 Encoder & Stream Injector - Feature Documentation

## 🎯 Core Features

### 1. SCTE-35 Encoder

#### Overview
The SCTE-35 Encoder provides a comprehensive interface for creating SCTE-35 messages according to the SCTE-35 standard. It supports multiple command types and provides extensive configuration options.

#### Key Features
- **Full SCTE-35 Compliance**: Complete implementation of the SCTE-35 standard
- **Multiple Command Types**: Splice Insert, Time Signal, Splice Schedule, Time Signal
- **Flexible Configuration**: Comprehensive parameter control including PTS, duration, descriptors
- **Multiple Output Formats**: Base64 and Hex encoding with validation
- **Real-time Encoding**: Instant encoding with error handling and validation

#### Supported Commands

##### Splice Insert (Command Type 5)
The most commonly used SCTE-35 command for ad insertion and program switching.

**Parameters:**
- `spliceEventId`: Unique identifier for the splice event
- `spliceEventCancelIndicator`: Flag to cancel a previously scheduled event
- `outOfNetworkIndicator`: Indicates if the splice is out of network
- `programSpliceFlag`: Whether this is a program-level splice
- `durationFlag`: Whether break duration is specified
- `spliceImmediateFlag`: Whether the splice should happen immediately
- `breakDuration`: Duration of the break (in 90kHz units)
- `uniqueProgramId`: Unique identifier for the program
- `available`: Number of available events
- `expected`: Number of expected events
- `spliceTimePts`: Presentation Time Stamp for the splice

**Example Usage:**
```typescript
const spliceInsert = {
  spliceEventId: 1,
  spliceEventCancelIndicator: false,
  outOfNetworkIndicator: true,
  programSpliceFlag: true,
  durationFlag: true,
  spliceImmediateFlag: false,
  breakDuration: 2700000, // 30 seconds in 90kHz units
  uniqueProgramId: 1,
  available: 0,
  expected: 0,
  spliceTimeSpecified: true,
  spliceTimePts: 86400000 // 1 second in 90kHz units
};
```

##### Time Signal (Command Type 6)
Used for timing-related commands and synchronization.

**Parameters:**
- `timeSpecified`: Whether time is specified
- `pts`: Presentation Time Stamp

**Example Usage:**
```typescript
const timeSignal = {
  timeSpecified: true,
  pts: 86400000 // 1 second in 90kHz units
};
```

#### Descriptors Support
SCTE-35 descriptors provide additional metadata for splice events.

**Supported Descriptors:**
- **Avail Descriptor**: Indicates availability of advertising time
- **DTMF Descriptor**: DTMF tone information
- **Segmentation Descriptor**: Content segmentation information
- **Time Descriptor**: Time-related information

### 2. Stream Injection

#### Overview
The Stream Injection system allows real-time insertion of SCTE-35 cues into live video streams. It supports multiple streaming protocols and provides both scheduled and manual injection capabilities.

#### Key Features
- **Multi-Protocol Support**: SRT, HLS, DASH, RTMP
- **Real-time Injection**: Live SCTE-35 insertion into streams
- **Scheduled Injections**: Time-based injection points with automatic triggering
- **Manual Triggering**: Immediate injection capability for live events
- **Stream Configuration**: Comprehensive stream setup with bitrate, resolution, codec control
- **Health Monitoring**: Real-time stream health and quality metrics

#### Supported Protocols

##### SRT (Secure Reliable Transport)
SRT is a secure, reliable transport protocol for delivering high-quality, low-latency video across unpredictable networks.

**Features:**
- Low latency (typically 1-2 seconds)
- AES encryption
- Packet loss recovery
- Firewall traversal
- Bandwidth adaptation

**Configuration:**
```typescript
const srtConfig = {
  streamType: 'srt',
  inputUrl: 'srt://source:9000?streamid=live/input&latency=100',
  outputUrl: 'srt://destination:9001?streamid=live/output&latency=100',
  bitrate: 5000,
  resolution: '1920x1080',
  codec: 'h264'
};
```

**SRT Parameters:**
- `latency`: Buffer size in milliseconds
- `passphrase`: Encryption key for AES
- `packetfilter`: Stream type filter
- `streamid`: Stream identifier
- `pbkeylen`: Encryption key length (16/24/32 bytes)

##### HLS (HTTP Live Streaming)
HLS is a streaming protocol that works by breaking the overall stream into a sequence of small HTTP-based file downloads.

**Features:**
- Adaptive bitrate streaming
- Wide device compatibility
- CDN-friendly
- Subtitle and metadata support
- Digital rights management

**Configuration:**
```typescript
const hlsConfig = {
  streamType: 'hls',
  inputUrl: 'http://source-server:8080/input.m3u8',
  outputUrl: '/output/stream.m3u8',
  bitrate: 5000,
  resolution: '1920x1080',
  codec: 'h264',
  segmentDuration: 6,
  playlistLength: 10
};
```

##### DASH (Dynamic Adaptive Streaming over HTTP)
DASH is an adaptive bitrate streaming technique that enables high-quality streaming of media content over the Internet.

**Features:**
- Standard-based (ISO/IEC)
- Multiple codec support
- Adaptive bitrate
- Wide device compatibility
- Subtitle and metadata support

**Configuration:**
```typescript
const dashConfig = {
  streamType: 'dash',
  inputUrl: 'http://source-server:8080/input.mp4',
  outputUrl: '/output/stream.mpd',
  bitrate: 5000,
  resolution: '1920x1080',
  codec: 'h264',
  segmentDuration: 2,
  adaptation: 'dash'
};
```

##### RTMP (Real-Time Messaging Protocol)
RTMP is a protocol for streaming audio, video, and data over the Internet.

**Features:**
- Low latency
- Real-time communication
- Wide adoption
- Sub-second latency possible
- AMF message formatting

**Configuration:**
```typescript
const rtmpConfig = {
  streamType: 'rtmp',
  inputUrl: 'rtmp://source-server:1935/live/input',
  outputUrl: 'rtmp://destination-server:1935/live/output',
  bitrate: 5000,
  resolution: '1920x1080',
  codec: 'h264',
  flashVer: 'FMLE/3.0',
  tcUrl: 'rtmp://destination-server:1935/live'
};
```

#### Injection Methods

##### Scheduled Injection
Schedule SCTE-35 injections at specific times during the stream.

**Features:**
- Time-based scheduling
- Automatic triggering
- Multiple injection points
- Activation/deactivation control
- Description and metadata

**Example:**
```typescript
const scheduledInjection = {
  id: 'injection-001',
  time: 30, // 30 seconds from stream start
  scte35Data: '/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM=',
  description: 'Commercial break start',
  active: true
};
```

##### Manual Injection
Trigger SCTE-35 injections immediately for live events and emergency situations.

**Features:**
- Immediate execution
- Live event support
- Emergency alert insertion
- Real-time decision making
- On-demand triggering

**Example:**
```typescript
// Trigger immediate injection
await fetch('/api/stream/inject', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    scte35Data: '/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM='
  })
});
```

### 3. Stream Monitoring

#### Overview
The Stream Monitoring system provides comprehensive real-time monitoring and analytics for streams and SCTE-35 activity. It offers detailed metrics, health monitoring, and activity tracking.

#### Key Features
- **Real-time Metrics**: Input/output bitrate, viewer count, uptime tracking
- **System Health**: CPU, memory, disk, network monitoring
- **Quality Analytics**: Packet loss, latency, connection status
- **Activity Logging**: SCTE-35 event tracking with timestamps
- **Alert System**: Critical issue notifications and warnings
- **Historical Data**: Trend analysis and performance tracking

#### Metrics Dashboard

##### Stream Metrics
- **Input Bitrate**: Real-time input stream bitrate in kbps
- **Output Bitrate**: Real-time output stream bitrate in kbps
- **Viewers**: Current number of active viewers
- **Uptime**: Stream duration in HH:MM:SS format
- **Packet Loss**: Percentage of lost packets
- **Latency**: Stream delay in milliseconds

##### System Health
- **CPU Usage**: Percentage of CPU utilization
- **Memory Usage**: Percentage of memory utilization
- **Disk Usage**: Percentage of disk space used
- **Network Usage**: Percentage of network bandwidth used

##### Quality Metrics
- **Bitrate Efficiency**: Ratio of output to input bitrate
- **Connection Status**: Stream connection stability
- **Error Rate**: Frequency of stream errors
- **Buffer Health**: Stream buffer status

#### Activity Tracking
The system logs all SCTE-35 related activities with detailed information:

**Activity Types:**
- **Injection**: SCTE-35 injection events
- **Detection**: SCTE-35 cue detection in streams
- **Stream Events**: Stream start/stop/error events
- **System Events**: System health and performance events

**Activity Data Structure:**
```typescript
interface SCTE35Activity {
  timestamp: string;
  type: 'injection' | 'detection' | 'stream' | 'system';
  subtype: string;
  data: any;
  description: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}
```

#### Alert System
The monitoring system includes a comprehensive alert system for critical issues:

**Alert Types:**
- **Critical Alerts**: System failures, stream interruption
- **Warning Alerts**: High resource usage, quality degradation
- **Info Alerts**: System events, maintenance notifications

**Alert Conditions:**
- CPU usage > 90%
- Memory usage > 90%
- Disk usage > 90%
- Network usage > 90%
- Packet loss > 5%
- Latency > 1000ms
- Stream interruption
- SCTE-35 injection failures

### 4. User Interface

#### Overview
The user interface provides a modern, responsive web application for controlling SCTE-35 encoding, stream injection, and monitoring. Built with Next.js and shadcn/ui components.

#### Key Features
- **Modern Design**: Clean, professional interface with dark/light theme support
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Real-time Updates**: WebSocket-powered live data updates
- **Intuitive Controls**: Easy-to-use forms and configuration panels
- **Professional Dashboard**: Comprehensive monitoring and analytics
- **Accessibility**: WCAG compliant with keyboard navigation support

#### Interface Components

##### Main Dashboard (`/`)
- Feature overview cards
- Quick access to main functions
- System status summary
- Recent activity highlights

##### Encoder Interface (`/encoder`)
- SCTE-35 parameter configuration
- Command type selection (Splice Insert, Time Signal)
- Real-time encoding with validation
- Output format selection (Base64/Hex)
- Copy/download functionality

##### Stream Injection Interface (`/stream-injection`)
- Stream configuration setup
- Multi-protocol support selection
- Injection point management
- Real-time stream status
- Scheduled injection controls

##### Monitor Interface (`/monitor`)
- Real-time metrics dashboard
- System health monitoring
- Quality analytics display
- Activity logging
- Alert notifications

#### UI Features

##### Real-time Updates
- WebSocket integration for live data
- Automatic refresh of metrics
- Live status indicators
- Real-time activity feeds

##### Responsive Design
- Mobile-first approach
- Adaptive layouts
- Touch-friendly controls
- Optimized for various screen sizes

##### Theme Support
- Light and dark theme options
- System preference detection
- Persistent theme selection
- High contrast mode support

##### Accessibility
- Keyboard navigation
- Screen reader support
- ARIA labels and roles
- Focus management
- Color contrast compliance

### 5. API Infrastructure

#### Overview
The API infrastructure provides a comprehensive set of RESTful endpoints and WebSocket connections for controlling SCTE-35 encoding, stream management, and monitoring.

#### Key Features
- **RESTful API**: Standard HTTP methods and status codes
- **TypeScript Types**: Full type safety for requests and responses
- **Error Handling**: Comprehensive error responses and validation
- **WebSocket Support**: Real-time bidirectional communication
- **Authentication**: API key and token-based security
- **Rate Limiting**: Protection against abuse

#### API Endpoints

##### SCTE-35 Encoding
- `POST /api/scte35/encode` - Encode SCTE-35 data
- `GET /api/scte35/validate` - Validate SCTE-35 data
- `POST /api/scte35/decode` - Decode SCTE-35 data

##### Stream Management
- `POST /api/stream/start` - Start a new stream
- `POST /api/stream/stop` - Stop an active stream
- `GET /api/stream/status` - Get stream status
- `POST /api/stream/inject` - Inject SCTE-35 into stream

##### Monitoring and Metrics
- `GET /api/stream/metrics` - Get stream metrics
- `GET /api/stream/health` - Get system health
- `GET /api/stream/activity` - Get activity log
- `GET /api/stream/alerts` - Get active alerts

##### WebSocket Connection
- `WS /api/stream/ws` - Real-time updates and notifications

#### Data Types

##### Request Types
```typescript
interface EncodeRequest {
  spliceInfo: SpliceInfoSection;
  command: SpliceCommand;
  commandType: string;
}

interface StreamConfig {
  inputUrl: string;
  outputUrl: string;
  streamType: 'srt' | 'hls' | 'dash' | 'rtmp';
  bitrate: number;
  resolution: string;
  codec: string;
}

interface InjectionRequest {
  scte35Data: string;
}
```

##### Response Types
```typescript
interface EncodeResponse {
  base64: string;
  hex: string;
}

interface StreamStatus {
  status: 'stopped' | 'starting' | 'running' | 'error';
  inputBitrate: number;
  outputBitrate: number;
  viewers: number;
  uptime: number;
  lastInjection: string;
  error?: string;
}

interface StreamMetrics {
  inputBitrate: number;
  outputBitrate: number;
  viewers: number;
  uptime: number;
  packetLoss: number;
  latency: number;
}
```

#### WebSocket Messages
```typescript
interface WebSocketMessage {
  type: 'status' | 'metrics' | 'health' | 'activity' | 'alert';
  data: any;
  timestamp: string;
}
```

### 6. Security Features

#### Overview
The system includes comprehensive security features to protect against unauthorized access and ensure data integrity.

#### Key Features
- **API Authentication**: API key and token-based authentication
- **Input Validation**: Comprehensive validation of all input data
- **Rate Limiting**: Protection against API abuse
- **CORS Protection**: Cross-origin resource sharing controls
- **Secure Headers**: Security-focused HTTP headers
- **WebSocket Security**: Secure WebSocket connections with authentication

#### Security Measures

##### Authentication
- API key validation for all API endpoints
- JWT token support for user authentication
- Role-based access control (RBAC)
- Session management with timeout

##### Input Validation
- SCTE-35 data format validation
- Stream URL validation and sanitization
- Parameter type checking and bounds validation
- SQL injection prevention
- XSS attack prevention

##### Rate Limiting
- API endpoint rate limiting
- WebSocket connection limits
- IP-based throttling
- Burst protection

##### Data Protection
- HTTPS encryption for all communications
- Secure storage of sensitive data
- Audit logging for security events
- Regular security updates and patches

### 7. Performance Features

#### Overview
The system is designed for high performance and scalability, with features to handle multiple concurrent streams and real-time processing.

#### Key Features
- **Concurrent Processing**: Multiple stream support
- **Real-time Performance**: Low-latency processing
- **Scalable Architecture**: Horizontal scaling support
- **Memory Management**: Efficient memory usage
- **Caching**: Intelligent caching strategies
- **Load Balancing**: Distribution of processing load

#### Performance Optimizations

##### Concurrent Processing
- Multi-threaded stream processing
- Asynchronous operations
- Non-blocking I/O operations
- Connection pooling

##### Real-time Performance
- Sub-second SCTE-35 injection
- Low-latency WebSocket updates
- Efficient encoding algorithms
- Optimized data structures

##### Scalable Architecture
- Horizontal scaling support
- Microservices-ready design
- Container deployment support
- Cloud-native architecture

##### Memory Management
- Efficient memory allocation
- Garbage collection optimization
- Memory leak prevention
- Resource cleanup

### 8. Deployment Features

#### Overview
The system is designed for easy deployment in various environments, from development to production.

#### Key Features
- **Container Support**: Docker and Kubernetes ready
- **Environment Configuration**: Flexible environment-based configuration
- **Health Checks**: Built-in health monitoring
- **Logging**: Comprehensive logging system
- **Monitoring**: Integration-ready monitoring endpoints
- **Scaling**: Auto-scaling support

#### Deployment Options

##### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

##### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scte35-encoder
spec:
  replicas: 3
  selector:
    matchLabels:
      app: scte35-encoder
  template:
    metadata:
      labels:
        app: scte35-encoder
    spec:
      containers:
      - name: scte35-encoder
        image: scte35-encoder:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

##### Cloud Deployment
- AWS ECS/Fargate support
- Google Cloud Run support
- Azure Container Instances support
- Heroku deployment support

This comprehensive feature documentation provides a detailed overview of all capabilities and technical specifications of the SCTE-35 Encoder & Stream Injector system.