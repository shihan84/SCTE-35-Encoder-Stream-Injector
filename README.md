# 📺 SCTE-35 Encoder & Stream Injector

A professional web-based solution for creating SCTE-35 cues and injecting them into live video streams. Built with modern web technologies for broadcast and streaming professionals.

## 🎯 Overview

The SCTE-35 Encoder & Stream Injector is a comprehensive system that enables broadcasters and streaming professionals to:

- **Encode SCTE-35 messages** with full parameter control
- **Inject cues into live streams** in real-time
- **Monitor stream health** and performance metrics
- **Support multiple protocols** (SRT, HLS, DASH, RTMP)
- **Manage scheduled injections** with precision timing

## ✨ Key Features

### 🎬 SCTE-35 Encoder
- **Full Command Support**: Splice Insert and Time Signal commands
- **Comprehensive Configuration**: All SCTE-35 parameters and descriptors
- **Multiple Output Formats**: Base64 and Hex encoding
- **Real-time Validation**: Input validation and error handling
- **CRC32 Calculation**: Proper checksum generation

### 🌊 Stream Injection
- **Multi-Protocol Support**: SRT, HLS, DASH, and RTMP
- **Real-time Injection**: Live SCTE-35 cue insertion
- **Scheduled Injections**: Time-based cue scheduling
- **Manual Injection**: Immediate cue injection capability
- **Stream Management**: Start/stop/control stream operations

### 📊 Stream Monitoring
- **Real-time Metrics**: Bitrate, viewers, uptime, packet loss, latency
- **System Health**: CPU, memory, disk, network monitoring
- **Activity Logging**: SCTE-35 injection and detection tracking
- **WebSocket Support**: Live data updates and notifications
- **Alert System**: Configurable alerts for critical issues

### 🎨 Professional UI
- **Responsive Design**: Works on desktop and mobile devices
- **Intuitive Interface**: Easy-to-use tabbed navigation
- **Real-time Updates**: Live data visualization
- **Dark/Light Mode**: Theme support for all environments
- **Accessibility**: WCAG-compliant design

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm 8.x or higher
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shihan84/SCTE-35-Encoder-Stream-Injector.git
   cd SCTE-35-Encoder-Stream-Injector
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Basic Usage

#### Encode SCTE-35 Cue
1. Navigate to the **Encoder** page
2. Configure **Splice Info Section** parameters
3. Select **Command Type** (Splice Insert or Time Signal)
4. Set **Command Parameters** (event ID, timing, duration, etc.)
5. Choose **Output Format** (Base64 or Hex)
6. Click **"Encode SCTE-35"**
7. Copy or download the encoded result

#### Inject into Live Stream
1. Navigate to the **Stream Injection** page
2. Configure **Stream Settings** (input/output URLs, protocol, bitrate)
3. Click **"Start Stream"** to begin streaming
4. Add **Injection Points** with timing and SCTE-35 data
5. Enable **Auto-inject** or use **Manual Injection**
6. Monitor **Stream Status** and injection results

#### Monitor Stream Health
1. Navigate to the **Monitor** page
2. View **Real-time Metrics** for stream performance
3. Check **System Health** for resource usage
4. Monitor **SCTE-35 Activity** for injection events
5. Set up **Alerts** for critical issues

## 🏗️ Architecture

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** for components
- **Framer Motion** for animations
- **Zustand** for state management

### Backend
- **Next.js API Routes** for serverless functions
- **WebSocket** for real-time communication
- **Prisma** ORM for database operations
- **Socket.io** for real-time updates

### Protocols Supported
- **SRT** (Secure Reliable Transport)
- **HLS** (HTTP Live Streaming)
- **DASH** (Dynamic Adaptive Streaming)
- **RTMP** (Real-Time Messaging Protocol)

## 📁 Project Structure

```
src/
├── app/                                      # Next.js App Router
│   ├── page.tsx                             # Main landing page
│   ├── encoder/                             # SCTE-35 encoder page
│   ├── stream-injection/                    # Stream injection page
│   ├── monitor/                             # Stream monitoring page
│   └── api/                                 # API routes
│       ├── scte35/encode/                   # SCTE-35 encoding API
│       └── stream/                          # Stream management APIs
├── components/                              # React components
│   ├── ui/                                 # shadcn/ui components
│   └── stream-injection.tsx               # Stream injection component
├── hooks/                                   # Custom React hooks
└── lib/                                     # Utility functions
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Application
NODE_ENV=development
PORT=3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database"

# Stream Configuration
SRT_INPUT_PORT=9000
SRT_OUTPUT_PORT=9001
RTMP_PORT=1935
HLS_OUTPUT_DIR=/var/www/hls
DASH_OUTPUT_DIR=/var/www/dash

# Security
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key

# Logging
LOG_LEVEL=info
```

### Stream Configuration Examples

#### SRT Stream
```javascript
{
  inputUrl: "srt://localhost:9000?streamid=live/input",
  outputUrl: "srt://localhost:9001?streamid=live/output",
  streamType: "srt",
  bitrate: 5000,
  resolution: "1920x1080",
  codec: "h264"
}
```

