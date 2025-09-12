# SCTE-35 FFmpeg Test Commands
# Complete manual testing commands with your FFmpeg path

Write-Host "========================================" -ForegroundColor Green
Write-Host "SCTE-35 Stream Injection - Manual Test" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Set FFmpeg path
$ffmpegPath = "E:\NEW DOWNLOADS\ffmpeg-N-120864-g9a34ddc345-win64-gpl\ffmpeg-N-120864-g9a34ddc345-win64-gpl\bin\ffmpeg.exe"

# SCTE-35 Base64 data for 30-second CUE-OUT
$scte35Base64 = "/LAiAAAAAAAA///wEAAAAAAAADA5AOAAgAApMuAAAQAACge1ig=="

Write-Host "FFmpeg Path: $ffmpegPath" -ForegroundColor Yellow
Write-Host "SCTE-35 Base64: $scte35Base64" -ForegroundColor Yellow
Write-Host ""

# Check if FFmpeg exists
if (Test-Path $ffmpegPath) {
    Write-Host "✅ FFmpeg found at specified path" -ForegroundColor Green
} else {
    Write-Host "❌ FFmpeg not found at: $ffmpegPath" -ForegroundColor Red
    Write-Host "Please verify the path is correct" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COMMAND 1: HLS to SRT with SCTE-35" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Input: HLS Stream (https://cdn.itassist.one/BREAKING/NEWS/index.m3u8)" -ForegroundColor White
Write-Host "Output: SRT Stream (srt://itassist.one:8888)" -ForegroundColor White
Write-Host "SCTE-35: 30-second CUE-OUT marker" -ForegroundColor White
Write-Host ""

$command1 = @"
& "$ffmpegPath" -i "https://cdn.itassist.one/BREAKING/NEWS/index.m3u8" `
  -c:v copy -c:a copy `
  -bsf:v "scte35_inject=inject=base64:$scte35Base64" `
  -f srt "srt://itassist.one:8888?streamid=#!::r=live/live,m=publish"
"@

Write-Host "Command 1:" -ForegroundColor Yellow
Write-Host $command1 -ForegroundColor White
Write-Host ""

$runCommand1 = Read-Host "Run Command 1? (y/n)"
if ($runCommand1 -eq "y" -or $runCommand1 -eq "Y") {
    Write-Host "Running Command 1..." -ForegroundColor Green
    try {
        Invoke-Expression $command1
        Write-Host "✅ Command 1 completed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Command 1 failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COMMAND 2: Test Stream Generation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating 60-second test stream with SCTE-35 injection" -ForegroundColor White
Write-Host "Output: test-scte35-output.ts" -ForegroundColor White
Write-Host ""

$command2 = @"
& "$ffmpegPath" -f lavfi -i testsrc=duration=60:size=1280x720:rate=30 `
  -f lavfi -i sine=frequency=1000:duration=60 `
  -c:v libx264 -preset ultrafast `
  -c:a aac -b:a 128k `
  -bsf:v "scte35_inject=inject=base64:$scte35Base64" `
  -f mpegts test-scte35-output.ts
"@

Write-Host "Command 2:" -ForegroundColor Yellow
Write-Host $command2 -ForegroundColor White
Write-Host ""

$runCommand2 = Read-Host "Run Command 2? (y/n)"
if ($runCommand2 -eq "y" -or $runCommand2 -eq "Y") {
    Write-Host "Running Command 2..." -ForegroundColor Green
    try {
        Invoke-Expression $command2
        Write-Host "✅ Command 2 completed successfully" -ForegroundColor Green
        Write-Host "Test file created: test-scte35-output.ts" -ForegroundColor Green
    } catch {
        Write-Host "❌ Command 2 failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COMMAND 3: Live Stream with SCTE-35" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Creating live stream with SCTE-35 injection" -ForegroundColor White
Write-Host "Output: UDP stream on udp://127.0.0.1:1234" -ForegroundColor White
Write-Host "Duration: 5 minutes" -ForegroundColor White
Write-Host ""

$command3 = @"
& "$ffmpegPath" -f lavfi -i testsrc=duration=300:size=1920x1080:rate=30 `
  -f lavfi -i sine=frequency=1000:duration=300 `
  -c:v libx264 -preset ultrafast -tune zerolatency -g 30 `
  -c:a aac -b:a 128k `
  -bsf:v "scte35_inject=inject=base64:$scte35Base64" `
  -f mpegts udp://127.0.0.1:1234
"@

Write-Host "Command 3:" -ForegroundColor Yellow
Write-Host $command3 -ForegroundColor White
Write-Host ""

$runCommand3 = Read-Host "Run Command 3? (y/n)"
if ($runCommand3 -eq "y" -or $runCommand3 -eq "Y") {
    Write-Host "Running Command 3..." -ForegroundColor Green
    Write-Host "Live stream will be available at: udp://127.0.0.1:1234" -ForegroundColor Yellow
    Write-Host "Use VLC or ffplay to view the stream" -ForegroundColor Yellow
    Write-Host ""
    try {
        Invoke-Expression $command3
        Write-Host "✅ Command 3 completed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Command 3 failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Manual Testing Complete" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "- SCTE-35 Base64: $scte35Base64" -ForegroundColor White
Write-Host "- FFmpeg Path: $ffmpegPath" -ForegroundColor White
Write-Host "- Commands tested: HLS to SRT, Test Stream, Live Stream" -ForegroundColor White
Write-Host ""
Write-Host "To view streams:" -ForegroundColor Yellow
Write-Host "- VLC: Media > Open Network Stream > udp://127.0.0.1:1234" -ForegroundColor White
Write-Host "- ffplay: ffplay udp://127.0.0.1:1234" -ForegroundColor White
Write-Host "- Test file: ffplay test-scte35-output.ts" -ForegroundColor White
