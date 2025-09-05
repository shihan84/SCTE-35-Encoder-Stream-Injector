import { NextRequest, NextResponse } from "next/server";

interface StreamMetrics {
  inputBitrate: number;
  outputBitrate: number;
  viewers: number;
  uptime: number;
  packetLoss: number;
  latency: number;
}

// Simulated metrics storage
let currentMetrics: StreamMetrics = {
  inputBitrate: 0,
  outputBitrate: 0,
  viewers: 0,
  uptime: 0,
  packetLoss: 0,
  latency: 0
};

export async function GET(request: NextRequest) {
  try {
    // Simulate realistic metrics when stream is active
    // In a real implementation, these would come from actual stream monitoring
    
    if (currentMetrics.uptime > 0) {
      // Simulate varying bitrates
      currentMetrics.inputBitrate = Math.floor(Math.random() * 1000) + 4500; // 4500-5500 kbps
      currentMetrics.outputBitrate = Math.floor(Math.random() * 800) + 4200; // 4200-5000 kbps
      currentMetrics.viewers = Math.floor(Math.random() * 50) + 10; // 10-60 viewers
      
      // Simulate packet loss (usually low, occasionally higher)
      currentMetrics.packetLoss = Math.random() < 0.9 ? 
        Math.random() * 2 : // 0-2% packet loss
        Math.random() * 10; // Occasionally higher
      
      // Simulate latency (typically 50-200ms, occasionally higher)
      currentMetrics.latency = Math.random() < 0.8 ?
        Math.floor(Math.random() * 150) + 50 : // 50-200ms
        Math.floor(Math.random() * 800) + 200; // Occasionally 200-1000ms
    }

    return NextResponse.json(currentMetrics);
  } catch (error) {
    console.error("Error getting stream metrics:", error);
    return NextResponse.json(
      { error: "Failed to get stream metrics" },
      { status: 500 }
    );
  }
}

// Helper functions to update metrics (can be called from other modules)
export function updateMetrics(metrics: Partial<StreamMetrics>) {
  currentMetrics = { ...currentMetrics, ...metrics };
}

export function resetMetrics() {
  currentMetrics = {
    inputBitrate: 0,
    outputBitrate: 0,
    viewers: 0,
    uptime: 0,
    packetLoss: 0,
    latency: 0
  };
}