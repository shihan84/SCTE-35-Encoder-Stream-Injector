# SCTE-35 Stream Analysis Script
# Analyzes stream files for SCTE-35 markers and CUE-OUT data

Write-Host "=== SCTE-35 Stream Analysis ===" -ForegroundColor Green

# Check if FFmpeg is available
try {
    $ffmpegVersion = ffmpeg -version 2>&1 | Select-Object -First 1
    Write-Host "✅ FFmpeg is available: $ffmpegVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ FFmpeg not found. Please install FFmpeg." -ForegroundColor Red
    exit 1
}

# Check if test file exists
if (Test-Path "test-scte35-output.ts") {
    Write-Host "`nAnalyzing test-scte35-output.ts..." -ForegroundColor Yellow
    
    # Get stream information
    Write-Host "`nStream Information:" -ForegroundColor Cyan
    ffprobe -v quiet -show_format -show_streams test-scte35-output.ts
    
    # Look for SCTE-35 markers in the stream
    Write-Host "`nSearching for SCTE-35 markers..." -ForegroundColor Cyan
    
    # Extract packets and look for SCTE-35 data
    $packets = ffprobe -v quiet -show_packets -select_streams v test-scte35-output.ts 2>&1
    
    # Look for splice-related information
    $splicePackets = $packets | Select-String -Pattern "splice|SCTE|0xFC"
    
    if ($splicePackets) {
        Write-Host "✅ Found SCTE-35 related packets:" -ForegroundColor Green
        $splicePackets | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
    } else {
        Write-Host "⚠️ No explicit SCTE-35 markers found in packet analysis" -ForegroundColor Yellow
    }
    
    # Try to extract SCTE-35 data using bitstream filter
    Write-Host "`nAttempting to extract SCTE-35 data..." -ForegroundColor Cyan
    
    try {
        $extractOutput = ffmpeg -i test-scte35-output.ts -bsf:v "scte35_extract" -f null - 2>&1
        if ($extractOutput -match "SCTE-35") {
            Write-Host "✅ SCTE-35 data extraction successful:" -ForegroundColor Green
            Write-Host $extractOutput -ForegroundColor White
        } else {
            Write-Host "⚠️ SCTE-35 extraction did not find explicit markers" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️ SCTE-35 extraction filter not available in this FFmpeg build" -ForegroundColor Yellow
    }
    
    # Analyze hex dump of first few packets
    Write-Host "`nAnalyzing stream header for SCTE-35 signatures..." -ForegroundColor Cyan
    
    # Read first 1024 bytes and look for SCTE-35 table ID (0xFC)
    $bytes = [System.IO.File]::ReadAllBytes("test-scte35-output.ts")[0..1023]
    $hexString = ($bytes | ForEach-Object { $_.ToString("X2") }) -join " "
    
    if ($hexString -match "FC") {
        Write-Host "✅ Found potential SCTE-35 table ID (0xFC) in stream header" -ForegroundColor Green
        $matches = [regex]::Matches($hexString, "FC")
        Write-Host "Found $($matches.Count) occurrences of 0xFC" -ForegroundColor White
    } else {
        Write-Host "⚠️ No SCTE-35 table ID (0xFC) found in stream header" -ForegroundColor Yellow
    }
    
} else {
    Write-Host "❌ Test file 'test-scte35-output.ts' not found." -ForegroundColor Red
    Write-Host "Please run 'test-scte35-simple.bat' first to create the test stream." -ForegroundColor Yellow
}

# Create a simple verification script
Write-Host "`nCreating verification script..." -ForegroundColor Cyan

$verifyScript = @"
# Quick SCTE-35 Verification
Write-Host "Quick SCTE-35 Verification" -ForegroundColor Green

if (Test-Path "test-scte35-output.ts") {
    # Check file size
    `$fileSize = (Get-Item "test-scte35-output.ts").Length
    Write-Host "File size: `$fileSize bytes" -ForegroundColor White
    
    # Check for 0xFC bytes (SCTE-35 table ID)
    `$bytes = [System.IO.File]::ReadAllBytes("test-scte35-output.ts")
    `$fcCount = (`$bytes | Where-Object { `$_ -eq 252 }).Count
    Write-Host "SCTE-35 table ID (0xFC) occurrences: `$fcCount" -ForegroundColor White
    
    if (`$fcCount -gt 0) {
        Write-Host "✅ SCTE-35 markers detected in stream!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No SCTE-35 markers detected" -ForegroundColor Yellow
    }
} else {
    Write-Host "Test file not found" -ForegroundColor Red
}
"@

$verifyScript | Out-File -FilePath "verify-scte35.ps1" -Encoding UTF8
Write-Host "✅ Verification script saved to verify-scte35.ps1" -ForegroundColor Green

Write-Host "`n=== Analysis Complete ===" -ForegroundColor Green
Write-Host "Run 'verify-scte35.ps1' for quick verification" -ForegroundColor Yellow
