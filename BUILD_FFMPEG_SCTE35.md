# Building FFmpeg with SCTE-35 Support

This guide explains how to build FFmpeg with SCTE-35 (Society of Cable Telecommunications Engineers) support using GitHub Actions.

## 🎯 **What We're Building**

A custom FFmpeg build that includes:
- `scte35_inject` bitstream filter for injecting SCTE-35 markers
- `scte35ptsadjust` bitstream filter for adjusting PTS/DTS timestamps
- Full FFmpeg functionality with extensive codec support

## 🚀 **GitHub Actions Workflows**

### **1. Simple Linux Build** (Recommended)
- **File:** `.github/workflows/build-ffmpeg-simple.yml`
- **Platform:** Ubuntu Linux
- **Build Time:** ~30-60 minutes
- **Output:** Static FFmpeg binaries with SCTE-35 support

### **2. Windows Build** (Advanced)
- **File:** `.github/workflows/build-ffmpeg-scte35.yml`
- **Platform:** Windows with MSYS2
- **Build Time:** ~60-90 minutes
- **Output:** Windows FFmpeg binaries with SCTE-35 support

## 📋 **How to Use**

### **Step 1: Enable GitHub Actions**
1. Push the workflow files to your repository
2. Go to **Actions** tab in GitHub
3. Enable workflows if prompted

### **Step 2: Trigger Build**
1. **Automatic:** Push to `main` branch
2. **Manual:** Go to Actions → "Build FFmpeg with SCTE-35" → "Run workflow"
3. **Custom Version:** Specify FFmpeg version (default: `n6.1.1`)

### **Step 3: Download Build**
1. Go to **Actions** → Select your workflow run
2. Download **Artifacts** → `ffmpeg-scte35-linux` or `ffmpeg-scte35-windows`
3. Extract the archive

## 🛠️ **Manual Build Instructions**

### **Prerequisites**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y build-essential cmake ninja-build pkg-config yasm nasm
sudo apt-get install -y libx264-dev libx265-dev libvpx-dev libfdk-aac-dev
sudo apt-get install -y libmp3lame-dev libopus-dev libvorbis-dev libtheora-dev
sudo apt-get install -y libwebp-dev libass-dev libfreetype6-dev libfontconfig1-dev
sudo apt-get install -y libfribidi-dev libharfbuzz-dev libxml2-dev zlib1g-dev
sudo apt-get install -y libbz2-dev liblzma-dev libssl-dev libssh-dev
sudo apt-get install -y libbluray-dev libdvdread-dev libdvdnav-dev
# ... (see workflow for complete list)

# Windows (MSYS2)
pacman -S --noconfirm --needed base-devel mingw-w64-x86_64-toolchain
pacman -S --noconfirm --needed mingw-w64-x86_64-cmake mingw-w64-x86_64-ninja
pacman -S --noconfirm --needed mingw-w64-x86_64-pkg-config mingw-w64-x86_64-yasm
# ... (see workflow for complete list)
```

### **Build Steps**
```bash
# 1. Download FFmpeg source
wget https://github.com/FFmpeg/FFmpeg/archive/n6.1.1.zip
unzip n6.1.1.zip
cd FFmpeg-n6.1.1

# 2. Create SCTE-35 patches (see workflow files for details)
mkdir patches
# Create scte35_inject.patch and scte35ptsadjust.patch
# Create scte35_inject_bsf.c and scte35ptsadjust_bsf.c

# 3. Apply patches
patch -p1 < patches/scte35_inject.patch
patch -p1 < patches/scte35ptsadjust.patch

# 4. Configure build
./configure \
  --prefix=/usr/local \
  --enable-gpl \
  --enable-version3 \
  --enable-static \
  --disable-shared \
  --disable-debug \
  --enable-pthreads \
  --enable-iconv \
  --enable-zlib \
  --enable-libxml2 \
  --enable-fontconfig \
  --enable-libharfbuzz \
  --enable-libfreetype \
  --enable-libfribidi \
  --enable-libvorbis \
  --enable-opencl \
  --enable-gmp \
  --enable-lzma \
  --enable-libaom \
  --enable-libaribb24 \
  --enable-avisynth \
  --enable-chromaprint \
  --enable-libdav1d \
  --enable-libdavs2 \
  --enable-libdvdread \
  --enable-libdvdnav \
  --enable-ffnvcodec \
  --enable-cuda-llvm \
  --enable-frei0r \
  --enable-libgme \
  --enable-libkvazaar \
  --enable-libaribcaption \
  --enable-libass \
  --enable-libbluray \
  --enable-libjxl \
  --enable-libmp3lame \
  --enable-libopus \
  --enable-libplacebo \
  --enable-librist \
  --enable-libssh \
  --enable-libtheora \
  --enable-libvpx \
  --enable-libwebp \
  --enable-libzmq \
  --enable-lv2 \
  --enable-libvpl \
  --enable-openal \
  --enable-liboapv \
  --enable-libopencore-amrnb \
  --enable-libopencore-amrwb \
  --enable-libopenh264 \
  --enable-libopenjpeg \
  --enable-libopenmpt \
  --enable-librav1e \
  --enable-librubberband \
  --enable-schannel \
  --enable-sdl2 \
  --enable-libsnappy \
  --enable-libsoxr \
  --enable-libsrt \
  --enable-libsvtav1 \
  --enable-libtwolame \
  --enable-libuavs3d \
  --disable-libdrm \
  --enable-vaapi \
  --enable-libvidstab \
  --enable-libvvenc \
  --enable-whisper \
  --enable-libx264 \
  --enable-libx265 \
  --enable-libxavs2 \
  --enable-libxvid \
  --enable-libzimg \
  --enable-libzvbi

# 5. Build
make -j$(nproc)

# 6. Install
sudo make install
```

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

## 📊 **Build Information**

### **Supported Platforms**
- ✅ **Linux x64** (Ubuntu, Debian, CentOS, RHEL)
- ✅ **Windows x64** (MSYS2, MinGW)
- ⚠️ **macOS** (requires additional setup)

### **FFmpeg Versions**
- `n6.1.1` (default, recommended)
- `n6.0.1` (stable)
- `n5.1.4` (LTS)
- Custom versions (specify in workflow)

### **Build Features**
- **Static Build:** Self-contained binaries
- **GPL License:** Includes GPL-licensed components
- **Extensive Codec Support:** H.264, H.265, VP9, AV1, etc.
- **Streaming Protocols:** HLS, DASH, SRT, RIST, etc.
- **SCTE-35 Support:** Custom bitstream filters

## 🔧 **Troubleshooting**

### **Common Issues**

1. **Build Fails on Dependencies**
   ```bash
   # Solution: Install missing packages
   sudo apt-get update
   sudo apt-get install -y [missing-package]
   ```

2. **SCTE-35 Filters Not Found**
   ```bash
   # Solution: Check if patches were applied correctly
   grep -r "scte35_inject" libavcodec/
   ```

3. **Windows Build Issues**
   ```bash
   # Solution: Use MSYS2 environment
   C:\msys64\usr\bin\bash.exe -lc "your-command"
   ```

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

## 📁 **File Structure**

```
.github/workflows/
├── build-ffmpeg-simple.yml      # Linux build (recommended)
└── build-ffmpeg-scte35.yml      # Windows build (advanced)

BUILD_FFMPEG_SCTE35.md           # This guide
```

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

Your custom FFmpeg build will now support SCTE-35 injection! 🎉
