# Examples and Configuration Samples

This directory contains practical examples and configuration samples for the SCTE-35 Encoder & Stream Injection System.

## Available Examples

### 1. SCTE-35 Encoding Examples
- [Basic Splice Insert](./scte35/basic-splice-insert.ts)
- [Ad Break Start/End Pair](./scte35/ad-break-pair.ts)
- [Time Signal Events](./scte35/time-signal.ts)
- [Multiple Descriptors](./scte35/descriptors.ts)

### 2. Stream Configuration Examples
- [SRT Stream Setup](./streams/srt-config.json)
- [HLS Stream Setup](./streams/hls-config.json)
- [DASH Stream Setup](./streams/dash-config.json)
- [RTMP Stream Setup](./streams/rtmp-config.json)

### 3. Integration Examples
- [JavaScript Client](./integration/javascript-client.js)
- [Python Client](./integration/python-client.py)
- [WebSocket Integration](./integration/websocket-example.js)
- [React Component](./integration/react-component.tsx)

### 4. Deployment Examples
- [Docker Compose](./deployment/docker-compose.yml)
- [Kubernetes](./deployment/k8s/)
- [PM2 Configuration](./deployment/pm2.config.js)
- [Nginx Configuration](./deployment/nginx.conf)

## Quick Start

### Using SCTE-35 Encoding Examples

```bash
# Navigate to examples directory
cd examples

# Run basic splice insert example
node scte35/basic-splice-insert.ts
```

### Using Stream Configuration Examples

```bash
# Copy SRT configuration to your project
cp examples/streams/srt-config.json ./my-stream-config.json

# Edit the configuration
nano ./my-stream-config.json
```

## SCTE-35 Encoding Examples

### Basic Splice Insert

```typescript
// examples/scte35/basic-splice-insert.ts
import { encodeSCTE35 } from '../src/lib/scte35-encoder';

const config = {
  spliceInfo: {
    tableId: 252,
    protocolVersion: 0,
    ptsAdjustment: 0,
    cwIndex: 255,
    tier: 4095,
    spliceCommandType: 5
  },
  command: {
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
    spliceTimePts: 0
  },
  commandType: 'splice-insert'
};

async function main() {
  try {
    const result = await encodeSCTE35(config);
    console.log('Base64:', result.base64);
    console.log('Hex:', result.hex);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

### Ad Break Start/End Pair

```typescript
// examples/scte35/ad-break-pair.ts
import { encodeSCTE35 } from '../src/lib/scte35-encoder';

// Ad Break Start (30 seconds duration)
const adBreakStart = {
  spliceInfo: {
    tableId: 252,
    protocolVersion: 0,
    ptsAdjustment: 0,
    cwIndex: 255,
    tier: 4095,
    spliceCommandType: 5
  },
  command: {
    spliceEventId: 1,
    spliceEventCancelIndicator: false,
    outOfNetworkIndicator: true,
    programSpliceFlag: true,
    durationFlag: true,
    spliceImmediateFlag: false,
    breakDurationAutoReturn: true,
    breakDuration: 2700000, // 30 seconds
    uniqueProgramId: 1,
    available: 0,
    expected: 0,
    spliceTimeSpecified: true,
    spliceTimePts: 0
  },
  commandType: 'splice-insert'
};

// Ad Break End (30 seconds later)
const adBreakEnd = {
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
    outOfNetworkIndicator: false,
    programSpliceFlag: true,
    durationFlag: false,
    spliceImmediateFlag: false,
    uniqueProgramId: 1,
    available: 0,
    expected: 0,
    spliceTimeSpecified: true,
    spliceTimePts: 2700000 // 30 seconds later
  },
  commandType: 'splice-insert'
};

