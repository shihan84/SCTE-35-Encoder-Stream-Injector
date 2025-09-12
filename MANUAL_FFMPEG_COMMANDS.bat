@echo off
echo ========================================
echo SCTE-35 Stream Injection - Manual Test
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
echo COMMAND 1: HLS to SRT with SCTE-35
echo ========================================
echo Input: HLS Stream (https://cdn.itassist.one/BREAKING/NEWS/index.m3u8)
echo Output: SRT Stream (srt://itassist.one:8888)
echo SCTE-35: 30-second CUE-OUT marker
echo.

echo Running Command 1...
%FFMPEG_PATH% -i "https://cdn.itassist.one/BREAKING/NEWS/index.m3u8" ^
  -c:v copy -c:a copy ^
  -bsf:v "scte35_inject=inject=base64:%SCTE35_BASE64%" ^
  -f srt "srt://itassist.one:8888?streamid=#!::r=live/live,m=publish"

echo.
echo ========================================
echo Command 1 Complete
echo ========================================
pause
