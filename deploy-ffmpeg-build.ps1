# Deploy FFmpeg SCTE-35 Build
Write-Host "========================================" -ForegroundColor Green
Write-Host "Deploying FFmpeg SCTE-35 Build" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if build artifacts exist
if (Test-Path "ffmpeg-scte35-release") {
    Write-Host "âœ… Build artifacts found" -ForegroundColor Green
    
    # Check if ffmpeg binary exists
    if (Test-Path "ffmpeg-scte35-release/ffmpeg.exe") {
        Write-Host "âœ… FFmpeg binary found" -ForegroundColor Green
        
        # Test the binary
        Write-Host "Testing FFmpeg binary:" -ForegroundColor Cyan
        & "ffmpeg-scte35-release/ffmpeg.exe" -version | Select-Object -First 1
        
        # Check SCTE-35 support
        Write-Host "Checking SCTE-35 support:" -ForegroundColor Cyan
         = & "ffmpeg-scte35-release/ffmpeg.exe" -bsfs 2>
        if ( -match "scte35") {
            Write-Host "âœ… SCTE-35 support confirmed" -ForegroundColor Green
        } else {
            Write-Host "âŒ SCTE-35 support not found" -ForegroundColor Red
        }
        
        # Ask if user wants to install
        {"timestamp":1757669581847,"serverTime":"2025-09-12T09:33:01.847Z","timezone":"UTC","precision":"millisecond","syncId":"sync_1757669581847","serverProcessingTime":0} = Read-Host "Do you want to install this FFmpeg build? (y/n)"
        if ({"timestamp":1757669581847,"serverTime":"2025-09-12T09:33:01.847Z","timezone":"UTC","precision":"millisecond","syncId":"sync_1757669581847","serverProcessingTime":0} -eq "y" -or {"timestamp":1757669581847,"serverTime":"2025-09-12T09:33:01.847Z","timezone":"UTC","precision":"millisecond","syncId":"sync_1757669581847","serverProcessingTime":0} -eq "Y") {
            # Backup existing ffmpeg
             = Get-Command ffmpeg -ErrorAction SilentlyContinue
            if () {
                Write-Host "Backing up existing FFmpeg..." -ForegroundColor Yellow
                Copy-Item .Source ".backup"
            }
            
            # Install new ffmpeg
            Write-Host "Installing FFmpeg..." -ForegroundColor Yellow
            Copy-Item "ffmpeg-scte35-release/ffmpeg.exe" "C:\Windows\System32\"
            Copy-Item "ffmpeg-scte35-release/ffprobe.exe" "C:\Windows\System32\"
            Copy-Item "ffmpeg-scte35-release/ffplay.exe" "C:\Windows\System32\"
            
            Write-Host "âœ… FFmpeg installed successfully" -ForegroundColor Green
            Write-Host "Test with: ffmpeg -bsfs | Select-String scte35" -ForegroundColor Cyan
        }
    } else {
        Write-Host "âŒ FFmpeg binary not found in build artifacts" -ForegroundColor Red
    }
} else {
    Write-Host "âŒ Build artifacts not found" -ForegroundColor Red
    Write-Host "Please run the GitHub Actions build first" -ForegroundColor Yellow
}
