# Real Environment Test Script
# Tests the SCTE-35 Stream Injector in real environment

Write-Host "=== SCTE-35 Stream Injector - Real Environment Test ===" -ForegroundColor Green
Write-Host "Testing all components in production environment..." -ForegroundColor Yellow

# Test 1: SCTE-35 Generation API
Write-Host "`n1. Testing SCTE-35 Generation API..." -ForegroundColor Magenta

try {
    $scte35Payload = @{
        spliceInfo = @{
            tableId = 252
            selectionSyntaxIndicator = $true
            privateIndicator = $false
            protocolVersion = 0
            encryptedPacket = $false
            encryptedAlgorithm = 0
            ptsAdjustment = 0
            cwIndex = 255
            tier = 4095
            spliceCommandType = 5
            descriptors = @()
        }
        command = @{
            spliceEventId = 12345
            spliceEventCancelIndicator = $false
            outOfNetworkIndicator = $true
            programSpliceFlag = $true
            durationFlag = $true
            spliceImmediateFlag = $false
            breakDurationAutoReturn = $true
            breakDuration = 2700000  # 30 seconds
            uniqueProgramId = 1
            available = 0
            expected = 0
            spliceTimeSpecified = $false
            spliceTimePts = 0
        }
        commandType = "splice-insert"
    } | ConvertTo-Json -Depth 10

    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/scte35/encode" -Method POST -ContentType "application/json" -Body $scte35Payload -TimeoutSec 10
    
    Write-Host "✅ SCTE-35 Generation API: WORKING" -ForegroundColor Green
    Write-Host "   Base64: $($response.base64)" -ForegroundColor White
    Write-Host "   Hex: $($response.hex)" -ForegroundColor White
    Write-Host "   Timestamp: $($response.timestamp)" -ForegroundColor White
    
    $scte35Data = $response
} catch {
    Write-Host "❌ SCTE-35 Generation API: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    $scte35Data = $null
}

# Test 2: Web Pages
Write-Host "`n2. Testing Web Pages..." -ForegroundColor Magenta

$pages = @(
    @{url="http://localhost:3000"; name="Main Dashboard"},
    @{url="http://localhost:3000/stream-injection"; name="Stream Injection"},
    @{url="http://localhost:3000/encoder"; name="SCTE-35 Encoder"},
    @{url="http://localhost:3000/documentation"; name="Documentation"},
    @{url="http://localhost:3000/advanced-dashboard"; name="Advanced Dashboard"}
)

