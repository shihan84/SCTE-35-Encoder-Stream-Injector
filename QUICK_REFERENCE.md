# SCTE-35 Stream Injector - Quick Reference

## 🚀 Quick Start (30s Pre-roll Example)

### 1. Start Application
```bash
npm run dev
# Open: http://localhost:3000
```

### 2. Stream Setup
- **Input**: `https://cdn.itassist.one/BREAKING/NEWS/index.m3u8`
- **Output**: `srt://itassist.one:8888?streamid=#!::r=live/live,m=publish`
- **Type**: HLS → SRT
- **Pre-roll**: 30 seconds

### 3. Generate SCTE-35
- **Cue Type**: Splice Insert
- **Event ID**: 12345
- **Duration**: 30s
- **Format**: Base64

### 4. Inject & Monitor
- Add injection point at time 0
- Start stream processing
- Monitor in Live Monitor tab

## 📋 Common SCTE-35 Cue Types

| Type | Use Case | Duration |
|------|----------|----------|
| **Splice Insert** | Ad breaks, pre-roll | 30s, 60s, 120s |
| **Time Signal** | Program boundaries | N/A |
| **Segmentation** | Chapter markers | Variable |

## 🔧 FFmpeg Commands

### Basic HLS to SRT
```bash
ffmpeg -i "input.m3u8" -c copy -f srt "srt://output:8888"
```

### With SCTE-35 Injection
```bash
ffmpeg -i "input.m3u8" -c copy -bsf:v "scte35_inject=inject=base64:DATA" -f srt "srt://output:8888"
```

## 📊 Monitoring Endpoints

- **Health**: `/api/health`
- **Time Sync**: `/api/time/sync`
- **Stream Status**: Live Monitor tab
- **System Metrics**: Advanced Dashboard

## ⚡ Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Stream won't start | Check FFmpeg installation |
| SCTE-35 not detected | Verify Base64 format |
| Connection failed | Check input/output URLs |
| Performance issues | Monitor Advanced Dashboard |

## 🎯 Best Practices

1. **Test with short durations first** (5-10s)
2. **Monitor system resources** during processing
3. **Use proper SCTE-35 timing** (PTS-based)
4. **Verify output stream** before going live
5. **Keep logs** for debugging

---
**Need more help?** See `SCTE35_USAGE_GUIDE.md` for detailed instructions.
