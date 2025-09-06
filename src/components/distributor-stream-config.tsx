"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Play, Square, Settings, Activity, AlertTriangle } from "lucide-react";

interface DistributorStreamConfig {
  // Basic Stream Info
  streamName: string;
  inputUrl: string;
  outputUrl: string;
  
  // Video Specifications
  videoResolution: string;
  videoCodec: string;
  profileLevel: string;
  gop: number;
  bFrames: number;
  videoBitrate: number;
  chroma: string;
  aspectRatio: string;
  pcr: string;
  
  // Audio Specifications
  audioCodec: string;
  audioBitrate: number;
  audioLKFS: number;
  audioSamplingRate: number;
  
  // SCTE Specifications
  scteDataPID: number;
  nullPID: number;
  latency: number;
  adDuration: number;
  scteEventID: number;
  preRollDuration: number;
}

interface SCTEEvent {
  id: number;
  type: 'CUE-OUT' | 'CUE-IN';
  timestamp: string;
  adDuration: number;
  preRollDuration: number;
  status: 'scheduled' | 'sent' | 'acknowledged';
}

export default function DistributorStreamConfig() {
  const [activeTab, setActiveTab] = useState("config");
  const [streamConfig, setStreamConfig] = useState<DistributorStreamConfig>({
    streamName: "",
    inputUrl: "",
    outputUrl: "",
    videoResolution: "1920x1080",
    videoCodec: "H.264",
    profileLevel: "High@Auto",
    gop: 12,
    bFrames: 5,
    videoBitrate: 5000,
    chroma: "4:2:0",
    aspectRatio: "16:9",
    pcr: "Video Embedded",
    audioCodec: "AAC-LC",
    audioBitrate: 128,
    audioLKFS: -20,
    audioSamplingRate: 48,
    scteDataPID: 500,
    nullPID: 8191,
    latency: 2000,
    adDuration: 600,
    scteEventID: 100023,
    preRollDuration: 0
  });

  const [scteEvents, setScteEvents] = useState<SCTEEvent[]>([]);
  const [isStreamRunning, setIsStreamRunning] = useState(false);
  const [nextEventId, setNextEventId] = useState(100024);

  const handleStartStream = async () => {
    try {
      // Validate configuration
      if (!validateConfig()) {
        return;
      }

      setIsStreamRunning(true);
      
      const response = await fetch("/api/stream/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...streamConfig,
          streamType: "srt"
        })
      });

      if (!response.ok) {
        throw new Error("Failed to start stream");
      }

      console.log("SRT stream started with distributor specifications");
    } catch (error) {
      console.error("Error starting stream:", error);
      setIsStreamRunning(false);
    }
  };

  const handleStopStream = async () => {
    try {
      await fetch("/api/stream/stop", { method: "POST" });
      setIsStreamRunning(false);
    } catch (error) {
      console.error("Error stopping stream:", error);
    }
  };

  const validateConfig = (): boolean => {
    const required = ['streamName', 'inputUrl', 'outputUrl'];
    const missing = required.filter(field => !streamConfig[field as keyof DistributorStreamConfig]);
    
    if (missing.length > 0) {
      alert(`Missing required fields: ${missing.join(', ')}`);
      return false;
    }

    // Validate specific distributor requirements
    if (streamConfig.videoResolution !== "1920x1080") {
      alert("Video resolution must be 1920x1080 (HD)");
      return false;
    }

    if (streamConfig.videoCodec !== "H.264") {
      alert("Video codec must be H.264");
      return false;
    }

    if (streamConfig.gop !== 12) {
      alert("GOP must be 12");
      return false;
    }

    if (streamConfig.bFrames !== 5) {
      alert("Number of B frames must be 5");
      return false;
    }

    if (streamConfig.videoBitrate !== 5000) {
      alert("Video bitrate must be 5 Mbps (5000 kbps)");
      return false;
    }

    if (streamConfig.scteDataPID !== 500) {
      alert("SCTE Data PID must be 500");
      return false;
    }

    if (streamConfig.nullPID !== 8191) {
      alert("Null PID must be 8191");
      return false;
    }

    if (streamConfig.latency !== 2000) {
      alert("Latency must be 2000ms (2 seconds)");
      return false;
    }

    return true;
  };

  const handleSendCueOut = async () => {
    try {
      const scte35Data = generateSCTE35Data('CUE-OUT', streamConfig.adDuration, streamConfig.preRollDuration);
      
      const response = await fetch("/api/stream/inject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          scte35Data,
          eventType: 'CUE-OUT',
          eventId: streamConfig.scteEventID,
          adDuration: streamConfig.adDuration,
          preRollDuration: streamConfig.preRollDuration
        })
      });

      if (!response.ok) {
        throw new Error("Failed to send CUE-OUT");
      }

      // Add to events log
      const event: SCTEEvent = {
        id: streamConfig.scteEventID,
        type: 'CUE-OUT',
        timestamp: new Date().toISOString(),
        adDuration: streamConfig.adDuration,
        preRollDuration: streamConfig.preRollDuration,
        status: 'sent'
      };

      setScteEvents(prev => [...prev, event]);
      
      // Increment event ID for next event
      setStreamConfig(prev => ({ ...prev, scteEventID: nextEventId }));
      setNextEventId(prev => prev + 1);

      console.log(`CUE-OUT sent with Event ID: ${streamConfig.scteEventID}`);
    } catch (error) {
      console.error("Error sending CUE-OUT:", error);
    }
  };

  const handleSendCueIn = async () => {
    try {
      const scte35Data = generateSCTE35Data('CUE-IN', 0, 0);
      
      const response = await fetch("/api/stream/inject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          scte35Data,
          eventType: 'CUE-IN',
          eventId: streamConfig.scteEventID,
          adDuration: 0,
          preRollDuration: 0
        })
      });

      if (!response.ok) {
        throw new Error("Failed to send CUE-IN");
      }

      // Add to events log
      const event: SCTEEvent = {
        id: streamConfig.scteEventID,
        type: 'CUE-IN',
        timestamp: new Date().toISOString(),
        adDuration: 0,
        preRollDuration: 0,
        status: 'sent'
      };

      setScteEvents(prev => [...prev, event]);
      
      // Increment event ID for next event
      setStreamConfig(prev => ({ ...prev, scteEventID: nextEventId }));
      setNextEventId(prev => prev + 1);

      console.log(`CUE-IN sent with Event ID: ${streamConfig.scteEventID}`);
    } catch (error) {
      console.error("Error sending CUE-IN:", error);
    }
  };

  const generateSCTE35Data = (cueType: 'CUE-OUT' | 'CUE-IN', adDuration: number, preRollDuration: number): string => {
    // Generate SCTE-35 data based on distributor requirements
    // This is a simplified implementation - in production, you'd use proper SCTE-35 encoding
    
    const baseData = cueType === 'CUE-OUT' 
      ? "/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM="
      : "/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM=";
    
    // In a real implementation, you would encode the specific parameters
    return baseData;
  };

  const handleCrashRecovery = async () => {
    try {
      // Send emergency CUE-IN to get back to program
      await handleSendCueIn();
      console.log("Crash recovery CUE-IN sent");
    } catch (error) {
      console.error("Error during crash recovery:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Distributor SRT Stream Configuration</h1>
            <p className="text-muted-foreground">
              Configure SRT streams with distributor-specific specifications
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isStreamRunning ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">{isStreamRunning ? 'Stream Active' : 'Stream Inactive'}</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config">Stream Config</TabsTrigger>
            <TabsTrigger value="video">Video Specs</TabsTrigger>
            <TabsTrigger value="audio">Audio Specs</TabsTrigger>
            <TabsTrigger value="scte">SCTE Control</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Stream Configuration</CardTitle>
                <CardDescription>
                  Configure basic SRT stream parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="streamName">Stream Name *</Label>
                  <Input
                    id="streamName"
                    placeholder="Service Name"
                    value={streamConfig.streamName}
                    onChange={(e) => setStreamConfig(prev => ({ ...prev, streamName: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="inputUrl">Input URL *</Label>
                    <Input
                      id="inputUrl"
                      placeholder="srt://localhost:9000?streamid=live/stream"
                      value={streamConfig.inputUrl}
                      onChange={(e) => setStreamConfig(prev => ({ ...prev, inputUrl: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="outputUrl">Output URL *</Label>
                    <Input
                      id="outputUrl"
                      placeholder="srt://localhost:9001?streamid=live/output"
                      value={streamConfig.outputUrl}
                      onChange={(e) => setStreamConfig(prev => ({ ...prev, outputUrl: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scteDataPID">SCTE Data PID *</Label>
                    <Input
                      id="scteDataPID"
                      type="number"
                      value={streamConfig.scteDataPID}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="nullPID">Null PID *</Label>
                    <Input
                      id="nullPID"
                      type="number"
                      value={streamConfig.nullPID}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="latency">Latency (ms) *</Label>
                  <Input
                    id="latency"
                    type="number"
                    value={streamConfig.latency}
                    readOnly
                    className="bg-muted"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={handleStartStream} 
                    disabled={isStreamRunning}
                    className="flex-1"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Stream
                  </Button>
                  <Button 
                    onClick={handleStopStream} 
                    disabled={!isStreamRunning}
                    variant="outline"
                    className="flex-1"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Stream
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Video Specifications</CardTitle>
                <CardDescription>
                  Distributor-required video encoding parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="videoResolution">Video Resolution *</Label>
                    <Input
                      id="videoResolution"
                      value={streamConfig.videoResolution}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="videoCodec">Video Codec *</Label>
                    <Input
                      id="videoCodec"
                      value={streamConfig.videoCodec}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="profileLevel">Profile@Level *</Label>
                    <Input
                      id="profileLevel"
                      value={streamConfig.profileLevel}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gop">GOP *</Label>
                    <Input
                      id="gop"
                      type="number"
                      value={streamConfig.gop}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bFrames">B Frames *</Label>
                    <Input
                      id="bFrames"
                      type="number"
                      value={streamConfig.bFrames}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="videoBitrate">Video Bitrate (kbps) *</Label>
                    <Input
                      id="videoBitrate"
                      type="number"
                      value={streamConfig.videoBitrate}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="chroma">Chroma *</Label>
                    <Input
                      id="chroma"
                      value={streamConfig.chroma}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="aspectRatio">Aspect Ratio *</Label>
                    <Input
                      id="aspectRatio"
                      value={streamConfig.aspectRatio}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pcr">PCR *</Label>
                    <Input
                      id="pcr"
                      value={streamConfig.pcr}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Video Specifications Locked</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    Video specifications are locked to distributor requirements. All parameters must match exactly.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audio Specifications</CardTitle>
                <CardDescription>
                  Distributor-required audio encoding parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="audioCodec">Audio Codec *</Label>
                    <Input
                      id="audioCodec"
                      value={streamConfig.audioCodec}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="audioBitrate">Audio Bitrate (kbps) *</Label>
                    <Input
                      id="audioBitrate"
                      type="number"
                      value={streamConfig.audioBitrate}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="audioLKFS">Audio LKFS (dB) *</Label>
                    <Input
                      id="audioLKFS"
                      type="number"
                      value={streamConfig.audioLKFS}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="audioSamplingRate">Audio Sampling Rate (kHz) *</Label>
                    <Input
                      id="audioSamplingRate"
                      type="number"
                      value={streamConfig.audioSamplingRate}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Audio Specifications Locked</span>
                  </div>
                  <p className="text-sm text-green-700 mt-2">
                    Audio specifications are locked to distributor requirements. All parameters must match exactly.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scte" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>SCTE-35 Control</CardTitle>
                  <CardDescription>
                    Manage SCTE-35 events for ad insertion
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="adDuration">Ad Duration (seconds) *</Label>
                      <Input
                        id="adDuration"
                        type="number"
                        value={streamConfig.adDuration}
                        onChange={(e) => setStreamConfig(prev => ({ ...prev, adDuration: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="scteEventID">Next SCTE Event ID *</Label>
                      <Input
                        id="scteEventID"
                        type="number"
                        value={streamConfig.scteEventID}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="preRollDuration">Pre-roll Duration (seconds) *</Label>
                    <Input
                      id="preRollDuration"
                      type="number"
                      min="0"
                      max="10"
                      value={streamConfig.preRollDuration}
                      onChange={(e) => setStreamConfig(prev => ({ ...prev, preRollDuration: parseInt(e.target.value) }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Button 
                        onClick={handleSendCueOut}
                        disabled={!isStreamRunning}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        Send CUE-OUT
                      </Button>
                      <Button 
                        onClick={handleSendCueIn}
                        disabled={!isStreamRunning}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Send CUE-IN
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={handleCrashRecovery}
                      disabled={!isStreamRunning}
                      variant="outline"
                      className="w-full"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Emergency CUE-IN (Crash Recovery)
                    </Button>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Important Notes</span>
                    </div>
                    <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                      <li>• Event IDs increment sequentially automatically</li>
                      <li>• CUE-OUT starts ad break with specified duration</li>
                      <li>• CUE-IN returns to regular programming</li>
                      <li>• Use Emergency CUE-IN for crash recovery</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SCTE Event Log</CardTitle>
                  <CardDescription>
                    Recent SCTE-35 events and status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {scteEvents.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">
                        No SCTE events sent yet
                      </div>
                    ) : (
                      scteEvents.map((event) => (
                        <div key={event.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant={event.type === 'CUE-OUT' ? 'destructive' : 'default'}>
                                {event.type}
                              </Badge>
                              <span className="font-medium">Event ID: {event.id}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(event.timestamp).toLocaleString()}
                              {event.adDuration > 0 && ` • Duration: ${event.adDuration}s`}
                              {event.preRollDuration > 0 && ` • Pre-roll: ${event.preRollDuration}s`}
                            </div>
                          </div>
                          <Badge variant="outline">
                            {event.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}