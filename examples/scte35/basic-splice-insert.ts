// Basic Splice Insert Example
// This example demonstrates how to encode a basic SCTE-35 splice insert command

interface SpliceInfoSection {
  tableId: number;
  protocolVersion: number;
  ptsAdjustment: number;
  cwIndex: number;
  tier: number;
  spliceCommandType: number;
}

interface SpliceInsertCommand {
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

interface SCTE35Config {
  spliceInfo: SpliceInfoSection;
  command: SpliceInsertCommand;
  commandType: 'splice-insert';
}

interface SCTE35Encoded {
  base64: string;
  hex: string;
}

// Mock encode function - in real implementation, this would call the actual API
async function encodeSCTE35(config: SCTE35Config): Promise<SCTE35Encoded> {
  // In a real implementation, this would make an API call:
  // const response = await fetch('http://localhost:3000/api/scte35/encode', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(config)
  // });
  // return response.json().data;
  
  // For this example, we'll return a mock response
  return {
    base64: "/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM=",
    hex: "0xFC302A0000002673C0FFFFF00F050000163A7FCFFE7F0C4F7300000000000A00084355454900000000EC8B354E"
  };
}

// Basic splice insert configuration for an ad break
const basicSpliceInsertConfig: SCTE35Config = {
  spliceInfo: {
    tableId: 252, // Standard SCTE-35 table ID (0xFC)
    protocolVersion: 0, // Protocol version
    ptsAdjustment: 0, // PTS adjustment
    cwIndex: 255, // Control word index
    tier: 4095, // Tier information (0xFFF)
    spliceCommandType: 5 // Splice insert command type
  },
  command: {
    spliceEventId: 1, // Unique identifier for this splice event
    spliceEventCancelIndicator: false, // Not cancelling a previous event
    outOfNetworkIndicator: true, // This is an out-of-network splice (ad break)
    programSpliceFlag: true, // Affects the entire program
    durationFlag: true, // Duration is specified
    spliceImmediateFlag: false, // Not immediate, scheduled for specific time
    breakDurationAutoReturn: true, // Auto-return after break duration
    breakDuration: 1800000, // 30 seconds in 90kHz units (30 * 90000)
    uniqueProgramId: 1, // Unique program identifier
    available: 0, // Available count
    expected: 0, // Expected count
    spliceTimeSpecified: true, // Time is specified
    spliceTimePts: 0 // Splice at current time (immediate)
  },
  commandType: 'splice-insert'
};

// Alternative configuration for program end
const programEndConfig: SCTE35Config = {
  spliceInfo: {
    tableId: 252,
    protocolVersion: 0,
    ptsAdjustment: 0,
    cwIndex: 255,
    tier: 4095,
    spliceCommandType: 5
  },
  command: {
    spliceEventId: 2,
    spliceEventCancelIndicator: false,
    outOfNetworkIndicator: false, // Not out-of-network (program content)
    programSpliceFlag: true,
    durationFlag: false, // No duration specified
    spliceImmediateFlag: false,
    breakDurationAutoReturn: false,
    breakDuration: 0,
    uniqueProgramId: 1,
    available: 0,
    expected: 0,
    spliceTimeSpecified: true,
    spliceTimePts: 3600000 // 40 seconds from now
  },
  commandType: 'splice-insert'
};

// Function to demonstrate encoding
async function demonstrateEncoding() {
  console.log('=== SCTE-35 Basic Splice Insert Example ===\n');

  // Example 1: Ad Break Start
  console.log('1. Encoding Ad Break Start:');
  console.log('Configuration:', JSON.stringify(basicSpliceInsertConfig, null, 2));
  
  try {
    const adBreakResult = await encodeSCTE35(basicSpliceInsertConfig);
    console.log('Result:');
    console.log('  Base64:', adBreakResult.base64);
    console.log('  Hex:', adBreakResult.hex);
    console.log('');
  } catch (error) {
    console.error('Error encoding ad break:', error);
  }

  // Example 2: Program End
  console.log('2. Encoding Program End:');
  console.log('Configuration:', JSON.stringify(programEndConfig, null, 2));
  
  try {
    const programEndResult = await encodeSCTE35(programEndConfig);
    console.log('Result:');
    console.log('  Base64:', programEndResult.base64);
    console.log('  Hex:', programEndResult.hex);
    console.log('');
  } catch (error) {
    console.error('Error encoding program end:', error);
  }

  // Example 3: Immediate Splice
  const immediateSpliceConfig: SCTE35Config = {
    ...basicSpliceInsertConfig,
    command: {
      ...basicSpliceInsertConfig.command,
      spliceImmediateFlag: true, // Execute immediately
      spliceTimeSpecified: false // No time needed for immediate
    }
  };

  console.log('3. Encoding Immediate Splice:');
  console.log('Configuration:', JSON.stringify(immediateSpliceConfig, null, 2));
  
  try {
    const immediateResult = await encodeSCTE35(immediateSpliceConfig);
    console.log('Result:');
    console.log('  Base64:', immediateResult.base64);
    console.log('  Hex:', immediateResult.hex);
    console.log('');
  } catch (error) {
    console.error('Error encoding immediate splice:', error);
  }

  console.log('=== Usage Instructions ===');
  console.log('To use these SCTE-35 messages:');
  console.log('1. Copy the Base64 encoded string');
  console.log('2. Use it with your streaming system or SCTE-35 injector');
  console.log('3. The Hex format can be used for debugging or low-level processing');
  console.log('');
  console.log('Common use cases:');
  console.log('- Ad Break Start: Use basicSpliceInsertConfig with outOfNetworkIndicator=true');
  console.log('- Ad Break End: Use similar config with outOfNetworkIndicator=false');
  console.log('- Immediate Splice: Set spliceImmediateFlag=true for immediate execution');
  console.log('- Scheduled Splice: Set specific spliceTimePts for future execution');
}

// Run the demonstration
if (require.main === module) {
  demonstrateEncoding().catch(console.error);
}

export {
  basicSpliceInsertConfig,
  programEndConfig,
  encodeSCTE35,
  demonstrateEncoding
};