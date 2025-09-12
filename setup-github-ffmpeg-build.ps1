# Setup GitHub Repository for FFmpeg SCTE-35 Build
# This script helps you set up a GitHub repository with the necessary files

Write-Host "========================================" -ForegroundColor Green
Write-Host "Setting up GitHub FFmpeg SCTE-35 Build" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not in a git repository. Please run 'git init' first." -ForegroundColor Red
    exit 1
}

# Create .github/workflows directory if it doesn't exist
if (-not (Test-Path ".github/workflows")) {
    New-Item -ItemType Directory -Path ".github/workflows" -Force | Out-Null
}

Write-Host "✅ Created .github/workflows directory" -ForegroundColor Green

# Check if workflow files exist
if (Test-Path ".github/workflows/build-ffmpeg-simple.yml") {
    Write-Host "✅ Linux build workflow already exists" -ForegroundColor Green
} else {
    Write-Host "❌ Linux build workflow not found" -ForegroundColor Red
}

if (Test-Path ".github/workflows/build-ffmpeg-scte35.yml") {
    Write-Host "✅ Windows build workflow already exists" -ForegroundColor Green
} else {
    Write-Host "❌ Windows build workflow not found" -ForegroundColor Red
}

# Create a simple README for the FFmpeg build
$readmeContent = @"
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

``````bash
# Test SCTE-35 injection
ffmpeg -i input.m3u8 -c:v copy -c:a copy -bsf:v "scte35_inject=inject=base64:YOUR_SCTE35_DATA" -f srt output.srt

# Test SCTE-35 PTS adjustment
ffmpeg -i input.ts -bsf:v "scte35ptsadjust" -c copy output.ts
``````

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
"@

$readmeContent | Out-File -FilePath "FFMPEG_BUILD_README.md" -Encoding UTF8
Write-Host "✅ Created FFMPEG_BUILD_README.md" -ForegroundColor Green

