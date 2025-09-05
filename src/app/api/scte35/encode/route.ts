import { NextRequest, NextResponse } from "next/server";

interface SpliceInfoSection {
  tableId: number;
  selectionSyntaxIndicator: boolean;
  privateIndicator: boolean;
  protocolVersion: number;
  encryptedPacket: boolean;
  encryptedAlgorithm: number;
  ptsAdjustment: number;
  cwIndex: number;
  tier: number;
  spliceCommandType: number;
  descriptors: Array<{
    tag: number;
    data: string;
  }>;
}

interface SpliceInsert {
  spliceEventId: number;
  spliceEventCancelIndicator: boolean;
  outOfNetworkIndicator: boolean;
  programSpliceFlag: boolean;
  durationFlag: boolean;
  spliceImmediateFlag: boolean;
  breakDurationAutoReturn: boolean;
  breakDuration: number;
  uniqueProgramId: number;
  available: number;
  expected: number;
  spliceTimeSpecified: boolean;
  spliceTimePts: number;
}

interface TimeSignal {
  timeSpecified: boolean;
  pts: number;
}

interface EncodeRequest {
  spliceInfo: SpliceInfoSection;
  command: SpliceInsert | TimeSignal;
  commandType: string;
}

class SCTE35Encoder {
  private static readonly THIRTY_TWO_BIT_MULTIPLIER = 4294967296;

  static encode(request: EncodeRequest): { base64: string; hex: string } {
    const { spliceInfo, command, commandType } = request;
    
    // Create a buffer to hold the encoded data
    const buffer: number[] = [];
    
    // Encode splice info section header
    this.encodeSpliceInfoSection(buffer, spliceInfo);
    
    // Encode command based on type
    const commandStartIndex = buffer.length;
    switch (commandType) {
      case "splice-insert":
        this.encodeSpliceInsert(buffer, command as SpliceInsert);
        break;
      case "time-signal":
        this.encodeTimeSignal(buffer, command as TimeSignal);
        break;
      default:
        throw new Error(`Unsupported command type: ${commandType}`);
    }
    
    const commandLength = buffer.length - commandStartIndex;
    
    // Encode descriptors (if any)
    const descriptorStartIndex = buffer.length;
    spliceInfo.descriptors.forEach(descriptor => {
      this.encodeDescriptor(buffer, descriptor);
    });
    const descriptorLoopLength = buffer.length - descriptorStartIndex;
    
    // Update header length fields
    this.updateHeaderLengths(buffer, commandLength, descriptorLoopLength);
    
    // Calculate and append CRC32
    const crc32 = this.calculateCRC32(buffer);
    this.writeUint32(buffer, crc32);
    
    // Convert to base64 and hex
    const bytes = new Uint8Array(buffer);
    const base64 = Buffer.from(bytes).toString('base64');
    const hex = Buffer.from(bytes).toString('hex').toUpperCase();
    
    return { base64, hex };
  }

  private static encodeSpliceInfoSection(buffer: number[], info: SpliceInfoSection): void {
    // Table ID (8 bits)
    buffer.push(info.tableId);
    
    // Section syntax indicator (1 bit), private indicator (1 bit), reserved (2 bits), section length (12 bits)
    const sectionSyntaxAndPrivate = (info.selectionSyntaxIndicator ? 0x80 : 0) | 
                                   (info.privateIndicator ? 0x40 : 0) | 0x30;
    buffer.push(sectionSyntaxAndPrivate);
    buffer.push(0); // Section length low byte (placeholder)
    
    // Protocol version (8 bits)
    buffer.push(info.protocolVersion);
    
    // Encrypted packet (1 bit), encryption algorithm (6 bits), pts adjustment (33 bits)
    const encryptedByte = (info.encryptedPacket ? 0x80 : 0) | 
                         ((info.encryptedAlgorithm & 0x3f) << 1) | 
                         ((info.ptsAdjustment & this.THIRTY_TWO_BIT_MULTIPLIER) ? 1 : 0);
    buffer.push(encryptedByte);
    
    // PTS adjustment (32 bits)
    this.writeUint32(buffer, info.ptsAdjustment & 0xffffffff);
    
    // CW index (8 bits)
    buffer.push(info.cwIndex);
    
    // Tier (12 bits)
    buffer.push((info.tier >> 4) & 0xff);
    buffer.push(((info.tier & 0x0f) << 4) | 0x0f); // Last 4 bits reserved
    
    // Splice command length (12 bits) - placeholder
    buffer.push(0x0f); // High 4 bits reserved, low 4 bits placeholder
    buffer.push(0xff); // Low 8 bits placeholder
    
    // Splice command type (8 bits)
    buffer.push(info.spliceCommandType);
    
    // Descriptor loop length (16 bits) - placeholder
    buffer.push(0);
    buffer.push(0);
  }

