# SCTE-35 Encoder & Stream Injector

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)

A professional SCTE-35 encoder and real-time stream injection system for digital video broadcasting. Built with Next.js, TypeScript, and modern web technologies.

## 🚀 Features

### SCTE-35 Encoder
- **Full SCTE-35 Compliance**: Complete implementation of SCTE-35 standard
- **Multiple Command Types**: Splice Insert, Time Signal, and more
- **Flexible Configuration**: Comprehensive parameter control
- **Multiple Output Formats**: Base64 and Hex encoding
- **Real-time Encoding**: Instant encoding with validation

### Stream Injection
- **Multi-Protocol Support**: SRT, HLS, DASH, and RTMP
- **Real-time Injection**: Live SCTE-35 insertion into streams
- **Scheduled Injections**: Time-based injection points
- **Manual Triggering**: Immediate injection capability
- **Stream Configuration**: Bitrate, resolution, codec control

### Monitoring & Analytics
- **Real-time Metrics**: Bitrate, viewers, uptime tracking
- **System Health**: CPU, memory, disk, network monitoring
- **Quality Analytics**: Packet loss, latency measurements
- **Activity Logging**: SCTE-35 event tracking
- **Alert System**: Critical issue notifications

### User Interface
- **Modern Web Interface**: Built with Next.js and shadcn/ui
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: WebSocket-powered live data
- **Professional Dashboard**: Comprehensive monitoring tools
- **Intuitive Controls**: Easy-to-use configuration panels

## 🎯 Use Cases

### Digital Broadcasting
- **Ad Insertion**: Precise commercial break scheduling
- **Program Scheduling**: Automated content switching
- **Emergency Alerts**: Real-time emergency message insertion
- **Regional Content**: Location-based content delivery

### Streaming Platforms
- **Live Events**: Real-time SCTE-35 cue injection
- **VOD Streaming**: Pre-recorded content with ad markers
- **Multi-bitrate Streams**: Adaptive bitrate streaming support
- **CDN Integration**: Content delivery network optimization

### Broadcast Automation
- **Automated Playout**: Schedule-based content delivery
- **Compliance**: Regulatory requirement fulfillment
- **Analytics**: Viewer behavior and engagement tracking
- **Quality Control**: Stream health monitoring

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- FFmpeg (for stream processing - optional)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/scte35-encoder.git
   cd scte35-encoder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   # Add other environment variables as needed
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Deployment

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 📖 Documentation

### Core Components

#### SCTE-35 Encoder (`/encoder`)
The encoder provides a comprehensive interface for creating SCTE-35 messages:

- **Splice Insert**: Create ad insertion and program switching cues
- **Time Signal**: Generate timing-based commands
- **Configuration**: Full parameter control including PTS, duration, and descriptors
- **Output**: Base64 or Hex format with copy/download functionality

#### Stream Injection (`/stream-injection`)
Real-time SCTE-35 injection into live streams:

- **Stream Configuration**: Set up input/output streams with various protocols
- **Injection Points**: Schedule or manually trigger SCTE-35 insertion
- **Protocol Support**: SRT, HLS, DASH, RTMP
- **Monitoring**: Real-time stream status and health

#### Stream Monitor (`/monitor`)
Comprehensive monitoring and analytics:

- **Metrics**: Real-time bitrate, viewer count, uptime
- **Health**: System resource monitoring
- **Quality**: Packet loss, latency tracking
- **Activity**: SCTE-35 event logging

### API Reference

#### SCTE-35 Encoding API
```typescript
POST /api/scte35/encode
Content-Type: application/json

{
  "spliceInfo": {
    "tableId": 252,
    "protocolVersion": 0,
    "ptsAdjustment": 0,
    "cwIndex": 255,
    "tier": 4095,
    "spliceCommandType": 5
  },
  "command": {
    "spliceEventId": 1,
    "spliceEventCancelIndicator": false,
    "outOfNetworkIndicator": false,
    "programSpliceFlag": true,
    "durationFlag": false,
    "spliceImmediateFlag": false,
    "uniqueProgramId": 1,
    "available": 0,
    "expected": 0,
    "spliceTimeSpecified": true,
    "spliceTimePts": 0
  },
  "commandType": "splice-insert"
}
```

#### Stream Control APIs

**Start Stream**
```typescript
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

**Inject SCTE-35**
```typescript
POST /api/stream/inject
Content-Type: application/json

