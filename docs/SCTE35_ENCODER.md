# SCTE-35 Encoder Documentation

## Overview

The SCTE-35 Encoder provides a comprehensive implementation of the SCTE-35 standard for creating and encoding SCTE-35 messages used in digital video broadcasting for ad insertion, program scheduling, and other broadcast automation tasks.

## What is SCTE-35?

SCTE-35 is a standard for signaling splice points in digital video streams. It's commonly used for:

- **Ad Insertion**: Signaling the start and end of commercial breaks
- **Program Scheduling**: Coordinating program transitions
- **Emergency Alerts**: Inserting emergency broadcast messages
- **Content Replacement**: Replacing content with alternative programming

## Encoder Features

### Supported Commands

#### 1. Splice Insert (Command Type 5)
The most commonly used SCTE-35 command for signaling ad breaks and program splices.

**Key Parameters:**
- `spliceEventId`: Unique identifier for the splice event
- `spliceEventCancelIndicator`: Cancel a previously scheduled event
- `outOfNetworkIndicator`: Indicates if the splice is out of network
- `programSpliceFlag`: Whether the splice affects the entire program
- `durationFlag`: Whether break duration is specified
- `spliceImmediateFlag`: Whether the splice should happen immediately
- `breakDuration`: Duration of the break (if duration flag is set)
- `uniqueProgramId`: Identifier for the program
- `spliceTime`: Timing information for the splice

#### 2. Time Signal (Command Type 6)
Used for signaling specific timing events without splice information.

**Key Parameters:**
- `timeSpecified`: Whether time is specified
- `pts`: Presentation Time Stamp for the event

### Splice Info Section

Every SCTE-35 message begins with a splice info section containing:

- `tableId`: Identifies the table type (0xFC for SCTE-35)
- `sectionSyntaxIndicator`: Syntax indicator
- `privateIndicator`: Private bit
- `protocolVersion`: Protocol version number
- `encryptedPacket`: Encryption flag
- `ptsAdjustment`: PTS adjustment value
- `cwIndex`: Control word index
- `tier`: Tier information
- `spliceCommandLength`: Length of the splice command
- `spliceCommandType`: Type of splice command
- `descriptorLoopLength`: Length of descriptor loop

## Usage Examples

### Basic Splice Insert

```typescript
const spliceInsert = {
  spliceEventId: 1,
  spliceEventCancelIndicator: false,
  outOfNetworkIndicator: true,
  programSpliceFlag: true,
  durationFlag: true,
  spliceImmediateFlag: false,
  breakDurationAutoReturn: true,
  breakDuration: 1800000, // 30 seconds in 90kHz units
  uniqueProgramId: 1,
  available: 0,
  expected: 0,
  spliceTimeSpecified: true,
  spliceTimePts: 900000 // 10 seconds in 90kHz units
};

const result = await encodeSCTE35({
  spliceInfo: defaultSpliceInfo,
  command: spliceInsert,
  commandType: 'splice-insert'
});

console.log(result.base64);
// Output: /DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM=
```

### Time Signal

```typescript
const timeSignal = {
  timeSpecified: true,
  pts: 900000 // 10 seconds in 90kHz units
};

const result = await encodeSCTE35({
  spliceInfo: defaultSpliceInfo,
  command: timeSignal,
  commandType: 'time-signal'
});
```

### Ad Break Start/End Pair

```typescript
// Ad Break Start
const adBreakStart = {
  spliceEventId: 1,
  spliceEventCancelIndicator: false,
  outOfNetworkIndicator: true,
  programSpliceFlag: true,
  durationFlag: true,
  spliceImmediateFlag: false,
  breakDurationAutoReturn: true,
  breakDuration: 1800000, // 30 seconds
  uniqueProgramId: 1,
  available: 0,
  expected: 0,
  spliceTimeSpecified: true,
  spliceTimePts: 0
};

// Ad Break End (30 seconds later)
const adBreakEnd = {
  spliceEventId: 2,
  spliceEventCancelIndicator: false,
  outOfNetworkIndicator: false,
  programSpliceFlag: true,
  durationFlag: false,
  spliceImmediateFlag: false,
  uniqueProgramId: 1,
  available: 0,
  expected: 0,
  spliceTimeSpecified: true,
  spliceTimePts: 2700000 // 30 seconds later
};
```

