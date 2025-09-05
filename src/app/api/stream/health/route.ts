import { NextRequest, NextResponse } from "next/server";

interface StreamHealth {
  status: 'healthy' | 'warning' | 'critical';
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

// Simulated health data
let currentHealth: StreamHealth = {
  status: 'healthy',
  cpu: 0,
  memory: 0,
  disk: 0,
  network: 0
};

export async function GET(request: NextRequest) {
  try {
    // Simulate system health metrics
    // In a real implementation, these would come from system monitoring tools
    
    // Simulate CPU usage (0-100%)
    currentHealth.cpu = Math.floor(Math.random() * 100);
    
    // Simulate memory usage (0-100%)
    currentHealth.memory = Math.floor(Math.random() * 100);
    
    // Simulate disk usage (0-100%)
    currentHealth.disk = Math.floor(Math.random() * 100);
    
    // Simulate network usage (0-100%)
    currentHealth.network = Math.floor(Math.random() * 100);
    
    // Determine overall health status
    const criticalThreshold = 90;
    const warningThreshold = 70;
    
    if (currentHealth.cpu >= criticalThreshold || 
        currentHealth.memory >= criticalThreshold || 
        currentHealth.disk >= criticalThreshold || 
        currentHealth.network >= criticalThreshold) {
      currentHealth.status = 'critical';
    } else if (currentHealth.cpu >= warningThreshold || 
               currentHealth.memory >= warningThreshold || 
               currentHealth.disk >= warningThreshold || 
               currentHealth.network >= warningThreshold) {
      currentHealth.status = 'warning';
    } else {
      currentHealth.status = 'healthy';
    }
    
    return NextResponse.json(currentHealth);
  } catch (error) {
    console.error("Error getting stream health:", error);
    return NextResponse.json(
      { error: "Failed to get stream health" },
      { status: 500 }
    );
  }
}

// Helper functions to update health data (can be called from other modules)
export function updateHealth(health: Partial<StreamHealth>) {
  currentHealth = { ...currentHealth, ...health };
}