async function main() {
  try {
    const startResult = await encodeSCTE35(adBreakStart);
    const endResult = await encodeSCTE35(adBreakEnd);
    
    console.log('Ad Break Start:');
    console.log('Base64:', startResult.base64);
    console.log('');
    
    console.log('Ad Break End:');
    console.log('Base64:', endResult.base64);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

### Time Signal Events

```typescript
// examples/scte35/time-signal.ts
import { encodeSCTE35 } from '../src/lib/scte35-encoder';

const timeSignalConfig = {
  spliceInfo: {
    tableId: 252,
    protocolVersion: 0,
    ptsAdjustment: 0,
    cwIndex: 255,
    tier: 4095,
    spliceCommandType: 6 // Time Signal command type
  },
  command: {
    timeSpecified: true,
    pts: 900000 // 10 seconds in 90kHz units
  },
  commandType: 'time-signal'
};

async function main() {
  try {
    const result = await encodeSCTE35(timeSignalConfig);
    console.log('Time Signal Base64:', result.base64);
    console.log('Time Signal Hex:', result.hex);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## Stream Configuration Examples

### SRT Stream Configuration

```json
// examples/streams/srt-config.json
{
  "inputUrl": "srt://source-server:9000?streamid=live/stream",
  "outputUrl": "srt://output-server:9001?streamid=live/output",
  "streamType": "srt",
  "bitrate": 5000,
  "resolution": "1920x1080",
  "codec": "h264",
  "srtOptions": {
    "latency": 2000,
    "maxbw": 10000000,
    "packetfilter": "",
    "messageapi": true,
    "streamid": "live/stream",
    "pbkeylen": 0,
    "passphrase": ""
  }
}
```

### HLS Stream Configuration

```json
// examples/streams/hls-config.json
{
  "inputUrl": "http://source-server/live/stream.m3u8",
  "outputUrl": "http://output-server/live/output.m3u8",
  "streamType": "hls",
  "bitrate": 5000,
  "resolution": "1920x1080",
  "codec": "h264",
  "hlsOptions": {
    "segmentDuration": 6,
    "playlistType": "event",
    "hlsTime": 6,
    "hlsListSize": 0,
    "hlsFlags": "delete_segments+round_durations",
    "hlsAllowCache": 1
  }
}
```

### DASH Stream Configuration

```json
// examples/streams/dash-config.json
{
  "inputUrl": "http://source-server/live/stream.mpd",
  "outputUrl": "http://output-server/live/output.mpd",
  "streamType": "dash",
  "bitrate": 5000,
  "resolution": "1920x1080",
  "codec": "h264",
  "dashOptions": {
    "segDuration": 6,
    "fragDuration": 2,
    "windowSize": 6,
    "extraWindowSize": 6,
    "use_template": true,
    "use_timeline": true
  }
}
```

### RTMP Stream Configuration

```json
// examples/streams/rtmp-config.json
{
  "inputUrl": "rtmp://source-server/live/stream",
  "outputUrl": "rtmp://output-server/live/output",
  "streamType": "rtmp",
  "bitrate": 5000,
  "resolution": "1920x1080",
  "codec": "h264",
  "rtmpOptions": {
    "flashVer": "FMLE/3.0",
    "tcUrl": "rtmp://output-server/live",
    "pageUrl": "http://your-site.com",
    "app": "live",
    "playpath": "stream"
  }
}
```

## Integration Examples

### JavaScript Client

```javascript
// examples/integration/javascript-client.js
class SCTE35StreamClient {
  constructor(baseUrl = 'http://localhost:3000/api') {
    this.baseUrl = baseUrl;
    this.ws = null;
  }

  // Encode SCTE-35 message
  async encodeSCTE35(config) {
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

  // Start stream
  async startStream(config) {
    const response = await fetch(`${this.baseUrl}/stream/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Inject SCTE-35
  async injectSCTE35(scte35Data) {
    const response = await fetch(`${this.baseUrl}/stream/inject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scte35Data })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Connect WebSocket for real-time updates
  connectWebSocket(onMessage) {
    this.ws = new WebSocket(`ws://localhost:3000/api/stream/ws`);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Auto-reconnect
      setTimeout(() => this.connectWebSocket(onMessage), 5000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  // Disconnect WebSocket
  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Usage example
async function runExample() {
  const client = new SCTE35StreamClient();

  // Encode SCTE-35 for ad break
  const adBreakConfig = {
    spliceInfo: {
      tableId: 252,
      protocolVersion: 0,
      ptsAdjustment: 0,
      cwIndex: 255,
      tier: 4095,
      spliceCommandType: 5
    },
    command: {
      spliceEventId: 1,
      spliceEventCancelIndicator: false,
      outOfNetworkIndicator: true,
      programSpliceFlag: true,
      durationFlag: true,
      spliceImmediateFlag: false,
      breakDurationAutoReturn: true,
      breakDuration: 1800000,
      uniqueProgramId: 1,
      available: 0,
      expected: 0,
      spliceTimeSpecified: true,
      spliceTimePts: 0
    },
    commandType: 'splice-insert'
  };

  const encoded = await client.encodeSCTE35(adBreakConfig);
  console.log('Encoded SCTE-35:', encoded.base64);

  // Start SRT stream
  const streamConfig = {
    inputUrl: "srt://localhost:9000?streamid=live/stream",
    outputUrl: "srt://localhost:9001?streamid=live/output",
    streamType: "srt",
    bitrate: 5000,
    resolution: "1920x1080",
    codec: "h264"
  };

  await client.startStream(streamConfig);
  console.log('Stream started');

  // Connect WebSocket for real-time updates
  client.connectWebSocket((message) => {
    console.log('Received:', message.type, message.data);
  });

  // Inject SCTE-35 after 5 seconds
  setTimeout(async () => {
    await client.injectSCTE35(encoded.base64);
    console.log('SCTE-35 injected');
  }, 5000);
}

runExample().catch(console.error);
```

### Python Client

```python
# examples/integration/python-client.py
import requests
import json
import websocket
import threading
import time

class SCTE35StreamClient:
    def __init__(self, base_url="http://localhost:3000/api"):
        self.base_url = base_url
        self.ws_url = "ws://localhost:3000/api/stream/ws"
        self.ws = None

    def encode_scte35(self, config):
        """Encode SCTE-35 message"""
        response = requests.post(
            f"{self.base_url}/scte35/encode",
            json=config,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()["data"]

    def start_stream(self, config):
        """Start a new stream"""
        response = requests.post(
            f"{self.base_url}/stream/start",
            json=config,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()

    def inject_scte35(self, scte35_data):
        """Inject SCTE-35 into active stream"""
        response = requests.post(
            f"{self.base_url}/stream/inject",
            json={"scte35Data": scte35_data},
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()

    def get_stream_status(self):
        """Get current stream status"""
        response = requests.get(f"{self.base_url}/stream/status")
        response.raise_for_status()
        return response.json()["data"]

    def connect_websocket(self, on_message):
        """Connect to WebSocket for real-time updates"""
        def on_ws_message(ws, message):
            data = json.loads(message)
            on_message(data)

        def on_ws_error(ws, error):
            print(f"WebSocket error: {error}")

        def on_ws_close(ws, close_status_code, close_msg):
            print("WebSocket closed")
            # Auto-reconnect
            time.sleep(5)
            self.connect_websocket(on_message)

        def on_ws_open(ws):
            print("WebSocket connected")

        self.ws = websocket.WebSocketApp(
            self.ws_url,
            on_message=on_ws_message,
            on_error=on_ws_error,
            on_close=on_ws_close,
            on_open=on_ws_open
        )

        wst = threading.Thread(target=self.ws.run_forever)
        wst.daemon = True
        wst.start()

        return self.ws

    def disconnect_websocket(self):
        """Disconnect WebSocket"""
        if self.ws:
            self.ws.close()
            self.ws = None

def main():
    """Main example function"""
    client = SCTE35StreamClient()

    # Encode SCTE-35 for ad break
    ad_break_config = {
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
            "spliceEventCancelIndicator": False,
            "outOfNetworkIndicator": True,
            "programSpliceFlag": True,
            "durationFlag": True,
            "spliceImmediateFlag": False,
            "breakDurationAutoReturn": True,
            "breakDuration": 1800000,
            "uniqueProgramId": 1,
            "available": 0,
            "expected": 0,
            "spliceTimeSpecified": True,
            "spliceTimePts": 0
        },
        "commandType": "splice-insert"
    }

    encoded = client.encode_scte35(ad_break_config)
    print(f"Encoded SCTE-35: {encoded['base64']}")

    # Start SRT stream
    stream_config = {
        "inputUrl": "srt://localhost:9000?streamid=live/stream",
        "outputUrl": "srt://localhost:9001?streamid=live/output",
        "streamType": "srt",
        "bitrate": 5000,
        "resolution": "1920x1080",
        "codec": "h264"
    }

    stream_response = client.start_stream(stream_config)
    print("Stream started:", stream_response)

    # Connect WebSocket for real-time updates
    def handle_message(message):
        print(f"Received {message['type']}: {message['data']}")

    client.connect_websocket(handle_message)

    # Inject SCTE-35 after 5 seconds
    time.sleep(5)
    injection_response = client.inject_scte35(encoded["base64"])
    print("SCTE-35 injected:", injection_response)

    # Monitor stream status
    for i in range(10):
        status = client.get_stream_status()
        print(f"Stream status: {status}")
        time.sleep(2)

    # Cleanup
    client.disconnect_websocket()

if __name__ == "__main__":
    main()
```

### React Component

```typescript
// examples/integration/react-component.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface StreamStatus {
  status: 'stopped' | 'starting' | 'running' | 'error';
  inputBitrate: number;
  outputBitrate: number;
  viewers: number;
  uptime: number;
}

interface SCTE35StreamControlProps {
  baseUrl?: string;
}

export function SCTE35StreamControl({ baseUrl = 'http://localhost:3000/api' }: SCTE35StreamControlProps) {
  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    status: 'stopped',
    inputBitrate: 0,
    outputBitrate: 0,
    viewers: 0,
    uptime: 0
  });

  const [isConnected, setIsConnected] = useState(false);
  const [scte35Data, setScte35Data] = useState('');

  // WebSocket connection for real-time updates
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:3000/api/stream/ws`);

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'status') {
        setStreamStatus(data.status);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const startStream = async () => {
    try {
      const config = {
        inputUrl: "srt://localhost:9000?streamid=live/stream",
        outputUrl: "srt://localhost:9001?streamid=live/output",
        streamType: "srt",
        bitrate: 5000,
        resolution: "1920x1080",
        codec: "h264"
      };

      const response = await fetch(`${baseUrl}/stream/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        console.log('Stream started successfully');
      }
    } catch (error) {
      console.error('Error starting stream:', error);
    }
  };

  const stopStream = async () => {
    try {
      const response = await fetch(`${baseUrl}/stream/stop`, {
        method: 'POST'
      });

      if (response.ok) {
        console.log('Stream stopped successfully');
      }
    } catch (error) {
      console.error('Error stopping stream:', error);
    }
  };

  const injectSCTE35 = async () => {
    if (!scte35Data) return;

    try {
      const response = await fetch(`${baseUrl}/stream/inject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scte35Data })
      });

      if (response.ok) {
        console.log('SCTE-35 injected successfully');
      }
    } catch (error) {
      console.error('Error injecting SCTE-35:', error);
    }
  };

  const encodeSCTE35 = async () => {
    try {
      const config = {
        spliceInfo: {
          tableId: 252,
          protocolVersion: 0,
          ptsAdjustment: 0,
          cwIndex: 255,
          tier: 4095,
          spliceCommandType: 5
        },
        command: {
          spliceEventId: 1,
          spliceEventCancelIndicator: false,
          outOfNetworkIndicator: true,
          programSpliceFlag: true,
          durationFlag: true,
          spliceImmediateFlag: false,
          breakDurationAutoReturn: true,
          breakDuration: 1800000,
          uniqueProgramId: 1,
          available: 0,
          expected: 0,
          spliceTimeSpecified: true,
          spliceTimePts: 0
        },
        commandType: 'splice-insert'
      };

      const response = await fetch(`${baseUrl}/scte35/encode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        const result = await response.json();
        setScte35Data(result.data.base64);
      }
    } catch (error) {
      console.error('Error encoding SCTE-35:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Stream Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Badge variant={
              streamStatus.status === 'running' ? "default" :
              streamStatus.status === 'error' ? "destructive" : "secondary"
            }>
              {streamStatus.status.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Input Bitrate</label>
              <div className="text-lg font-bold">{streamStatus.inputBitrate} kbps</div>
            </div>
            <div>
              <label className="text-sm font-medium">Output Bitrate</label>
              <div className="text-lg font-bold">{streamStatus.outputBitrate} kbps</div>
            </div>
            <div>
              <label className="text-sm font-medium">Viewers</label>
              <div className="text-lg font-bold">{streamStatus.viewers}</div>
            </div>
            <div>
              <label className="text-sm font-medium">Uptime</label>
              <div className="text-lg font-bold">{formatTime(streamStatus.uptime)}</div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={startStream} 
              disabled={streamStatus.status === 'running'}
            >
              Start Stream
            </Button>
            <Button 
              onClick={stopStream} 
              disabled={streamStatus.status !== 'running'}
              variant="outline"
            >
              Stop Stream
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SCTE-35 Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={encodeSCTE35}>
              Generate SCTE-35
            </Button>
          </div>

          {scte35Data && (
            <div className="space-y-2">
              <label className="text-sm font-medium">SCTE-35 Data</label>
              <Input 
                value={scte35Data} 
                readOnly 
                className="font-mono text-xs"
              />
              <Button onClick={injectSCTE35} disabled={!scte35Data}>
                Inject SCTE-35
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

## Deployment Examples

### Docker Compose

```yaml
# examples/deployment/docker-compose.yml
version: '3.8'

services:
  app:
    build: ../../
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/scte35_encoder
      - NEXTAUTH_SECRET=your-secret-key-here
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
      - redis
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=scte35_encoder
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### PM2 Configuration

```javascript
// examples/deployment/pm2.config.js
module.exports = {
  apps: [{
    name: 'scte35-encoder',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/scte35-encoder',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://postgres:password@localhost:5432/scte35_encoder',
      NEXTAUTH_SECRET: 'your-secret-key-here',
      NEXTAUTH_URL: 'https://your-domain.com'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }],
  deploy: {
    production: {
      user: 'node',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'https://github.com/your-username/scte35-encoder.git',
      path: '/home/node/scte35-encoder',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
```

### Nginx Configuration

```nginx
# examples/deployment/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=websocket:10m rate=5r/s;

    upstream scte35_backend {
        server localhost:3000;
        keepalive 64;
    }

    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Main application
        location / {
            proxy_pass http://scte35_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 86400;
            limit_req zone=api burst=20 nodelay;
        }

        # WebSocket endpoint
        location /api/stream/ws {
            proxy_pass http://scte35_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            limit_req zone=websocket burst=10 nodelay;
        }

        # API rate limiting
        location /api/ {
            proxy_pass http://scte35_backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            limit_req zone=api burst=20 nodelay;
        }

        # Static files
        location /_next/static/ {
            alias /home/node/scte35-encoder/.next/static/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Health check
        location /health {
            proxy_pass http://scte35_backend/api/health;
            access_log off;
        }
    }
}
```

## Running Examples

### Prerequisites

1. Install the SCTE-35 Encoder system following the [Installation Guide](../docs/INSTALLATION.md)
2. Ensure the development server is running: `npm run dev`
3. Install required dependencies for examples

### Running JavaScript Examples

```bash
# Navigate to examples directory
cd examples

# Install dependencies for integration examples
cd integration
npm install

# Run JavaScript client example
node javascript-client.js
```

### Running Python Examples

```bash
# Install Python dependencies
pip install requests websocket-client

# Run Python client example
python python-client.py
```

### Using React Component

```typescript
// Import the component in your React application
import { SCTE35StreamControl } from './examples/integration/react-component';

// Use in your component
function App() {
  return (
    <div>
      <h1>SCTE-35 Stream Control</h1>
      <SCTE35StreamControl />
    </div>
  );
}
```

### Using Deployment Examples

```bash
# Navigate to deployment examples
cd examples/deployment

# Start with Docker Compose
docker-compose up -d

# Or use PM2 configuration
pm2 start pm2.config.js

# Or use Nginx configuration
sudo cp nginx.conf /etc/nginx/nginx.conf
sudo nginx -t
sudo systemctl reload nginx
```

## Customizing Examples

### Modifying SCTE-35 Configurations

You can modify the SCTE-35 configuration parameters to match your specific requirements:

```typescript
// Custom SCTE-35 configuration
const customConfig = {
  spliceInfo: {
    tableId: 252, // Standard SCTE-35 table ID
    protocolVersion: 0, // Protocol version
    ptsAdjustment: 0, // PTS adjustment
    cwIndex: 255, // Control word index
    tier: 4095, // Tier information
    spliceCommandType: 5 // Splice insert command
  },
  command: {
    spliceEventId: 12345, // Your unique event ID
    spliceEventCancelIndicator: false,
    outOfNetworkIndicator: true, // For ad breaks
    programSpliceFlag: true,
    durationFlag: true,
    spliceImmediateFlag: false,
    breakDurationAutoReturn: true,
    breakDuration: 3600000, // 40 seconds in 90kHz units
    uniqueProgramId: 67890, // Your program ID
    available: 0,
    expected: 0,
    spliceTimeSpecified: true,
    spliceTimePts: 0 // Immediate splice
  },
  commandType: 'splice-insert'
};
```

### Customizing Stream Configurations

Modify stream configurations to match your infrastructure:

```json
{
  "inputUrl": "srt://your-source-server:9000?streamid=your-stream",
  "outputUrl": "srt://your-output-server:9001?streamid=your-output",
  "streamType": "srt",
  "bitrate": 8000, // Higher bitrate for better quality
  "resolution": "1920x1080",
  "codec": "h264",
  "srtOptions": {
    "latency": 1000, // Lower latency for real-time
    "maxbw": 20000000, // 20 Mbps maximum bandwidth
    "passphrase": "your-secure-passphrase"
  }
}
```

## Troubleshooting Examples

### Common Issues

1. **Connection Errors**: Ensure the SCTE-35 Encoder server is running on `localhost:3000`
2. **WebSocket Issues**: Check firewall settings and port accessibility
3. **SCTE-35 Encoding Errors**: Validate configuration parameters
4. **Stream Start Failures**: Check input URL format and network connectivity

### Debug Mode

Enable debug logging for troubleshooting:

```javascript
// Enable debug logging in JavaScript
const client = new SCTE35StreamClient('http://localhost:3000/api?debug=true');
```

```python
# Enable debug logging in Python
client = SCTE35StreamClient('http://localhost:3000/api?debug=true')
```

---

For more detailed information, refer to the main [documentation](../docs/README.md) or [API reference](../docs/API_REFERENCE.md).