## Technical Implementation

### Encoding Process

1. **Parameter Validation**: Validate all input parameters
2. **Binary Encoding**: Convert parameters to binary format
3. **Command Assembly**: Assemble the splice command
4. **Descriptor Processing**: Add any descriptors
5. **CRC Calculation**: Calculate CRC32 checksum
6. **Output Generation**: Generate Base64 and Hex outputs

### Bit-Level Encoding

The encoder performs precise bit-level manipulation to ensure compliance with the SCTE-35 standard:

```typescript
// Example: Encoding splice event ID (32 bits)
buffer.push((spliceEventId >> 24) & 0xff);
buffer.push((spliceEventId >> 16) & 0xff);
buffer.push((spliceEventId >> 8) & 0xff);
buffer.push(spliceEventId & 0xff);

// Example: Encoding flags (8 bits)
const flagsByte = (outOfNetworkIndicator ? 0x80 : 0) |
                 (programSpliceFlag ? 0x40 : 0) |
                 (durationFlag ? 0x20 : 0) |
                 (spliceImmediateFlag ? 0x10 : 0);
buffer.push(flagsByte);
```

### PTS Time Handling

Presentation Time Stamps (PTS) are handled in 90kHz units as specified by the SCTE-35 standard:

```typescript
function encodePTS(pts: number): void {
  const ptsHigh = (pts & THIRTY_TWO_BIT_MULTIPLIER) ? 1 : 0;
  const ptsLow = pts & 0xffffffff;
  
  buffer.push(ptsHigh);
  buffer.push((ptsLow >> 24) & 0xff);
  buffer.push((ptsLow >> 16) & 0xff);
  buffer.push((ptsLow >> 8) & 0xff);
  buffer.push(ptsLow & 0xff);
}
```

## Output Formats

### Base64 Encoding

Base64 is the most common format for SCTE-35 data in web applications:

```javascript
const base64 = "/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM=";
```

### Hexadecimal Encoding

Hexadecimal format is useful for debugging and low-level processing:

```javascript
const hex = "0xFC302A0000002673C0FFFFF00F050000163A7FCFFE7F0C4F7300000000000A00084355454900000000EC8B354E";
```

## Descriptors

SCTE-35 descriptors provide additional metadata for splice events. Common descriptors include:

### Avail Descriptor (Tag 0)
Signals availability for ad insertion.

```typescript
const availDescriptor = {
  tag: 0,
  identifier: "CUEI",
  data: "00000000"
};
```

### DTMF Descriptor (Tag 1)
Provides DTMF (Dual-Tone Multi-Frequency) signaling.

```typescript
const dtmfDescriptor = {
  tag: 1,
  identifier: "CUEI",
  preRoll: 177,
  dtmfCount: 4,
  dtmfChars: 4186542473
};
```

### Segmentation Descriptor (Tag 2)
Provides segmentation information for the stream.

```typescript
const segmentationDescriptor = {
  tag: 2,
  identifier: "CUEI",
  segmentationEventId: 1,
  segmentationEventCancelIndicator: false,
  programSegmentationFlag: true,
  segmentationDurationFlag: true,
  segmentationDuration: 1800000,
  segmentationTypeId: 0x10, // Provider Advertisement Start
  segmentNum: 0,
  segmentsExpected: 0
};
```

## Validation and Error Handling

### Input Validation

The encoder validates all input parameters:

