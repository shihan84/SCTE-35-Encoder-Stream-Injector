# 🎯 SCTE-35 Stream Injector Usage Guide

## 📋 Quick Start

### Prerequisites
- FFmpeg installed with SCTE-35 support
- Node.js 18+ installed
- Network access to input streams

### Start the Dashboard
```bash
npm install
npm run dev
```
Access: `http://localhost:3000`

## 🎬 HLS Input Examples

### Basic HLS Input
```bash
# Input: HLS stream
https://cdn.itassist.one/BREAKING/NEWS/index.m3u8

# Output: SRT stream  
srt://itassist.one:8888?streamid=#!::r=live/live,m=publish
```

### Live News Stream (Example)
```bash
# BBC News HLS
https://vs-hls-push-ww-live.akamaized.net/x=4/i=urn:bbc:pips:service:bbc_news24/t=3840/v=pv14/b=5070016/main.m3u8

# CNN HLS
https://cnn-cnninternational-1-de.samsung.wurl.com/manifest/playlist.m3u8

# Al Jazeera HLS  
https://live-hls-web-aje.getaj.net/AJE/01.m3u8
```

## 📡 SRT Output Examples

### Basic SRT Output
```bash
# Local SRT output
srt://localhost:8888?mode=listener

# Remote SRT output
srt://stream-server.com:8888?streamid=live/channel1,m=publish

# SRT with authentication
srt://server.com:8888?streamid=#!::r=live/stream,m=publish,user=admin,pass=secret
```

### Professional SRT Configurations
```bash
# Low latency SRT
srt://server.com:8888?streamid=live/low-latency,latency=40,m=publish

# High quality SRT
srt://server.com:8888?streamid=live/hq,bitrate=10000000,m=publish

# Encrypted SRT
srt://server.com:8888?streamid=live/secure,passphrase=mykey123,m=publish
```

## 🎥 Pre-Roll Configuration

### Dashboard Setup
1. Navigate to **Stream Injection** tab
2. Go to **SCTE-35 Tools** section
3. Configure pre-roll settings:

```json
{
  "preRoll": {
    "enabled": true,
    "duration": 30,
    "type": "advertisement",
    "url": "https://cdn.example.com/preroll.mp4"
  }
}
```

### Pre-Roll Types
- **Advertisement**: 15-60 second ads
- **Branding**: 5-15 second logos
- **Announcement**: 10-30 second messages
- **Station ID**: 3-10 second identifiers

## 🛠️ Command Line Usage

### Basic SCTE-35 Injection
```bash
ffmpeg -i "https://cdn.itassist.one/BREAKING/NEWS/index.m3u8" \
  -f mpegts \
  -metadata service_name="News Channel" \
  -metadata service_provider="Media Corp" \
  -c:v copy -c:a copy \
  -f mpegts "srt://itassist.one:8888?streamid=#!::r=live/live,m=publish"
```

### Advanced SCTE-35 with Pre-Roll
```bash
ffmpeg -i "https://input-stream.m3u8" \
  -i "preroll.mp4" \
  -filter_complex "[1:v][1:a][0:v][0:a]concat=n=2:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" \
  -f mpegts \
  -metadata scte35_out=30 \
  -c:v libx264 -preset fast -crf 23 \
  -c:a aac -b:a 128k \
  "srt://server.com:8888?streamid=live/preroll,m=publish"
```

### SCTE-35 Splice Insert
```bash
ffmpeg -i "input.m3u8" \
  -f mpegts \
  -metadata scte35_splice_insert="0xFC301100000000000000FFFFFFFF0000004F1A2EFA" \
  -c:v copy -c:a copy \
  "srt://output.com:8888?streamid=live/splice,m=publish"
```

## 🎛️ Dashboard Usage

### Stream Setup Tab
1. **Input URL**: Enter HLS stream URL
2. **Output URL**: Configure SRT destination
3. **Stream Quality**: Select resolution/bitrate
4. **Audio Settings**: Configure audio encoding