{
  "scte35Data": "/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM="
}
```

## 🎮 Usage Examples

### Basic SCTE-35 Encoding
```typescript
// Create a simple ad insertion cue
const scte35Data = await fetch('/api/scte35/encode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    spliceInfo: {
      tableId: 252,
      protocolVersion: 0,
      ptsAdjustment: 0,
      cwIndex: 255,
      tier: 4095,
      spliceCommandType: 5
    },
    command: {
      spliceEventId: 1,
      spliceEventCancelIndicator: false,
      outOfNetworkIndicator: true,
      programSpliceFlag: true,
      durationFlag: true,
      spliceImmediateFlag: false,
      breakDuration: 1800000, // 30 seconds in 90kHz units
      uniqueProgramId: 1,
      available: 0,
      expected: 0,
      spliceTimeSpecified: true,
      spliceTimePts: 86400000 // 1 second in 90kHz units
    },
    commandType: 'splice-insert'
  })
});

const result = await scte35Data.json();
console.log('Encoded SCTE-35:', result.base64);
```

### Stream Injection Setup
```typescript
// Start a stream with SCTE-35 injection
const streamConfig = {
  inputUrl: "srt://source-server:9000?streamid=live/input",
  outputUrl: "srt://output-server:9001?streamid=live/output",
  streamType: "srt" as const,
  bitrate: 5000,
  resolution: "1920x1080",
  codec: "h264"
};

// Start the stream
await fetch('/api/stream/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(streamConfig)
});

// Schedule an injection point
const injectionData = {
  time: 30, // 30 seconds from start
  scte35Data: result.base64,
  description: "Commercial break start",
  active: true
};

// Inject immediately
await fetch('/api/stream/inject', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ scte35Data: result.base64 })
});
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the project root:

```env
# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development

# Stream Configuration (Optional)
FFMPEG_PATH=/usr/local/bin/ffmpeg
SRT_LAUNCHER_PATH=/usr/local/bin/srt-live-transmit

# Monitoring Configuration
METRICS_INTERVAL=1000
HEALTH_CHECK_INTERVAL=5000

# Security (Optional)
API_KEY=your-api-key-here
CORS_ORIGIN=http://localhost:3000
```

### Stream Protocol Support

#### SRT (Secure Reliable Transport)
```typescript
const srtConfig = {
  streamType: 'srt',
  inputUrl: 'srt://source:9000?streamid=live/input&latency=100',
  outputUrl: 'srt://destination:9001?streamid=live/output&latency=100',
  // Additional SRT parameters
  passphrase: 'your-encryption-key', // Optional encryption
  packetfilter: 'mpegts' // Stream type
};
```

#### HLS (HTTP Live Streaming)
```typescript
const hlsConfig = {
  streamType: 'hls',
  inputUrl: 'http://source-server:8080/input.m3u8',
  outputUrl: '/output/stream.m3u8',
  // HLS-specific settings
  segmentDuration: 6,
  playlistLength: 10
};
```

#### DASH (Dynamic Adaptive Streaming)
```typescript
const dashConfig = {
  streamType: 'dash',
  inputUrl: 'http://source-server:8080/input.mp4',
  outputUrl: '/output/stream.mpd',
  // DASH-specific settings
  segmentDuration: 2,
  adaptation: 'dash'
};
```

#### RTMP (Real-Time Messaging Protocol)
```typescript
const rtmpConfig = {
  streamType: 'rtmp',
  inputUrl: 'rtmp://source-server:1935/live/input',
  outputUrl: 'rtmp://destination-server:1935/live/output',
  // RTMP-specific settings
  flashVer: 'FMLE/3.0',
  tcUrl: 'rtmp://destination-server:1935/live'
};
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### End-to-End Tests
```bash
npm run test:e2e
```

### Linting
```bash
npm run lint
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow ESLint configuration
- Add JSDoc comments for public APIs
- Write tests for new features

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [SCTE-35 Standard](https://www.scte.org/SCTE35/) for the specification
- [Next.js](https://nextjs.org/) for the amazing React framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

## 📞 Support

- **Documentation**: Check our [Wiki](https://github.com/your-username/scte35-encoder/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/scte35-encoder/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/scte35-encoder/discussions)
- **Email**: support@example.com

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=your-username/scte35-encoder&type=Date)](https://star-history.com/#your-username/scte35-encoder&Date)

---

Built with ❤️ for the broadcasting community