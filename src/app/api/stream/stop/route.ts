import { NextRequest, NextResponse } from "next/server";

// Import stream state from start module
let isStreamRunning = false;
let streamProcess: any = null;

export async function POST(request: NextRequest) {
  try {
    if (!isStreamRunning) {
      return NextResponse.json(
        { error: "No stream is currently running" },
        { status: 400 }
      );
    }

    // Stop the stream process
    if (streamProcess) {
      try {
        streamProcess.kill();
        streamProcess = null;
      } catch (error) {
        console.error("Error killing stream process:", error);
      }
    }

    isStreamRunning = false;
    
    return NextResponse.json({ 
      success: true, 
      message: "Stream stopped successfully" 
    });
  } catch (error) {
    console.error("Error stopping stream:", error);
    return NextResponse.json(
      { error: "Failed to stop stream" },
      { status: 500 }
    );
  }
}