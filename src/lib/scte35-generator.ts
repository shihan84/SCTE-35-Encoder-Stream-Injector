import { DistributorStreamConfig, SCTE35CueCommand, getNextEventID } from './distributor-config';

export interface SCTE35Message {
  base64: string;
  hex: string;
  eventId: number;
  command: SCTE35CueCommand;
  timestamp: string;
}

export class DistributorSCTE35Generator {
  private static readonly THIRTY_TWO_BIT_MULTIPLIER = 4294967296;

  static generateCueCommand(
    command: SCTE35CueCommand,
    config: DistributorStreamConfig
  ): SCTE35Message {
    const eventId = command.eventId || getNextEventID();
    const timestamp = new Date().toISOString();
    
    let spliceInfoSection: any;
    
    switch (command.type) {
      case "CUE-OUT":
        spliceInfoSection = this.generateCueOut(eventId, command.adDuration || 600, command.preRollDuration || 0);
        break;
      case "CUE-IN":
        spliceInfoSection = this.generateCueIn(eventId);
        break;
      case "CRASH-OUT":
        spliceInfoSection = this.generateCrashOut(eventId);
        break;
      default:
        throw new Error(`Unknown command type: ${command.type}`);
    }

    const encoded = this.encodeSCTE35(spliceInfoSection);
    
    return {
      base64: encoded.base64,
      hex: encoded.hex,
      eventId,
      command: {
        ...command,
        eventId,
        timestamp
      },
      timestamp
    };
  }

  private static generateCueOut(eventId: number, adDuration: number, preRollDuration: number) {
    return {
      tableId: 0xfc,
      sectionSyntaxIndicator: false,
      privateIndicator: false,
      protocolVersion: 0,
      encryptedPacket: false,
      encryptedAlgorithm: 0,
      ptsAdjustment: 0,
      cwIndex: 0xff,
      tier: 0xfff,
      spliceCommandType: 5, // Splice Insert
      spliceCommand: {
        spliceEventId: eventId,
        spliceEventCancelIndicator: false,
        outOfNetworkIndicator: true, // Program going out for ad
        programSpliceFlag: true,
        durationFlag: true,
        spliceImmediateFlag: false,
        breakDuration: {
          autoReturn: true,
          duration: adDuration * 90000 // Convert seconds to 90kHz ticks
        },
        uniqueProgramId: 1,
        available: 0,
        expected: 0,
        spliceTime: {
          specified: true,
          pts: Math.floor(Date.now() / 1000) * 90000 // Current time in 90kHz ticks
        }
      },
      descriptorLoopLength: 0,
      descriptors: []
    };
  }

  private static generateCueIn(eventId: number) {
    return {
      tableId: 0xfc,
      sectionSyntaxIndicator: false,
      privateIndicator: false,
      protocolVersion: 0,
      encryptedPacket: false,
      encryptedAlgorithm: 0,
      ptsAdjustment: 0,
      cwIndex: 0xff,
      tier: 0xfff,
      spliceCommandType: 5, // Splice Insert
      spliceCommand: {
        spliceEventId: eventId,
        spliceEventCancelIndicator: false,
        outOfNetworkIndicator: false, // Program coming back in
        programSpliceFlag: true,
        durationFlag: false,
        spliceImmediateFlag: false,
        uniqueProgramId: 1,
        available: 0,
        expected: 0,
        spliceTime: {
          specified: true,
          pts: Math.floor(Date.now() / 1000) * 90000 // Current time in 90kHz ticks
        }
      },
      descriptorLoopLength: 0,
      descriptors: []
    };
  }

  private static generateCrashOut(eventId: number) {
    return {
      tableId: 0xfc,
      sectionSyntaxIndicator: false,
      privateIndicator: false,
      protocolVersion: 0,
      encryptedPacket: false,
      encryptedAlgorithm: 0,
      ptsAdjustment: 0,
      cwIndex: 0xff,
      tier: 0xfff,
      spliceCommandType: 5, // Splice Insert
      spliceCommand: {
        spliceEventId: eventId,
        spliceEventCancelIndicator: false,
        outOfNetworkIndicator: false, // Back to regular program
        programSpliceFlag: true,
        durationFlag: false,
        spliceImmediateFlag: true, // Immediate splice for crash scenario
        uniqueProgramId: 1,
        available: 0,
        expected: 0
      },
      descriptorLoopLength: 0,
      descriptors: []
    };
  }

  private static encodeSCTE35(data: any): { base64: string; hex: string } {
    const buffer: number[] = [];
    
    // Encode splice info section header
    this.encodeSpliceInfoSection(buffer, data);
    
    // Encode splice command
    const commandStartIndex = buffer.length;
    this.encodeSpliceInsert(buffer, data.spliceCommand);
    const commandLength = buffer.length - commandStartIndex;
    
    // Encode descriptors (if any)
    const descriptorStartIndex = buffer.length;
    data.descriptors?.forEach((descriptor: any) => {
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

  private static encodeSpliceInfoSection(buffer: number[], data: any): void {
    // Table ID (8 bits)
    buffer.push(data.tableId);
    
    // Section syntax indicator (1 bit), private indicator (1 bit), reserved (2 bits), section length (12 bits)
    const sectionSyntaxAndPrivate = (data.sectionSyntaxIndicator ? 0x80 : 0) | 
                                   (data.privateIndicator ? 0x40 : 0) | 0x30;
    buffer.push(sectionSyntaxAndPrivate);
    buffer.push(0); // Section length low byte (placeholder)
    
    // Protocol version (8 bits)
    buffer.push(data.protocolVersion);
    
    // Encrypted packet (1 bit), encryption algorithm (6 bits), pts adjustment (33 bits)
    const encryptedByte = (data.encryptedPacket ? 0x80 : 0) | 
                         ((data.encryptedAlgorithm & 0x3f) << 1) | 
                         ((data.ptsAdjustment & this.THIRTY_TWO_BIT_MULTIPLIER) ? 1 : 0);
    buffer.push(encryptedByte);
    
    // PTS adjustment (32 bits)
    this.writeUint32(buffer, data.ptsAdjustment & 0xffffffff);
    
    // CW index (8 bits)
    buffer.push(data.cwIndex);
    
    // Tier (12 bits)
    buffer.push((data.tier >> 4) & 0xff);
    buffer.push(((data.tier & 0x0f) << 4) | 0x0f); // Last 4 bits reserved
    
    // Splice command length (12 bits) - placeholder
    buffer.push(0x0f); // High 4 bits reserved, low 4 bits placeholder
    buffer.push(0xff); // Low 8 bits placeholder
    
    // Splice command type (8 bits)
    buffer.push(data.spliceCommandType);
    
    // Descriptor loop length (16 bits) - placeholder
    buffer.push(0);
    buffer.push(0);
  }

  private static encodeSpliceInsert(buffer: number[], command: any): void {
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
    if (command.programSpliceFlag && !command.spliceImmediateFlag && command.spliceTime) {
      this.encodeSpliceTime(buffer, command.spliceTime.specified, command.spliceTime.pts);
    }
    
    // Break duration (if duration flag)
    if (command.durationFlag && command.breakDuration) {
      this.encodeBreakDuration(buffer, command.breakDuration.autoReturn, command.breakDuration.duration);
    }
    
    // Unique program ID (16 bits)
    this.writeUint16(buffer, command.uniqueProgramId);
    
    // Available (8 bits)
    buffer.push(command.available);
    
    // Expected (8 bits)
    buffer.push(command.expected);
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

  private static encodeDescriptor(buffer: number[], descriptor: any): void {
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