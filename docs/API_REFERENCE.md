# API Reference

## Overview

The SCTE-35 Encoder & Stream Injection System provides a comprehensive REST API for encoding SCTE-35 messages, managing streams, and injecting cues into live video streams.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API does not require authentication. For production deployment, consider implementing API key authentication or OAuth2.

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Detailed error message",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error - Server error |

---

## SCTE-35 Encoding API

### POST /scte35/encode

Encode SCTE-35 messages from configuration data.

**Endpoint:** `POST /api/scte35/encode`

**Description:** Encodes SCTE-35 splice commands into Base64 and Hex formats.

#### Request Body

```json
{
  "spliceInfo": {
    "tableId": 252,
    "selectionSyntaxIndicator": false,
    "privateIndicator": false,
    "protocolVersion": 0,
    "encryptedPacket": false,
    "encryptedAlgorithm": 0,
    "ptsAdjustment": 0,
    "cwIndex": 255,
    "tier": 4095,
    "spliceCommandType": 5,
    "descriptors": []
  },
  "command": {
    "spliceEventId": 1,
    "spliceEventCancelIndicator": false,
    "outOfNetworkIndicator": false,
    "programSpliceFlag": true,
    "durationFlag": false,
    "spliceImmediateFlag": false,
    "breakDurationAutoReturn": false,
    "breakDuration": 0,
    "uniqueProgramId": 1,
    "available": 0,
    "expected": 0,
    "spliceTimeSpecified": true,
    "spliceTimePts": 0
  },
  "commandType": "splice-insert"
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `spliceInfo` | Object | Yes | Splice information section configuration |
| `command` | Object | Yes | SCTE-35 command configuration |
| `commandType` | String | Yes | Type of command ("splice-insert" or "time-signal") |

##### SpliceInfo Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `tableId` | Number | 252 | Table identifier (0xFC for SCTE-35) |
| `selectionSyntaxIndicator` | Boolean | false | Section syntax indicator |
| `privateIndicator` | Boolean | false | Private indicator |
| `protocolVersion` | Number | 0 | Protocol version |
| `encryptedPacket` | Boolean | false | Encrypted packet flag |
| `encryptedAlgorithm` | Number | 0 | Encryption algorithm |
| `ptsAdjustment` | Number | 0 | PTS adjustment value |
| `cwIndex` | Number | 255 | Control word index |
| `tier` | Number | 4095 | Tier information |
| `spliceCommandType` | Number | 5 | Splice command type |
| `descriptors` | Array | [] | Array of descriptors |

##### SpliceInsert Command Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `spliceEventId` | Number | - | Unique identifier for the splice event |
| `spliceEventCancelIndicator` | Boolean | false | Cancel a previously scheduled event |
| `outOfNetworkIndicator` | Boolean | false | Out of network indicator |
| `programSpliceFlag` | Boolean | true | Program splice flag |
| `durationFlag` | Boolean | false | Duration flag |
| `spliceImmediateFlag` | Boolean | false | Splice immediate flag |
| `breakDurationAutoReturn` | Boolean | false | Break duration auto return |
| `breakDuration` | Number | 0 | Break duration in 90kHz units |
| `uniqueProgramId` | Number | 1 | Unique program identifier |
| `available` | Number | 0 | Available count |
| `expected` | Number | 0 | Expected count |
| `spliceTimeSpecified` | Boolean | true | Time specified flag |
| `spliceTimePts` | Number | 0 | Splice time PTS in 90kHz units |

##### TimeSignal Command Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `timeSpecified` | Boolean | true | Time specified flag |
| `pts` | Number | 0 | PTS value in 90kHz units |

#### Response

```json
{
  "success": true,
  "data": {
    "base64": "/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM=",
    "hex": "0xFC302A0000002673C0FFFFF00F050000163A7FCFFE7F0C4F7300000000000A00084355454900000000EC8B354E"
  },
  "message": "SCTE-35 encoded successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Response Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `base64` | String | Base64 encoded SCTE-35 data |
| `hex` | String | Hexadecimal encoded SCTE-35 data |

#### Example

```bash
curl -X POST http://localhost:3000/api/scte35/encode \
  -H "Content-Type: application/json" \
  -d '{
    "spliceInfo": {
      "tableId": 252,
      "protocolVersion": 0,
      "ptsAdjustment": 0,
      "cwIndex": 255,
      "tier": 4095,
      "spliceCommandType": 5
    },
    "command": {
      "spliceEventId": 1,
      "spliceEventCancelIndicator": false,
      "outOfNetworkIndicator": true,
      "programSpliceFlag": true,
      "durationFlag": true,
      "spliceImmediateFlag": false,
      "breakDurationAutoReturn": true,
      "breakDuration": 1800000,
      "uniqueProgramId": 1,
      "available": 0,
      "expected": 0,
      "spliceTimeSpecified": true,
      "spliceTimePts": 0
    },
    "commandType": "splice-insert"
  }'
```

#### Error Responses

**400 Bad Request**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Missing required fields",
    "details": {
      "missing": ["spliceInfo", "command", "commandType"]
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**422 Unprocessable Entity**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid spliceEventId value",
    "details": {
      "field": "spliceEventId",
      "value": -1,
      "constraint": "must be between 0 and 4294967295"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Stream Management API

### POST /stream/start

Start a new stream with specified configuration.

**Endpoint:** `POST /api/stream/start`

**Description:** Initializes and starts a new stream processing pipeline.

#### Request Body

```json
{
  "inputUrl": "srt://localhost:9000?streamid=live/stream",
  "outputUrl": "srt://localhost:9001?streamid=live/output",
  "streamType": "srt",
  "bitrate": 5000,
  "resolution": "1920x1080",
  "codec": "h264"
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `inputUrl` | String | Yes | Source stream URL |
| `outputUrl` | String | Yes | Output stream URL |
| `streamType` | String | Yes | Stream type ("srt", "hls", "dash", "rtmp") |
| `bitrate` | Number | Yes | Target bitrate in kbps |
| `resolution` | String | Yes | Video resolution (e.g., "1920x1080") |
| `codec` | String | Yes | Video codec ("h264", "h265", "av1") |

#### Response

```json
{
  "success": true,
  "data": {
    "streamId": "stream_123456",
    "config": {
      "inputUrl": "srt://localhost:9000?streamid=live/stream",
      "outputUrl": "srt://localhost:9001?streamid=live/output",
      "streamType": "srt",
      "bitrate": 5000,
      "resolution": "1920x1080",
      "codec": "h264"
    },
    "startTime": "2024-01-01T00:00:00.000Z"
  },
  "message": "Stream started successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Example

```bash
curl -X POST http://localhost:3000/api/stream/start \
  -H "Content-Type: application/json" \
  -d '{
    "inputUrl": "srt://localhost:9000?streamid=live/stream",
    "outputUrl": "srt://localhost:9001?streamid=live/output",
    "streamType": "srt",
    "bitrate": 5000,
    "resolution": "1920x1080",
    "codec": "h264"
  }'
```

### POST /stream/stop

Stop the currently running stream.

**Endpoint:** `POST /api/stream/stop`

**Description:** Stops the active stream and releases resources.

#### Request Body

Empty request body.

#### Response

```json
{
  "success": true,
  "data": {
    "streamId": "stream_123456",
    "stopTime": "2024-01-01T00:01:00.000Z",
    "duration": 60,
    "totalBytesProcessed": 375000000
  },
  "message": "Stream stopped successfully",
  "timestamp": "2024-01-01T00:01:00.000Z"
}
```

#### Example

```bash
curl -X POST http://localhost:3000/api/stream/stop \
  -H "Content-Type: application/json"
```

### POST /stream/inject

Inject SCTE-35 data into the active stream.

**Endpoint:** `POST /api/stream/inject`

**Description:** Injects SCTE-35 cues into the currently active stream.

#### Request Body

```json
{
  "scte35Data": "/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM="
}
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `scte35Data` | String | Yes | Base64 encoded SCTE-35 data |

#### Response

```json
{
  "success": true,
  "data": {
    "injectionId": "injection_789012",
    "timestamp": "2024-01-01T00:00:30.000Z",
    "dataLength": 68,
    "streamTime": 30.5
  },
  "message": "SCTE-35 injection successful",
  "timestamp": "2024-01-01T00:00:30.000Z"
}
```

#### Example

```bash
curl -X POST http://localhost:3000/api/stream/inject \
  -H "Content-Type: application/json" \
  -d '{
    "scte35Data": "/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM="
  }'
```

---

## Stream Monitoring API

### GET /stream/status

Get current stream status and basic metrics.

**Endpoint:** `GET /api/stream/status`

**Description:** Retrieves the current status of the active stream.

#### Parameters

No parameters required.

#### Response

```json
{
  "success": true,
  "data": {
    "status": "running",
    "inputBitrate": 5123,
    "outputBitrate": 4876,
    "viewers": 25,
    "uptime": 3600,
    "lastInjection": "2024-01-01T00:30:00.000Z"
  },
  "message": "Stream status retrieved successfully",
  "timestamp": "2024-01-01T01:00:00.000Z"
}
```

#### Response Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | String | Stream status ("stopped", "starting", "running", "error") |
| `inputBitrate` | Number | Current input bitrate in kbps |
| `outputBitrate` | Number | Current output bitrate in kbps |
| `viewers` | Number | Number of current viewers |
| `uptime` | Number | Stream uptime in seconds |
| `lastInjection` | String | Timestamp of last SCTE-35 injection |

#### Example

```bash
curl -X GET http://localhost:3000/api/stream/status
```

### GET /stream/metrics

Get detailed stream performance metrics.

**Endpoint:** `GET /api/stream/metrics`

**Description:** Retrieves detailed performance metrics for the active stream.

#### Parameters

No parameters required.

#### Response

```json
{
  "success": true,
  "data": {
    "inputBitrate": 5123,
    "outputBitrate": 4876,
    "viewers": 25,
    "uptime": 3600,
    "packetLoss": 0.05,
    "latency": 1250,
    "framesDropped": 12,
    "audioLevel": -12.5,
    "videoLevel": -8.3,
    "networkThroughput": 6234000,
    "cpuUsage": 15.3,
    "memoryUsage": 512000000
  },
  "message": "Stream metrics retrieved successfully",
  "timestamp": "2024-01-01T01:00:00.000Z"
}
```

#### Response Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `inputBitrate` | Number | Current input bitrate in kbps |
| `outputBitrate` | Number | Current output bitrate in kbps |
| `viewers` | Number | Number of current viewers |
| `uptime` | Number | Stream uptime in seconds |
| `packetLoss` | Number | Packet loss percentage |
| `latency` | Number | Stream latency in milliseconds |
| `framesDropped` | Number | Number of dropped frames |
| `audioLevel` | Number | Audio level in dB |
| `videoLevel` | Number | Video level in dB |
| `networkThroughput` | Number | Network throughput in bytes/second |
| `cpuUsage` | Number | CPU usage percentage |
| `memoryUsage` | Number | Memory usage in bytes |

#### Example

```bash
curl -X GET http://localhost:3000/api/stream/metrics
```

### GET /stream/health

Get system health information.

**Endpoint:** `GET /api/stream/health`

**Description:** Retrieves system health metrics and resource usage.

#### Parameters

No parameters required.

#### Response

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "cpu": 25.3,
    "memory": 67.8,
    "disk": 45.2,
    "network": 12.5,
    "loadAverage": [1.2, 1.5, 1.8],
    "temperature": 65.0,
    "uptime": 86400
  },
  "message": "System health retrieved successfully",
  "timestamp": "2024-01-01T01:00:00.000Z"
}
```

#### Response Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | String | Overall health status ("healthy", "warning", "critical") |
| `cpu` | Number | CPU usage percentage |
| `memory` | Number | Memory usage percentage |
| `disk` | Number | Disk usage percentage |
| `network` | Number | Network usage percentage |
| `loadAverage` | Array | System load average (1min, 5min, 15min) |
| `temperature` | Number | CPU temperature in Celsius |
| `uptime` | Number | System uptime in seconds |

#### Example

```bash
curl -X GET http://localhost:3000/api/stream/health
```

---

## WebSocket API

### Connection

Connect to the WebSocket endpoint for real-time updates:

```
ws://localhost:3000/api/stream/ws
```

### Message Format

All WebSocket messages follow this format:

```json
{
  "type": "status|metrics|health|activity",
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Message Types

#### Status Update

```json
{
  "type": "status",
  "data": {
    "status": "running",
    "inputBitrate": 5123,
    "outputBitrate": 4876,
    "viewers": 25,
    "uptime": 3600,
    "lastInjection": "2024-01-01T00:30:00.000Z"
  },
  "timestamp": "2024-01-01T01:00:00.000Z"
}
```

#### Metrics Update

```json
{
  "type": "metrics",
  "data": {
    "inputBitrate": 5123,
    "outputBitrate": 4876,
    "viewers": 25,
    "uptime": 3600,
    "packetLoss": 0.05,
    "latency": 1250
  },
  "timestamp": "2024-01-01T01:00:00.000Z"
}
```

#### Health Update

```json
{
  "type": "health",
  "data": {
    "status": "healthy",
    "cpu": 25.3,
    "memory": 67.8,
    "disk": 45.2,
    "network": 12.5
  },
  "timestamp": "2024-01-01T01:00:00.000Z"
}
```

#### Activity Update

```json
{
  "type": "activity",
  "data": {
    "timestamp": "2024-01-01T00:30:00.000Z",
    "type": "injection",
    "data": "/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM=",
    "description": "Ad break start"
  },
  "timestamp": "2024-01-01T00:30:00.000Z"
}
```

### JavaScript Example

```javascript
const ws = new WebSocket('ws://localhost:3000/api/stream/ws');

ws.onopen = () => {
  console.log('Connected to stream WebSocket');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'status':
      updateStreamStatus(message.data);
      break;
    case 'metrics':
      updateMetrics(message.data);
      break;
    case 'health':
      updateHealth(message.data);
      break;
    case 'activity':
      logActivity(message.data);
      break;
  }
};

ws.onclose = () => {
  console.log('Disconnected from stream WebSocket');
  // Implement reconnection logic
  setTimeout(() => {
    connectWebSocket();
  }, 5000);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};
```

---

## Error Handling

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_INPUT` | 400 | Invalid input data |
| `MISSING_REQUIRED_FIELD` | 400 | Required field is missing |
| `INVALID_FORMAT` | 400 | Invalid data format |
| `VALIDATION_ERROR` | 422 | Data validation failed |
| `STREAM_NOT_RUNNING` | 400 | No stream is currently running |
| `STREAM_ALREADY_RUNNING` | 400 | Stream is already running |
| `UNSUPPORTED_STREAM_TYPE` | 400 | Unsupported stream type |
| `INJECTION_FAILED` | 500 | SCTE-35 injection failed |
| `STREAM_START_FAILED` | 500 | Failed to start stream |
| `STREAM_STOP_FAILED` | 500 | Failed to stop stream |
| `INTERNAL_ERROR` | 500 | Internal server error |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Detailed error message",
    "details": {
      "field": "spliceEventId",
      "value": -1,
      "constraint": "must be between 0 and 4294967295"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **SCTE-35 Encoding**: 100 requests per minute
- **Stream Operations**: 10 requests per minute
- **Monitoring APIs**: 60 requests per minute
- **WebSocket Connections**: 10 concurrent connections per IP

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

---

## Versioning

The API uses semantic versioning. Include the API version in requests:

```
Accept: application/vnd.scte35-encoder.v1+json
```

Current version: `v1`

---

## SDK Examples

### JavaScript/TypeScript

```typescript
class SCTE35EncoderClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
  }

  async encodeSCTE35(config: SCTE35Config): Promise<SCTE35Encoded> {
    const response = await fetch(`${this.baseUrl}/scte35/encode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async startStream(config: StreamConfig): Promise<StreamStartResponse> {
    const response = await fetch(`${this.baseUrl}/stream/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }

  async injectSCTE35(scte35Data: string): Promise<InjectionResponse> {
    const response = await fetch(`${this.baseUrl}/stream/inject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scte35Data })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
  }
}

// Usage example
const client = new SCTE35EncoderClient();

// Encode SCTE-35
const encoded = await client.encodeSCTE35({
  spliceInfo: { ... },
  command: { ... },
  commandType: 'splice-insert'
});

// Start stream
const stream = await client.startStream({
  inputUrl: 'srt://localhost:9000?streamid=live/stream',
  outputUrl: 'srt://localhost:9001?streamid=live/output',
  streamType: 'srt',
  bitrate: 5000,
  resolution: '1920x1080',
  codec: 'h264'
});

// Inject SCTE-35
await client.injectSCTE35(encoded.base64);
```

### Python

```python
import requests
import json
import websocket
import threading

class SCTE35EncoderClient:
    def __init__(self, base_url="http://localhost:3000/api"):
        self.base_url = base_url
        self.ws_url = "ws://localhost:3000/api/stream/ws"

    def encode_scte35(self, config):
        response = requests.post(
            f"{self.base_url}/scte35/encode",
            json=config,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()["data"]

    def start_stream(self, config):
        response = requests.post(
            f"{self.base_url}/stream/start",
            json=config,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()["data"]

    def inject_scte35(self, scte35_data):
        response = requests.post(
            f"{self.base_url}/stream/inject",
            json={"scte35Data": scte35_data},
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()["data"]

    def get_stream_status(self):
        response = requests.get(f"{self.base_url}/stream/status")
        response.raise_for_status()
        return response.json()["data"]

    def connect_websocket(self, on_message):
        def on_ws_message(ws, message):
            data = json.loads(message)
            on_message(data)

        def on_ws_error(ws, error):
            print(f"WebSocket error: {error}")

        def on_ws_close(ws, close_status_code, close_msg):
            print("WebSocket closed")

        def on_ws_open(ws):
            print("WebSocket connected")

        ws = websocket.WebSocketApp(
            self.ws_url,
            on_message=on_ws_message,
            on_error=on_ws_error,
            on_close=on_ws_close,
            on_open=on_ws_open
        )

        wst = threading.Thread(target=ws.run_forever)
        wst.daemon = True
        wst.start()

        return ws

# Usage example
client = SCTE35EncoderClient()

# Encode SCTE-35
config = {
    "spliceInfo": {"tableId": 252, "protocolVersion": 0, "ptsAdjustment": 0, "cwIndex": 255, "tier": 4095, "spliceCommandType": 5},
    "command": {"spliceEventId": 1, "spliceEventCancelIndicator": False, "outOfNetworkIndicator": True, "programSpliceFlag": True, "durationFlag": True, "spliceImmediateFlag": False, "breakDurationAutoReturn": True, "breakDuration": 1800000, "uniqueProgramId": 1, "available": 0, "expected": 0, "spliceTimeSpecified": True, "spliceTimePts": 0},
    "commandType": "splice-insert"
}
encoded = client.encode_scte35(config)

# Start stream
stream_config = {
    "inputUrl": "srt://localhost:9000?streamid=live/stream",
    "outputUrl": "srt://localhost:9001?streamid=live/output",
    "streamType": "srt",
    "bitrate": 5000,
    "resolution": "1920x1080",
    "codec": "h264"
}
stream = client.start_stream(stream_config)

# Connect to WebSocket for real-time updates
def handle_message(message):
    print(f"Received {message['type']}: {message['data']}")

ws = client.connect_websocket(handle_message)

# Inject SCTE-35
client.inject_scte35(encoded["base64"])
```

---

For more information and examples, please refer to the [complete documentation](../README.md) or [feature-specific documentation](./SCTE35_ENCODER.md, ./STREAM_INJECTION.md).