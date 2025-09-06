import { NextRequest, NextResponse } from "next/server";

interface StreamConfig {
  streamName: string;
  inputUrl: string;
  outputUrl: string;
  streamType: 'srt' | 'hls' | 'dash' | 'rtmp';
  videoResolution: string;
  videoCodec: string;
  pcr: string;
  profileLevel: string;
  gop: number;
  bFrames: number;
  videoBitrate: number;
  chroma: string;
  aspectRatio: string;
  audioCodec: string;
  audioBitrate: number;
  audioLKFS: number;
  audioSamplingRate: number;
  scteDataPid: number;
  nullPid: number;
  latency: number;
  scteSettings: {
    adDuration: number;
    scteEventId: number;
    preRollDuration: number;
  };
}

// Global stream state
let streamProcess: any = null;
let isStreamRunning = false;
let currentScteEventId = 1000; // Starting event ID as per requirement

export async function POST(request: NextRequest) {
  try {
    const config: StreamConfig = await request.json();
    
    // Validate input
    if (!config.inputUrl || !config.outputUrl || !config.streamName) {
      return NextResponse.json(
        { error: "Stream name, input and output URLs are required" },
        { status: 400 }
      );
    }

    // Validate distributor-specific requirements
    if (config.streamType === 'srt') {
      // Validate video specifications
      if (config.videoResolution !== "1920x1080") {
        return NextResponse.json(
          { error: "Video resolution must be 1920x1080 (HD)" },
          { status: 400 }
        );
      }
      
      if (config.videoCodec !== "h264") {
        return NextResponse.json(
          { error: "Video codec must be H.264" },
          { status: 400 }
        );
      }
      
      if (config.pcr !== "Video Embedded") {
        return NextResponse.json(
          { error: "PCR must be Video Embedded" },
          { status: 400 }
        );
      }
      
      if (config.profileLevel !== "High@Auto") {
        return NextResponse.json(
          { error: "Profile@Level must be High@Auto" },
          { status: 400 }
        );
      }
      
      if (config.gop !== 12) {
        return NextResponse.json(
          { error: "GOP must be 12" },
          { status: 400 }
        );
      }
      
      if (config.bFrames !== 5) {
        return NextResponse.json(
          { error: "Number of B Frames must be 5" },
          { status: 400 }
        );
      }
      
      if (config.videoBitrate !== 5000) {
        return NextResponse.json(
          { error: "Video bitrate must be 5 Mbps (5000 kbps)" },
          { status: 400 }
        );
      }
      
      if (config.chroma !== "4:2:0") {
        return NextResponse.json(
          { error: "Chroma must be 4:2:0" },
          { status: 400 }
        );
      }
      
      if (config.aspectRatio !== "16:9") {
        return NextResponse.json(
          { error: "Aspect ratio must be 16:9" },
          { status: 400 }
        );
      }
      
      // Validate audio specifications
      if (config.audioCodec !== "AAC-LC") {
        return NextResponse.json(
          { error: "Audio codec must be AAC-LC" },
          { status: 400 }
        );
      }
      
      if (config.audioBitrate !== 128) {
        return NextResponse.json(
          { error: "Audio bitrate must be 128 Kbps" },
          { status: 400 }
        );
      }
      
      if (config.audioLKFS !== -20) {
        return NextResponse.json(
          { error: "Audio LKFS must be -20 dB" },
          { status: 400 }
        );
      }
      
      if (config.audioSamplingRate !== 48000) {
        return NextResponse.json(
          { error: "Audio sampling rate must be 48KHz" },
          { status: 400 }
        );
      }
      
      // Validate SCTE specifications
      if (config.scteDataPid !== 500) {
        return NextResponse.json(
          { error: "SCTE Data PID must be 500" },
          { status: 400 }
        );
      }
      
      if (config.nullPid !== 8191) {
        return NextResponse.json(
          { error: "Null PID must be 8191" },
          { status: 400 }
        );
      }
      
      if (config.latency !== 2000) {
        return NextResponse.json(
          { error: "Latency must be 2000 milliseconds (2 seconds)" },
          { status: 400 }
        );
      }
      
      // Validate SCTE settings
      if (config.scteSettings.preRollDuration < 0 || config.scteSettings.preRollDuration > 10) {
        return NextResponse.json(
          { error: "Pre-roll duration must be between 0-10 seconds" },
          { status: 400 }
        );
      }
    }

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

    // Update SCTE event ID
    currentScteEventId = config.scteSettings.scteEventId;

    // Start new stream based on type
    switch (config.streamType) {
      case 'srt':
        await startSRTStream(config);
        break;
      case 'hls':
        await startHLSStream(config);
        break;
      case 'dash':
        await startDASHStream(config);
        break;
      case 'rtmp':
        await startRTMPStream(config);
        break;
      default:
        return NextResponse.json(
          { error: "Unsupported stream type" },
          { status: 400 }
        );
    }

    isStreamRunning = true;
    
    return NextResponse.json({ 
      success: true, 
      message: `Stream "${config.streamName}" started successfully`,
      config,
      scteEventId: currentScteEventId
    });
  } catch (error) {
    console.error("Error starting stream:", error);
    return NextResponse.json(
      { error: "Failed to start stream" },
      { status: 500 }
    );
  }
}

async function startSRTStream(config: StreamConfig) {
  console.log(`Starting SRT stream "${config.streamName}" from ${config.inputUrl} to ${config.outputUrl}`);
  console.log(`Video: ${config.videoResolution} ${config.videoCodec} ${config.videoBitrate}kbps`);
  console.log(`Audio: ${config.audioCodec} ${config.audioBitrate}kbps ${config.audioSamplingRate}Hz`);
  console.log(`SCTE PID: ${config.scteDataPid}, Event ID: ${config.scteSettings.scteEventId}`);
  
  // Simulate stream process with distributor specifications
  streamProcess = {
    kill: () => {
      console.log(`Stopping SRT stream "${config.streamName}"`);
    },
    config: config
  };
}

async function startHLSStream(config: StreamConfig) {
  console.log(`Starting HLS stream "${config.streamName}" from ${config.inputUrl} to ${config.outputUrl}`);
  
  streamProcess = {
    kill: () => {
      console.log(`Stopping HLS stream "${config.streamName}"`);
    },
    config: config
  };
}

async function startDASHStream(config: StreamConfig) {
  console.log(`Starting DASH stream "${config.streamName}" from ${config.inputUrl} to ${config.outputUrl}`);
  
  streamProcess = {
    kill: () => {
      console.log(`Stopping DASH stream "${config.streamName}"`);
    },
    config: config
  };
}

async function startRTMPStream(config: StreamConfig) {
  console.log(`Starting RTMP stream "${config.streamName}" from ${config.inputUrl} to ${config.outputUrl}`);
  
  streamProcess = {
    kill: () => {
      console.log(`Stopping RTMP stream "${config.streamName}"`);
    },
    config: config
  };
}

// Export function to get current SCTE event ID
export function getCurrentScteEventId(): number {
  return currentScteEventId;
}

// Export function to increment SCTE event ID
export function incrementScteEventId(): number {
  return ++currentScteEventId;
}