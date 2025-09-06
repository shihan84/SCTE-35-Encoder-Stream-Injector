import { NextRequest, NextResponse } from "next/server";

interface ValidateRequest {
  data: string;
  format: 'base64' | 'hex' | 'binary';
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  info: {
    format: string;
    length: number;
    tableId: string;
    commandType: string;
    crc32?: string;
    calculatedCrc32?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidateRequest = await request.json();
    
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

    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      info: {
        format: body.format.toUpperCase(),
        length: buffer.length,
        tableId: "",
        commandType: ""
      }
    };

    // Basic length validation
    if (buffer.length < 14) {
      result.isValid = false;
      result.errors.push("Data too short to be valid SCTE-35 (minimum 14 bytes)");
    }

    if (buffer.length > 4096) {
      result.warnings.push("Data is unusually long for SCTE-35");
    }

    if (buffer.length >= 14) {
      // Parse SCTE-35 header
      const tableId = buffer[0];
      result.info.tableId = `0x${tableId.toString(16).toUpperCase()}`;

      // Validate table ID
      if (tableId !== 0xFC) {
        result.isValid = false;
        result.errors.push(`Invalid table ID: ${result.info.tableId} (expected 0xFC)`);
      }

      const sectionSyntaxIndicator = !!(buffer[1] & 0x80);
      const sectionLength = ((buffer[1] & 0x0F) << 8) | buffer[2];
      const protocolVersion = buffer[3];

      // Validate protocol version
      if (protocolVersion !== 0) {
        result.warnings.push(`Unusual protocol version: ${protocolVersion} (expected 0)`);
      }

      // Validate section length
      if (sectionLength + 3 !== buffer.length) {
        result.isValid = false;
        result.errors.push(`Section length mismatch: expected ${sectionLength + 3}, got ${buffer.length}`);
      }

      const spliceCommandType = buffer[13];
      
      // Validate command type
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
        default:
          commandTypeName = `Unknown (${spliceCommandType})`;
          result.warnings.push(`Unusual splice command type: ${spliceCommandType}`);
      }
      result.info.commandType = commandTypeName;

      // Check CRC32 if present
      if (buffer.length >= 18) {
        const crcOffset = buffer.length - 4;
        const storedCrc32 = (buffer[crcOffset] << 24) | 
                           (buffer[crcOffset + 1] << 16) | 
                           (buffer[crcOffset + 2] << 8) | 
                           buffer[crcOffset + 3];
        
        result.info.crc32 = `0x${storedCrc32.toString(16).toUpperCase().padStart(8, '0')}`;
        
        // Calculate CRC32 (simplified)
        const calculatedCrc32 = calculateCRC32(buffer.slice(0, crcOffset));
        result.info.calculatedCrc32 = `0x${calculatedCrc32.toString(16).toUpperCase().padStart(8, '0')}`;
        
        if (storedCrc32 !== calculatedCrc32) {
          result.isValid = false;
          result.errors.push("CRC32 checksum mismatch");
        }
      }

      // Validate splice command length
      const spliceCommandLength = ((buffer[11] & 0x0F) << 8) | buffer[12];
      const expectedMinLength = 16 + spliceCommandLength + 4; // +4 for CRC
      
      if (buffer.length < expectedMinLength) {
        result.isValid = false;
        result.errors.push(`Insufficient data for splice command length: ${spliceCommandLength}`);
      }

      // Check for common issues
      const encryptedPacket = !!(buffer[4] & 0x80);
      if (encryptedPacket) {
        result.warnings.push("Packet is encrypted - analysis may be limited");
      }

      // Validate descriptor loop
      const descriptorLoopLength = ((buffer[14 + spliceCommandLength] & 0xFF) << 8) | 
                                   buffer[15 + spliceCommandLength];
      const expectedDescriptorEnd = 16 + spliceCommandLength + descriptorLoopLength + 4;
      
      if (expectedDescriptorEnd > buffer.length) {
        result.isValid = false;
        result.errors.push("Descriptor loop exceeds packet length");
      }

      // Check for null bytes in the middle (potential corruption)
      const nullBytes = [];
      for (let i = 0; i < buffer.length - 4; i++) {
        if (buffer[i] === 0) {
          nullBytes.push(i);
        }
      }
      
      if (nullBytes.length > 0 && nullBytes.length < buffer.length - 4) {
        result.warnings.push(`Null bytes found at positions: ${nullBytes.join(', ')}`);
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("Error validating SCTE-35 data:", error);
    return NextResponse.json(
      { error: "Failed to validate SCTE-35 data" },
      { status: 500 }
    );
  }
}

// Simple CRC32 calculation (simplified implementation)
function calculateCRC32(data: Buffer): number {
  let crc = 0xFFFFFFFF;
  const polynomial = 0x04C11DB7;
  
  for (let i = 0; i < data.length; i++) {
    crc ^= (data[i] << 24);
    for (let j = 0; j < 8; j++) {
      if (crc & 0x80000000) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc <<= 1;
      }
      crc &= 0xFFFFFFFF;
    }
  }
  
  return crc ^ 0xFFFFFFFF;
}