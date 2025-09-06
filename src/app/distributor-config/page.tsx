"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Settings, Broadcast, Zap, AlertTriangle, Copy, Download, Database, Network, Shield } from "lucide-react";

interface DistributorStreamConfig {
  // Stream Identification
  streamName: string;
  
  // Video Specifications
  videoResolution: string;
  videoCodec: string;
  pcr: string;
  profileLevel: string;
  gop: number;
  bFrames: number;
  videoBitrate: number;
  chroma: string;
  aspectRatio: string;
  
  // Audio Specifications
  audioCodec: string;
  audioBitrate: number;
  audioLKFS: number;
  audioSamplingRate: number;
  
  // SCTE-35 Configuration
  scteDataPid: number;
  nullPid: number;
  latency: number;
  
  // SCTE-35 Event Configuration
  adDuration: number;
  scteEventId: number;
  scteStartCommand: string;
  scteStopCommand: string;
  crashOutCommand: string;
  preRollDuration: number;
  scteDataPidValue: number;
}

interface GeneratedConfig {
  ffmpegCommand: string;
  srtConfig: string;
  scte35Config: string;
}

export default function DistributorConfig() {
  const [activeTab, setActiveTab] = useState("stream-config");
  const [config, setConfig] = useState<DistributorStreamConfig>({
    // Stream Identification
    streamName: "Live_Service",
    
    // Video Specifications
    videoResolution: "1920x1080",
    videoCodec: "h264",
    pcr: "Video Embedded",
    profileLevel: "High@Auto",
    gop: 12,
    bFrames: 5,
    videoBitrate: 5000,
    chroma: "4:2:0",
    aspectRatio: "16:9",
    
    // Audio Specifications
    audioCodec: "AAC-LC",
    audioBitrate: 128,
    audioLKFS: -20,
    audioSamplingRate: 48000,
    
    // SCTE-35 Configuration
    scteDataPid: 500,
    nullPid: 8191,
    latency: 2000,
    
    // SCTE-35 Event Configuration
    adDuration: 600,
    scteEventId: 100023,
    scteStartCommand: "CUE-OUT",
    scteStopCommand: "CUE-IN",
    crashOutCommand: "CUE-IN",
    preRollDuration: 0,
    scteDataPidValue: 500
  });

  const [generatedConfig, setGeneratedConfig] = useState<GeneratedConfig>({
    ffmpegCommand: "",
    srtConfig: "",
    scte35Config: ""
  });

  const handleGenerateConfig = () => {
    // Generate FFmpeg command
    const ffmpegCmd = generateFFmpegCommand(config);
    
    // Generate SRT configuration
    const srtCfg = generateSRTConfig(config);
    
    // Generate SCTE-35 configuration
    const scte35Cfg = generateSCTE35Config(config);
    
    setGeneratedConfig({
      ffmpegCommand: ffmpegCmd,
      srtConfig: srtCfg,
      scte35Config: scte35Cfg
    });
  };

  const generateFFmpegCommand = (cfg: DistributorStreamConfig): string => {
    return `ffmpeg -i input_stream \\
  -c:v ${cfg.videoCodec} \\
  -profile:v ${cfg.profileLevel} \\
  -b:v ${cfg.videoBitrate}k \\
  -g ${cfg.gop} \\
  -bf ${cfg.bFrames} \\
  -pix_fmt yuv420p \\
  -aspect ${cfg.aspectRatio} \\
  -c:a ${cfg.audioCodec} \\
  -b:a ${cfg.audioBitrate}k \\
  -ar ${cfg.audioSamplingRate} \\
  -f mpegts \\
  -mpegts_pcr_start 0 \\
  -mpegts_start_pid 256 \\
  -mpegts_service_id 1 \\
  -mpegts_pmt_pid 256 \\
  -mpegts_video_pid 512 \\
  -mpegts_audio_pid 768 \\
  -mpegts_scte35_pid ${cfg.scteDataPid} \\
  -metadata:scte35 "pid=${cfg.scteDataPid}" \\
  output_stream.ts`;
  };

  const generateSRTConfig = (cfg: DistributorStreamConfig): string => {
    return `# SRT Stream Configuration for ${cfg.streamName}
streamid=${cfg.streamName}
latency=${cfg.latency}
pbkeylen=16
passphrase=your_secure_passphrase
maxbw=${cfg.videoBitrate + 128}  # Video + Audio bitrate in kbps
minbw=0
overhead=25
mssrap=1316
pkt_size=1316
rcvbuf=8192000
sndbuf=8192000
linger=0
conntimeo=3000
driftbuffer=1000`;
  };

  const generateSCTE35Config = (cfg: DistributorStreamConfig): string => {
    return `# SCTE-35 Configuration for ${cfg.streamName}
# Stream Parameters
stream_name=${cfg.streamName}
video_resolution=${cfg.videoResolution}
video_codec=${cfg.videoCodec}
video_bitrate=${cfg.videoBitrate}k
audio_codec=${cfg.audioCodec}
audio_bitrate=${cfg.audioBitrate}k
audio_sampling_rate=${cfg.audioSamplingRate}

# SCTE-35 Parameters
scte_data_pid=${cfg.scteDataPid}
null_pid=${cfg.nullPid}
latency=${cfg.latency}ms

# Event Configuration
ad_duration=${cfg.adDuration}
scte_event_id=${cfg.scteEventId}
scte_start_command=${cfg.scteStartCommand}
scte_stop_command=${cfg.scteStopCommand}
crash_out_command=${cfg.crashOutCommand}
pre_roll_duration=${cfg.preRollDuration}
scte_data_pid_value=${cfg.scteDataPidValue}

# Event Commands
START_COMMAND=${cfg.scteStartCommand}
STOP_COMMAND=${cfg.scteStopCommand}
CRASH_OUT_COMMAND=${cfg.crashOutCommand}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadConfig = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatLKFS = (value: number) => {
    return `${value} dB`;
  };

  return (
    <div className="medialive-container">
      {/* AWS MediaLive-style Header */}
      <div className="bg-gradient-to-r from-[#16191f] to-[#0f1419] border-b border-[#232f3e] px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="medialive-button medialive-button-secondary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#ff9900] to-[#ff8800] rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-[#0f1419]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Distributor Configuration</h1>
                  <p className="text-sm text-[#a0aec0]">AWS Elemental MediaLive Compatible</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="medialive-status-indicator medialive-status-running"></div>
                <span className="text-sm text-[#a0aec0]">System Active</span>
              </div>
              <Badge className="medialive-badge medialive-badge-success">PRODUCTION READY</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="medialive-tabs">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stream-config" className="medialive-tab">Stream Config</TabsTrigger>
            <TabsTrigger value="scte35-config" className="medialive-tab">SCTE-35 Config</TabsTrigger>
            <TabsTrigger value="generated" className="medialive-tab">Generated Config</TabsTrigger>
          </TabsList>

          <TabsContent value="stream-config" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stream Identification */}
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <Broadcast className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">Stream Identification</h2>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    Basic stream identification parameters
                  </p>
                </div>
                <div className="medialive-panel-content space-y-4">
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Stream Name</label>
                    <input
                      className="medialive-input"
                      value={config.streamName}
                      onChange={(e) => setConfig(prev => ({ ...prev, streamName: e.target.value }))}
                      placeholder="Live_Service"
                    />
                  </div>
                </div>
              </div>

              {/* Video Specifications */}
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">Video Specifications</h2>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    Video encoding parameters as per distributor requirements
                  </p>
                </div>
                <div className="medialive-panel-content space-y-4">
                  <div className="medialive-form-row">
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Video Resolution</label>
                      <Select value={config.videoResolution} onValueChange={(value) => setConfig(prev => ({ ...prev, videoResolution: value }))}>
                        <SelectTrigger className="medialive-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1920x1080">1920x1080 (HD)</SelectItem>
                          <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                          <SelectItem value="3840x2160">3840x2160 (4K)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Video Codec</label>
                      <Select value={config.videoCodec} onValueChange={(value) => setConfig(prev => ({ ...prev, videoCodec: value }))}>
                        <SelectTrigger className="medialive-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="h264">H.264</SelectItem>
                          <SelectItem value="h265">H.265</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="medialive-form-row">
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">PCR</label>
                      <Select value={config.pcr} onValueChange={(value) => setConfig(prev => ({ ...prev, pcr: value }))}>
                        <SelectTrigger className="medialive-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Video Embedded">Video Embedded</SelectItem>
                          <SelectItem value="Audio Embedded">Audio Embedded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Profile@Level</label>
                      <Select value={config.profileLevel} onValueChange={(value) => setConfig(prev => ({ ...prev, profileLevel: value }))}>
                        <SelectTrigger className="medialive-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="High@Auto">High@Auto</SelectItem>
                          <SelectItem value="High@L4.0">High@L4.0</SelectItem>
                          <SelectItem value="High@L4.1">High@L4.1</SelectItem>
                          <SelectItem value="Main@L3.1">Main@L3.1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="medialive-form-row">
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">GOP</label>
                      <input
                        className="medialive-input"
                        type="number"
                        value={config.gop}
                        onChange={(e) => setConfig(prev => ({ ...prev, gop: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">No of B Frames</label>
                      <input
                        className="medialive-input"
                        type="number"
                        value={config.bFrames}
                        onChange={(e) => setConfig(prev => ({ ...prev, bFrames: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="medialive-form-row">
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Video Bitrate (kbps)</label>
                      <input
                        className="medialive-input"
                        type="number"
                        value={config.videoBitrate}
                        onChange={(e) => setConfig(prev => ({ ...prev, videoBitrate: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Chroma</label>
                      <Select value={config.chroma} onValueChange={(value) => setConfig(prev => ({ ...prev, chroma: value }))}>
                        <SelectTrigger className="medialive-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4:2:0">4:2:0</SelectItem>
                          <SelectItem value="4:2:2">4:2:2</SelectItem>
                          <SelectItem value="4:4:4">4:4:4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Aspect Ratio</label>
                    <Select value={config.aspectRatio} onValueChange={(value) => setConfig(prev => ({ ...prev, aspectRatio: value }))}>
                      <SelectTrigger className="medialive-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9</SelectItem>
                        <SelectItem value="4:3">4:3</SelectItem>
                        <SelectItem value="1:1">1:1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Audio Specifications */}
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">Audio Specifications</h2>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    Audio encoding parameters as per distributor requirements
                  </p>
                </div>
                <div className="medialive-panel-content space-y-4">
                  <div className="medialive-form-row">
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Audio Codec</label>
                      <Select value={config.audioCodec} onValueChange={(value) => setConfig(prev => ({ ...prev, audioCodec: value }))}>
                        <SelectTrigger className="medialive-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AAC-LC">AAC-LC</SelectItem>
                          <SelectItem value="AAC-HE">AAC-HE</SelectItem>
                          <SelectItem value="MP3">MP3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Audio Bitrate (kbps)</label>
                      <input
                        className="medialive-input"
                        type="number"
                        value={config.audioBitrate}
                        onChange={(e) => setConfig(prev => ({ ...prev, audioBitrate: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="medialive-form-row">
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Audio LKFS</label>
                      <input
                        className="medialive-input"
                        type="number"
                        value={config.audioLKFS}
                        onChange={(e) => setConfig(prev => ({ ...prev, audioLKFS: parseInt(e.target.value) }))}
                      />
                      <p className="text-xs text-[#a0aec0] mt-1">
                        Target loudness level in dB LKFS
                      </p>
                    </div>
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Audio Sampling Rate</label>
                      <Select value={config.audioSamplingRate} onValueChange={(value) => setConfig(prev => ({ ...prev, audioSamplingRate: parseInt(value) }))}>
                        <SelectTrigger className="medialive-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="48000">48 kHz</SelectItem>
                          <SelectItem value="44100">44.1 kHz</SelectItem>
                          <SelectItem value="32000">32 kHz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SCTE-35 Configuration */}
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">SCTE-35 Configuration</h2>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    SCTE-35 injection parameters for ad insertion
                  </p>
                </div>
                <div className="medialive-panel-content space-y-4">
                  <div className="medialive-form-row">
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">SCTE-35 Data PID</label>
                      <input
                        className="medialive-input"
                        type="number"
                        value={config.scteDataPid}
                        onChange={(e) => setConfig(prev => ({ ...prev, scteDataPid: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Null PID</label>
                      <input
                        className="medialive-input"
                        type="number"
                        value={config.nullPid}
                        onChange={(e) => setConfig(prev => ({ ...prev, nullPid: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="medialive-form-row">
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Latency (ms)</label>
                      <input
                        className="medialive-input"
                        type="number"
                        value={config.latency}
                        onChange={(e) => setConfig(prev => ({ ...prev, latency: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">SCTE-35 Event ID</label>
                      <input
                        className="medialive-input"
                        type="number"
                        value={config.scteEventId}
                        onChange={(e) => setConfig(prev => ({ ...prev, scteEventId: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="medialive-form-row">
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Start Command</label>
                      <input
                        className="medialive-input"
                        value={config.scteStartCommand}
                        onChange={(e) => setConfig(prev => ({ ...prev, scteStartCommand: e.target.value }))}
                      />
                    </div>
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Stop Command</label>
                      <input
                        className="medialive-input"
                        value={config.scteStopCommand}
                        onChange={(e) => setConfig(prev => ({ ...prev, scteStopCommand: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="medialive-form-row">
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Crash Out Command</label>
                      <input
                        className="medialive-input"
                        value={config.crashOutCommand}
                        onChange={(e) => setConfig(prev => ({ ...prev, crashOutCommand: e.target.value }))}
                      />
                    </div>
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Ad Duration (seconds)</label>
                      <input
                        className="medialive-input"
                        type="number"
                        value={config.adDuration}
                        onChange={(e) => setConfig(prev => ({ ...prev, adDuration: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scte35-config" className="space-y-6">
            <div className="medialive-panel rounded-lg">
              <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-[#ff9900]" />
                  <h2 className="medialive-panel-title">SCTE-35 Event Configuration</h2>
                </div>
                <p className="medialive-panel-subtitle mt-1">
                  Configure SCTE-35 event parameters for ad insertion
                </p>
              </div>
              <div className="medialive-panel-content space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Event Timing</h3>
                    <div className="medialive-form-row">
                      <div className="medialive-form-group">
                        <label className="medialive-form-label">Pre-roll Duration (seconds)</label>
                        <input
                          className="medialive-input"
                          type="number"
                          value={config.preRollDuration}
                          onChange={(e) => setConfig(prev => ({ ...prev, preRollDuration: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div className="medialive-form-group">
                        <label className="medialive-form-label">Ad Duration (seconds)</label>
                        <input
                          className="medialive-input"
                          type="number"
                          value={config.adDuration}
                          onChange={(e) => setConfig(prev => ({ ...prev, adDuration: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Event Identification</h3>
                    <div className="medialive-form-row">
                      <div className="medialive-form-group">
                        <label className="medialive-form-label">SCTE-35 Event ID</label>
                        <input
                          className="medialive-input"
                          type="number"
                          value={config.scteEventId}
                          onChange={(e) => setConfig(prev => ({ ...prev, scteEventId: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div className="medialive-form-group">
                        <label className="medialive-form-label">SCTE-35 Data PID Value</label>
                        <input
                          className="medialive-input"
                          type="number"
                          value={config.scteDataPidValue}
                          onChange={(e) => setConfig(prev => ({ ...prev, scteDataPidValue: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Event Commands</h3>
                  <div className="medialive-form-row">
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Start Command</label>
                      <input
                        className="medialive-input"
                        value={config.scteStartCommand}
                        onChange={(e) => setConfig(prev => ({ ...prev, scteStartCommand: e.target.value }))}
                      />
                    </div>
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Stop Command</label>
                      <input
                        className="medialive-input"
                        value={config.scteStopCommand}
                        onChange={(e) => setConfig(prev => ({ ...prev, scteStopCommand: e.target.value }))}
                      />
                    </div>
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Crash Out Command</label>
                      <input
                        className="medialive-input"
                        value={config.crashOutCommand}
                        onChange={(e) => setConfig(prev => ({ ...prev, crashOutCommand: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button onClick={handleGenerateConfig} className="medialive-button medialive-button-primary">
                    Generate Configuration
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="generated" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* FFmpeg Command */}
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-[#ff9900]" />
                      <h2 className="medialive-panel-title">FFmpeg Command</h2>
                    </div>
                    <Badge className="medialive-badge">Generated</Badge>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    FFmpeg command for stream processing
                  </p>
                </div>
                <div className="medialive-panel-content space-y-4">
                  <textarea
                    value={generatedConfig.ffmpegCommand}
                    readOnly
                    rows={12}
                    className="medialive-textarea medialive-scrollbar font-mono text-sm"
                    placeholder="Generate configuration to see FFmpeg command..."
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(generatedConfig.ffmpegCommand)}
                      disabled={!generatedConfig.ffmpegCommand}
                      className={`medialive-button medialive-button-secondary flex-1 ${!generatedConfig.ffmpegCommand ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </button>
                    <button
                      onClick={() => downloadConfig(generatedConfig.ffmpegCommand, "ffmpeg-command.sh")}
                      disabled={!generatedConfig.ffmpegCommand}
                      className={`medialive-button medialive-button-secondary flex-1 ${!generatedConfig.ffmpegCommand ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>
              </div>

              {/* SRT Configuration */}
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Network className="w-5 h-5 text-[#ff9900]" />
                      <h2 className="medialive-panel-title">SRT Configuration</h2>
                    </div>
                    <Badge className="medialive-badge">Generated</Badge>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    SRT protocol configuration file
                  </p>
                </div>
                <div className="medialive-panel-content space-y-4">
                  <textarea
                    value={generatedConfig.srtConfig}
                    readOnly
                    rows={12}
                    className="medialive-textarea medialive-scrollbar font-mono text-sm"
                    placeholder="Generate configuration to see SRT config..."
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(generatedConfig.srtConfig)}
                      disabled={!generatedConfig.srtConfig}
                      className={`medialive-button medialive-button-secondary flex-1 ${!generatedConfig.srtConfig ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </button>
                    <button
                      onClick={() => downloadConfig(generatedConfig.srtConfig, "srt-config.srt")}
                      disabled={!generatedConfig.srtConfig}
                      className={`medialive-button medialive-button-secondary flex-1 ${!generatedConfig.srtConfig ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>
              </div>

              {/* SCTE-35 Configuration */}
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-[#ff9900]" />
                      <h2 className="medialive-panel-title">SCTE-35 Configuration</h2>
                    </div>
                    <Badge className="medialive-badge">Generated</Badge>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    SCTE-35 configuration file
                  </p>
                </div>
                <div className="medialive-panel-content space-y-4">
                  <textarea
                    value={generatedConfig.scte35Config}
                    readOnly
                    rows={12}
                    className="medialive-textarea medialive-scrollbar font-mono text-sm"
                    placeholder="Generate configuration to see SCTE-35 config..."
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(generatedConfig.scte35Config)}
                      disabled={!generatedConfig.scte35Config}
                      className={`medialive-button medialive-button-secondary flex-1 ${!generatedConfig.scte35Config ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </button>
                    <button
                      onClick={() => downloadConfig(generatedConfig.scte35Config, "scte35-config.conf")}
                      disabled={!generatedConfig.scte35Config}
                      className={`medialive-button medialive-button-secondary flex-1 ${!generatedConfig.scte35Config ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}