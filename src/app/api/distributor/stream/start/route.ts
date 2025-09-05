import { NextRequest, NextResponse } from "next/server";
import { DistributorStreamConfig, DEFAULT_DISTRIBUTOR_CONFIG, generateFFmpegArgs } from "@/lib/distributor-config";

interface StreamStartRequest {
  inputUrl: string;
  outputUrl: string;
  config?: Partial<DistributorStreamConfig>;
}

// Global stream state
let streamProcess: any = null;
let isStreamRunning = false;

export async function POST(request: NextRequest) {
  try {
    const body: StreamStartRequest = await request.json();
    
    // Validate input
    if (!body.inputUrl || !body.outputUrl) {
      return NextResponse.json(
        { error: "Input and output URLs are required" },
        { status: 400 }
      );
    }

    // Merge config with defaults
    const config: DistributorStreamConfig = {
      ...DEFAULT_DISTRIBUTOR_CONFIG,
      ...body.config
    };

    // Stop existing stream if running
    if (isStreamRunning && streamProcess) {
      try {
        streamProcess.kill();
        streamProcess = null;
        isStreamRunning = false;
      } catch (error) {
        console.error("Error stopping existing stream:", error);
      }
    }

    // Start new stream with distributor specifications
    await startDistributorStream(body.inputUrl, body.outputUrl, config);

    isStreamRunning = true;
    
    return NextResponse.json({ 
      success: true, 
      message: "Distributor SRT stream started successfully",
      config: {
        streamName: config.streamName,
        videoResolution: config.videoResolution,
        videoCodec: config.videoCodec,
        videoBitrate: config.videoBitrate,
        audioCodec: config.audioCodec,
        audioBitrate: config.audioBitrate,
        scteDataPID: config.scteDataPID,
        latency: config.latency
      },
      ffmpegArgs: generateFFmpegArgs(config)
    });
  } catch (error) {
    console.error("Error starting distributor stream:", error);
    return NextResponse.json(
      { error: "Failed to start distributor stream" },
      { status: 500 }
    );
  }
}

async function startDistributorStream(inputUrl: string, outputUrl: string, config: DistributorStreamConfig) {
  console.log(`Starting distributor SRT stream with specifications:`);
  console.log(`Stream Name: ${config.streamName}`);
  console.log(`Video: ${config.videoResolution} ${config.videoCodec} @ ${config.videoBitrate}kbps`);
  console.log(`Audio: ${config.audioCodec} @ ${config.audioBitrate}kbps`);
  console.log(`SCTE PID: ${config.scteDataPID}`);
  console.log(`Input: ${inputUrl}`);
  console.log(`Output: ${outputUrl}`);
  
  // Generate FFmpeg arguments with distributor specifications
  const ffmpegArgs = generateFFmpegArgs(config);
  
  // In a real implementation, you would spawn FFmpeg like this:
  /*
  const { spawn } = require('child_process');
  const ffmpeg = spawn('ffmpeg', [
    '-i', inputUrl,
    ...ffmpegArgs,
    outputUrl
  ]);
  
  streamProcess = ffmpeg;
  
  ffmpeg.stdout.on('data', (data) => {
    console.log(`FFmpeg stdout: ${data}`);
  });
  
  ffmpeg.stderr.on('data', (data) => {
    console.log(`FFmpeg stderr: ${data}`);
  });
  
  ffmpeg.on('close', (code) => {
    console.log(`FFmpeg process exited with code ${code}`);
    isStreamRunning = false;
  });
  */
  
  // For now, simulate the process
  streamProcess = {
    kill: () => {
      console.log("Stopping distributor SRT stream");
    },
    pid: Math.floor(Math.random() * 10000)
  };
  
  console.log("FFmpeg arguments that would be used:", ffmpegArgs);
}