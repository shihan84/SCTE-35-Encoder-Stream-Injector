# SCTE-35 Encoder & Stream Injector - Examples and Use Cases

## 📋 Table of Contents

- [Basic SCTE-35 Encoding](#basic-scte-35-encoding)
- [Stream Injection Setup](#stream-injection-setup)
- [Advanced Use Cases](#advanced-use-cases)
- [Integration Examples](#integration-examples)
- [Production Deployments](#production-deployments)

## 🎬 Basic SCTE-35 Encoding

### Example 1: Simple Ad Insertion

Create a basic commercial break insertion cue:

```typescript
// Basic ad insertion configuration
const adInsertion = {
  spliceInfo: {
    tableId: 252, // SCTE-35 table ID
    protocolVersion: 0,
    ptsAdjustment: 0,
    cwIndex: 255,
    tier: 4095,
    spliceCommandType: 5 // Splice Insert
  },
  command: {
    spliceEventId: 1,
    spliceEventCancelIndicator: false,
    outOfNetworkIndicator: true, // This is an out-of-network ad break
    programSpliceFlag: true,
    durationFlag: true,
    spliceImmediateFlag: false,
    breakDuration: 2700000, // 30 seconds in 90kHz units
    uniqueProgramId: 1,
    available: 0,
    expected: 0,
    spliceTimeSpecified: true,
    spliceTimePts: 86400000 // 1 second in 90kHz units
  },
  commandType: 'splice-insert'
};

// Encode the SCTE-35 data
const response = await fetch('/api/scte35/encode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(adInsertion)
});

const result = await response.json();
console.log('SCTE-35 Base64:', result.base64);
console.log('SCTE-35 Hex:', result.hex);
```

### Example 2: Program Switching

Create a cue for switching between programs:

```typescript
// Program switching configuration
const programSwitch = {
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
    spliceImmediateFlag: true, // Immediate switch
    uniqueProgramId: 2,
    available: 0,
    expected: 0,
    spliceTimeSpecified: false // No specific time needed for immediate
  },
  commandType: 'splice-insert'
};

const response = await fetch('/api/scte35/encode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(programSwitch)
});

const result = await response.json();
console.log('Program Switch Cue:', result.base64);
```

### Example 3: Time Signal

Create a timing-only cue for synchronization:

```typescript
// Time signal configuration
const timeSignal = {
  spliceInfo: {
    tableId: 252,
    protocolVersion: 0,
    ptsAdjustment: 0,
    cwIndex: 255,
    tier: 4095,
    spliceCommandType: 6 // Time Signal
  },
  command: {
    timeSpecified: true,
    pts: 172800000 // 2 seconds in 90kHz units
  },
  commandType: 'time-signal'
};

const response = await fetch('/api/scte35/encode', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(timeSignal)
});

const result = await response.json();
console.log('Time Signal Cue:', result.base64);
```

## 🔄 Stream Injection Setup

### Example 1: SRT Stream with SCTE-35 Injection

Set up an SRT stream with scheduled ad insertions:

```typescript
// SRT stream configuration
const srtConfig = {
  inputUrl: 'srt://source-server:9000?streamid=live/input&latency=100',
  outputUrl: 'srt://destination-server:9001?streamid=live/output&latency=100',
  streamType: 'srt' as const,
  bitrate: 5000,
  resolution: '1920x1080',
  codec: 'h264'
};

// Start the stream
const startResponse = await fetch('/api/stream/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(srtConfig)
});

console.log('Stream started:', await startResponse.json());

// Create ad insertion cue
const adCue = await createAdInsertionCue({
  duration: 30, // 30 seconds
  eventId: 1,
  description: 'Prime time ad break'
});

// Schedule injection at 30 seconds
const injection = {
  time: 30,
  scte35Data: adCue.base64,
  description: 'Prime time commercial break',
  active: true
};

// Add to scheduled injections
console.log('Scheduled injection for 30 seconds:', injection);

// Manual injection for emergency alert
const emergencyCue = await createEmergencyAlertCue('WEATHER ALERT');
await fetch('/api/stream/inject', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ scte35Data: emergencyCue.base64 })
});

console.log('Emergency alert injected');
```

### Example 2: HLS Stream with Multiple Ad Breaks

Set up an HLS stream with multiple scheduled ad breaks:

```typescript
// HLS stream configuration
const hlsConfig = {
  inputUrl: 'http://cdn-source.com/live/stream.m3u8',
  outputUrl: '/output/live/stream.m3u8',
  streamType: 'hls' as const,
  bitrate: 8000,
  resolution: '1920x1080',
  codec: 'h264'
};

// Start HLS stream
await fetch('/api/stream/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(hlsConfig)
});

// Create multiple ad break cues
const adBreaks = [
  { time: 300, duration: 60, description: 'Mid-roll ad break 1' },
  { time: 900, duration: 120, description: 'Mid-roll ad break 2' },
  { time: 1500, duration: 60, description: 'Mid-roll ad break 3' }
];

// Schedule all ad breaks
for (const adBreak of adBreaks) {
  const cue = await createAdInsertionCue({
    duration: adBreak.duration,
    eventId: adBreaks.indexOf(adBreak) + 1,
    description: adBreak.description
  });
  
  const injection = {
    time: adBreak.time,
    scte35Data: cue.base64,
    description: adBreak.description,
    active: true
  };
  
  console.log(`Scheduled ad break at ${adBreak.time}s:`, adBreak.description);
}
```

### Example 3: DASH Stream with Regional Content

Set up a DASH stream with regional content insertion:

```typescript
// DASH stream configuration
const dashConfig = {
  inputUrl: 'http://origin-server.com/live/input.mp4',
  outputUrl: '/output/live/stream.mpd',
  streamType: 'dash' as const,
  bitrate: 6000,
  resolution: '1920x1080',
  codec: 'h264'
};

// Start DASH stream
await fetch('/api/stream/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(dashConfig)
});

// Create regional content insertion cues
const regionalContent = [
  { region: 'US', time: 0, description: 'US content start' },
  { region: 'EU', time: 0, description: 'EU content start' },
  { region: 'ASIA', time: 0, description: 'Asia content start' }
];

// Schedule regional content based on viewer location
for (const content of regionalContent) {
  const cue = await createRegionalContentCue(content.region);
  
  const injection = {
    time: content.time,
    scte35Data: cue.base64,
    description: content.description,
    active: true,
    metadata: { region: content.region }
  };
  
  console.log(`Scheduled regional content for ${content.region}:`, content.description);
}
```

## 🚀 Advanced Use Cases

### Example 1: Live Event with Dynamic Ad Insertion

Handle a live sports event with dynamic ad insertion based on game events:

```typescript
class LiveEventInjector {
  private streamConfig: StreamConfig;
  private adSchedule: Map<string, any> = new Map();
  
  constructor() {
    this.streamConfig = {
      inputUrl: 'srt://sports-feed:9000?streamid=live/sports',
      outputUrl: 'srt://cdn-out:9001?streamid=live/sports',
      streamType: 'srt',
      bitrate: 8000,
      resolution: '1920x1080',
      codec: 'h264'
    };
  }
  
  async initialize() {
    // Start the stream
    await fetch('/api/stream/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.streamConfig)
    });
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Pre-load ad cues
    await this.preloadAdCues();
  }
  
  private setupEventListeners() {
    // Listen for game events (simulated)
    setInterval(() => {
      this.handleGameEvent();
    }, 5000);
  }
  
  private async preloadAdCues() {
    // Pre-create ad cues for different scenarios
    const scenarios = ['timeout', 'quarter-break', 'halftime', 'post-game'];
    
    for (const scenario of scenarios) {
      const cue = await this.createAdCue(scenario);
      this.adSchedule.set(scenario, cue);
    }
  }
  
  private handleGameEvent() {
    // Simulate game events
    const events = ['timeout', 'score', 'quarter-end'];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    
    switch (randomEvent) {
      case 'timeout':
        this.injectAdCue('timeout');
        break;
      case 'quarter-end':
        this.injectAdCue('quarter-break');
        break;
    }
  }
  
  private async injectAdCue(scenario: string) {
    const cue = this.adSchedule.get(scenario);
    if (cue) {
      await fetch('/api/stream/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scte35Data: cue.base64 })
      });
      
      console.log(`Injected ${scenario} ad cue at ${new Date().toISOString()}`);
    }
  }
  
  private async createAdCue(scenario: string) {
    const durations = {
      'timeout': 120,
      'quarter-break': 180,
      'halftime': 600,
      'post-game': 300
    };
    
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
        spliceEventId: Date.now(),
        spliceEventCancelIndicator: false,
        outOfNetworkIndicator: true,
        programSpliceFlag: true,
        durationFlag: true,
        spliceImmediateFlag: false,
        breakDuration: durations[scenario] * 90000, // Convert to 90kHz units
        uniqueProgramId: 1,
        available: 0,
        expected: 0,
        spliceTimeSpecified: true,
        spliceTimePts: Math.floor(Date.now() / 1000) * 90 // Current time in 90kHz units
      },
      commandType: 'splice-insert'
    };
    
    const response = await fetch('/api/scte35/encode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    
    return await response.json();
  }
}

// Usage
const liveEvent = new LiveEventInjector();
await liveEvent.initialize();
```

### Example 2: Multi-Channel Broadcast System

Manage multiple channels with different ad insertion schedules:

```typescript
class MultiChannelManager {
  private channels: Map<string, any> = new Map();
  
  constructor() {
    this.initializeChannels();
  }
  
  private initializeChannels() {
    const channelConfigs = [
      {
        id: 'channel-1',
        name: 'Sports Channel',
        inputUrl: 'srt://source1:9000?streamid=channel1',
        outputUrl: 'srt://output1:9001?streamid=channel1',
        adSchedule: [300, 900, 1500, 2100] // Every 5 minutes
      },
      {
        id: 'channel-2',
        name: 'News Channel',
        inputUrl: 'srt://source2:9000?streamid=channel2',
        outputUrl: 'srt://output2:9001?streamid=channel2',
        adSchedule: [600, 1800, 3000] // Every 10-20 minutes
      },
      {
        id: 'channel-3',
        name: 'Entertainment Channel',
        inputUrl: 'srt://source3:9000?streamid=channel3',
        outputUrl: 'srt://output3:9001?streamid=channel3',
        adSchedule: [900, 2100, 3300] // Every 15-20 minutes
      }
    ];
    
    channelConfigs.forEach(config => {
      this.channels.set(config.id, {
        ...config,
        startTime: Date.now(),
        active: false
      });
    });
  }
  
  async startChannel(channelId: string) {
    const channel = this.channels.get(channelId);
    if (!channel) throw new Error(`Channel ${channelId} not found`);
    
    const streamConfig = {
      inputUrl: channel.inputUrl,
      outputUrl: channel.outputUrl,
      streamType: 'srt' as const,
      bitrate: 5000,
      resolution: '1920x1080',
      codec: 'h264'
    };
    
    await fetch('/api/stream/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(streamConfig)
    });
    
    channel.active = true;
    channel.startTime = Date.now();
    
    // Schedule ad insertions
    this.scheduleAdInsertions(channelId);
    
    console.log(`Started channel: ${channel.name}`);
  }
  
  private scheduleAdInsertions(channelId: string) {
    const channel = this.channels.get(channelId);
    if (!channel) return;
    
    channel.adSchedule.forEach((time: number) => {
      setTimeout(async () => {
        if (channel.active) {
          const cue = await this.createChannelAdCue(channelId);
          await fetch('/api/stream/inject', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scte35Data: cue.base64 })
          });
          
          console.log(`Inserted ad for ${channel.name} at ${time}s`);
        }
      }, time * 1000);
    });
  }
  
  async stopChannel(channelId: string) {
    const channel = this.channels.get(channelId);
    if (!channel) return;
    
    await fetch('/api/stream/stop', { method: 'POST' });
    channel.active = false;
    
    console.log(`Stopped channel: ${channel.name}`);
  }
  
  private async createChannelAdCue(channelId: string) {
    const channel = this.channels.get(channelId);
    if (!channel) throw new Error(`Channel ${channelId} not found`);
    
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
        spliceEventId: Date.now(),
        spliceEventCancelIndicator: false,
        outOfNetworkIndicator: true,
        programSpliceFlag: true,
        durationFlag: true,
        spliceImmediateFlag: false,
        breakDuration: 1800000, // 30 seconds
        uniqueProgramId: parseInt(channelId.split('-')[1]),
        available: 0,
        expected: 0,
        spliceTimeSpecified: true,
        spliceTimePts: Math.floor(Date.now() / 1000) * 90
      },
      commandType: 'splice-insert'
    };
    
    const response = await fetch('/api/scte35/encode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    
    return await response.json();
  }
  
  getChannelStatus() {
    const status: any = {};
    
    this.channels.forEach((channel, channelId) => {
      status[channelId] = {
        name: channel.name,
        active: channel.active,
        uptime: channel.active ? Math.floor((Date.now() - channel.startTime) / 1000) : 0,
        nextAd: channel.active ? this.getNextAdTime(channelId) : null
      };
    });
    
    return status;
  }
  
  private getNextAdTime(channelId: string) {
    const channel = this.channels.get(channelId);
    if (!channel || !channel.active) return null;
    
    const uptime = Math.floor((Date.now() - channel.startTime) / 1000);
    const nextAd = channel.adSchedule.find((time: number) => time > uptime);
    
    return nextAd ? nextAd - uptime : null;
  }
}

// Usage
const channelManager = new MultiChannelManager();

// Start all channels
await Promise.all([
  channelManager.startChannel('channel-1'),
  channelManager.startChannel('channel-2'),
  channelManager.startChannel('channel-3')
]);

// Get channel status
console.log('Channel Status:', channelManager.getChannelStatus());
```

### Example 3: Emergency Alert System

Implement an emergency alert system that can interrupt any stream:

```typescript
class EmergencyAlertSystem {
  private activeStreams: Set<string> = new Set();
  private alertQueue: Array<any> = [];
  private processing = false;
  
  constructor() {
    this.setupWebSocketMonitoring();
  }
  
  private setupWebSocketMonitoring() {
    // Monitor stream status via WebSocket
    const ws = new WebSocket('ws://localhost:3000/api/stream/ws');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'status' && data.status.status === 'running') {
        this.activeStreams.add('main-stream');
      } else if (data.type === 'status' && data.status.status === 'stopped') {
        this.activeStreams.delete('main-stream');
      }
    };
  }
  
  async issueEmergencyAlert(type: string, message: string, severity: 'low' | 'medium' | 'high' | 'critical') {
    const alert = {
      id: Date.now().toString(),
      type,
      message,
      severity,
      timestamp: new Date().toISOString(),
      processed: false
    };
    
    this.alertQueue.push(alert);
    
    if (!this.processing) {
      this.processAlertQueue();
    }
    
    console.log(`Emergency alert queued: ${type} - ${message}`);
  }
  
  private async processAlertQueue() {
    this.processing = true;
    
    while (this.alertQueue.length > 0) {
      const alert = this.alertQueue.shift();
      
      try {
        await this.injectAlert(alert);
        alert.processed = true;
        
        console.log(`Emergency alert processed: ${alert.type}`);
      } catch (error) {
        console.error(`Failed to process alert ${alert.id}:`, error);
        
        // Re-queue critical alerts
        if (alert.severity === 'critical') {
          this.alertQueue.unshift(alert);
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        }
      }
    }
    
    this.processing = false;
  }
  
  private async injectAlert(alert: any) {
    // Create emergency alert SCTE-35 cue
    const emergencyCue = await this.createEmergencyCue(alert);
    
    // Inject into all active streams
    const injectionPromises = Array.from(this.activeStreams).map(async (streamId) => {
      try {
        await fetch('/api/stream/inject', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scte35Data: emergencyCue.base64 })
        });
        
        console.log(`Alert injected into stream: ${streamId}`);
      } catch (error) {
        console.error(`Failed to inject alert into stream ${streamId}:`, error);
      }
    });
    
    await Promise.all(injectionPromises);
    
    // Log the alert
    await this.logAlert(alert);
  }
  
  private async createEmergencyCue(alert: any) {
    const durations = {
      'low': 30,
      'medium': 60,
      'high': 120,
      'critical': 300
    };
    
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
        spliceEventId: parseInt(alert.id),
        spliceEventCancelIndicator: false,
        outOfNetworkIndicator: true,
        programSpliceFlag: true,
        durationFlag: true,
        spliceImmediateFlag: true, // Immediate injection
        breakDuration: durations[alert.severity] * 90000, // Convert to 90kHz units
        uniqueProgramId: 999, // Emergency program ID
        available: 0,
        expected: 0,
        spliceTimeSpecified: false // Immediate injection doesn't need specific time
      },
      commandType: 'splice-insert'
    };
    
    const response = await fetch('/api/scte35/encode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    
    return await response.json();
  }
  
  private async logAlert(alert: any) {
    // Log to monitoring system
    const logEntry = {
      timestamp: alert.timestamp,
      type: 'emergency_alert',
      severity: alert.severity,
      message: alert.message,
      alertId: alert.id,
      streamsAffected: this.activeStreams.size
    };
    
    console.log('Emergency alert logged:', logEntry);
    
    // In production, send to logging service
    // await fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(logEntry)
    // });
  }
  
  getActiveStreams() {
    return Array.from(this.activeStreams);
  }
  
  getAlertQueue() {
    return [...this.alertQueue];
  }
}

// Usage
const emergencySystem = new EmergencyAlertSystem();

// Issue different types of emergency alerts
await emergencySystem.issueEmergencyAlert('weather', 'Severe thunderstorm warning', 'high');
await emergencySystem.issueEmergencyAlert('amber', 'AMBER Alert in your area', 'critical');
await emergencySystem.issueEmergencyAlert('news', 'Breaking news interruption', 'medium');

// Check system status
console.log('Active streams:', emergencySystem.getActiveStreams());
console.log('Alert queue:', emergencySystem.getAlertQueue());
```

## 🔌 Integration Examples

### Example 1: Integration with Broadcast Automation System

```typescript
class BroadcastAutomationIntegration {
  private scte35Encoder: string;
  private streamInjector: string;
  
  constructor() {
    this.scte35Encoder = 'http://localhost:3000/api/scte35/encode';
    this.streamInjector = 'http://localhost:3000/api/stream';
  }
  
  async createAndInjectAdBreak(duration: number, eventId: string) {
    try {
      // Step 1: Create SCTE-35 cue
      const cueConfig = {
        spliceInfo: {
          tableId: 252,
          protocolVersion: 0,
          ptsAdjustment: 0,
          cwIndex: 255,
          tier: 4095,
          spliceCommandType: 5
        },
        command: {
          spliceEventId: parseInt(eventId),
          spliceEventCancelIndicator: false,
          outOfNetworkIndicator: true,
          programSpliceFlag: true,
          durationFlag: true,
          spliceImmediateFlag: false,
          breakDuration: duration * 90000, // Convert to 90kHz units
          uniqueProgramId: 1,
          available: 0,
          expected: 0,
          spliceTimeSpecified: true,
          spliceTimePts: Math.floor(Date.now() / 1000) * 90
        },
        commandType: 'splice-insert'
      };
      
      const encodeResponse = await fetch(this.scte35Encoder, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cueConfig)
      });
      
      const encodedCue = await encodeResponse.json();
      
      // Step 2: Inject into stream
      const injectResponse = await fetch(`${this.streamInjector}/inject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scte35Data: encodedCue.base64 })
      });
      
      const result = await injectResponse.json();
      
      return {
        success: true,
        cueId: eventId,
        encodedData: encodedCue.base64,
        injectionTime: new Date().toISOString(),
        injectionResult: result
      };
      
    } catch (error) {
      console.error('Broadcast automation integration error:', error);
      return {
        success: false,
        error: error.message,
        cueId: eventId
      };
    }
  }
  
  async scheduleAdBreak(scheduleTime: Date, duration: number, eventId: string) {
    const now = new Date();
    const delay = Math.max(0, scheduleTime.getTime() - now.getTime());
    
    setTimeout(async () => {
      const result = await this.createAndInjectAdBreak(duration, eventId);
      console.log('Scheduled ad break executed:', result);
    }, delay);
    
    return {
      scheduled: true,
      scheduledTime: scheduleTime.toISOString(),
      delay: delay,
      eventId: eventId
    };
  }
  
  async handleProgramSwitch(programId: string, immediate: boolean = false) {
    const cueConfig = {
      spliceInfo: {
        tableId: 252,
        protocolVersion: 0,
        ptsAdjustment: 0,
        cwIndex: 255,
        tier: 4095,
        spliceCommandType: 5
      },
      command: {
        spliceEventId: Date.now(),
        spliceEventCancelIndicator: false,
        outOfNetworkIndicator: false,
        programSpliceFlag: true,
        durationFlag: false,
        spliceImmediateFlag: immediate,
        uniqueProgramId: parseInt(programId),
        available: 0,
        expected: 0,
        spliceTimeSpecified: !immediate,
        spliceTimePts: immediate ? 0 : Math.floor(Date.now() / 1000) * 90
      },
      commandType: 'splice-insert'
    };
    
    const encodeResponse = await fetch(this.scte35Encoder, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cueConfig)
    });
    
    const encodedCue = await encodeResponse.json();
    
    const injectResponse = await fetch(`${this.streamInjector}/inject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scte35Data: encodedCue.base64 })
    });
    
    return await injectResponse.json();
  }
}

// Usage in broadcast automation system
const automation = new BroadcastAutomationIntegration();

// Schedule ad breaks
await automation.scheduleAdBreak(new Date(Date.now() + 300000), 120, 'ad-001'); // 5 minutes from now
await automation.scheduleAdBreak(new Date(Date.now() + 600000), 60, 'ad-002');  // 10 minutes from now

// Handle program switch
await automation.handleProgramSwitch('program-002', true); // Immediate switch
```

### Example 2: Integration with Ad Decision System

```typescript
class AdDecisionSystemIntegration {
  private apiBase: string;
  
  constructor() {
    this.apiBase = 'http://localhost:3000/api';
  }
  
  async processAdOpportunity(opportunity: AdOpportunity) {
    try {
      // Step 1: Get ad decision from ad server
      const adDecision = await this.getAdDecision(opportunity);
      
      if (!adDecision || !adDecision.approved) {
        return { success: false, reason: 'No ad available' };
      }
      
      // Step 2: Create SCTE-35 cue for the ad
      const scte35Cue = await this.createAdCue(adDecision);
      
      // Step 3: Inject the cue into the stream
      const injectionResult = await this.injectCue(scte35Cue);
      
      // Step 4: Track the ad impression
      await this.trackAdImpression(adDecision, injectionResult);
      
      return {
        success: true,
        adId: adDecision.adId,
        cueId: scte35Cue.cueId,
        injectionTime: injectionResult.timestamp
      };
      
    } catch (error) {
      console.error('Ad decision system integration error:', error);
      return { success: false, error: error.message };
    }
  }
  
  private async getAdDecision(opportunity: AdOpportunity) {
    // Simulate ad server call
    const adServerResponse = {
      approved: true,
      adId: `ad-${Date.now()}`,
      duration: opportunity.duration || 30,
      advertiser: opportunity.advertiser || 'default-advertiser',
      campaign: opportunity.campaign || 'default-campaign',
      creativeId: `creative-${Date.now()}`
    };
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return adServerResponse;
  }
  
  private async createAdCue(adDecision: any) {
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
        spliceEventId: Date.now(),
        spliceEventCancelIndicator: false,
        outOfNetworkIndicator: true,
        programSpliceFlag: true,
        durationFlag: true,
        spliceImmediateFlag: false,
        breakDuration: adDecision.duration * 90000,
        uniqueProgramId: 1,
        available: 0,
        expected: 0,
        spliceTimeSpecified: true,
        spliceTimePts: Math.floor(Date.now() / 1000) * 90
      },
      commandType: 'splice-insert'
    };
    
    const response = await fetch(`${this.apiBase}/scte35/encode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    
    const result = await response.json();
    
    return {
      cueId: `cue-${Date.now()}`,
      base64: result.base64,
      hex: result.hex,
      adDecision: adDecision
    };
  }
  
  private async injectCue(cue: any) {
    const response = await fetch(`${this.apiBase}/stream/inject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scte35Data: cue.base64 })
    });
    
    const result = await response.json();
    
    return {
      timestamp: new Date().toISOString(),
      injectionId: result.injectionId || `injection-${Date.now()}`,
      success: result.success
    };
  }
  
  private async trackAdImpression(adDecision: any, injectionResult: any) {
    const impressionData = {
      adId: adDecision.adId,
      creativeId: adDecision.creativeId,
      advertiser: adDecision.advertiser,
      campaign: adDecision.campaign,
      injectionTime: injectionResult.timestamp,
      injectionId: injectionResult.injectionId,
      duration: adDecision.duration
    };
    
    console.log('Tracking ad impression:', impressionData);
    
    // In production, send to analytics service
    // await fetch('/api/analytics/impression', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(impressionData)
    // });
  }
}

interface AdOpportunity {
  duration?: number;
  advertiser?: string;
  campaign?: string;
  position: 'pre-roll' | 'mid-roll' | 'post-roll';
  contentId: string;
}

// Usage
const adSystem = new AdDecisionSystemIntegration();

// Process ad opportunities
const opportunity1: AdOpportunity = {
  position: 'mid-roll',
  contentId: 'sports-game-001',
  duration: 30,
  advertiser: 'sports-brand'
};

const result1 = await adSystem.processAdOpportunity(opportunity1);
console.log('Ad opportunity result:', result1);

const opportunity2: AdOpportunity = {
  position: 'pre-roll',
  contentId: 'news-show-001',
  duration: 15,
  advertiser: 'news-network'
};

const result2 = await adSystem.processAdOpportunity(opportunity2);
console.log('Ad opportunity result:', result2);
```

## 🏗️ Production Deployments

### Example 1: Docker Compose Setup

```yaml
version: '3.8'

services:
  scte35-encoder:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_BASE_URL=https://your-domain.com
      - FFMPEG_PATH=/usr/bin/ffmpeg
      - METRICS_INTERVAL=1000
      - HEALTH_CHECK_INTERVAL=5000
    volumes:
      - ./logs:/app/logs
    depends_on:
      - redis
      - postgres
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=scte35_encoder
      - POSTGRES_USER=scte35_user
      - POSTGRES_PASSWORD=your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - scte35-encoder
    restart: unless-stopped

volumes:
  redis_data:
  postgres_data:
```

### Example 2: Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: scte35-encoder
  labels:
    app: scte35-encoder
spec:
  replicas: 3
  selector:
    matchLabels:
      app: scte35-encoder
  template:
    metadata:
      labels:
        app: scte35-encoder
    spec:
      containers:
      - name: scte35-encoder
        image: your-registry/scte35-encoder:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_BASE_URL
          value: "https://your-domain.com"
        - name: REDIS_URL
          value: "redis://redis-service:6379"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: scte35-secret
              key: database-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: scte35-encoder-service
spec:
  selector:
    app: scte35-encoder
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer

---
apiVersion: v1
kind: Secret
metadata:
  name: scte35-secret
type: Opaque
data:
  database-url: cG9zdGdyZXNxbDovL3NjdGUzNV91c2VyOnlvdXJfcGFzc3dvcmRAcG9zdGdyZXM6NTQzMi9zY3RlMzVfZW5jb2Rlcg==

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: scte35-encoder-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: scte35-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: scte35-encoder-service
            port:
              number: 80
```

### Example 3: AWS ECS Deployment

```json
{
  "family": "scte35-encoder",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::123456789012:role/scte35TaskRole",
  "containerDefinitions": [
    {
      "name": "scte35-encoder",
      "image": "your-registry/scte35-encoder:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "NEXT_PUBLIC_BASE_URL",
          "value": "https://your-domain.com"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789012:secret:scte35-database-url:password::"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/scte35-encoder",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3000/api/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

These examples demonstrate the versatility and power of the SCTE-35 Encoder & Stream Injector system across various use cases, from simple ad insertion to complex multi-channel broadcast systems and emergency alert integration.