#### HLS Stream
```javascript
{
  inputUrl: "http://input-server/live/stream.m3u8",
  outputUrl: "/var/www/hls/output/stream.m3u8",
  streamType: "hls",
  bitrate: 5000,
  resolution: "1920x1080",
  codec: "h264"
}
```

## 📚 Documentation

- **[Deployment Guide](DEPLOYMENT.md)** - Complete deployment instructions
- **[User Manual](USER_MANUAL.md)** - Detailed user documentation
- **[API Reference](USER_MANUAL.md#api-reference)** - API documentation

## 🚀 Deployment

### Development Deployment
```bash
npm install
npm run dev
```

### Production Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment instructions.

### Quick Production Setup
```bash
# Install dependencies
npm install

# Build application
npm run build

# Start with PM2 (recommended)
pm2 start server.ts --name "scte35-encoder"

# Configure PM2 for startup
pm2 startup
pm2 save
```

## 🧪 Testing

Run the comprehensive test suite:
```bash
node test-all-tabs.js
```

This will test all pages, APIs, and functionality to ensure everything is working correctly.

## 🔮 API Usage

### SCTE-35 Encoding
```javascript
const response = await fetch('/api/scte35/encode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    spliceInfo: { /* configuration */ },
    command: { /* command parameters */ },
    commandType: 'splice-insert'
  })
});

const result = await response.json();
console.log(result.base64); // Encoded SCTE-35 data
```

### Stream Management
```javascript
// Start stream
await fetch('/api/stream/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(streamConfig)
});

// Inject SCTE-35
await fetch('/api/stream/inject', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ scte35Data: encodedData })
});
```

### Real-time Updates
```javascript
const ws = new WebSocket('ws://localhost:3000/api/stream/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

## 🎯 Use Cases

### Broadcast Television
- **Advertisement Insertion**: Precise ad break timing
- **Program Scheduling**: Automated program start/end cues
- **Emergency Alerts**: Immediate emergency message insertion
- **Content Rating**: Automatic rating information insertion

### Live Streaming
- **Ad Break Coordination**: Synchronized ad insertion across platforms
- **Content Switching**: Seamless program transitions
- **Metadata Injection**: Real-time metadata updates
- **Quality Monitoring**: Stream health and performance tracking

### Digital Signage
- **Scheduled Content**: Automated content changes
- **Emergency Messaging**: Immediate alert systems
- **Advertising**: Dynamic ad insertion
- **Monitoring**: Remote system health checks

## 🔒 Security Considerations

### Application Security
- **Input Validation**: All user inputs are validated and sanitized
- **Authentication**: JWT-based authentication for protected routes
- **Rate Limiting**: API endpoints are rate-limited to prevent abuse
- **HTTPS**: Secure communication in production environments

### Stream Security
- **Access Control**: Configurable access controls for stream endpoints
- **Encryption**: Support for encrypted SRT streams
- **Authentication**: Stream-level authentication options
- **Monitoring**: Access logging and suspicious activity detection

## 📊 Performance

### System Requirements
- **Minimum**: 2 CPU cores, 4GB RAM, 20GB storage
- **Recommended**: 4+ CPU cores, 8GB+ RAM, 50GB+ SSD
- **Enterprise**: Load balancer, multiple servers, database clustering

### Scalability
- **Horizontal Scaling**: Load balancer with multiple application instances
- **Vertical Scaling**: Increased server resources and optimization
- **Database Scaling**: Read replicas and connection pooling
- **CDN Integration**: Content delivery for static assets and streams

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 🐛 Troubleshooting

### Common Issues

#### Application Won't Start
- Check Node.js version (requires 18.x+)
- Verify all dependencies are installed
- Check port 3000 availability

#### Stream Issues
- Verify input URL accessibility
- Check network connectivity
- Ensure proper port configuration

#### Encoding Problems
- Validate all required fields are filled
- Check SCTE-35 parameter values
- Verify command type matches configuration

### Getting Help

- **Documentation**: Check [USER_MANUAL.md](USER_MANUAL.md)
- **Issues**: [GitHub Issues](https://github.com/shihan84/SCTE-35-Encoder-Stream-Injector/issues)
- **Discussions**: [GitHub Discussions](https://github.com/shihan84/SCTE-35-Encoder-Stream-Injector/discussions)

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **SCTE-35 Standard**: Society of Cable Telecommunications Engineers
- **Next.js Team**: For the excellent React framework
- **shadcn/ui**: For the beautiful component library
- **Contributors**: Everyone who has contributed to this project

## 📞 Contact

For support, questions, or feature requests:
- **GitHub Issues**: [Create an issue](https://github.com/shihan84/SCTE-35-Encoder-Stream-Injector/issues)
- **Email**: [Your support email]
- **Discussions**: [GitHub Discussions](https://github.com/shihan84/SCTE-35-Encoder-Stream-Injector/discussions)

---

Built with ❤️ for the broadcast and streaming community.

**SCTE-35 Encoder & Stream Injector** - Professional tools for professional broadcasters. 🚀📺