"use client";

import { useState, useEffect, useRef } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Pause, Square, Settings, Monitor, Copy, Download, ArrowLeft, Zap, Activity, Network, Database, Shield, RadioWave } from "lucide-react";
import FFmpegCommandBuilder from "@/components/ffmpeg-command-builder";
import TimeSyncClock from "@/components/time-sync-clock";

interface StreamConfig {
  inputUrl: string;
  outputUrl: string;
  streamType: 'srt' | 'hls' | 'dash' | 'rtmp';
  
  // Distributor Requirements
  streamName: string;
  videoResolution: string;
  videoCodec: string;
  pcr: string;
  profileLevel: string;
  gop: number;
  bFrames: number;
  videoBitrate: number;
  chroma: string;
  aspectRatio: string;
  audioCodec: string;
  audioBitrate: number;
  audioLKFS: number;
  audioSamplingRate: number;
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

interface InjectionPoint {
  id: string;
  time: number;
  scte35Data: string;
  description: string;
  active: boolean;
}

interface StreamStatus {
  status: 'stopped' | 'starting' | 'running' | 'error';
  inputBitrate: number;
  outputBitrate: number;
  viewers: number;
  uptime: number;
  lastInjection: string;
  error?: string;
}

export default function StreamInjection() {
  const [activeTab, setActiveTab] = useState("config");
  const [streamConfig, setStreamConfig] = useState<StreamConfig>({
    inputUrl: "https://cdn.itassist.one/BREAKING/NEWS/index.m3u8",
    outputUrl: "srt://itassist.one:8888?streamid=#!::r=live/live,m=publish",
    streamType: "srt",
    
    // Distributor Requirements - Default Values
    streamName: "Live_Service",
    videoResolution: "1920x1080",
    videoCodec: "h264",
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

  const [injectionPoints, setInjectionPoints] = useState<InjectionPoint[]>([]);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    status: 'stopped',
    inputBitrate: 0,
    outputBitrate: 0,
    viewers: 0,
    uptime: 0,
    lastInjection: ""
  });

  const [newInjection, setNewInjection] = useState({
    time: 0,
    scte35Data: "",
    description: ""
  });

  const [autoInject, setAutoInject] = useState(false);
  const [scte35Encoded, setScte35Encoded] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
  }, []);

  const handleStartStream = async () => {
    try {
      setStreamStatus(prev => ({ ...prev, status: 'starting' }));
      
      const response = await fetch("/api/stream/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(streamConfig)
      });

      if (!response.ok) {
        throw new Error("Failed to start stream");
      }

      // Connect to WebSocket for real-time updates
      connectWebSocket();
      
      // Start status polling
      startStatusPolling();
      
      setStreamStatus(prev => ({ ...prev, status: 'running' }));
    } catch (error) {
      setStreamStatus(prev => ({ 
        ...prev, 
        status: 'error', 
        error: error instanceof Error ? error.message : "Unknown error" 
      }));
    }
  };

  const handleStopStream = async () => {
    try {
      await fetch("/api/stream/stop", { method: "POST" });
      
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }
      
      setStreamStatus(prev => ({ ...prev, status: 'stopped' }));
    } catch (error) {
      console.error("Error stopping stream:", error);
    }
  };

  const connectWebSocket = () => {
    const ws = new WebSocket(`ws://${window.location.host}/api/stream/ws`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'status') {
        setStreamStatus(data.status);
      } else if (data.type === 'injection') {
        setStreamStatus(prev => ({ ...prev, lastInjection: new Date().toISOString() }));
      }
    };

    ws.onclose = () => {
      setTimeout(connectWebSocket, 5000);
    };
  };

  const startStatusPolling = () => {
    statusIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch("/api/stream/status");
        if (response.ok) {
          const status = await response.json();
          setStreamStatus(status);
        }
      } catch (error) {
        console.error("Error polling status:", error);
      }
    }, 1000);
  };

  const handleAddInjection = () => {
    if (!newInjection.scte35Data || newInjection.time < 0) return;

    const injection: InjectionPoint = {
      id: Date.now().toString(),
      time: newInjection.time,
      scte35Data: newInjection.scte35Data,
      description: newInjection.description || `Injection at ${newInjection.time}s`,
      active: true
    };

    setInjectionPoints(prev => [...prev, injection]);
    setNewInjection({ time: 0, scte35Data: "", description: "" });
  };

  const handleRemoveInjection = (id: string) => {
    setInjectionPoints(prev => prev.filter(inj => inj.id !== id));
  };

  const handleToggleInjection = (id: string) => {
    setInjectionPoints(prev => 
      prev.map(inj => 
        inj.id === id ? { ...inj, active: !inj.active } : inj
      )
    );
  };

  const handleInjectNow = async (scte35Data: string) => {
    try {
      await fetch("/api/stream/inject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scte35Data })
      });
      
      setStreamStatus(prev => ({ ...prev, lastInjection: new Date().toISOString() }));
    } catch (error) {
      console.error("Error injecting SCTE-35:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: StreamStatus['status']) => {
    switch (status) {
      case 'running': return 'medialive-status-running';
      case 'starting': return 'medialive-status-warning';
      case 'error': return 'medialive-status-error';
      default: return 'medialive-status-stopped';
    }
  };

  const getStatusText = (status: StreamStatus['status']) => {
    switch (status) {
      case 'running': return 'Active';
      case 'starting': return 'Starting';
      case 'error': return 'Error';
      default: return 'Stopped';
    }
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
                  <Zap className="w-5 h-5 text-[#0f1419]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">SCTE-35 Stream Injection</h1>
                  <p className="text-sm text-[#a0aec0]">AWS Elemental MediaLive Compatible</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`medialive-status-indicator ${getStatusColor(streamStatus.status)}`}></div>
                <span className="text-sm text-[#a0aec0]">{getStatusText(streamStatus.status)}</span>
              </div>
              <Badge className="medialive-badge medialive-badge-success">PRODUCTION READY</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Time Sync Clock */}
      <div className="max-w-7xl mx-auto px-6 pt-4">
        <TimeSyncClock 
          onTimeUpdate={(timestamp) => {
            // Update injection timing based on synchronized time
            console.log('Synchronized time:', new Date(timestamp).toISOString());
          }}
          showSyncStatus={true}
        />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="medialive-tabs w-full">
          <TabsList className="grid w-full grid-cols-5 bg-[#16191f] border border-[#232f3e] rounded-lg p-5 gap-[80px]">
            <TabsTrigger 
              value="config" 
              className="medialive-tab data-[state=active]:bg-[#ff9900] data-[state=active]:text-[#0f1419] data-[state=active]:font-semibold px-3 py-2 text-xs"
            >
              Stream Setup
            </TabsTrigger>
            <TabsTrigger 
              value="encoder" 
              className="medialive-tab data-[state=active]:bg-[#ff9900] data-[state=active]:text-[#0f1419] data-[state=active]:font-semibold px-3 py-2 text-xs"
            >
              SCTE-35 Tools
            </TabsTrigger>
            <TabsTrigger 
              value="injection" 
              className="medialive-tab data-[state=active]:bg-[#ff9900] data-[state=active]:text-[#0f1419] data-[state=active]:font-semibold px-3 py-2 text-xs"
            >
              Injection Points
            </TabsTrigger>
            <TabsTrigger 
              value="monitor" 
              className="medialive-tab data-[state=active]:bg-[#ff9900] data-[state=active]:text-[#0f1419] data-[state=active]:font-semibold px-3 py-2 text-xs"
            >
              Live Monitor
            </TabsTrigger>
            <TabsTrigger 
              value="advanced" 
              className="medialive-tab data-[state=active]:bg-[#ff9900] data-[state=active]:text-[#0f1419] data-[state=active]:font-semibold px-3 py-2 text-xs"
            >
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stream Configuration Panel */}
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">Stream Configuration</h2>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    Configure input and output streams
                  </p>
                </div>
                <div className="medialive-panel-content space-y-4">
                  {/* Stream Identification */}
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Stream Name</label>
                    <input
                      className="medialive-input"
                      value={streamConfig.streamName}
                      onChange={(e) => setStreamConfig(prev => ({ ...prev, streamName: e.target.value }))}
                      placeholder="Live_Service"
                    />
                  </div>

                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Stream Type</label>
                    <Select value={streamConfig.streamType} onValueChange={(value: any) => setStreamConfig(prev => ({ ...prev, streamType: value }))}>
                      <SelectTrigger className="medialive-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="srt">SRT (Secure Reliable Transport)</SelectItem>
                        <SelectItem value="hls">HLS (HTTP Live Streaming)</SelectItem>
                        <SelectItem value="dash">DASH (Dynamic Adaptive Streaming)</SelectItem>
                        <SelectItem value="rtmp">RTMP (Real-Time Messaging Protocol)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Input URL</label>
                    <input
                      className="medialive-input"
                      placeholder="srt://localhost:9000?streamid=live/stream"
                      value={streamConfig.inputUrl}
                      onChange={(e) => setStreamConfig(prev => ({ ...prev, inputUrl: e.target.value }))}
                    />
                  </div>

                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Output URL</label>
                    <input
                      className="medialive-input"
                      placeholder="srt://localhost:9001?streamid=live/output"
                      value={streamConfig.outputUrl}
                      onChange={(e) => setStreamConfig(prev => ({ ...prev, outputUrl: e.target.value }))}
                    />
                  </div>

                  {/* Video Specifications */}
                  <div className="space-y-4 border-t border-[#232f3e] pt-4">
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-[#ff9900]" />
                      <h3 className="text-lg font-semibold text-white">Video Specifications</h3>
                    </div>
                    <div className="medialive-form-row">
                      <div className="medialive-form-group">
                        <label className="medialive-form-label">Video Resolution</label>
                        <Select value={streamConfig.videoResolution} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, videoResolution: value }))}>
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
                        <Select value={streamConfig.videoCodec} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, videoCodec: value }))}>
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
                        <Select value={streamConfig.pcr} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, pcr: value }))}>
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
                        <Select value={streamConfig.profileLevel} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, profileLevel: value }))}>
                          <SelectTrigger className="medialive-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High@Auto">High@Auto</SelectItem>
                            <SelectItem value="High@L4.0">High@L4.0</SelectItem>
                            <SelectItem value="High@L4.1">High@L4.1</SelectItem>
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
                          value={streamConfig.gop}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, gop: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div className="medialive-form-group">
                        <label className="medialive-form-label">No of B Frames</label>
                        <input
                          className="medialive-input"
                          type="number"
                          value={streamConfig.bFrames}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, bFrames: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Video Bitrate (kbps)</label>
                      <input
                        className="medialive-input"
                        type="number"
                        value={streamConfig.videoBitrate}
                        onChange={(e) => setStreamConfig(prev => ({ ...prev, videoBitrate: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  {/* Audio Specifications */}
                  <div className="space-y-4 border-t border-[#232f3e] pt-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-[#ff9900]" />
                      <h3 className="text-lg font-semibold text-white">Audio Specifications</h3>
                    </div>
                    <div className="medialive-form-row">
                      <div className="medialive-form-group">
                        <label className="medialive-form-label">Audio Codec</label>
                        <Select value={streamConfig.audioCodec} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, audioCodec: value }))}>
                          <SelectTrigger className="medialive-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AAC-LC">AAC-LC</SelectItem>
                            <SelectItem value="AAC-HE">AAC-HE</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="medialive-form-group">
                        <label className="medialive-form-label">Audio Bitrate (kbps)</label>
                        <input
                          className="medialive-input"
                          type="number"
                          value={streamConfig.audioBitrate}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, audioBitrate: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div className="medialive-form-row">
                      <div className="medialive-form-group">
                        <label className="medialive-form-label">Audio LKFS</label>
                        <input
                          className="medialive-input"
                          type="number"
                          value={streamConfig.audioLKFS}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, audioLKFS: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div className="medialive-form-group">
                        <label className="medialive-form-label">Sampling Rate (Hz)</label>
                        <input
                          className="medialive-input"
                          type="number"
                          value={streamConfig.audioSamplingRate}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, audioSamplingRate: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SCTE-35 Configuration */}
                  <div className="space-y-4 border-t border-[#232f3e] pt-4">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-[#ff9900]" />
                      <h3 className="text-lg font-semibold text-white">SCTE-35 Configuration</h3>
                    </div>
                    <div className="medialive-form-row">
                      <div className="medialive-form-group">
                        <label className="medialive-form-label">SCTE Data PID</label>
                        <input
                          className="medialive-input"
                          type="number"
                          value={streamConfig.scteDataPid}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, scteDataPid: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div className="medialive-form-group">
                        <label className="medialive-form-label">Null PID</label>
                        <input
                          className="medialive-input"
                          type="number"
                          value={streamConfig.nullPid}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, nullPid: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Latency (ms)</label>
                      <input
                        className="medialive-input"
                        type="number"
                        value={streamConfig.latency}
                        onChange={(e) => setStreamConfig(prev => ({ ...prev, latency: parseInt(e.target.value) }))}
                      />
                    </div>

                    <div className="medialive-form-row">
                      <div className="medialive-form-group">
                        <label className="medialive-form-label">Ad Duration (seconds)</label>
                        <input
                          className="medialive-input"
                          type="number"
                          value={streamConfig.adDuration}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, adDuration: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div className="medialive-form-group">
                        <label className="medialive-form-label">SCTE Event ID</label>
                        <input
                          className="medialive-input"
                          type="number"
                          value={streamConfig.scteEventId}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, scteEventId: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stream Control */}
                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={handleStartStream}
                      disabled={streamStatus.status === 'running' || streamStatus.status === 'starting'}
                      className={`medialive-button medialive-button-primary flex-1 ${
                        streamStatus.status === 'running' || streamStatus.status === 'starting' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Stream
                    </button>
                    <button
                      onClick={handleStopStream}
                      disabled={streamStatus.status === 'stopped'}
                      className={`medialive-button medialive-button-secondary flex-1 ${
                        streamStatus.status === 'stopped' ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop Stream
                    </button>
                  </div>
                </div>
              </div>

              {/* FFmpeg Command Builder */}
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">FFmpeg Command Builder</h2>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    Generate FFmpeg commands for stream processing
                  </p>
                </div>
                <div className="medialive-panel-content">
                  <FFmpegCommandBuilder />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="injection" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Injection Points */}
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">Injection Points</h2>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    Schedule SCTE-35 injection points
                  </p>
                </div>
                <div className="medialive-panel-content space-y-4">
                  <div className="medialive-form-row">
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Time (seconds)</label>
                      <input
                        className="medialive-input"
                        type="number"
                        value={newInjection.time}
                        onChange={(e) => setNewInjection(prev => ({ ...prev, time: parseInt(e.target.value) }))}
                        min="0"
                      />
                    </div>
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Description</label>
                      <input
                        className="medialive-input"
                        value={newInjection.description}
                        onChange={(e) => setNewInjection(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Injection description"
                      />
                    </div>
                  </div>

                  <div className="medialive-form-group">
                    <label className="medialive-form-label">SCTE-35 Data</label>
                    <textarea
                      className="medialive-textarea"
                      value={newInjection.scte35Data}
                      onChange={(e) => setNewInjection(prev => ({ ...prev, scte35Data: e.target.value }))}
                      placeholder="Paste SCTE-35 data here..."
                      rows={3}
                    />
                  </div>

                  <button
                    onClick={handleAddInjection}
                    disabled={!newInjection.scte35Data || newInjection.time < 0}
                    className={`medialive-button medialive-button-primary w-full ${
                      !newInjection.scte35Data || newInjection.time < 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Add Injection Point
                  </button>

                  {/* Injection Points List */}
                  <div className="space-y-2 max-h-64 overflow-y-auto medialive-scrollbar">
                    {injectionPoints.length === 0 ? (
                      <div className="text-center text-[#a0aec0] py-4">
                        No injection points configured
                      </div>
                    ) : (
                      injectionPoints.map((injection) => (
                        <div key={injection.id} className="flex items-center justify-between p-3 bg-[#1a252f] border border-[#232f3e] rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-white font-medium">{injection.description}</span>
                              <div className="flex items-center space-x-2">
                                <Badge className={`medialive-badge ${injection.active ? 'medialive-badge-success' : 'medialive-badge-warning'}`}>
                                  {injection.active ? 'Active' : 'Inactive'}
                                </Badge>
                                <Badge className="medialive-badge">{formatTime(injection.time)}</Badge>
                              </div>
                            </div>
                            <div className="text-xs text-[#a0aec0] mt-1 font-mono">
                              {injection.scte35Data.substring(0, 50)}...
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleToggleInjection(injection.id)}
                              className={`medialive-button medialive-button-secondary text-xs ${
                                injection.active ? 'opacity-50' : ''
                              }`}
                            >
                              {injection.active ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => handleInjectNow(injection.scte35Data)}
                              disabled={!injection.active}
                              className={`medialive-button medialive-button-primary text-xs ${
                                !injection.active ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              Inject Now
                            </button>
                            <button
                              onClick={() => handleRemoveInjection(injection.id)}
                              className="medialive-button medialive-button-secondary text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Time Synchronization for Injection */}
                  <div className="border-t border-[#232f3e] pt-4 mt-4">
                    <div className="text-sm text-[#ff9900] mb-2">Time Synchronization</div>
                    <div className="bg-[#16191f] p-3 rounded-lg">
                      <div className="text-xs text-[#ff9900] mb-2">Current Stream Time Reference</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[#ff9900]">Stream Time:</span>
                          <div className="font-mono text-[#ff9900]">
                            {new Date().toLocaleTimeString('en-US', { hour12: false })}
                          </div>
                        </div>
                        <div>
                          <span className="text-[#ff9900]">Next Injection:</span>
                          <div className="font-mono text-[#ff9900]">
                            {injectionPoints.length > 0 ? 
                              `${Math.min(...injectionPoints.map(p => p.time))}s` : 
                              'None'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto Injection Settings */}
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <Network className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">Auto Injection</h2>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    Configure automatic SCTE-35 injection
                  </p>
                </div>
                <div className="medialive-panel-content space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium">Enable Auto Injection</span>
                      <p className="text-sm text-[#a0aec0] mt-1">
                        Automatically inject SCTE-35 cues at scheduled times
                      </p>
                    </div>
                    <Switch
                      checked={autoInject}
                      onCheckedChange={setAutoInject}
                    />
                  </div>

                  {autoInject && (
                    <div className="space-y-4 border-t border-[#232f3e] pt-4">
                      <div className="medialive-form-group">
                        <label className="medialive-form-label">Pre-roll Duration (seconds)</label>
                        <input
                          className="medialive-input"
                          type="number"
                          value={streamConfig.preRollDuration}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, preRollDuration: parseInt(e.target.value) }))}
                          min="0"
                        />
                      </div>

                      <div className="medialive-form-row">
                        <div className="medialive-form-group">
                          <label className="medialive-form-label">Start Command</label>
                          <input
                            className="medialive-input"
                            value={streamConfig.scteStartCommand}
                            onChange={(e) => setStreamConfig(prev => ({ ...prev, scteStartCommand: e.target.value }))}
                          />
                        </div>
                        <div className="medialive-form-group">
                          <label className="medialive-form-label">Stop Command</label>
                          <input
                            className="medialive-input"
                            value={streamConfig.scteStopCommand}
                            onChange={(e) => setStreamConfig(prev => ({ ...prev, scteStopCommand: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="medialive-form-group">
                        <label className="medialive-form-label">Crash Out Command</label>
                        <input
                          className="medialive-input"
                          value={streamConfig.crashOutCommand}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, crashOutCommand: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stream Status */}
                  <div className="space-y-4 border-t border-[#232f3e] pt-4">
                    <div className="flex items-center space-x-2">
                      <Monitor className="w-4 h-4 text-[#ff9900]" />
                      <h3 className="text-lg font-semibold text-white">Stream Status</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{streamStatus.inputBitrate}</div>
                        <div className="text-sm text-[#a0aec0]">Input Bitrate (kbps)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{streamStatus.outputBitrate}</div>
                        <div className="text-sm text-[#a0aec0]">Output Bitrate (kbps)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{streamStatus.viewers}</div>
                        <div className="text-sm text-[#a0aec0]">Viewers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{formatTime(streamStatus.uptime)}</div>
                        <div className="text-sm text-[#a0aec0]">Uptime</div>
                      </div>
                    </div>
                    {streamStatus.lastInjection && (
                      <div className="text-center">
                        <div className="text-sm text-[#a0aec0]">Last Injection</div>
                        <div className="text-white">{new Date(streamStatus.lastInjection).toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monitor" className="space-y-6">
            {/* Stream Monitoring */}
            <div className="medialive-panel rounded-lg">
              <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <Monitor className="w-5 h-5 text-[#ff9900]" />
                  <h2 className="medialive-panel-title">Stream Monitor</h2>
                </div>
                <p className="medialive-panel-subtitle mt-1">
                  Real-time monitoring of stream health and SCTE-35 activity
                </p>
              </div>
              <div className="medialive-panel-content">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#232f3e] to-[#1a252f] rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Network className="w-8 h-8 text-[#ff9900]" />
                    </div>
                    <div className="text-2xl font-bold text-white">{streamStatus.inputBitrate}</div>
                    <div className="text-sm text-[#a0aec0]">Input Bitrate (kbps)</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#232f3e] to-[#1a252f] rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-[#ff9900]" />
                    </div>
                    <div className="text-2xl font-bold text-white">{streamStatus.outputBitrate}</div>
                    <div className="text-sm text-[#a0aec0]">Output Bitrate (kbps)</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#232f3e] to-[#1a252f] rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-[#ff9900]" />
                    </div>
                    <div className="text-2xl font-bold text-white">{streamStatus.viewers}</div>
                    <div className="text-sm text-[#a0aec0]">Viewers</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#232f3e] to-[#1a252f] rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-[#ff9900]" />
                    </div>
                    <div className="text-2xl font-bold text-white">{formatTime(streamStatus.uptime)}</div>
                    <div className="text-sm text-[#a0aec0]">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="encoder" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SCTE-35 Message Builder */}
            <div className="medialive-panel rounded-lg">
              <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                <div className="flex items-center space-x-2">
                    <RadioWave className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">SCTE-35 Message Builder</h2>
                </div>
                <p className="medialive-panel-subtitle mt-1">
                    Create and encode SCTE-35 messages
                </p>
              </div>
                <div className="medialive-panel-content space-y-4">
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Message Type</label>
                    <Select defaultValue="splice_insert">
                      <SelectTrigger className="medialive-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="splice_insert">Splice Insert</SelectItem>
                        <SelectItem value="time_signal">Time Signal</SelectItem>
                        <SelectItem value="splice_null">Splice Null</SelectItem>
                        <SelectItem value="bandwidth_reservation">Bandwidth Reservation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="medialive-form-row">
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Event ID</label>
                      <input
                        className="medialive-input"
                        type="number"
                        defaultValue="12345"
                        placeholder="12345"
                      />
                    </div>
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Duration (ms)</label>
                      <input
                        className="medialive-input"
                        type="number"
                        defaultValue="30000"
                        placeholder="30000"
                      />
                    </div>
                  </div>

                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Pre-roll Duration (ms)</label>
                    <input
                      className="medialive-input"
                      type="number"
                      defaultValue="0"
                      placeholder="0"
                    />
                  </div>

                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Output Format</label>
                    <Select defaultValue="hex">
                      <SelectTrigger className="medialive-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hex">Hexadecimal</SelectItem>
                        <SelectItem value="base64">Base64</SelectItem>
                        <SelectItem value="binary">Binary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <button className="medialive-button medialive-button-primary w-full">
                    <Radio className="w-4 h-4 mr-2" />
                    Generate SCTE-35 Message
                  </button>
                </div>
              </div>

              {/* Generated SCTE-35 Data */}
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">Generated SCTE-35 Data</h2>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    Copy and use in injection points
                  </p>
                </div>
                <div className="medialive-panel-content space-y-4">
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Hex Data</label>
                    <textarea
                      className="medialive-textarea"
                      rows={4}
                      placeholder="FC302500000000000000FFF01405000000017FEF00452F0001E02DCAFF000000000000A18A329B33"
                      readOnly
                    />
                  </div>

                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Base64 Data</label>
                    <textarea
                      className="medialive-textarea"
                      rows={2}
                      placeholder="8DA1JQAAAAAAAAAA//8EFAAAAAHf7wBF..."
                      readOnly
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button className="medialive-button medialive-button-secondary flex-1">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Hex
                    </button>
                    <button className="medialive-button medialive-button-secondary flex-1">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Base64
                    </button>
                  </div>

                  <button 
                    className="medialive-button medialive-button-primary w-full"
                    onClick={() => setActiveTab("injection")}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Use in Injection Points
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* FFmpeg Command Builder */}
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">FFmpeg Command Builder</h2>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    Generate FFmpeg commands for stream processing
                  </p>
                </div>
                <div className="medialive-panel-content">
                  <FFmpegCommandBuilder />
                </div>
              </div>

              {/* Advanced Tools */}
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">Advanced Tools</h2>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    Professional tools and utilities
                  </p>
                </div>
                <div className="medialive-panel-content space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#1a252f] border border-[#232f3e] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Database className="w-5 h-5 text-[#ff9900]" />
                        <div>
                          <span className="text-white font-medium">Data Converter</span>
                          <p className="text-xs text-[#a0aec0]">Convert between formats</p>
                        </div>
                      </div>
                      <Badge className="medialive-badge">Multi-format</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#1a252f] border border-[#232f3e] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Settings className="w-5 h-5 text-[#ff9900]" />
                        <div>
                          <span className="text-white font-medium">FFmpeg Builder</span>
                          <p className="text-xs text-[#a0aec0]">Advanced command generation</p>
                        </div>
                      </div>
                      <Badge className="medialive-badge">Advanced</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#1a252f] border border-[#232f3e] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Activity className="w-5 h-5 text-[#ff9900]" />
                        <div>
                          <span className="text-white font-medium">Stream Analyzer</span>
                          <p className="text-xs text-[#a0aec0]">Detailed stream analysis</p>
                        </div>
                      </div>
                      <Badge className="medialive-badge">Detailed</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#1a252f] border border-[#232f3e] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Network className="w-5 h-5 text-[#ff9900]" />
                        <div>
                          <span className="text-white font-medium">Protocol Tester</span>
                          <p className="text-xs text-[#a0aec0]">Test SRT, HLS, RTMP</p>
                        </div>
                      </div>
                      <Badge className="medialive-badge">Multi-protocol</Badge>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#232f3e]">
                    <Link href="/scte35-tools">
                      <Button className="medialive-button medialive-button-primary w-full">
                        <Settings className="w-4 h-4 mr-2" />
                        Open Professional Tools
                  </Button>
                </Link>
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