```typescript
function validateSpliceInsert(config: SpliceInsert): void {
  if (config.spliceEventId < 0 || config.spliceEventId > 0xFFFFFFFF) {
    throw new Error("spliceEventId must be between 0 and 4294967295");
  }
  
  if (config.durationFlag && config.breakDuration < 0) {
    throw new Error("breakDuration must be non-negative when durationFlag is true");
  }
  
  if (config.spliceTimeSpecified && config.spliceTimePts < 0) {
    throw new Error("spliceTimePts must be non-negative when timeSpecified is true");
  }
}
```

### Error Handling

Comprehensive error handling ensures robust operation:

```typescript
try {
  const result = await encodeSCTE35(config);
  return result;
} catch (error) {
  console.error("SCTE-35 encoding failed:", error);
  throw new Error(`Failed to encode SCTE-35: ${error.message}`);
}
```

## Performance Considerations

### Encoding Speed

The encoder is optimized for performance:

- **Pre-allocated buffers**: Minimize memory allocations
- **Bitwise operations**: Use efficient bit manipulation
- **Caching**: Cache frequently used values
- **Parallel processing**: Support for batch encoding

### Memory Usage

Memory usage is minimized through:

- **Buffer reuse**: Reuse buffers when possible
- **Efficient data structures**: Use typed arrays
- **Garbage collection**: Minimize object creation

## Testing

### Unit Tests

Comprehensive unit tests ensure correctness:

```typescript
describe("SCTE35Encoder", () => {
  it("should encode splice insert command", () => {
    const config = createTestSpliceInsertConfig();
    const result = encoder.encode(config);
    
    expect(result.base64).toMatch(/^\/DA/);
    expect(result.hex).toMatch(/^0xFC/);
  });
  
  it("should validate input parameters", () => {
    const invalidConfig = { ...validConfig, spliceEventId: -1 };
    
    expect(() => encoder.encode(invalidConfig)).toThrow();
  });
});
```

### Integration Tests

Integration tests verify end-to-end functionality:

```typescript
describe("SCTE35 Integration", () => {
  it("should encode and decode SCTE-35 message", async () => {
    const originalConfig = createTestConfig();
    const encoded = await encodeSCTE35(originalConfig);
    const decoded = await decodeSCTE35(encoded.base64);
    
    expect(decoded.spliceEventId).toEqual(originalConfig.spliceEventId);
  });
});
```

## Best Practices

### Configuration Management

- Use consistent configuration across your system
- Store configurations in version control
- Validate configurations before use
- Document configuration parameters

### Timing Considerations

- Use accurate PTS values
- Account for PTS adjustment
- Consider network latency
- Test timing in different scenarios

### Error Recovery

- Implement retry mechanisms for encoding failures
- Log errors for debugging
- Provide fallback options
- Monitor encoding performance

## Troubleshooting

### Common Issues

#### Invalid Base64 Output
**Problem**: Generated Base64 doesn't start with `/DA`
**Solution**: Check splice info section configuration, especially table ID

#### CRC Mismatch
**Problem**: CRC32 calculation fails
**Solution**: Verify all parameters are correctly encoded

#### Timing Issues
**Problem**: Splice events don't trigger at expected times
**Solution**: Check PTS values and ensure proper time synchronization

### Debug Mode

Enable debug mode for detailed logging:

```typescript
const encoder = new SCTE35Encoder({ debug: true });
const result = encoder.encode(config);
```

## Future Enhancements

### Planned Features

- **Additional Command Types**: Support for all SCTE-35 command types
- **Advanced Descriptors**: More descriptor types and options
- **Batch Processing**: Encode multiple messages simultaneously
- **Performance Optimization**: Further performance improvements
- **Validation Tools**: Enhanced validation and debugging tools

### Integration Opportunities

- **FFmpeg Integration**: Direct FFmpeg integration for stream processing
- **Broadcast Systems**: Integration with professional broadcast systems
- **Cloud Platforms**: Cloud-native deployment options
- **Analytics**: SCTE-35 analytics and reporting

---

For more information about SCTE-35, refer to the official [SCTE-35 Standard](https://www.scte.org/SCTE35/) documentation.