@echo off
echo ========================================
echo Working FFmpeg Tests (No SCTE-35 BSF)
echo ========================================
echo.

REM Set FFmpeg path
set FFMPEG_PATH="E:\NEW DOWNLOADS\ffmpeg-N-120864-g9a34ddc345-win64-gpl\ffmpeg-N-120864-g9a34ddc345-win64-gpl\bin\ffmpeg.exe"

echo NOTE: Your FFmpeg build does NOT include scte35_inject bitstream filter
echo This is normal for standard FFmpeg builds
echo.

echo ========================================
echo TEST 1: Basic HLS to SRT Stream
echo ========================================
echo Input: HLS Stream (https://cdn.itassist.one/BREAKING/NEWS/index.m3u8)
echo Output: SRT Stream (srt://itassist.one:8888)
echo Purpose: Test basic stream conversion without SCTE-35
echo.

echo Running Test 1...
%FFMPEG_PATH% -i "https://cdn.itassist.one/BREAKING/NEWS/index.m3u8" ^
  -c:v copy -c:a copy ^
  -f srt "srt://itassist.one:8888?streamid=#!::r=live/live,m=publish"

echo.
echo ========================================
echo TEST 2: Generate Test Stream
echo ========================================
echo Creating 30-second test stream
echo Output: test-stream-output.ts
echo Purpose: Test stream generation capabilities
echo.

echo Running Test 2...
%FFMPEG_PATH% -f lavfi -i testsrc=duration=30:size=1280x720:rate=30 ^
  -f lavfi -i sine=frequency=1000:duration=30 ^
  -c:v libx264 -preset ultrafast ^
  -c:a aac -b:a 128k ^
  -f mpegts test-stream-output.ts

echo.
echo ========================================
echo TEST 3: Live Stream Generation
echo ========================================
echo Creating live stream
echo Output: UDP stream on udp://127.0.0.1:1234
echo Duration: 2 minutes
echo Purpose: Test live streaming capabilities
echo.

echo Running Test 3...
%FFMPEG_PATH% -f lavfi -i testsrc=duration=120:size=1920x1080:rate=30 ^
  -f lavfi -i sine=frequency=1000:duration=120 ^
  -c:v libx264 -preset ultrafast -tune zerolatency -g 30 ^
  -c:a aac -b:a 128k ^
  -f mpegts udp://127.0.0.1:1234

echo.
echo ========================================
echo Tests Complete
echo ========================================
echo.
echo Files created:
echo - test-stream-output.ts (30-second test stream)
echo.
echo Live stream available at:
echo - udp://127.0.0.1:1234
echo.
echo To view streams:
echo - VLC: Media ^> Open Network Stream ^> udp://127.0.0.1:1234
echo - ffplay: ffplay udp://127.0.0.1:1234
echo - Test file: ffplay test-stream-output.ts
echo.
echo NOTE: For SCTE-35 injection, you need a custom FFmpeg build
echo with scte35_inject bitstream filter support.
echo.
pause
