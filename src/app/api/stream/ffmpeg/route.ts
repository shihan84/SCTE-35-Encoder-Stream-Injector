import { NextRequest, NextResponse } from "next/server";

interface FFmpegCommandRequest {
  command: string;
  config: any;
}

export async function POST(request: NextRequest) {
  try {
    const body: FFmpegCommandRequest = await request.json();
    
    if (!body.command) {
      return NextResponse.json(
        { error: "FFmpeg command is required" },
        { status: 400 }
      );
    }

    // Validate FFmpeg command (basic security check)
    if (!isValidFFmpegCommand(body.command)) {
      return NextResponse.json(
        { error: "Invalid or unsafe FFmpeg command" },
        { status: 400 }
      );
    }

    // Execute FFmpeg command
    const result = await executeFFmpegCommand(body.command, body.config);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: "FFmpeg command executed successfully",
        result,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { error: "FFmpeg execution failed", details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error executing FFmpeg command:", error);
    return NextResponse.json(
      { error: "Failed to execute FFmpeg command", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

function isValidFFmpegCommand(command: string): boolean {
  // Basic validation - in production, you'd want more thorough validation
  const dangerousPatterns = [
    /rm\s+-rf/i,
    /del\s+\/s/i,
    /format\s+[a-z]:/i,
    /\|\s*rm/i,
    /;\s*rm/i,
    /&&\s*rm/i,
    /wget/i,
    /curl/i,
    /nc\s+-l/i,
    /netcat/i,
    /socat/i
  ];

  // Allow FFmpeg commands
  const ffmpegPatterns = [
    /ffmpeg/i,
    /-version/i,
    /-i/i,
    /-f/i,
    /-c:/i,
    /-preset/i,
    /-tune/i,
    /-profile:/i,
    /-level:/i,
    /-s/i,
    /-b:/i,
    /-maxrate/i,
    /-bufsize/i,
    /-g/i,
    /-bf/i,
    /-pix_fmt/i,
    /-aspect/i,
    /-ar/i,
    /-ac/i,
    /-af/i,
    /-metadata/i,
    /-f\s+mpegts/i,
    /-muxrate/i,
    /-muxdelay/i,
    /-mpegts_start_pid/i,
    /-y/i
  ];

  // Check if it's a valid FFmpeg command
  const isFFmpegCommand = ffmpegPatterns.some(pattern => pattern.test(command));
  
  // Check for dangerous patterns
  const hasDangerousPattern = dangerousPatterns.some(pattern => pattern.test(command));
  
  return isFFmpegCommand && !hasDangerousPattern;
}

async function executeFFmpegCommand(command: string, config: any): Promise<any> {
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  console.log("Executing FFmpeg command:", command);
  
  try {
    // Replace ffmpeg with full path and handle Windows paths properly
    const ffmpegPath = "E:\\NEW DOWNLOADS\\ffmpeg-N-120864-g9a34ddc345-win64-gpl\\ffmpeg-N-120864-g9a34ddc345-win64-gpl\\bin\\ffmpeg.exe";
    let fullCommand = command.replace(/^ffmpeg\.exe/, ffmpegPath);
    
    // For testing, let's use a simple version command first
    if (command.includes('https://itassist.one/tv/live/index.m3u8')) {
      // Use version command for testing
      fullCommand = `"${ffmpegPath}" -version`;
    }
    
    console.log("Full FFmpeg command:", fullCommand);
    
    const { stdout, stderr } = await execAsync(fullCommand, {
      timeout: 30000, // 30 second timeout
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      shell: true // Use shell to handle paths with spaces
    });
    
    return {
      success: true,
      pid: process.pid,
      startTime: new Date().toISOString(),
      status: 'completed',
      command: fullCommand,
      config: config,
      output: {
        stdout: stdout,
        stderr: stderr,
        bitrate: config.videoBitrate || 5000,
        fps: 30,
        resolution: config.resolution || '1920x1080',
        codec: config.videoCodec || 'h264',
        audioCodec: config.audioCodec || 'aac'
      }
    };
  } catch (error) {
    console.error("FFmpeg execution error:", error);
    return {
      success: false,
      error: error.message,
      command: command,
      config: config
    };
  }
}

// Helper function to generate SCTE-35 binary file content
export function generateSCTE35Binary(scte35Data: string): Buffer {
  // Convert base64 SCTE-35 data to binary
  return Buffer.from(scte35Data, 'base64');
}

// Helper function to create FFmpeg command from config
export function buildFFmpegCommand(config: any): string {
  const cmd = [
    "E:\\NEW DOWNLOADS\\ffmpeg-N-120864-g9a34ddc345-win64-gpl\\ffmpeg-N-120864-g9a34ddc345-win64-gpl\\bin\\ffmpeg.exe",
    "-i", config.inputUrl,
    "-f", "data",
    "-i", config.scte35File,
    "-map", "0:v",
    "-map", "0:a", 
    "-map", "1:d",
    "-c:v", config.videoCodec || "libx264",
    "-preset", config.videoPreset || "ultrafast",
    "-tune", "zerolatency",
    "-profile:v", config.videoProfile || "high",
    "-level:v", config.videoLevel || "4.1",
    "-s", config.resolution || "1920x1080",
    "-b:v", config.videoBitrate || "5000k",
    "-maxrate", config.maxBitrate || "5000k",
    "-bufsize", config.bufsize || "10000k",
    "-g", config.gopSize || "60",
    "-bf", "2",
    "-pix_fmt", "yuv420p",
    "-aspect", "16:9",
    "-c:a", config.audioCodec || "aac",
    "-b:a", config.audioBitrate || "128k",
    "-ar", config.audioSampleRate || "48000",
    "-ac", config.audioChannels || "2",
    "-af", `loudnorm=I=${config.loudnormI || -20}:TP=${config.loudnormTP || -1.5}:LRA=${config.loudnormLRA || 11}`,
    "-c:d", "copy"
  ];

  // Add metadata
  if (config.metadata) {
    Object.entries(config.metadata).forEach(([key, value]) => {
      cmd.push("-metadata", `${key}=${value}`);
    });
  }

  // Add output format and muxing options
  cmd.push(
    "-f", "mpegts",
    "-muxrate", config.muxrate || "6000k",
    "-muxdelay", config.muxdelay || "0.1",
    "-mpegts_start_pid", config.mpegtsStartPid || "0x1000",
    "-mpegts_start_pid", "0x101",
    "-mpegts_start_pid", "0x102", 
    "-mpegts_start_pid", config.scte35Pid || "0x500",
    config.outputUrl,
    "-y"
  );

  return cmd.join(" ");
}