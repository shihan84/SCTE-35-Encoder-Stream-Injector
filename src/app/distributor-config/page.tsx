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
import { ArrowLeft, Settings, Broadcast, Zap, AlertTriangle } from "lucide-react";

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

  const formatLKFS = (value: number) => {
    return `${value} dB`;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Distributor Configuration</h1>
            <p className="text-muted-foreground">
              Configure stream settings according to distributor specifications
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stream-config">Stream Config</TabsTrigger>
            <TabsTrigger value="scte35-config">SCTE-35 Config</TabsTrigger>
            <TabsTrigger value="generated">Generated Config</TabsTrigger>
          </TabsList>

          <TabsContent value="stream-config" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stream Identification */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Broadcast className="w-5 h-5" />
                    <span>Stream Identification</span>
                  </CardTitle>
                  <CardDescription>Basic stream identification parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="streamName">Stream Name</Label>
                    <Input
                      id="streamName"
                      value={config.streamName}
                      onChange={(e) => setConfig(prev => ({ ...prev, streamName: e.target.value }))}
                      placeholder="Live_Service"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Video Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    <span>Video Specifications</span>
                  </CardTitle>
                  <CardDescription>Video encoding parameters as per distributor requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="videoResolution">Video Resolution</Label>
                      <Select value={config.videoResolution} onValueChange={(value) => setConfig(prev => ({ ...prev, videoResolution: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1920x1080">1920x1080 (HD)</SelectItem>
                          <SelectItem value="1280x720">1280x720 (HD)</SelectItem>
                          <SelectItem value="3840x2160">3840x2160 (4K)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="videoCodec">Video Codec</Label>
                      <Select value={config.videoCodec} onValueChange={(value) => setConfig(prev => ({ ...prev, videoCodec: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="h264">H.264</SelectItem>
                          <SelectItem value="h265">H.265</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pcr">PCR</Label>
                      <Select value={config.pcr} onValueChange={(value) => setConfig(prev => ({ ...prev, pcr: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Video Embedded">Video Embedded</SelectItem>
                          <SelectItem value="Audio Embedded">Audio Embedded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="profileLevel">Profile@Level</Label>
                      <Select value={config.profileLevel} onValueChange={(value) => setConfig(prev => ({ ...prev, profileLevel: value }))}>
                        <SelectTrigger>
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gop">GOP</Label>
                      <Input
                        id="gop"
                        type="number"
                        value={config.gop}
                        onChange={(e) => setConfig(prev => ({ ...prev, gop: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bFrames">No of B Frames</Label>
                      <Input
                        id="bFrames"
                        type="number"
                        value={config.bFrames}
                        onChange={(e) => setConfig(prev => ({ ...prev, bFrames: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="videoBitrate">Video Bitrate (kbps)</Label>
                      <Input
                        id="videoBitrate"
                        type="number"
                        value={config.videoBitrate}
                        onChange={(e) => setConfig(prev => ({ ...prev, videoBitrate: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="chroma">Chroma</Label>
                      <Select value={config.chroma} onValueChange={(value) => setConfig(prev => ({ ...prev, chroma: value }))}>
                        <SelectTrigger>
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

                  <div>
                    <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                    <Select value={config.aspectRatio} onValueChange={(value) => setConfig(prev => ({ ...prev, aspectRatio: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9</SelectItem>
                        <SelectItem value="4:3">4:3</SelectItem>
                        <SelectItem value="1:1">1:1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Audio Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Audio Specifications</span>
                  </CardTitle>
                  <CardDescription>Audio encoding parameters as per distributor requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="audioCodec">Audio Codec</Label>
                      <Select value={config.audioCodec} onValueChange={(value) => setConfig(prev => ({ ...prev, audioCodec: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AAC-LC">AAC-LC</SelectItem>
                          <SelectItem value="AAC-HE">AAC-HE</SelectItem>
                          <SelectItem value="MP3">MP3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="audioBitrate">Audio Bitrate (kbps)</Label>
                      <Input
                        id="audioBitrate"
                        type="number"
                        value={config.audioBitrate}
                        onChange={(e) => setConfig(prev => ({ ...prev, audioBitrate: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="audioLKFS">Audio LKFS</Label>
                      <Input
                        id="audioLKFS"
                        type="number"
                        value={config.audioLKFS}
                        onChange={(e) => setConfig(prev => ({ ...prev, audioLKFS: parseInt(e.target.value) }))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatLKFS(config.audioLKFS)}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="audioSamplingRate">Audio Sampling Rate</Label>
                      <Select value={config.audioSamplingRate.toString()} onValueChange={(value) => setConfig(prev => ({ ...prev, audioSamplingRate: parseInt(value) }))}>
                        <SelectTrigger>
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
                </CardContent>
              </Card>

              {/* SCTE-35 Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>SCTE-35 Configuration</span>
                  </CardTitle>
                  <CardDescription>SCTE-35 and transport stream parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scteDataPid">SCTE Data PID</Label>
                      <Input
                        id="scteDataPid"
                        type="number"
                        value={config.scteDataPid}
                        onChange={(e) => setConfig(prev => ({ ...prev, scteDataPid: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="nullPid">Null PID</Label>
                      <Input
                        id="nullPid"
                        type="number"
                        value={config.nullPid}
                        onChange={(e) => setConfig(prev => ({ ...prev, nullPid: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="latency">Latency (milliseconds)</Label>
                    <Input
                      id="latency"
                      type="number"
                      value={config.latency}
                      onChange={(e) => setConfig(prev => ({ ...prev, latency: parseInt(e.target.value) }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {config.latency / 1000} seconds
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scte35-config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SCTE-35 Event Configuration</CardTitle>
                <CardDescription>Configure SCTE-35 event parameters as per distributor requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="adDuration">Ad Duration (seconds)</Label>
                    <Input
                      id="adDuration"
                      type="number"
                      value={config.adDuration}
                      onChange={(e) => setConfig(prev => ({ ...prev, adDuration: parseInt(e.target.value) }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.floor(config.adDuration / 60)} minutes {config.adDuration % 60} seconds
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="scteEventId">SCTE Event ID</Label>
                    <Input
                      id="scteEventId"
                      type="number"
                      value={config.scteEventId}
                      onChange={(e) => setConfig(prev => ({ ...prev, scteEventId: parseInt(e.target.value) }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Unique ID, increments sequentially
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scteStartCommand">SCTE START Command</Label>
                    <Select value={config.scteStartCommand} onValueChange={(value) => setConfig(prev => ({ ...prev, scteStartCommand: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CUE-OUT">CUE-OUT</SelectItem>
                        <SelectItem value="SPLICE_OUT">SPLICE_OUT</SelectItem>
                        <SelectItem value="BREAK_START">BREAK_START</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Program out point
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="scteStopCommand">SCTE STOP Command</Label>
                    <Select value={config.scteStopCommand} onValueChange={(value) => setConfig(prev => ({ ...prev, scteStopCommand: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CUE-IN">CUE-IN</SelectItem>
                        <SelectItem value="SPLICE_IN">SPLICE_IN</SelectItem>
                        <SelectItem value="BREAK_END">BREAK_END</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Program in point
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="crashOutCommand">Crash Out Command</Label>
                    <Select value={config.crashOutCommand} onValueChange={(value) => setConfig(prev => ({ ...prev, crashOutCommand: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CUE-IN">CUE-IN</SelectItem>
                        <SelectItem value="SPLICE_IN">SPLICE_IN</SelectItem>
                        <SelectItem value="BREAK_END">BREAK_END</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Emergency return to program
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="preRollDuration">Pre-roll Duration (seconds)</Label>
                    <Input
                      id="preRollDuration"
                      type="number"
                      min="0"
                      max="10"
                      value={config.preRollDuration}
                      onChange={(e) => setConfig(prev => ({ ...prev, preRollDuration: parseInt(e.target.value) }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Range: 0-10 seconds
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="scteDataPidValue">SCTE Data PID Value</Label>
                  <Input
                    id="scteDataPidValue"
                    type="number"
                    value={config.scteDataPidValue}
                    onChange={(e) => setConfig(prev => ({ ...prev, scteDataPidValue: parseInt(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must match SCTE Data PID above
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleGenerateConfig} className="flex-1">
                    Generate Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generated" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* FFmpeg Command */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>FFmpeg Command</span>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedConfig.ffmpegCommand)}>
                      Copy
                    </Button>
                  </CardTitle>
                  <CardDescription>Generated FFmpeg command for stream processing</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={generatedConfig.ffmpegCommand}
                    readOnly
                    rows={12}
                    className="font-mono text-sm"
                    placeholder="Generate configuration to see FFmpeg command..."
                  />
                </CardContent>
              </Card>

              {/* SRT Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>SRT Configuration</span>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedConfig.srtConfig)}>
                      Copy
                    </Button>
                  </CardTitle>
                  <CardDescription>SRT stream configuration file</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={generatedConfig.srtConfig}
                    readOnly
                    rows={12}
                    className="font-mono text-sm"
                    placeholder="Generate configuration to see SRT configuration..."
                  />
                </CardContent>
              </Card>

              {/* SCTE-35 Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>SCTE-35 Configuration</span>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedConfig.scte35Config)}>
                      Copy
                    </Button>
                  </CardTitle>
                  <CardDescription>SCTE-35 event and transport stream configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={generatedConfig.scte35Config}
                    readOnly
                    rows={12}
                    className="font-mono text-sm"
                    placeholder="Generate configuration to see SCTE-35 configuration..."
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}