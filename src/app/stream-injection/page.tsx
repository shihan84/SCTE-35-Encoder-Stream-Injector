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
import { Play, Pause, Square, Settings, Monitor, Copy, Download, ArrowLeft } from "lucide-react";
import FFmpegCommandBuilder from "@/components/ffmpeg-command-builder";

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
    inputUrl: "",
    outputUrl: "",
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
      case 'running': return 'bg-green-500';
      case 'starting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
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
            <h1 className="text-3xl font-bold tracking-tight">SCTE-35 Stream Injection</h1>
            <p className="text-muted-foreground">
              Inject SCTE-35 cues into live streams in real-time
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config">Stream Config</TabsTrigger>
            <TabsTrigger value="injection">Injection Points</TabsTrigger>
            <TabsTrigger value="monitor">Monitor</TabsTrigger>
            <TabsTrigger value="encoder">SCTE-35 Encoder</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stream Configuration</CardTitle>
                  <CardDescription>Configure input and output streams</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stream Identification */}
                  <div>
                    <Label htmlFor="streamName">Stream Name</Label>
                    <Input
                      id="streamName"
                      value={streamConfig.streamName}
                      onChange={(e) => setStreamConfig(prev => ({ ...prev, streamName: e.target.value }))}
                      placeholder="Live_Service"
                    />
                  </div>

                  <div>
                    <Label htmlFor="streamType">Stream Type</Label>
                    <Select value={streamConfig.streamType} onValueChange={(value: any) => setStreamConfig(prev => ({ ...prev, streamType: value }))}>
                      <SelectTrigger>
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

                  <div>
                    <Label htmlFor="inputUrl">Input URL</Label>
                    <Input
                      id="inputUrl"
                      placeholder="srt://localhost:9000?streamid=live/stream"
                      value={streamConfig.inputUrl}
                      onChange={(e) => setStreamConfig(prev => ({ ...prev, inputUrl: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="outputUrl">Output URL</Label>
                    <Input
                      id="outputUrl"
                      placeholder="srt://localhost:9001?streamid=live/output"
                      value={streamConfig.outputUrl}
                      onChange={(e) => setStreamConfig(prev => ({ ...prev, outputUrl: e.target.value }))}
                    />
                  </div>

                  {/* Video Specifications */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold text-lg">Video Specifications</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="videoResolution">Video Resolution</Label>
                        <Select value={streamConfig.videoResolution} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, videoResolution: value }))}>
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
                        <Select value={streamConfig.videoCodec} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, videoCodec: value }))}>
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
                        <Select value={streamConfig.pcr} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, pcr: value }))}>
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
                        <Select value={streamConfig.profileLevel} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, profileLevel: value }))}>
                          <SelectTrigger>
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="gop">GOP</Label>
                        <Input
                          id="gop"
                          type="number"
                          value={streamConfig.gop}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, gop: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="bFrames">No of B Frames</Label>
                        <Input
                          id="bFrames"
                          type="number"
                          value={streamConfig.bFrames}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, bFrames: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="videoBitrate">Video Bitrate (kbps)</Label>
                        <Input
                          id="videoBitrate"
                          type="number"
                          value={streamConfig.videoBitrate}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, videoBitrate: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="chroma">Chroma</Label>
                        <Select value={streamConfig.chroma} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, chroma: value }))}>
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
                      <Select value={streamConfig.aspectRatio} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, aspectRatio: value }))}>
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
                  </div>

                  {/* Audio Specifications */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold text-lg">Audio Specifications</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="audioCodec">Audio Codec</Label>
                        <Select value={streamConfig.audioCodec} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, audioCodec: value }))}>
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
                          value={streamConfig.audioBitrate}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, audioBitrate: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="audioLKFS">Audio LKFS</Label>
                        <Input
                          id="audioLKFS"
                          type="number"
                          value={streamConfig.audioLKFS}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, audioLKFS: parseInt(e.target.value) }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {streamConfig.audioLKFS} dB
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="audioSamplingRate">Audio Sampling Rate</Label>
                        <Select value={streamConfig.audioSamplingRate.toString()} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, audioSamplingRate: parseInt(value) }))}>
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
                  </div>

                  {/* SCTE-35 Configuration */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold text-lg">SCTE-35 Configuration</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="scteDataPid">SCTE Data PID</Label>
                        <Input
                          id="scteDataPid"
                          type="number"
                          value={streamConfig.scteDataPid}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, scteDataPid: parseInt(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="nullPid">Null PID</Label>
                        <Input
                          id="nullPid"
                          type="number"
                          value={streamConfig.nullPid}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, nullPid: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="latency">Latency (milliseconds)</Label>
                      <Input
                        id="latency"
                        type="number"
                        value={streamConfig.latency}
                        onChange={(e) => setStreamConfig(prev => ({ ...prev, latency: parseInt(e.target.value) }))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {streamConfig.latency / 1000} seconds
                      </p>
                    </div>
                  </div>

                  {/* SCTE-35 Event Configuration */}
                  <div className="space-y-4 border-t pt-4">
                    <h4 className="font-semibold text-lg">SCTE-35 Event Configuration</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="adDuration">Ad Duration (seconds)</Label>
                        <Input
                          id="adDuration"
                          type="number"
                          value={streamConfig.adDuration}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, adDuration: parseInt(e.target.value) }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.floor(streamConfig.adDuration / 60)} minutes {streamConfig.adDuration % 60} seconds
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="scteEventId">SCTE Event ID</Label>
                        <Input
                          id="scteEventId"
                          type="number"
                          value={streamConfig.scteEventId}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, scteEventId: parseInt(e.target.value) }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Unique ID, increments sequentially
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="scteStartCommand">SCTE START Command</Label>
                        <Select value={streamConfig.scteStartCommand} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, scteStartCommand: value }))}>
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
                        <Select value={streamConfig.scteStopCommand} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, scteStopCommand: value }))}>
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
                        <Select value={streamConfig.crashOutCommand} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, crashOutCommand: value }))}>
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
                          value={streamConfig.preRollDuration}
                          onChange={(e) => setStreamConfig(prev => ({ ...prev, preRollDuration: parseInt(e.target.value) }))}
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
                        value={streamConfig.scteDataPidValue}
                        onChange={(e) => setStreamConfig(prev => ({ ...prev, scteDataPidValue: parseInt(e.target.value) }))}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Must match SCTE Data PID above
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleStartStream} 
                      disabled={streamStatus.status === 'running' || !streamConfig.inputUrl || !streamConfig.outputUrl}
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Stream
                    </Button>
                    <Button 
                      onClick={handleStopStream} 
                      disabled={streamStatus.status !== 'running'}
                      variant="outline"
                      className="flex-1"
                    >
                      <Square className="w-4 h-4 mr-2" />
                      Stop Stream
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stream Status</CardTitle>
                  <CardDescription>Real-time stream monitoring</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(streamStatus.status)}`} />
                      <Badge variant="outline">{streamStatus.status.toUpperCase()}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Input Bitrate</Label>
                      <div className="text-2xl font-bold">{streamStatus.inputBitrate} kbps</div>
                    </div>
                    <div>
                      <Label>Output Bitrate</Label>
                      <div className="text-2xl font-bold">{streamStatus.outputBitrate} kbps</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Viewers</Label>
                      <div className="text-2xl font-bold">{streamStatus.viewers}</div>
                    </div>
                    <div>
                      <Label>Uptime</Label>
                      <div className="text-2xl font-bold">{formatTime(streamStatus.uptime)}</div>
                    </div>
                  </div>

                  {streamStatus.lastInjection && (
                    <div>
                      <Label>Last Injection</Label>
                      <div className="text-sm text-muted-foreground">
                        {new Date(streamStatus.lastInjection).toLocaleString()}
                      </div>
                    </div>
                  )}

                  {streamStatus.error && (
                    <Alert variant="destructive">
                      <AlertDescription>{streamStatus.error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="injection" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Injection Point</CardTitle>
                  <CardDescription>Schedule or trigger SCTE-35 injections</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="injectionTime">Time (seconds)</Label>
                    <Input
                      id="injectionTime"
                      type="number"
                      min="0"
                      value={newInjection.time}
                      onChange={(e) => setNewInjection(prev => ({ ...prev, time: parseInt(e.target.value) }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="scte35Data">SCTE-35 Data (Base64)</Label>
                    <Textarea
                      id="scte35Data"
                      placeholder="/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM="
                      value={newInjection.scte35Data}
                      onChange={(e) => setNewInjection(prev => ({ ...prev, scte35Data: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Ad break start"
                      value={newInjection.description}
                      onChange={(e) => setNewInjection(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoInject"
                      checked={autoInject}
                      onCheckedChange={setAutoInject}
                    />
                    <Label htmlFor="autoInject">Auto-inject at scheduled time</Label>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={handleAddInjection} className="flex-1">
                      Add Injection Point
                    </Button>
                    <Button 
                      onClick={() => handleInjectNow(newInjection.scte35Data)}
                      disabled={!newInjection.scte35Data}
                      variant="outline"
                    >
                      Inject Now
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Scheduled Injections</CardTitle>
                  <CardDescription>Manage scheduled SCTE-35 injection points</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {injectionPoints.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        No injection points scheduled
                      </div>
                    ) : (
                      injectionPoints.map((injection) => (
                        <div key={injection.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex-1">
                            <div className="font-medium">{injection.description}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatTime(injection.time)} • {injection.active ? "Active" : "Inactive"}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={injection.active}
                              onCheckedChange={() => handleToggleInjection(injection.id)}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleInjectNow(injection.scte35Data)}
                            >
                              Inject
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRemoveInjection(injection.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monitor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stream Monitor</CardTitle>
                <CardDescription>Real-time stream analysis and SCTE-35 detection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-green-600">{streamStatus.inputBitrate}</div>
                      <div className="text-sm text-muted-foreground">Input Bitrate (kbps)</div>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-blue-600">{streamStatus.outputBitrate}</div>
                      <div className="text-sm text-muted-foreground">Output Bitrate (kbps)</div>
                    </div>
                    <div className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold text-purple-600">{injectionPoints.length}</div>
                      <div className="text-sm text-muted-foreground">Active Injections</div>
                    </div>
                  </div>
                  
                  <div className="bg-muted p-4 rounded">
                    <h4 className="font-medium mb-2">Recent SCTE-35 Activity</h4>
                    <div className="space-y-2">
                      {streamStatus.lastInjection ? (
                        <div className="text-sm">
                          Last injection: {new Date(streamStatus.lastInjection).toLocaleString()}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">No recent SCTE-35 activity</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="encoder" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick SCTE-35 Encoder</CardTitle>
                <CardDescription>Generate SCTE-35 cues for injection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventType">Event Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ad-start">Ad Break Start</SelectItem>
                        <SelectItem value="ad-end">Ad Break End</SelectItem>
                        <SelectItem value="program-start">Program Start</SelectItem>
                        <SelectItem value="program-end">Program End</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (seconds)</Label>
                    <Input type="number" placeholder="30" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="cueId">Cue ID</Label>
                  <Input placeholder="1" />
                </div>
                
                <Button className="w-full">
                  Generate SCTE-35
                </Button>
                
                {scte35Encoded && (
                  <div className="space-y-2">
                    <Label>Generated SCTE-35 Data</Label>
                    <Textarea value={scte35Encoded} readOnly rows={3} />
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleInjectNow(scte35Encoded)}>
                        <Play className="w-4 h-4 mr-2" />
                        Inject Now
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <FFmpegCommandBuilder />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}