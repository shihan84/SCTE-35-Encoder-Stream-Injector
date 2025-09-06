// Distributor-specific SRT stream configuration
export interface DistributorStreamConfig {
  // Stream identification
  streamName: string;
  
  // Video specifications
  videoResolution: "1920x1080"; // HD only
  videoCodec: "H.264";
  pcr: "Video Embedded";
  profileLevel: "High@Auto";
  gop: 12;
  bFrames: 5;
  videoBitrate: 5000; // 5 Mbps in kbps
  chroma: "4:2:0";
  aspectRatio: "16:9";
  
  // Audio specifications
  audioCodec: "AAC-LC";
  audioBitrate: 128; // 128 Kbps
  audioLKFS: -20; // -20 db
  audioSamplingRate: 48000; // 48Khz
  
  // SCTE specifications
  scteDataPID: 500;
  nullPID: 8191;
  latency: 2000; // 2000 milliseconds (2 seconds)
  
  // Ad break configuration
  adDuration: number; // in seconds
  scteEventID: number; // Unique ID that increments sequentially
  preRollDuration: number; // 0-10 seconds
}

export interface SCTE35CueCommand {
  type: "CUE-OUT" | "CUE-IN" | "CRASH-OUT";
  eventId: number;
  adDuration?: number; // in seconds
  preRollDuration?: number; // 0-10 seconds
  timestamp: string;
}

// Default distributor configuration
export const DEFAULT_DISTRIBUTOR_CONFIG: DistributorStreamConfig = {
  streamName: "Service Name",
  videoResolution: "1920x1080",
  videoCodec: "H.264",
  pcr: "Video Embedded",
  profileLevel: "High@Auto",
  gop: 12,
  bFrames: 5,
  videoBitrate: 5000,
  chroma: "4:2:0",
  aspectRatio: "16:9",
  audioCodec: "AAC-LC",
  audioBitrate: 128,
  audioLKFS: -20,
  audioSamplingRate: 48000,
  scteDataPID: 500,
  nullPID: 8191,
  latency: 2000,
  adDuration: 600, // 10 minutes default
  scteEventID: 100023, // Starting event ID
  preRollDuration: 0
};

// Event ID counter for sequential incrementing
let currentEventID = 100023;

export function getNextEventID(): number {
  return currentEventID++;
}

export function resetEventID(startID: number = 100023): void {
  currentEventID = startID;
}

export function generateFFmpegArgs(config: DistributorStreamConfig): string[] {
  return [
    // Video parameters
    '-c:v', 'libx264',
    '-profile:v', 'high',
    '-level:v', '4.2',
    '-pix_fmt', 'yuv420p',
    '-s', config.videoResolution,
    '-r', '30', // Assuming 30fps
    '-g', config.gop.toString(),
    '-bf', config.bFrames.toString(),
    '-b:v', `${config.videoBitrate}k`,
    '-maxrate:v', `${config.videoBitrate * 1.5}k`,
    '-bufsize:v', `${config.videoBitrate * 3}k`,
    '-aspect', config.aspectRatio,
    
    // Audio parameters
    '-c:a', 'aac',
    '-b:a', `${config.audioBitrate}k`,
    '-ar', config.audioSamplingRate.toString(),
    '-ac', '2',
    
    // PCR and timing
    '-mpegts_pcr_period', '20', // PCR every 20ms
    '-muxrate', `${config.videoBitrate + config.audioBitrate + 100}k`, // Total bitrate with overhead
    
    // SRT specific parameters
    '-f', 'mpegts',
    '-mpegts_transport_stream_id', '1',
    '-mpegts_original_network_id', '1',
    '-mpegts_service_id', '1',
    '-mpegts_service_type', 'digital_tv',
    
    // SCTE-35 PID mapping
    '-mpegts_pmt_start_pid', '0x1000',
    '-mpegts_start_pid', '0x1000',
    '-streamid', '0:0x1000',
    '-streamid', '1:0x1010',
    '-streamid', '0x500:0x500' // SCTE-35 PID
  ];
}

export function validateDistributorConfig(config: Partial<DistributorStreamConfig>): string[] {
  const errors: string[] = [];
  
  if (config.videoResolution && config.videoResolution !== "1920x1080") {
    errors.push("Video resolution must be 1920x1080 (HD)");
  }
  
  if (config.videoCodec && config.videoCodec !== "H.264") {
    errors.push("Video codec must be H.264");
  }
  
  if (config.videoBitrate && config.videoBitrate !== 5000) {
    errors.push("Video bitrate must be 5 Mbps (5000 kbps)");
  }
  
  if (config.gop && config.gop !== 12) {
    errors.push("GOP must be 12");
  }
  
  if (config.bFrames && config.bFrames !== 5) {
    errors.push("Number of B frames must be 5");
  }
  
  if (config.audioCodec && config.audioCodec !== "AAC-LC") {
    errors.push("Audio codec must be AAC-LC");
  }
  
  if (config.audioBitrate && config.audioBitrate !== 128) {
    errors.push("Audio bitrate must be 128 Kbps");
  }
  
  if (config.audioLKFS && config.audioLKFS !== -20) {
    errors.push("Audio LKFS must be -20 db");
  }
  
  if (config.audioSamplingRate && config.audioSamplingRate !== 48000) {
    errors.push("Audio sampling rate must be 48Khz");
  }
  
  if (config.scteDataPID && config.scteDataPID !== 500) {
    errors.push("SCTE Data PID must be 500");
  }
  
  if (config.nullPID && config.nullPID !== 8191) {
    errors.push("Null PID must be 8191");
  }
  
  if (config.latency && config.latency !== 2000) {
    errors.push("Latency must be 2000 milliseconds (2 seconds)");
  }
  
  if (config.preRollDuration !== undefined && (config.preRollDuration < 0 || config.preRollDuration > 10)) {
    errors.push("Pre-roll duration must be between 0-10 seconds");
  }
  
  return errors;
}