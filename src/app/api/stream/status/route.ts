import { NextRequest, NextResponse } from "next/server";

interface StreamStatus {
  status: 'stopped' | 'starting' | 'running' | 'error';
  inputBitrate: number;
  outputBitrate: number;
  viewers: number;
  uptime: number;
  lastInjection: string;
  error?: string;
}

// Simulated stream state
let streamStatus: StreamStatus = {
  status: 'stopped',
  inputBitrate: 0,
  outputBitrate: 0,
  viewers: 0,
  uptime: 0,
  lastInjection: ""
};

let streamStartTime: number | null = null;

export async function GET(request: NextRequest) {
  try {
    // Update uptime if stream is running
    if (streamStatus.status === 'running' && streamStartTime) {
      streamStatus.uptime = Math.floor((Date.now() - streamStartTime) / 1000);
    }

    // Simulate some realistic metrics when stream is running
    if (streamStatus.status === 'running') {
      // Simulate varying bitrates
      streamStatus.inputBitrate = Math.floor(Math.random() * 1000) + 4500; // 4500-5500 kbps
      streamStatus.outputBitrate = Math.floor(Math.random() * 800) + 4200; // 4200-5000 kbps
      streamStatus.viewers = Math.floor(Math.random() * 50) + 10; // 10-60 viewers
    }

    return NextResponse.json(streamStatus);
  } catch (error) {
    console.error("Error getting stream status:", error);
    return NextResponse.json(
      { error: "Failed to get stream status" },
      { status: 500 }
    );
  }
}

// Helper functions to update stream state (can be called from other modules)
export function updateStreamStatus(status: StreamStatus['status']) {
  streamStatus.status = status;
  
  if (status === 'running') {
    streamStartTime = Date.now();
  } else if (status === 'stopped') {
    streamStartTime = null;
    streamStatus.uptime = 0;
    streamStatus.inputBitrate = 0;
    streamStatus.outputBitrate = 0;
    streamStatus.viewers = 0;
  }
}

export function recordInjection() {
  streamStatus.lastInjection = new Date().toISOString();
}

export function setStreamError(error: string) {
  streamStatus.status = 'error';
  streamStatus.error = error;
}