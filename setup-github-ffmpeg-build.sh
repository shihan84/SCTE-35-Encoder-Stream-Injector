#!/bin/bash

# Setup GitHub Repository for FFmpeg SCTE-35 Build
# This script helps you set up a GitHub repository with the necessary files

echo "========================================"
echo "Setting up GitHub FFmpeg SCTE-35 Build"
echo "========================================"
echo

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please run 'git init' first."
    exit 1
fi

# Create .github/workflows directory if it doesn't exist
mkdir -p .github/workflows

echo "✅ Created .github/workflows directory"

# Check if workflow files exist
if [ -f ".github/workflows/build-ffmpeg-simple.yml" ]; then
    echo "✅ Linux build workflow already exists"
else
    echo "❌ Linux build workflow not found"
fi

if [ -f ".github/workflows/build-ffmpeg-scte35.yml" ]; then
    echo "✅ Windows build workflow already exists"
else
    echo "❌ Windows build workflow not found"
fi

# Create a simple README for the FFmpeg build
cat > FFMPEG_BUILD_README.md << 'EOF'
# FFmpeg SCTE-35 Build Repository

This repository contains GitHub Actions workflows to build FFmpeg with SCTE-35 support.

## Quick Start

1. **Push to GitHub:** Push this repository to GitHub
2. **Enable Actions:** Go to Actions tab and enable workflows
3. **Run Build:** Go to Actions → "Build FFmpeg with SCTE-35" → "Run workflow"
4. **Download:** Download the build artifacts when complete

## Workflows

- **Linux Build:** `.github/workflows/build-ffmpeg-simple.yml` (Recommended)
- **Windows Build:** `.github/workflows/build-ffmpeg-scte35.yml` (Advanced)

## Output

The build will create:
- Static FFmpeg binaries with SCTE-35 support
- `scte35_inject` bitstream filter
- `scte35ptsadjust` bitstream filter
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
EOF

echo "✅ Created FFMPEG_BUILD_README.md"

# Create a simple test script
cat > test-ffmpeg-scte35.sh << 'EOF'
#!/bin/bash

# Test FFmpeg SCTE-35 Build
echo "========================================"
echo "Testing FFmpeg SCTE-35 Build"
echo "========================================"
echo

# Check if ffmpeg exists
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg not found in PATH"
    echo "Please add FFmpeg to your PATH or run from the build directory"
    exit 1
fi

echo "✅ FFmpeg found: $(which ffmpeg)"
echo

# Check FFmpeg version
echo "FFmpeg Version:"
ffmpeg -version | head -n 1
echo

# Check SCTE-35 bitstream filters
echo "Checking SCTE-35 bitstream filters:"
if ffmpeg -bsfs 2>/dev/null | grep -i scte35; then
    echo "✅ SCTE-35 filters found"
else
    echo "❌ SCTE-35 filters not found"
    echo "This FFmpeg build does not include SCTE-35 support"
fi
echo

# Check SCTE-35 help
echo "Checking SCTE-35 help:"
if ffmpeg -h filter=scte35_inject 2>/dev/null | head -n 5; then
    echo "✅ SCTE-35 help available"
else
    echo "❌ SCTE-35 help not available"
fi
echo

# Test SCTE-35 injection (dry run)
echo "Testing SCTE-35 injection (dry run):"
SCTE35_DATA="/LAiAAAAAAAA///wEAAAAAAAADA5AOAAgAApMuAAAQAACge1ig=="
if ffmpeg -f lavfi -i testsrc=duration=1:size=320x240:rate=1 -c:v libx264 -preset ultrafast -bsf:v "scte35_inject=inject=base64:$SCTE35_DATA" -f null - 2>&1 | grep -i "scte35\|error"; then
    echo "✅ SCTE-35 injection test passed"
else
    echo "❌ SCTE-35 injection test failed"
fi
echo

echo "========================================"
echo "Test completed!"
echo "========================================"
EOF

chmod +x test-ffmpeg-scte35.sh
echo "✅ Created test-ffmpeg-scte35.sh"

# Create a simple build status check
cat > check-build-status.sh << 'EOF'
#!/bin/bash

