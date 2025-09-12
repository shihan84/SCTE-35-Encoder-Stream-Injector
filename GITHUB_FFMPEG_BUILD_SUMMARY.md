# GitHub FFmpeg SCTE-35 Build - Complete Setup

## 🎯 **What We've Created**

A complete GitHub Actions setup to build FFmpeg with SCTE-35 support, including:

### **📁 Files Created**
- `.github/workflows/build-ffmpeg-simple.yml` - Linux build workflow (recommended)
- `.github/workflows/build-ffmpeg-scte35.yml` - Windows build workflow (advanced)
- `BUILD_FFMPEG_SCTE35.md` - Comprehensive build guide
- `setup-github-ffmpeg-build.ps1` - PowerShell setup script
- `setup-github-ffmpeg-build.sh` - Bash setup script
- `FFMPEG_BUILD_README.md` - Build documentation
- `test-ffmpeg-scte35.ps1` - Test script for Windows
- `test-ffmpeg-scte35.sh` - Test script for Linux
- `check-build-status.ps1` - Status check script
- `deploy-ffmpeg-build.ps1` - Deployment script

## 🚀 **Quick Start Guide**

### **Step 1: Setup Repository**
```powershell
# Run the setup script
.\setup-github-ffmpeg-build.ps1
```

### **Step 2: Commit and Push**
```bash
git add .github/workflows/
git commit -m "Add FFmpeg SCTE-35 build workflows"
git push origin main
```

### **Step 3: Run Build**
1. Go to **GitHub Actions** tab in your repository
2. Enable workflows if prompted
3. Run **"Build FFmpeg with SCTE-35"** workflow
4. Wait for build to complete (~30-60 minutes)

### **Step 4: Download and Test**
1. Download build artifacts from Actions
2. Extract the archive
3. Run test script: `.\test-ffmpeg-scte35.ps1`
4. Deploy if successful: `.\deploy-ffmpeg-build.ps1`

## 🛠️ **Build Features**

### **SCTE-35 Support**
- ✅ `scte35_inject` bitstream filter
- ✅ `scte35ptsadjust` bitstream filter
- ✅ Custom SCTE-35 implementation
- ✅ Base64 data injection support

### **FFmpeg Features**
- ✅ Static build (self-contained)
- ✅ Extensive codec support (H.264, H.265, VP9, AV1, etc.)
- ✅ Streaming protocols (HLS, DASH, SRT, RIST, etc.)
- ✅ GPL license compliance

### **Platform Support**
- ✅ **Linux x64** (Ubuntu, Debian, CentOS, RHEL)
- ✅ **Windows x64** (MSYS2, MinGW)
- ⚠️ **macOS** (requires additional setup)

## 📊 **Build Information**

### **Build Time**
- **Linux:** ~30-60 minutes
- **Windows:** ~60-90 minutes

### **FFmpeg Versions**
- `n6.1.1` (default, recommended)
- `n6.0.1` (stable)
- `n5.1.4` (LTS)
- Custom versions (specify in workflow)

### **Output**
- Static FFmpeg binaries
- `ffmpeg`, `ffprobe`, `ffplay` executables
- SCTE-35 bitstream filters
- Test scripts and documentation

## 🧪 **Testing Your Build**

### **Check SCTE-35 Support**
```bash
# Check if SCTE-35 filters are available
ffmpeg -bsfs | grep -i scte35

# Expected output:
# scte35_inject
# scte35ptsadjust
```

### **Test SCTE-35 Injection**
```bash
# Test SCTE-35 injection
ffmpeg -i input.m3u8 \
  -c:v copy -c:a copy \
  -bsf:v "scte35_inject=inject=base64:/LAiAAAAAAAA///wEAAAAAAAADA5AOAAgAApMuAAAQAACge1ig==" \
  -f srt output.srt
```

### **Test SCTE-35 PTS Adjustment**
```bash
# Test SCTE-35 PTS adjustment
ffmpeg -i input.ts \
  -bsf:v "scte35ptsadjust=pts_offset=1000" \
  -c copy output.ts
```

## 🔧 **Troubleshooting**

### **Common Issues**

1. **Build Fails on Dependencies**
   - Check GitHub Actions logs
   - Verify all required packages are installed
   - Try different FFmpeg version

2. **SCTE-35 Filters Not Found**
   - Check if patches were applied correctly
   - Verify source files were created
   - Check build configuration

3. **Windows Build Issues**
   - Use MSYS2 environment
   - Check MinGW toolchain
   - Verify Windows-specific dependencies

### **Debug Commands**
```bash
# Check FFmpeg configuration
ffmpeg -version

# List all bitstream filters
ffmpeg -bsfs

# Check specific filter help
ffmpeg -h filter=scte35_inject

# Test with verbose output
ffmpeg -v debug -i input.m3u8 -bsf:v "scte35_inject=..." output.srt
```

## 📈 **GitHub Actions Usage**

### **Free Tier Limits**
- **Build Time:** 2000 minutes/month
- **Storage:** 500MB for artifacts
- **Concurrent Jobs:** 20

### **Cost Optimization**
- Use Linux builds (faster, less resource-intensive)
- Build only when needed
- Clean up old artifacts
- Use specific FFmpeg versions

### **Monitoring**
- Check build status in Actions tab
- Monitor build time and resource usage
- Set up notifications for build failures

## 🎉 **Success Indicators**

When your build is successful, you should see:
- ✅ **FFmpeg Version:** Shows custom build info
- ✅ **SCTE-35 Filters:** `scte35_inject` and `scte35ptsadjust` listed in `-bsfs`
- ✅ **Test Commands:** SCTE-35 injection commands work without errors
- ✅ **Release Artifacts:** Downloadable FFmpeg binaries

## 🚀 **Next Steps**

1. **Download** your custom FFmpeg build
2. **Replace** your current FFmpeg installation
3. **Test** SCTE-35 injection with your streams
4. **Integrate** with your SCTE-35 Stream Injector dashboard

## 📞 **Support**

For issues with the build process:
1. Check GitHub Actions logs
2. Verify build dependencies
3. Test with different FFmpeg versions
4. Check the comprehensive build guide

Your custom FFmpeg build will now support SCTE-35 injection! 🎉

---

**Note:** This setup creates a production-ready FFmpeg build with SCTE-35 support that you can use with your SCTE-35 Stream Injector dashboard.
