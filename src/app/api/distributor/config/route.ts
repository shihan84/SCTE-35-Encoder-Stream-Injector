import { NextRequest, NextResponse } from "next/server";
import { DistributorStreamConfig, DEFAULT_DISTRIBUTOR_CONFIG, validateDistributorConfig } from "@/lib/distributor-config";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      config: DEFAULT_DISTRIBUTOR_CONFIG,
      description: "Distributor-specific SRT stream configuration"
    });
  } catch (error) {
    console.error("Error getting distributor config:", error);
    return NextResponse.json(
      { error: "Failed to get distributor config" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const config: Partial<DistributorStreamConfig> = await request.json();
    
    // Validate configuration
    const validationErrors = validateDistributorConfig(config);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: "Configuration validation failed",
          details: validationErrors 
        },
        { status: 400 }
      );
    }

    // Merge with defaults
    const mergedConfig = {
      ...DEFAULT_DISTRIBUTOR_CONFIG,
      ...config
    };

    return NextResponse.json({
      success: true,
      message: "Configuration validated successfully",
      config: mergedConfig
    });
  } catch (error) {
    console.error("Error validating distributor config:", error);
    return NextResponse.json(
      { error: "Failed to validate configuration" },
      { status: 500 }
    );
  }
}