import { NextRequest, NextResponse } from "next/server";

interface AnalyzeRequest {
  data: string;
  format: 'base64' | 'hex' | 'binary';
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeRequest = await request.json();
    
    if (!body.data || !body.format) {
      return NextResponse.json(
        { error: "Data and format are required" },
        { status: 400 }
      );
    }

    // Convert input to buffer
    let buffer: Buffer;
    try {
      switch (body.format) {
        case 'base64':
          buffer = Buffer.from(body.data, 'base64');
          break;
        case 'hex':
          const hexData = body.data.replace(/\s/g, '').replace(/^0x/i, '');
          if (!/^[0-9A-Fa-f]+$/.test(hexData)) {
            return NextResponse.json(
              { error: "Invalid hexadecimal data" },
              { status: 400 }
            );
          }
          buffer = Buffer.from(hexData, 'hex');
          break;
        case 'binary':
          const binaryData = body.data.replace(/\s/g, '');
          if (!/^[01]+$/.test(binaryData)) {
            return NextResponse.json(
              { error: "Invalid binary data" },
              { status: 400 }
            );
          }
          buffer = Buffer.from(binaryData.match(/.{1,8}/g)?.map(bin => parseInt(bin, 2)) || []);
          break;
        default:
          return NextResponse.json(
            { error: "Unsupported input format" },
            { status: 400 }
          );
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to parse input data" },
        { status: 400 }
      );
    }

    // Basic SCTE-35 analysis
    if (buffer.length < 14) {
      return NextResponse.json(
        { error: "Data too short to be valid SCTE-35" },
        { status: 400 }
      );
    }

    // Parse SCTE-35 structure
    const tableId = buffer[0];
    const sectionSyntaxIndicator = !!(buffer[1] & 0x80);
    const privateIndicator = !!(buffer[1] & 0x40);
    const sectionLength = ((buffer[1] & 0x0F) << 8) | buffer[2];
    const protocolVersion = buffer[3];
    const encryptedPacket = !!(buffer[4] & 0x80);
    const encryptionAlgorithm = (buffer[4] & 0x7E) >> 1;
    const ptsAdjustment = ((buffer[4] & 0x01) ? 0x100000000 : 0) + 
                         (buffer[5] << 24) + (buffer[6] << 16) + (buffer[7] << 8) + buffer[8];
    const cwIndex = buffer[9];
    const tier = ((buffer[10] & 0xF0) << 4) | ((buffer[11] & 0xF0) >> 4);
    const spliceCommandLength = ((buffer[11] & 0x0F) << 8) | buffer[12];
    const spliceCommandType = buffer[13];

    // Validate table ID
    if (tableId !== 0xFC) {
      return NextResponse.json(
        { error: `Invalid table ID: 0x${tableId.toString(16).toUpperCase()} (expected 0xFC)` },
        { status: 400 }
      );
    }

    // Analyze command type
    let commandTypeName = "Unknown";
    switch (spliceCommandType) {
      case 0:
        commandTypeName = "Splice Null";
        break;
      case 4:
        commandTypeName = "Splice Schedule";
        break;
      case 5:
        commandTypeName = "Splice Insert";
        break;
      case 6:
        commandTypeName = "Time Signal";
        break;
      case 7:
        commandTypeName = "Bandwidth Reservation";
        break;
      case 255:
        commandTypeName = "Private Command";
        break;
    }

    // Parse descriptors if present
    const descriptorLoopLength = ((buffer[14 + spliceCommandLength] & 0xFF) << 8) | 
                                 buffer[15 + spliceCommandLength];
    const descriptors = [];
    
    let descriptorOffset = 16 + spliceCommandLength;
    while (descriptorOffset < buffer.length - 4 && descriptors.length < 10) {
      if (descriptorOffset + 2 > buffer.length) break;
      
      const descriptorTag = buffer[descriptorOffset];
      const descriptorLength = buffer[descriptorOffset + 1];
      
      if (descriptorOffset + 2 + descriptorLength > buffer.length) break;
      
      const descriptorData = buffer.slice(descriptorOffset + 2, descriptorOffset + 2 + descriptorLength);
      
      // Try to identify descriptor type
      let descriptorName = "Unknown";
      switch (descriptorTag) {
        case 0:
          descriptorName = "Reserved";
          break;
        case 1:
          descriptorName = "DTMF Descriptor";
          break;
        case 2:
          descriptorName = "Segmentation Descriptor";
          break;
        case 3:
          descriptorName = "Time Descriptor";
          break;
        case 4:
          descriptorName = "Audio Descriptor";
          break;
      }
      
      descriptors.push({
        tag: descriptorTag,
        name: descriptorName,
        length: descriptorLength,
        data: descriptorData.toString('hex')
      });
      
      descriptorOffset += 2 + descriptorLength;
    }

    // Parse splice time if present (for time signal or splice insert)
    let spliceTime = null;
    if (spliceCommandType === 6 || (spliceCommandType === 5 && spliceCommandLength > 5)) {
      const timeSpecified = !!(buffer[14] & 0x80);
      if (timeSpecified) {
        const ptsHigh = buffer[14] & 0x01;
        const ptsLow = (buffer[15] << 24) + (buffer[16] << 16) + (buffer[17] << 8) + buffer[18];
        const pts = (ptsHigh ? 0x100000000 : 0) + ptsLow;
        
        spliceTime = {
          timeSpecified: true,
          pts: pts
        };
      } else {
        spliceTime = {
          timeSpecified: false,
          pts: null
        };
      }
    }

    // Parse break duration if present
    let breakDuration = null;
    if (spliceCommandType === 5 && spliceCommandLength > 10) {
      // This is a simplified parsing - actual structure is more complex
      const durationOffset = 14 + (spliceTime ? 5 : 1);
      if (durationOffset + 5 <= buffer.length) {
        const autoReturn = !!(buffer[durationOffset] & 0x80);
        const durationHigh = buffer[durationOffset] & 0x01;
        const durationLow = (buffer[durationOffset + 1] << 24) + 
                          (buffer[durationOffset + 2] << 16) + 
                          (buffer[durationOffset + 3] << 8) + 
                          buffer[durationOffset + 4];
        const duration = (durationHigh ? 0x100000000 : 0) + durationLow;
        
        breakDuration = {
          autoReturn,
          duration
        };
      }
    }

    const analysis = {
      format: body.format.toUpperCase(),
      length: buffer.length,
      tableId: `0x${tableId.toString(16).toUpperCase()}`,
      sectionSyntaxIndicator,
      privateIndicator,
      sectionLength,
      protocolVersion,
      encryptedPacket,
      encryptionAlgorithm,
      ptsAdjustment,
      cwIndex: `0x${cwIndex.toString(16).toUpperCase()}`,
      tier: `0x${tier.toString(16).toUpperCase()}`,
      spliceCommandLength,
      commandType: commandTypeName,
      descriptors,
      spliceTime,
      breakDuration,
      descriptorLoopLength,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(analysis);

  } catch (error) {
    console.error("Error analyzing SCTE-35 data:", error);
    return NextResponse.json(
      { error: "Failed to analyze SCTE-35 data" },
      { status: 500 }
    );
  }
}