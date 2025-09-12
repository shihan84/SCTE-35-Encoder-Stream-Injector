# 🎬 SCTE-35 Stream Injector

A professional-grade SCTE-35 stream injection system with real-time monitoring, pre-roll support, and enterprise features for broadcast and streaming applications.

## ✨ Features

- **🎯 SCTE-35 Injection**: Real-time SCTE-35 message injection into live streams
- **📡 HLS to SRT**: Convert HLS input streams to SRT output with SCTE-35 support
- **🎬 Pre-Roll Support**: Seamless pre-roll advertisement integration
- **⏰ Time Synchronization**: NTP-based time sync for precise injection timing
- **📊 Visual Timeline**: Real-time event monitoring and timeline visualization
- **🖥️ Professional Dashboard**: Modern web interface for stream management
- **🔧 FFmpeg Integration**: Advanced FFmpeg command builder and execution
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **FFmpeg** with SCTE-35 support
- **Windows 10/11**, **macOS 10.15+**, or **Linux Ubuntu 20.04+**

### Installation

   ```bash
# Clone the repository
git clone https://github.com/shihan84/scte-final.git
cd scte-final

# Install dependencies
   npm install

# Start the development server
   npm run dev
   ```

Visit `http://localhost:3000` to access the dashboard.

### Quick Test

```bash
# Linux/macOS
./examples/quick-start.sh check

# Windows PowerShell
.\examples\quick-start.ps1 check
```

## 📖 Usage

### Basic HLS to SRT Streaming

```bash
ffmpeg -i "https://cdn.itassist.one/BREAKING/NEWS/index.m3u8" \
  -f mpegts \
  -metadata service_name="News Channel" \
  -c:v copy -c:a copy \
  "srt://itassist.one:8888?streamid=#!::r=live/live,m=publish"
```

### Pre-Roll Advertisement

```bash
ffmpeg -i "preroll.mp4" -i "main-stream.m3u8" \
  -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -f mpegts -metadata scte35_out=30 \
  -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k \
  "srt://server.com:8888?streamid=live/preroll,m=publish"
```

### SCTE-35 Injection

```bash
ffmpeg -i "input.m3u8" \
  -f mpegts \
  -metadata scte35_splice_insert="0xFC301100000000000000FFFFFFFF0000004F1A2EFA" \
  -c:v copy -c:a copy \
  "srt://output.com:8888?streamid=live/splice,m=publish"
```

## 🎛️ Dashboard Features

### Stream Setup
- **Input Configuration**: HLS stream URL setup
- **Output Configuration**: SRT destination configuration
- **Quality Settings**: Resolution and bitrate selection
- **Audio Settings**: Audio encoding configuration

### SCTE-35 Tools
- **Message Builder**: Create custom SCTE-35 messages
- **Cue Types**: Splice insert, time signal, and more
- **Timing Control**: Precise injection timing
- **Validation**: Message format verification

### Injection Points
- **Time-based Injection**: Schedule injection points
- **Pre-Roll Setup**: Configure pre-roll content
- **Duration Control**: Set ad break duration
- **Real-time Monitoring**: Live injection status

### Live Monitor
- **Stream Status**: Real-time stream health
- **Performance Metrics**: Latency, bitrate, quality
- **Error Tracking**: Connection and encoding errors
- **Timeline Visualization**: Event timeline with zoom controls

### Advanced Features
- **FFmpeg Command Builder**: Visual command construction
- **Time Synchronization**: NTP-based time sync
- **Hardware Acceleration**: GPU acceleration support
- **Multi-Quality Output**: Adaptive bitrate streaming

## 🔧 API Usage

### Start Stream

```bash
curl -X POST http://localhost:3000/api/stream/start \
  -H "Content-Type: application/json" \
  -d '{
    "input": "https://cdn.itassist.one/BREAKING/NEWS/index.m3u8",
    "output": "srt://itassist.one:8888?streamid=#!::r=live/live,m=publish",
    "preRoll": {
      "enabled": true,
      "url": "https://cdn.example.com/ad.mp4",
      "duration": 30
    }
  }'
```

### Inject SCTE-35

```bash
curl -X POST http://localhost:3000/api/stream/inject \
  -H "Content-Type: application/json" \
  -d '{
    "message": "0xFC301100000000000000FFFFFFFF0000004F1A2EFA",
    "timestamp": "2024-09-10T12:00:00Z",
    "duration": 30
  }'
```

### Get Stream Status

```bash
curl http://localhost:3000/api/stream/status
```

## 📚 Configuration Examples

See `examples/hls-to-srt-preroll.json` for comprehensive configuration examples including:

- Basic HLS to SRT streaming
- Pre-roll advertisement setup
- Live news with ad insertion
- Sports with highlights
- Educational content with chapters
- Multi-quality adaptive streaming

## 🛠️ Development

### Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── stream-injection/  # Main dashboard
│   ├── scte35-tools/     # SCTE-35 tools
│   └── monitor/          # Stream monitoring
├── components/            # React components
│   ├── time-sync-clock.tsx
│   ├── timeline-monitor.tsx
│   └── ffmpeg-command-builder.tsx
└── lib/                  # Utility functions
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 🔒 Security

- **Input Validation**: All inputs are validated and sanitized
- **Command Injection Protection**: FFmpeg commands are safely constructed
- **Rate Limiting**: API endpoints have rate limiting
- **CORS Configuration**: Proper CORS headers for cross-origin requests

## 📊 Performance

- **Hardware Acceleration**: NVIDIA CUDA, Intel Quick Sync support
- **Low Latency**: Optimized for real-time streaming
- **Memory Efficient**: Stream processing with minimal memory usage
- **Scalable**: Supports multiple concurrent streams

## 🐛 Troubleshooting

### Common Issues

1. **Stream not starting**: Check FFmpeg installation and stream URL accessibility
2. **SCTE-35 not injecting**: Verify message format and stream compatibility
3. **Pre-roll not playing**: Ensure media file is accessible and properly formatted
4. **SRT connection failed**: Check network connectivity and firewall settings

### Debug Commands

```bash
# Test HLS input
ffprobe "https://cdn.itassist.one/BREAKING/NEWS/index.m3u8"

# Test SRT output
ffmpeg -f lavfi -i testsrc=size=1280x720:rate=25 -t 10 \
  -c:v libx264 -f mpegts "srt://server.com:8888?streamid=test,m=publish"

# Validate SCTE-35 message
echo "0xFC301100000000000000FFFFFFFF0000004F1A2EFA" | xxd -r -p | hexdump -C
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **Documentation**: Check the [USAGE_GUIDE.md](USAGE_GUIDE.md) for detailed instructions
- **Issues**: Report bugs and request features on [GitHub Issues](https://github.com/shihan84/scte-final/issues)
- **Discussions**: Join community discussions on [GitHub Discussions](https://github.com/shihan84/scte-final/discussions)

## 🙏 Acknowledgments

- **FFmpeg** for multimedia processing capabilities
- **Next.js** for the React framework
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **SuperKabuki** for SCTE-35 FFmpeg patches

---

**Made with ❤️ for the broadcast and streaming community**