# Check GitHub Actions Build Status
echo "========================================"
echo "Checking GitHub Actions Build Status"
echo "========================================"
echo

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Get repository URL
REPO_URL=$(git remote get-url origin 2>/dev/null)
if [ -z "$REPO_URL" ]; then
    echo "❌ No remote repository configured"
    echo "Please run: git remote add origin <your-github-repo-url>"
    exit 1
fi

echo "✅ Repository: $REPO_URL"
echo

# Check if GitHub Actions are enabled
if [ -d ".github/workflows" ]; then
    echo "✅ GitHub Actions workflows found"
    ls -la .github/workflows/
else
    echo "❌ No GitHub Actions workflows found"
fi
echo

# Check if files are committed
if git status --porcelain | grep -q "\.github/workflows/"; then
    echo "⚠️  GitHub Actions workflows not committed"
    echo "Please run: git add .github/workflows/ && git commit -m 'Add FFmpeg SCTE-35 build workflows'"
else
    echo "✅ GitHub Actions workflows are committed"
fi
echo

# Check if pushed to remote
if git status --porcelain | grep -q "ahead"; then
    echo "⚠️  Local commits not pushed to remote"
    echo "Please run: git push origin main"
else
    echo "✅ All commits are pushed to remote"
fi
echo

echo "========================================"
echo "Next steps:"
echo "1. Go to GitHub Actions tab in your repository"
echo "2. Enable workflows if prompted"
echo "3. Run 'Build FFmpeg with SCTE-35' workflow"
echo "4. Download build artifacts when complete"
echo "========================================"
EOF

chmod +x check-build-status.sh
echo "✅ Created check-build-status.sh"

# Create a simple deployment script
cat > deploy-ffmpeg-build.sh << 'EOF'
#!/bin/bash

# Deploy FFmpeg SCTE-35 Build
echo "========================================"
echo "Deploying FFmpeg SCTE-35 Build"
echo "========================================"
echo

# Check if build artifacts exist
if [ -d "ffmpeg-scte35-release" ]; then
    echo "✅ Build artifacts found"
    
    # Check if ffmpeg binary exists
    if [ -f "ffmpeg-scte35-release/ffmpeg" ]; then
        echo "✅ FFmpeg binary found"
        
        # Test the binary
        echo "Testing FFmpeg binary:"
        ./ffmpeg-scte35-release/ffmpeg -version | head -n 1
        
        # Check SCTE-35 support
        echo "Checking SCTE-35 support:"
        if ./ffmpeg-scte35-release/ffmpeg -bsfs 2>/dev/null | grep -i scte35; then
            echo "✅ SCTE-35 support confirmed"
        else
            echo "❌ SCTE-35 support not found"
        fi
        
        # Ask if user wants to install
        read -p "Do you want to install this FFmpeg build? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # Backup existing ffmpeg
            if command -v ffmpeg &> /dev/null; then
                echo "Backing up existing FFmpeg..."
                sudo mv $(which ffmpeg) $(which ffmpeg).backup
            fi
            
            # Install new ffmpeg
            echo "Installing FFmpeg..."
            sudo cp ffmpeg-scte35-release/ffmpeg /usr/local/bin/
            sudo cp ffmpeg-scte35-release/ffprobe /usr/local/bin/
            sudo cp ffmpeg-scte35-release/ffplay /usr/local/bin/
            
            echo "✅ FFmpeg installed successfully"
            echo "Test with: ffmpeg -bsfs | grep -i scte35"
        fi
    else
        echo "❌ FFmpeg binary not found in build artifacts"
    fi
else
    echo "❌ Build artifacts not found"
    echo "Please run the GitHub Actions build first"
fi
EOF

chmod +x deploy-ffmpeg-build.sh
echo "✅ Created deploy-ffmpeg-build.sh"

echo
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo
echo "Files created:"
echo "✅ FFMPEG_BUILD_README.md - Build documentation"
echo "✅ test-ffmpeg-scte35.sh - Test SCTE-35 support"
echo "✅ check-build-status.sh - Check GitHub Actions status"
echo "✅ deploy-ffmpeg-build.sh - Deploy build artifacts"
echo
echo "Next steps:"
echo "1. git add .github/workflows/"
echo "2. git commit -m 'Add FFmpeg SCTE-35 build workflows'"
echo "3. git push origin main"
echo "4. Go to GitHub Actions tab and run the workflow"
echo "5. Download build artifacts when complete"
echo
echo "For help, run: ./check-build-status.sh"
echo "========================================"