### SCTE-35 Tools Tab
1. **Message Builder**: Create custom SCTE-35 messages
2. **Cue Types**: Select splice insert, time signal, etc.
3. **Timing**: Set precise injection timing
4. **Validation**: Test message format

### Injection Points Tab
1. **Add Point**: Set time-based injection points
2. **Pre-Roll Setup**: Configure pre-roll content
3. **Duration**: Set ad break duration
4. **Monitoring**: Real-time injection status

## 📊 API Usage

### Start Stream with Pre-Roll
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
    },
    "quality": "1080p"
  }'
```

### Inject SCTE-35 Message
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

## 🔧 Advanced Configuration

### Custom SCTE-35 Messages
```json
{
  "spliceInsert": {
    "spliceEventId": 123456,
    "outOfNetworkIndicator": true,
    "spliceImmediateFlag": false,
    "breakDuration": 30000,
    "uniqueProgramId": 1
  }
}
```

### Quality Presets
```json
{
  "1080p": {
    "video": "-c:v libx264 -preset fast -crf 23 -s 1920x1080",
    "audio": "-c:a aac -b:a 128k -ar 48000"
  },
  "720p": {
    "video": "-c:v libx264 -preset fast -crf 25 -s 1280x720", 
    "audio": "-c:a aac -b:a 96k -ar 48000"
  }
}
```

## 📱 Mobile/Remote Access

### Secure Remote Access
```bash
# SSH tunnel for secure access
ssh -L 3000:localhost:3000 user@server.com

# Then access: http://localhost:3000
```

### HTTPS Configuration
```javascript
// next.config.js
module.exports = {
  server: {
    https: {
      key: './ssl/private.key',
      cert: './ssl/certificate.crt'
    }
  }
}
```

## 🚨 Troubleshooting

### Common Issues
1. **Stream not starting**: Check FFmpeg installation
2. **SCTE-35 not injecting**: Verify message format
3. **Pre-roll not playing**: Check media file accessibility
4. **SRT connection failed**: Verify firewall/network settings

### Debug Commands
```bash
# Test HLS input
ffprobe "https://cdn.itassist.one/BREAKING/NEWS/index.m3u8"

# Test SRT output
ffmpeg -f lavfi -i testsrc=size=1280x720:rate=25 -t 10 \
  -c:v libx264 -f mpegts \
  "srt://server.com:8888?streamid=test,m=publish"

# Validate SCTE-35 message
echo "0xFC301100000000000000FFFFFFFF0000004F1A2EFA" | xxd -r -p | hexdump -C
```

## 📈 Performance Optimization

### Hardware Acceleration
```bash
# NVIDIA GPU acceleration
ffmpeg -hwaccel cuda -i "input.m3u8" \
  -c:v h264_nvenc -preset fast \
  -c:a copy \
  "srt://output.com:8888?streamid=live,m=publish"

# Intel Quick Sync
ffmpeg -hwaccel qsv -i "input.m3u8" \
  -c:v h264_qsv -preset fast \
  -c:a copy \
  "srt://output.com:8888?streamid=live,m=publish"
```

### Network Optimization
```bash
# Low latency settings
ffmpeg -i "input.m3u8" \
  -tune zerolatency -preset ultrafast \
  -f mpegts \
  "srt://server.com:8888?latency=40&streamid=live,m=publish"
```

## 📞 Support

### Getting Help
- **Documentation**: Check `/docs` folder
- **Issues**: Report on GitHub
- **Discord**: Join community server
- **Email**: support@example.com

### Version Information
- **Current Version**: 1.0.0
- **FFmpeg Required**: 4.4+
- **Node.js Required**: 18+
- **Browser Support**: Chrome 90+, Firefox 88+

---

*For more advanced configurations and enterprise features, contact our support team.*
