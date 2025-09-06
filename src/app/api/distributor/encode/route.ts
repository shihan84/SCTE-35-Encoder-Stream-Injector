import { NextRequest, NextResponse } from "next/server";
import { DistributorSCTE35Generator, SCTE35CueCommand } from "@/lib/scte35-generator";
import { DistributorStreamConfig, DEFAULT_DISTRIBUTOR_CONFIG, validateDistributorConfig } from "@/lib/distributor-config";

interface EncodeRequest {
  command: SCTE35CueCommand;
  config?: Partial<DistributorStreamConfig>;
}

export async function POST(request: NextRequest) {
  try {
    const body: EncodeRequest = await request.json();
    
    // Validate input
    if (!body.command || !body.command.type) {
      return NextResponse.json(
        { error: "Command type is required" },
        { status: 400 }
      );
    }

    // Validate command type
    const validCommands = ["CUE-OUT", "CUE-IN", "CRASH-OUT"];
    if (!validCommands.includes(body.command.type)) {
      return NextResponse.json(
        { error: `Invalid command type. Must be one of: ${validCommands.join(", ")}` },
        { status: 400 }
      );
    }

    // Merge config with defaults
    const config: DistributorStreamConfig = {
      ...DEFAULT_DISTRIBUTOR_CONFIG,
      ...body.config
    };

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

    // Generate SCTE-35 message
    const result = DistributorSCTE35Generator.generateCueCommand(body.command, config);
    
    return NextResponse.json({
      success: true,
      message: "SCTE-35 message generated successfully",
      data: result,
      config: {
        streamName: config.streamName,
        scteDataPID: config.scteDataPID,
        adDuration: config.adDuration,
        videoBitrate: config.videoBitrate,
        audioBitrate: config.audioBitrate
      }
    });
  } catch (error) {
    console.error("Distributor SCTE-35 encoding error:", error);
    return NextResponse.json(
      { error: "Failed to encode SCTE-35 message" },
      { status: 500 }
    );
  }
}