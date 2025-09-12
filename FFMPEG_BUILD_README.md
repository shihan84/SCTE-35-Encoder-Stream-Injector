# FFmpeg SCTE-35 Build Repository

This repository contains GitHub Actions workflows to build FFmpeg with SCTE-35 support.

## Quick Start

1. **Push to GitHub:** Push this repository to GitHub
2. **Enable Actions:** Go to Actions tab and enable workflows
3. **Run Build:** Go to Actions â†’ "Build FFmpeg with SCTE-35" â†’ "Run workflow"
4. **Download:** Download the build artifacts when complete

## Workflows

- **Linux Build:** .github/workflows/build-ffmpeg-simple.yml (Recommended)
- **Windows Build:** .github/workflows/build-ffmpeg-scte35.yml (Advanced)

## Output

The build will create:
- Static FFmpeg binaries with SCTE-35 support
- scte35_inject bitstream filter
- scte35ptsadjust bitstream filter
- Full FFmpeg functionality

## Usage

```bash
# Test SCTE-35 injection
ffmpeg -i input.m3u8 -c:v copy -c:a copy -bsf:v "scte35_inject=inject=base64:YOUR_SCTE35_DATA" -f srt output.srt

# Test SCTE-35 PTS adjustment
ffmpeg -i input.ts -bsf:v "scte35ptsadjust" -c copy output.ts
```

## Build Time

- Linux: ~30-60 minutes
- Windows: ~60-90 minutes

## Requirements

- GitHub Actions enabled
- Sufficient build time (free tier: 2000 minutes/month)
- Storage for build artifacts (free tier: 500MB)

## Support

For issues with the build process, check:
1. GitHub Actions logs
2. Build dependencies
3. FFmpeg version compatibility
