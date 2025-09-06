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
import { Play, Square, Settings, Activity, AlertTriangle, Zap, Shield, Database, Network } from "lucide-react";

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
    <div className="medialive-container">
      {/* AWS MediaLive-style Header */}
      <div className="bg-gradient-to-r from-[#16191f] to-[#0f1419] border-b border-[#232f3e] px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#ff9900] to-[#ff8800] rounded-lg flex items-center justify-center">
                <Network className="w-5 h-5 text-[#0f1419]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Distributor SRT Stream Configuration</h1>
                <p className="text-sm text-[#a0aec0]">AWS Elemental MediaLive Compatible</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`medialive-status-indicator ${isStreamRunning ? 'medialive-status-running' : 'medialive-status-stopped'}`}></div>
                <span className="text-sm text-[#a0aec0]">{isStreamRunning ? 'Stream Active' : 'Stream Inactive'}</span>
              </div>
              <Badge className="medialive-badge medialive-badge-success">PRODUCTION READY</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="medialive-tabs">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config" className="medialive-tab">Stream Config</TabsTrigger>
            <TabsTrigger value="video" className="medialive-tab">Video Specs</TabsTrigger>
            <TabsTrigger value="audio" className="medialive-tab">Audio Specs</TabsTrigger>
            <TabsTrigger value="scte" className="medialive-tab">SCTE Control</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-6">
            <div className="medialive-panel rounded-lg">
              <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-[#ff9900]" />
                  <h2 className="medialive-panel-title">Basic Stream Configuration</h2>
                </div>
                <p className="medialive-panel-subtitle mt-1">
                  Configure basic SRT stream parameters
                </p>
              </div>
              <div className="medialive-panel-content space-y-4">
                <div className="medialive-form-group">
                  <label className="medialive-form-label">Stream Name *</label>
                  <input
                    className="medialive-input"
                    placeholder="Service Name"
                    value={streamConfig.streamName}
                    onChange={(e) => setStreamConfig(prev => ({ ...prev, streamName: e.target.value }))}
                  />
                </div>

                <div className="medialive-form-row">
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Input URL *</label>
                    <input
                      className="medialive-input"
                      placeholder="srt://localhost:9000?streamid=live/stream"
                      value={streamConfig.inputUrl}
                      onChange={(e) => setStreamConfig(prev => ({ ...prev, inputUrl: e.target.value }))}
                    />
                  </div>
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Output URL *</label>
                    <input
                      className="medialive-input"
                      placeholder="srt://localhost:9001?streamid=live/output"
                      value={streamConfig.outputUrl}
                      onChange={(e) => setStreamConfig(prev => ({ ...prev, outputUrl: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="medialive-form-row">
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">SCTE Data PID *</label>
                    <input
                      className="medialive-input"
                      type="number"
                      value={streamConfig.scteDataPID}
                      readOnly
                    />
                  </div>
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Null PID *</label>
                    <input
                      className="medialive-input"
                      type="number"
                      value={streamConfig.nullPID}
                      readOnly
                    />
                  </div>
                </div>

                <div className="medialive-form-group">
                  <label className="medialive-form-label">Latency (ms) *</label>
                  <input
                    className="medialive-input"
                    type="number"
                    value={streamConfig.latency}
                    readOnly
                  />
                </div>

                <div className="flex space-x-2">
                  <button 
                    onClick={handleStartStream} 
                    disabled={isStreamRunning}
                    className={`medialive-button medialive-button-primary flex-1 ${isStreamRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Stream
                  </button>
                  <button 
                    onClick={handleStopStream} 
                    disabled={!isStreamRunning}
                    className={`medialive-button medialive-button-secondary flex-1 ${!isStreamRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Stream
                  </button>
                </div>
                
                {/* Stream Status */}
                <div className="flex items-center justify-between pt-4 border-t border-[#232f3e]">
                  <div className="flex items-center space-x-2">
                    <div className={`medialive-status-indicator ${isStreamRunning ? 'medialive-status-running' : 'medialive-status-stopped'}`}></div>
                    <span className="text-sm text-[#a0aec0]">Stream Status</span>
                  </div>
                  <Badge className={`medialive-badge ${isStreamRunning ? 'medialive-badge-success' : 'medialive-badge-warning'}`}>
                    {isStreamRunning ? 'ACTIVE' : 'INACTIVE'}
                  </Badge>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-6">
            <div className="medialive-panel rounded-lg">
              <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-[#ff9900]" />
                  <h2 className="medialive-panel-title">Video Specifications</h2>
                </div>
                <p className="medialive-panel-subtitle mt-1">
                  Distributor-required video encoding parameters
                </p>
              </div>
              <div className="medialive-panel-content space-y-4">
                <div className="medialive-form-row">
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Video Resolution *</label>
                    <input
                      className="medialive-input"
                      value={streamConfig.videoResolution}
                      readOnly
                    />
                  </div>
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Video Codec *</label>
                    <input
                      className="medialive-input"
                      value={streamConfig.videoCodec}
                      readOnly
                    />
                  </div>
                </div>

                <div className="medialive-form-row">
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Profile@Level *</label>
                    <input
                      className="medialive-input"
                      value={streamConfig.profileLevel}
                      readOnly
                    />
                  </div>
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">GOP *</label>
                    <input
                      className="medialive-input"
                      type="number"
                      value={streamConfig.gop}
                      readOnly
                    />
                  </div>
                </div>

                <div className="medialive-form-row">
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">B Frames *</label>
                    <input
                      className="medialive-input"
                      type="number"
                      value={streamConfig.bFrames}
                      readOnly
                    />
                  </div>
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Video Bitrate (kbps) *</label>
                    <input
                      className="medialive-input"
                      type="number"
                      value={streamConfig.videoBitrate}
                      readOnly
                    />
                  </div>
                </div>

                <div className="medialive-form-row-3">
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Chroma *</label>
                    <input
                      className="medialive-input"
                      value={streamConfig.chroma}
                      readOnly
                    />
                  </div>
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Aspect Ratio *</label>
                    <input
                      className="medialive-input"
                      value={streamConfig.aspectRatio}
                      readOnly
                    />
                  </div>
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">PCR *</label>
                    <input
                      className="medialive-input"
                      value={streamConfig.pcr}
                      readOnly
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#232f3e] to-[#1a252f] border border-[#3b454f] rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-[#ff9900]" />
                    <span className="text-sm font-medium text-white">Distributor Requirements</span>
                  </div>
                  <p className="text-sm text-[#a0aec0]">
                    All video parameters are locked to distributor specifications. Any changes must be approved by the distributor.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audio" className="space-y-6">
            <div className="medialive-panel rounded-lg">
              <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-[#ff9900]" />
                  <h2 className="medialive-panel-title">Audio Specifications</h2>
                </div>
                <p className="medialive-panel-subtitle mt-1">
                  Distributor-required audio encoding parameters
                </p>
              </div>
              <div className="medialive-panel-content space-y-4">
                <div className="medialive-form-row">
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Audio Codec *</label>
                    <input
                      className="medialive-input"
                      value={streamConfig.audioCodec}
                      readOnly
                    />
                  </div>
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Audio Bitrate (kbps) *</label>
                    <input
                      className="medialive-input"
                      type="number"
                      value={streamConfig.audioBitrate}
                      readOnly
                    />
                  </div>
                </div>

                <div className="medialive-form-row">
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Audio LKFS *</label>
                    <input
                      className="medialive-input"
                      type="number"
                      value={streamConfig.audioLKFS}
                      readOnly
                    />
                  </div>
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Sampling Rate (kHz) *</label>
                    <input
                      className="medialive-input"
                      type="number"
                      value={streamConfig.audioSamplingRate}
                      readOnly
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#232f3e] to-[#1a252f] border border-[#3b454f] rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-4 h-4 text-[#ff9900]" />
                    <span className="text-sm font-medium text-white">Audio Compliance</span>
                  </div>
                  <p className="text-sm text-[#a0aec0]">
                    Audio parameters are locked to ensure compliance with distributor loudness standards and broadcast requirements.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scte" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SCTE Configuration */}
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">SCTE-35 Configuration</h2>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    Configure SCTE-35 injection parameters
                  </p>
                </div>
                <div className="medialive-panel-content space-y-4">
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
                      <label className="medialive-form-label">Pre-roll Duration (seconds)</label>
                      <input
                        className="medialive-input"
                        type="number"
                        value={streamConfig.preRollDuration}
                        onChange={(e) => setStreamConfig(prev => ({ ...prev, preRollDuration: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Next Event ID</label>
                    <input
                      className="medialive-input"
                      type="number"
                      value={streamConfig.scteEventID}
                      readOnly
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#a0aec0]">Injection Status</span>
                      <div className="flex items-center space-x-2">
                        <div className={`medialive-status-indicator ${isStreamRunning ? 'medialive-status-running' : 'medialive-status-stopped'}`}></div>
                        <Badge className={`medialive-badge ${isStreamRunning ? 'medialive-badge-success' : 'medialive-badge-warning'}`}>
                          {isStreamRunning ? 'READY' : 'STOPPED'}
                        </Badge>
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleSendCueOut}
                      disabled={!isStreamRunning}
                      className={`medialive-button medialive-button-primary w-full ${!isStreamRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Send CUE-OUT
                    </button>
                    <button 
                      onClick={handleSendCueIn}
                      disabled={!isStreamRunning}
                      className={`medialive-button medialive-button-secondary w-full ${!isStreamRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Send CUE-IN
                    </button>
                    <button 
                      onClick={handleCrashRecovery}
                      disabled={!isStreamRunning}
                      className={`medialive-button medialive-button-secondary w-full ${!isStreamRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Crash Recovery
                    </button>
                  </div>
                </div>
              </div>

              {/* Event Log */}
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">Event Log</h2>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    Recent SCTE-35 events and status
                  </p>
                </div>
                <div className="medialive-panel-content">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className={`medialive-status-indicator ${scteEvents.length > 0 ? 'medialive-status-running' : 'medialive-status-stopped'}`}></div>
                      <span className="text-sm text-[#a0aec0]">Event Activity</span>
                    </div>
                    <Badge className={`medialive-badge ${scteEvents.length > 0 ? 'medialive-badge-success' : 'medialive-badge-warning'}`}>
                      {scteEvents.length} EVENTS
                    </Badge>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto medialive-scrollbar">
                    {scteEvents.length === 0 ? (
                      <div className="text-center py-8">
                        <Activity className="w-8 h-8 mx-auto text-[#3b454f] mb-2" />
                        <p className="text-[#a0aec0]">No SCTE-35 events yet</p>
                        <p className="text-sm text-[#a0aec0] mt-1">Send CUE-OUT/CUE-IN to see events here</p>
                      </div>
                    ) : (
                      scteEvents.map((event) => (
                        <div key={event.id} className="bg-gradient-to-r from-[#232f3e] to-[#1a252f] border border-[#3b454f] rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`medialive-status-indicator ${
                                event.status === 'sent' ? 'medialive-status-running' : 
                                event.status === 'acknowledged' ? 'medialive-status-running' : 'medialive-status-warning'
                              }`} />
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-white font-medium">{event.type}</span>
                                  <Badge className={`medialive-badge ${
                                    event.type === 'CUE-OUT' ? 'medialive-badge-warning' : 'medialive-badge-success'
                                  }`}>
                                    {event.type}
                                  </Badge>
                                </div>
                                <div className="text-sm text-[#a0aec0]">Event ID: {event.id}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-white">
                                {event.adDuration > 0 ? `${event.adDuration}s` : ''}
                              </div>
                              <div className="text-xs text-[#a0aec0]">
                                {new Date(event.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
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