@echo off
echo ========================================
echo Simple SCTE-35 Stream Injection
echo ========================================

REM Complete FFmpeg command with your path
"E:\NEW DOWNLOADS\ffmpeg-N-120864-g9a34ddc345-win64-gpl\ffmpeg-N-120864-g9a34ddc345-win64-gpl\bin\ffmpeg.exe" -i "https://cdn.itassist.one/BREAKING/NEWS/index.m3u8" -c:v copy -c:a copy -bsf:v "scte35_inject=inject=base64:/LAiAAAAAAAA///wEAAAAAAAADA5AOAAgAApMuAAAQAACge1ig==" -f srt "srt://itassist.one:8888?streamid=#!::r=live/live,m=publish"

echo.
echo Command completed!
pause