  private static encodeSpliceInsert(buffer: number[], command: SpliceInsert): void {
    // Splice event ID (32 bits)
    this.writeUint32(buffer, command.spliceEventId);
    
    // Splice event cancel indicator (1 bit), reserved (7 bits)
    const cancelByte = command.spliceEventCancelIndicator ? 0x80 : 0;
    buffer.push(cancelByte);
    
    if (command.spliceEventCancelIndicator) {
      return; // No more data if cancelled
    }
    
    // Out of network indicator (1 bit), program splice flag (1 bit), duration flag (1 bit), 
    // splice immediate flag (1 bit), reserved (4 bits)
    const flagsByte = (command.outOfNetworkIndicator ? 0x80 : 0) |
                     (command.programSpliceFlag ? 0x40 : 0) |
                     (command.durationFlag ? 0x20 : 0) |
                     (command.spliceImmediateFlag ? 0x10 : 0);
    buffer.push(flagsByte);
    
    // Splice time (if program splice and not immediate)
    if (command.programSpliceFlag && !command.spliceImmediateFlag) {
      this.encodeSpliceTime(buffer, command.spliceTimeSpecified, command.spliceTimePts);
    }
    
    // Break duration (if duration flag)
    if (command.durationFlag) {
      this.encodeBreakDuration(buffer, command.breakDurationAutoReturn, command.breakDuration);
    }
    
    // Unique program ID (16 bits)
    this.writeUint16(buffer, command.uniqueProgramId);
    
    // Available (8 bits)
    buffer.push(command.available);
    
    // Expected (8 bits)
    buffer.push(command.expected);
  }

  private static encodeTimeSignal(buffer: number[], command: TimeSignal): void {
    this.encodeSpliceTime(buffer, command.timeSpecified, command.pts);
  }

  private static encodeSpliceTime(buffer: number[], specified: boolean, pts: number): void {
    // Time specified flag (1 bit), reserved (7 bits)
    const timeByte = specified ? 0x80 : 0;
    buffer.push(timeByte);
    
    if (specified) {
      // PTS (33 bits)
      const ptsHigh = (pts & this.THIRTY_TWO_BIT_MULTIPLIER) ? 1 : 0;
      const ptsLow = pts & 0xffffffff;
      buffer.push(ptsHigh);
      this.writeUint32(buffer, ptsLow);
    }
  }

  private static encodeBreakDuration(buffer: number[], autoReturn: boolean, duration: number): void {
    // Auto return (1 bit), reserved (6 bits), duration high bit (1 bit)
    const durationByte = (autoReturn ? 0x80 : 0) | ((duration & this.THIRTY_TWO_BIT_MULTIPLIER) ? 1 : 0);
    buffer.push(durationByte);
    
    // Duration (32 bits)
    this.writeUint32(buffer, duration & 0xffffffff);
  }

  private static encodeDescriptor(buffer: number[], descriptor: { tag: number; data: string }): void {
    // Descriptor tag (8 bits)
    buffer.push(descriptor.tag);
    
    // Convert hex data string to bytes
    const dataBytes = this.hexToBytes(descriptor.data);
    
    // Descriptor length (8 bits)
    buffer.push(dataBytes.length);
    
    // Descriptor data
    buffer.push(...dataBytes);
  }

  private static updateHeaderLengths(buffer: number[], commandLength: number, descriptorLoopLength: number): void {
    // Update section length (at position 1-2)
    const sectionLength = buffer.length - 3 + 4; // +4 for CRC
    buffer[1] = (buffer[1] & 0xf0) | ((sectionLength >> 8) & 0x0f);
    buffer[2] = sectionLength & 0xff;
    
    // Update splice command length (at position 11-12)
    buffer[11] = (buffer[11] & 0xf0) | ((commandLength >> 8) & 0x0f);
    buffer[12] = commandLength & 0xff;
    
    // Update descriptor loop length (at position 13-14)
    buffer[13] = (descriptorLoopLength >> 8) & 0xff;
    buffer[14] = descriptorLoopLength & 0xff;
  }

  private static writeUint16(buffer: number[], value: number): void {
    buffer.push((value >> 8) & 0xff);
    buffer.push(value & 0xff);
  }

  private static writeUint32(buffer: number[], value: number): void {
    buffer.push((value >> 24) & 0xff);
    buffer.push((value >> 16) & 0xff);
    buffer.push((value >> 8) & 0xff);
    buffer.push(value & 0xff);
  }

  private static hexToBytes(hex: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
  }

  private static calculateCRC32(data: number[]): number {
    // Simple CRC32 implementation
    let crc = 0xffffffff;
    const polynomial = 0x04c11db7;
    
    for (let i = 0; i < data.length; i++) {
      crc ^= (data[i] << 24);
      for (let j = 0; j < 8; j++) {
        if (crc & 0x80000000) {
          crc = (crc << 1) ^ polynomial;
        } else {
          crc <<= 1;
        }
        crc &= 0xffffffff;
      }
    }
    
    return crc ^ 0xffffffff;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EncodeRequest = await request.json();
    
    // Validate input
    if (!body.spliceInfo || !body.command || !body.commandType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Encode SCTE-35 data
    const result = SCTE35Encoder.encode(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("SCTE-35 encoding error:", error);
    return NextResponse.json(
      { error: "Failed to encode SCTE-35 data" },
      { status: 500 }
    );
  }
}