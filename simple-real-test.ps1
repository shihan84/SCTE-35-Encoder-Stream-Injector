# Simple Real Environment Test
Write-Host "=== SCTE-35 Real Environment Test ===" -ForegroundColor Green

# Test SCTE-35 Generation
Write-Host "Testing SCTE-35 Generation API..." -ForegroundColor Yellow

$payload = '{"spliceInfo":{"tableId":252,"selectionSyntaxIndicator":true,"privateIndicator":false,"protocolVersion":0,"encryptedPacket":false,"encryptedAlgorithm":0,"ptsAdjustment":0,"cwIndex":255,"tier":4095,"spliceCommandType":5,"descriptors":[]},"command":{"spliceEventId":12345,"spliceEventCancelIndicator":false,"outOfNetworkIndicator":true,"programSpliceFlag":true,"durationFlag":true,"spliceImmediateFlag":false,"breakDurationAutoReturn":true,"breakDuration":2700000,"uniqueProgramId":1,"available":0,"expected":0,"spliceTimeSpecified":false,"spliceTimePts":0},"commandType":"splice-insert"}'

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/scte35/encode" -Method POST -ContentType "application/json" -Body $payload
    Write-Host "✅ SCTE-35 Generation: WORKING" -ForegroundColor Green
    Write-Host "Base64: $($response.base64)" -ForegroundColor White
    Write-Host "Hex: $($response.hex)" -ForegroundColor White
    
    # Create FFmpeg command
    $scte35Base64 = $response.base64
    $ffmpegCmd = "ffmpeg -i `"https://cdn.itassist.one/BREAKING/NEWS/index.m3u8`" -c:v copy -c:a copy -bsf:v `"scte35_inject=inject=base64:$scte35Base64`" -f srt `"srt://itassist.one:8888?streamid=#!::r=live/live,m=publish`""
    
    $ffmpegCmd | Out-File -FilePath "real-stream-injection.bat" -Encoding UTF8
    Write-Host "✅ FFmpeg command saved to: real-stream-injection.bat" -ForegroundColor Green
    
} catch {
    Write-Host "❌ SCTE-35 Generation: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Web Pages
Write-Host "`nTesting Web Pages..." -ForegroundColor Yellow

$pages = @(
    "http://localhost:3000/encoder",
    "http://localhost:3000/documentation", 
    "http://localhost:3000/advanced-dashboard"
)

foreach($page in $pages) {
    try {
        $response = Invoke-WebRequest -Uri $page -Method GET -TimeoutSec 5
        Write-Host "✅ $page - Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "❌ $page - Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