$workingPages = 0
foreach($page in $pages) {
    try {
        $response = Invoke-WebRequest -Uri $page.url -Method GET -TimeoutSec 5
        Write-Host "✅ $($page.name): WORKING (Status: $($response.StatusCode))" -ForegroundColor Green
        $workingPages++
    } catch {
        Write-Host "❌ $($page.name): FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: API Endpoints
Write-Host "`n3. Testing API Endpoints..." -ForegroundColor Magenta

$apis = @(
    @{url="http://localhost:3000/api/health"; name="Health Check"},
    @{url="http://localhost:3000/api/time/sync"; name="Time Sync"}
)

$workingApis = 0
foreach($api in $apis) {
    try {
        $response = Invoke-WebRequest -Uri $api.url -Method GET -TimeoutSec 5
        Write-Host "✅ $($api.name): WORKING (Status: $($response.StatusCode))" -ForegroundColor Green
        $workingApis++
    } catch {
        Write-Host "❌ $($api.name): FAILED - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: SCTE-35 Data Validation
Write-Host "`n4. Validating SCTE-35 Data..." -ForegroundColor Magenta

if ($scte35Data) {
    # Validate Base64 format
    try {
        $bytes = [System.Convert]::FromBase64String($scte35Data.base64)
        Write-Host "✅ Base64 Format: VALID ($($bytes.Length) bytes)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Base64 Format: INVALID" -ForegroundColor Red
    }
    
    # Validate Hex format
    if ($scte35Data.hex -match "^[0-9A-F]+$") {
        Write-Host "✅ Hex Format: VALID ($($scte35Data.hex.Length) characters)" -ForegroundColor Green
    } else {
        Write-Host "❌ Hex Format: INVALID" -ForegroundColor Red
    }
    
    # Check for SCTE-35 table ID (0xFC)
    if ($scte35Data.hex.StartsWith("FC")) {
        Write-Host "✅ SCTE-35 Table ID: CORRECT (0xFC)" -ForegroundColor Green
    } else {
        Write-Host "❌ SCTE-35 Table ID: INCORRECT" -ForegroundColor Red
    }
} else {
    Write-Host "❌ SCTE-35 Data Validation: SKIPPED (No data available)" -ForegroundColor Red
}

# Test 5: Create FFmpeg Command for Real Testing
Write-Host "`n5. Creating Real Environment FFmpeg Commands..." -ForegroundColor Magenta

if ($scte35Data) {
    $scte35Base64 = $scte35Data.base64
    
    # HLS to SRT with SCTE-35 injection
    $hlsToSrtCommand = @"
ffmpeg -i "https://cdn.itassist.one/BREAKING/NEWS/index.m3u8" \
  -c:v copy -c:a copy \
  -bsf:v "scte35_inject=inject=base64:$scte35Base64" \
  -f srt "srt://itassist.one:8888?streamid=#!::r=live/live,m=publish"
"@
    
    $hlsToSrtCommand | Out-File -FilePath "real-hls-to-srt-injection.bat" -Encoding UTF8
    Write-Host "✅ HLS to SRT command saved to: real-hls-to-srt-injection.bat" -ForegroundColor Green
    
    # Test stream generation
    $testStreamCommand = @"
ffmpeg -f lavfi -i testsrc=duration=60:size=1280x720:rate=30 \
  -f lavfi -i sine=frequency=1000:duration=60 \
  -c:v libx264 -preset ultrafast \
  -c:a aac -b:a 128k \
  -bsf:v "scte35_inject=inject=base64:$scte35Base64" \
  -f mpegts real-test-output.ts
"@
    
    $testStreamCommand | Out-File -FilePath "real-test-stream.bat" -Encoding UTF8
    Write-Host "✅ Test stream command saved to: real-test-stream.bat" -ForegroundColor Green
    
    # Live stream test
    $liveStreamCommand = @"
ffmpeg -f lavfi -i testsrc=duration=300:size=1920x1080:rate=30 \
  -f lavfi -i sine=frequency=1000:duration=300 \
  -c:v libx264 -preset ultrafast -tune zerolatency -g 30 \
  -c:a aac -b:a 128k \
  -bsf:v "scte35_inject=inject=base64:$scte35Base64" \
  -f mpegts udp://127.0.0.1:1234
"@
    
    $liveStreamCommand | Out-File -FilePath "real-live-stream.bat" -Encoding UTF8
    Write-Host "✅ Live stream command saved to: real-live-stream.bat" -ForegroundColor Green
} else {
    Write-Host "❌ FFmpeg Commands: SKIPPED (No SCTE-35 data available)" -ForegroundColor Red
}

# Test Summary
Write-Host "`n=== Real Environment Test Summary ===" -ForegroundColor Green
Write-Host "SCTE-35 Generation API: $(if($scte35Data) {'✅ WORKING'} else {'❌ FAILED'})" -ForegroundColor $(if($scte35Data) {'Green'} else {'Red'})
Write-Host "Web Pages Working: $workingPages/5" -ForegroundColor $(if($workingPages -ge 3) {'Green'} else {'Yellow'})
Write-Host "API Endpoints Working: $workingApis/2" -ForegroundColor $(if($workingApis -ge 1) {'Green'} else {'Yellow'})

if ($scte35Data) {
    Write-Host "`n🎯 Ready for Real Stream Injection:" -ForegroundColor Cyan
    Write-Host "1. Install FFmpeg if not available" -ForegroundColor White
    Write-Host "2. Run: real-hls-to-srt-injection.bat" -ForegroundColor White
    Write-Host "3. Run: real-test-stream.bat" -ForegroundColor White
    Write-Host "4. Run: real-live-stream.bat" -ForegroundColor White
    Write-Host "5. Monitor output stream for CUE-OUT markers" -ForegroundColor White
    
    Write-Host "`n📊 SCTE-35 Data Ready:" -ForegroundColor Cyan
    Write-Host "Base64: $($scte35Data.base64)" -ForegroundColor White
    Write-Host "Hex: $($scte35Data.hex)" -ForegroundColor White
    Write-Host "Duration: 30 seconds (CUE-OUT)" -ForegroundColor White
} else {
    Write-Host "`n❌ Cannot proceed with stream injection tests" -ForegroundColor Red
    Write-Host "SCTE-35 generation API is not working" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
