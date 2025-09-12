@echo off
echo ========================================
echo SCTE-35 Test Stream Generation
echo ========================================
echo.

REM Set FFmpeg path
set FFMPEG_PATH="E:\NEW DOWNLOADS\ffmpeg-N-120864-g9a34ddc345-win64-gpl\ffmpeg-N-120864-g9a34ddc345-win64-gpl\bin\ffmpeg.exe"

REM SCTE-35 Base64 data for 30-second CUE-OUT
set SCTE35_BASE64=/LAiAAAAAAAA///wEAAAAAAAADA5AOAAgAApMuAAAQAACge1ig==

echo SCTE-35 Base64 Data:
echo %SCTE35_BASE64%
echo.

echo ========================================
echo COMMAND 1: Generate Test Stream with SCTE-35
echo ========================================
echo Creating 60-second test stream with SCTE-35 injection...
echo Output: test-scte35-output.ts
echo.

echo Running Command 1...
%FFMPEG_PATH% -f lavfi -i testsrc=duration=60:size=1280x720:rate=30 ^
  -f lavfi -i sine=frequency=1000:duration=60 ^
  -c:v libx264 -preset ultrafast ^
  -c:a aac -b:a 128k ^
  -bsf:v "scte35_inject=inject=base64:%SCTE35_BASE64%" ^
  -f mpegts test-scte35-output.ts

echo.
echo ========================================
echo COMMAND 2: Live Stream with SCTE-35
echo ========================================
echo Creating live stream with SCTE-35 injection...
echo Output: UDP stream on udp://127.0.0.1:1234
echo Duration: 5 minutes
echo.

echo Running Command 2...
%FFMPEG_PATH% -f lavfi -i testsrc=duration=300:size=1920x1080:rate=30 ^
  -f lavfi -i sine=frequency=1000:duration=300 ^
  -c:v libx264 -preset ultrafast -tune zerolatency -g 30 ^
  -c:a aac -b:a 128k ^
  -bsf:v "scte35_inject=inject=base64:%SCTE35_BASE64%" ^
  -f mpegts udp://127.0.0.1:1234

echo.
echo ========================================
echo Commands Complete
echo ========================================
echo.
echo Files created:
echo - test-scte35-output.ts (60-second test stream)
echo.
echo Live stream available at:
echo - udp://127.0.0.1:1234
echo.
echo Use VLC or ffplay to view:
echo - ffplay udp://127.0.0.1:1234
echo - VLC: Media ^> Open Network Stream ^> udp://127.0.0.1:1234
echo.
pause
