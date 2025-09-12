# Quick SCTE-35 Verification
Write-Host "Quick SCTE-35 Verification" -ForegroundColor Green

if (Test-Path "test-scte35-output.ts") {
    # Check file size
    $fileSize = (Get-Item "test-scte35-output.ts").Length
    Write-Host "File size: $fileSize bytes" -ForegroundColor White
    
    # Check for 0xFC bytes (SCTE-35 table ID)
    $bytes = [System.IO.File]::ReadAllBytes("test-scte35-output.ts")
    $fcCount = ($bytes | Where-Object { $_ -eq 252 }).Count
    Write-Host "SCTE-35 table ID (0xFC) occurrences: $fcCount" -ForegroundColor White
    
    if ($fcCount -gt 0) {
        Write-Host "âœ… SCTE-35 markers detected in stream!" -ForegroundColor Green
    } else {
        Write-Host "âš ï¸ No SCTE-35 markers detected" -ForegroundColor Yellow
    }
} else {
    Write-Host "Test file not found" -ForegroundColor Red
}