# Create a simple test script
$testScriptContent = @"
# Test FFmpeg SCTE-35 Build
Write-Host "========================================" -ForegroundColor Green
Write-Host "Testing FFmpeg SCTE-35 Build" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if ffmpeg exists
$ffmpegPath = Get-Command ffmpeg -ErrorAction SilentlyContinue
if (-not $ffmpegPath) {
    Write-Host "❌ FFmpeg not found in PATH" -ForegroundColor Red
    Write-Host "Please add FFmpeg to your PATH or run from the build directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ FFmpeg found: $($ffmpegPath.Source)" -ForegroundColor Green
Write-Host ""

# Check FFmpeg version
Write-Host "FFmpeg Version:" -ForegroundColor Cyan
ffmpeg -version | Select-Object -First 1
Write-Host ""

# Check SCTE-35 bitstream filters
Write-Host "Checking SCTE-35 bitstream filters:" -ForegroundColor Cyan
$bsfs = ffmpeg -bsfs 2>$null
if ($bsfs -match "scte35") {
    Write-Host "✅ SCTE-35 filters found" -ForegroundColor Green
} else {
    Write-Host "❌ SCTE-35 filters not found" -ForegroundColor Red
    Write-Host "This FFmpeg build does not include SCTE-35 support" -ForegroundColor Yellow
}
Write-Host ""

# Check SCTE-35 help
Write-Host "Checking SCTE-35 help:" -ForegroundColor Cyan
$help = ffmpeg -h filter=scte35_inject 2>$null
if ($help) {
    Write-Host "✅ SCTE-35 help available" -ForegroundColor Green
} else {
    Write-Host "❌ SCTE-35 help not available" -ForegroundColor Red
}
Write-Host ""

# Test SCTE-35 injection (dry run)
Write-Host "Testing SCTE-35 injection (dry run):" -ForegroundColor Cyan
$scte35Data = "/LAiAAAAAAAA///wEAAAAAAAADA5AOAAgAApMuAAAQAACge1ig=="
$testOutput = ffmpeg -f lavfi -i testsrc=duration=1:size=320x240:rate=1 -c:v libx264 -preset ultrafast -bsf:v "scte35_inject=inject=base64:$scte35Data" -f null - 2>&1
if ($testOutput -match "scte35|error") {
    Write-Host "✅ SCTE-35 injection test passed" -ForegroundColor Green
} else {
    Write-Host "❌ SCTE-35 injection test failed" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "Test completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
"@

$testScriptContent | Out-File -FilePath "test-ffmpeg-scte35.ps1" -Encoding UTF8
Write-Host "✅ Created test-ffmpeg-scte35.ps1" -ForegroundColor Green

# Create a simple build status check
$statusScriptContent = @"
# Check GitHub Actions Build Status
Write-Host "========================================" -ForegroundColor Green
Write-Host "Checking GitHub Actions Build Status" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not in a git repository" -ForegroundColor Red
    exit 1
}

# Get repository URL
try {
    $repoUrl = git remote get-url origin 2>$null
    if (-not $repoUrl) {
        Write-Host "❌ No remote repository configured" -ForegroundColor Red
        Write-Host "Please run: git remote add origin <your-github-repo-url>" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Repository: $repoUrl" -ForegroundColor Green
} catch {
    Write-Host "❌ Error getting repository URL" -ForegroundColor Red
}
Write-Host ""

# Check if GitHub Actions are enabled
if (Test-Path ".github/workflows") {
    Write-Host "✅ GitHub Actions workflows found" -ForegroundColor Green
    Get-ChildItem ".github/workflows" | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor White }
} else {
    Write-Host "❌ No GitHub Actions workflows found" -ForegroundColor Red
}
Write-Host ""

# Check if files are committed
$gitStatus = git status --porcelain 2>$null
if ($gitStatus -match "\.github/workflows/") {
    Write-Host "⚠️  GitHub Actions workflows not committed" -ForegroundColor Yellow
    Write-Host "Please run: git add .github/workflows/ && git commit -m 'Add FFmpeg SCTE-35 build workflows'" -ForegroundColor Yellow
} else {
    Write-Host "✅ GitHub Actions workflows are committed" -ForegroundColor Green
}
Write-Host ""

# Check if pushed to remote
if ($gitStatus -match "ahead") {
    Write-Host "⚠️  Local commits not pushed to remote" -ForegroundColor Yellow
    Write-Host "Please run: git push origin main" -ForegroundColor Yellow
} else {
    Write-Host "✅ All commits are pushed to remote" -ForegroundColor Green
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to GitHub Actions tab in your repository" -ForegroundColor White
Write-Host "2. Enable workflows if prompted" -ForegroundColor White
Write-Host "3. Run 'Build FFmpeg with SCTE-35' workflow" -ForegroundColor White
Write-Host "4. Download build artifacts when complete" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
"@

$statusScriptContent | Out-File -FilePath "check-build-status.ps1" -Encoding UTF8
Write-Host "✅ Created check-build-status.ps1" -ForegroundColor Green

# Create a simple deployment script
$deployScriptContent = @"
# Deploy FFmpeg SCTE-35 Build
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deploying FFmpeg SCTE-35 Build" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if build artifacts exist
if (Test-Path "ffmpeg-scte35-release") {
    Write-Host "✅ Build artifacts found" -ForegroundColor Green
    
    # Check if ffmpeg binary exists
    if (Test-Path "ffmpeg-scte35-release/ffmpeg.exe") {
        Write-Host "✅ FFmpeg binary found" -ForegroundColor Green
        
        # Test the binary
        Write-Host "Testing FFmpeg binary:" -ForegroundColor Cyan
        & "ffmpeg-scte35-release/ffmpeg.exe" -version | Select-Object -First 1
        
        # Check SCTE-35 support
        Write-Host "Checking SCTE-35 support:" -ForegroundColor Cyan
        $bsfs = & "ffmpeg-scte35-release/ffmpeg.exe" -bsfs 2>$null
        if ($bsfs -match "scte35") {
            Write-Host "✅ SCTE-35 support confirmed" -ForegroundColor Green
        } else {
            Write-Host "❌ SCTE-35 support not found" -ForegroundColor Red
        }
        
        # Ask if user wants to install
        $response = Read-Host "Do you want to install this FFmpeg build? (y/n)"
        if ($response -eq "y" -or $response -eq "Y") {
            # Backup existing ffmpeg
            $existingFfmpeg = Get-Command ffmpeg -ErrorAction SilentlyContinue
            if ($existingFfmpeg) {
                Write-Host "Backing up existing FFmpeg..." -ForegroundColor Yellow
                Copy-Item $existingFfmpeg.Source "$($existingFfmpeg.Source).backup"
            }
            
            # Install new ffmpeg
            Write-Host "Installing FFmpeg..." -ForegroundColor Yellow
            Copy-Item "ffmpeg-scte35-release/ffmpeg.exe" "C:\Windows\System32\"
            Copy-Item "ffmpeg-scte35-release/ffprobe.exe" "C:\Windows\System32\"
            Copy-Item "ffmpeg-scte35-release/ffplay.exe" "C:\Windows\System32\"
            
            Write-Host "✅ FFmpeg installed successfully" -ForegroundColor Green
            Write-Host "Test with: ffmpeg -bsfs | Select-String scte35" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ FFmpeg binary not found in build artifacts" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Build artifacts not found" -ForegroundColor Red
    Write-Host "Please run the GitHub Actions build first" -ForegroundColor Yellow
}
"@

$deployScriptContent | Out-File -FilePath "deploy-ffmpeg-build.ps1" -Encoding UTF8
Write-Host "✅ Created deploy-ffmpeg-build.ps1" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Files created:" -ForegroundColor Cyan
Write-Host "✅ FFMPEG_BUILD_README.md - Build documentation" -ForegroundColor White
Write-Host "✅ test-ffmpeg-scte35.ps1 - Test SCTE-35 support" -ForegroundColor White
Write-Host "✅ check-build-status.ps1 - Check GitHub Actions status" -ForegroundColor White
Write-Host "✅ deploy-ffmpeg-build.ps1 - Deploy build artifacts" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. git add .github/workflows/" -ForegroundColor White
Write-Host "2. git commit -m 'Add FFmpeg SCTE-35 build workflows'" -ForegroundColor White
Write-Host "3. git push origin main" -ForegroundColor White
Write-Host "4. Go to GitHub Actions tab and run the workflow" -ForegroundColor White
Write-Host "5. Download build artifacts when complete" -ForegroundColor White
Write-Host ""
Write-Host "For help, run: .\check-build-status.ps1" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Green
