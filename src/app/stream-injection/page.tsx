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

interface StreamConfig {
  inputUrl: string;
  outputUrl: string;
  streamType: 'srt' | 'hls' | 'dash' | 'rtmp';
  bitrate: number;
  resolution: string;
  codec: string;
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
    bitrate: 5000,
    resolution: "1920x1080",
    codec: "h264"
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bitrate">Bitrate (kbps)</Label>
                      <Input
                        id="bitrate"
                        type="number"
                        value={streamConfig.bitrate}
                        onChange={(e) => setStreamConfig(prev => ({ ...prev, bitrate: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="resolution">Resolution</Label>
                      <Select value={streamConfig.resolution} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, resolution: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1920x1080">1920x1080 (1080p)</SelectItem>
                          <SelectItem value="1280x720">1280x720 (720p)</SelectItem>
                          <SelectItem value="854x480">854x480 (480p)</SelectItem>
                          <SelectItem value="640x360">640x360 (360p)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="codec">Codec</Label>
                    <Select value={streamConfig.codec} onValueChange={(value) => setStreamConfig(prev => ({ ...prev, codec: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="h264">H.264</SelectItem>
                        <SelectItem value="h265">H.265</SelectItem>
                        <SelectItem value="av1">AV1</SelectItem>
                      </SelectContent>
                    </Select>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}