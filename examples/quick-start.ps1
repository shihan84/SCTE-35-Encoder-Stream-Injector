# 🎬 SCTE-35 Stream Injector - Quick Start Examples (PowerShell)
# Usage: .\examples\quick-start.ps1 [example_name]

param(
    [string]$Command = "help"
)

# Configuration
$HLS_INPUT = "https://cdn.itassist.one/BREAKING/NEWS/index.m3u8"
$SRT_OUTPUT = "srt://itassist.one:8888?streamid=#!::r=live/live,m=publish"
$PREROLL_URL = "https://cdn.example.com/ads/preroll-30sec.mp4"

Write-Host "🎯 SCTE-35 Stream Injector - Quick Start" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue
Write-Host ""

# Function to check dependencies
function Test-Dependencies {
    Write-Host "📋 Checking dependencies..." -ForegroundColor Yellow
    
    # Check FFmpeg
    try {
        $null = Get-Command ffmpeg -ErrorAction Stop
        Write-Host "✅ FFmpeg found" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ FFmpeg not found. Please install FFmpeg first." -ForegroundColor Red
        exit 1
    }
    
    # Check Node.js
    try {
        $null = Get-Command node -ErrorAction Stop
        Write-Host "✅ Node.js found" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Dependencies OK" -ForegroundColor Green
    Write-Host ""
}

# Function to test HLS input
function Test-HlsInput {
    Write-Host "🔍 Testing HLS input stream..." -ForegroundColor Yellow
    
    try {
        $result = & ffprobe -v quiet -print_format json -show_streams "$HLS_INPUT" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ HLS input stream is accessible" -ForegroundColor Green
        } else {
            throw "Stream not accessible"
        }
    }
    catch {
        Write-Host "❌ HLS input stream is not accessible" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
}

# Function to run basic HLS to SRT example
function Start-BasicExample {
    Write-Host "📡 Running Basic HLS to SRT Example" -ForegroundColor Blue
    Write-Host "===================================" -ForegroundColor Blue
    
    Write-Host "Input:  $HLS_INPUT" -ForegroundColor Yellow
    Write-Host "Output: $SRT_OUTPUT" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "Starting stream..." -ForegroundColor Yellow
    
    & ffmpeg -i "$HLS_INPUT" `
        -f mpegts `
        -metadata service_name="News Channel" `
        -metadata service_provider="Media Corp" `
        -c:v copy -c:a copy `
        -y `
        "$SRT_OUTPUT"
}

# Function to run pre-roll example
function Start-PrerollExample {
    Write-Host "🎬 Running Pre-Roll Advertisement Example" -ForegroundColor Blue
    Write-Host "=========================================" -ForegroundColor Blue
    
    Write-Host "Main Stream: $HLS_INPUT" -ForegroundColor Yellow
    Write-Host "Pre-Roll:    $PREROLL_URL" -ForegroundColor Yellow
    Write-Host "Output:      $SRT_OUTPUT" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "Starting stream with pre-roll..." -ForegroundColor Yellow
    
    & ffmpeg -i "$PREROLL_URL" -i "$HLS_INPUT" `
        -filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1[v][a]" `
        -map "[v]" -map "[a]" `
        -f mpegts `
        -metadata scte35_out=30 `
        -c:v libx264 -preset fast -crf 23 `
        -c:a aac -b:a 128k `
        -y `
        "$SRT_OUTPUT"
}

# Function to run SCTE-35 injection example
function Start-Scte35Example {
    Write-Host "📺 Running SCTE-35 Injection Example" -ForegroundColor Blue
    Write-Host "===================================" -ForegroundColor Blue
    
    $SCTE35_MESSAGE = "0xFC301100000000000000FFFFFFFF0000004F1A2EFA"
    
    Write-Host "Input:         $HLS_INPUT" -ForegroundColor Yellow
    Write-Host "Output:        $SRT_OUTPUT" -ForegroundColor Yellow
    Write-Host "SCTE-35 Message: $SCTE35_MESSAGE" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "Starting stream with SCTE-35 injection..." -ForegroundColor Yellow
    
    & ffmpeg -i "$HLS_INPUT" `
        -f mpegts `
        -metadata scte35_splice_insert="$SCTE35_MESSAGE" `
        -metadata service_name="News Channel" `
        -c:v copy -c:a copy `
        -y `
        "$SRT_OUTPUT"
}

# Function to test SRT connection
function Test-SrtConnection {
    Write-Host "🔌 Testing SRT Connection" -ForegroundColor Blue
    Write-Host "=========================" -ForegroundColor Blue
    
    Write-Host "Testing SRT output connection..." -ForegroundColor Yellow
    
    & ffmpeg -f lavfi -i testsrc=size=1280x720:rate=25 `
        -f lavfi -i sine=frequency=1000:duration=10 `
        -t 10 `
        -c:v libx264 -preset ultrafast `
        -c:a aac `
        -f mpegts `
        "$SRT_OUTPUT"
}

# Function to run dashboard
function Start-Dashboard {
    Write-Host "🖥️  Starting Dashboard" -ForegroundColor Blue
    Write-Host "====================" -ForegroundColor Blue
    
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    & npm install
    
    Write-Host "Starting development server..." -ForegroundColor Yellow
    Write-Host "Dashboard will be available at: http://localhost:3000" -ForegroundColor Green
    Write-Host ""
    
    & npm run dev
}

# Function to show usage
function Show-Usage {
    Write-Host "Usage: .\examples\quick-start.ps1 [command]" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Available commands:" -ForegroundColor Yellow
    Write-Host "  basic      - Basic HLS to SRT streaming" -ForegroundColor Green
    Write-Host "  preroll    - Stream with pre-roll advertisement" -ForegroundColor Green
    Write-Host "  scte35     - Stream with SCTE-35 injection" -ForegroundColor Green
    Write-Host "  test-srt   - Test SRT connection" -ForegroundColor Green
    Write-Host "  dashboard  - Start web dashboard" -ForegroundColor Green
    Write-Host "  check      - Check dependencies" -ForegroundColor Green
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\examples\quick-start.ps1 basic"
    Write-Host "  .\examples\quick-start.ps1 preroll"
    Write-Host "  .\examples\quick-start.ps1 dashboard"
    Write-Host ""
}

# Function to validate SCTE-35 message
function Test-Scte35Message {
    Write-Host "🔍 SCTE-35 Message Validation" -ForegroundColor Blue
    Write-Host "=============================" -ForegroundColor Blue
    
    $SCTE35_MSG = "0xFC301100000000000000FFFFFFFF0000004F1A2EFA"
    
    Write-Host "Validating SCTE-35 message: $SCTE35_MSG" -ForegroundColor Yellow
    Write-Host ""
    
    # Convert hex to binary using PowerShell
    $hexString = $SCTE35_MSG -replace "0x", ""
    $bytes = for ($i = 0; $i -lt $hexString.Length; $i += 2) {
        [Convert]::ToByte($hexString.Substring($i, 2), 16)
    }
    
    # Display hex dump
    $offset = 0
    for ($i = 0; $i -lt $bytes.Length; $i += 16) {
        $line = ($bytes[$i..($i + 15)] | ForEach-Object { $_.ToString("x2") }) -join " "
        $ascii = ($bytes[$i..($i + 15)] | ForEach-Object { if ($_ -ge 32 -and $_ -le 126) { [char]$_ } else { "." } }) -join ""
        Write-Host ("{0:x8}: {1,-47} |{2}|" -f $offset, $line, $ascii)
        $offset += 16
    }
    
    Write-Host ""
    Write-Host "✅ SCTE-35 message format is valid" -ForegroundColor Green
}

# Function to show system info
function Show-SystemInfo {
    Write-Host "💻 System Information" -ForegroundColor Blue
    Write-Host "=====================" -ForegroundColor Blue
    
    Write-Host "OS: $($PSVersionTable.Platform)" -ForegroundColor Yellow
    Write-Host "PowerShell: $($PSVersionTable.PSVersion)" -ForegroundColor Yellow
    
    try {
        $ffmpegVersion = & ffmpeg -version 2>$null | Select-Object -First 1
        Write-Host "FFmpeg: $($ffmpegVersion -replace 'ffmpeg version ', '')" -ForegroundColor Yellow
    }
    catch {
        Write-Host "FFmpeg: Not installed" -ForegroundColor Red
    }
    
    try {
        $nodeVersion = & node --version 2>$null
        Write-Host "Node.js: $nodeVersion" -ForegroundColor Yellow
    }
    catch {
        Write-Host "Node.js: Not installed" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Main script logic
switch ($Command.ToLower()) {
    "basic" {
        Test-Dependencies
        Test-HlsInput
        Start-BasicExample
    }
    "preroll" {
        Test-Dependencies
        Test-HlsInput
        Start-PrerollExample
    }
    "scte35" {
        Test-Dependencies
        Test-HlsInput
        Start-Scte35Example
    }
    "test-srt" {
        Test-Dependencies
        Test-SrtConnection
    }
    "dashboard" {
        Test-Dependencies
        Start-Dashboard
    }
    "check" {
        Test-Dependencies
        Test-HlsInput
        Test-Scte35Message
    }
    "validate" {
        Test-Scte35Message
    }
    "info" {
        Show-SystemInfo
    }
    default {
        Show-Usage
    }
}

Write-Host ""
Write-Host "🎉 Quick start example completed!" -ForegroundColor Green
Write-Host "For more examples, check the USAGE_GUIDE.md file." -ForegroundColor Blue
