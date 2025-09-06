"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings, Activity, AlertTriangle, CheckCircle, Clock, Zap, Shield, Database, Network } from "lucide-react";
import DistributorStreamConfig from "@/components/distributor-stream-config";

interface StreamMetrics {
  inputBitrate: number;
  outputBitrate: number;
  viewers: number;
  uptime: number;
  packetLoss: number;
  latency: number;
}

interface StreamHealth {
  status: 'healthy' | 'warning' | 'critical';
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

interface ComplianceStatus {
  video: boolean;
  audio: boolean;
  scte: boolean;
  stream: boolean;
}

export default function DistributorPage() {
  const [metrics, setMetrics] = useState<StreamMetrics>({
    inputBitrate: 0,
    outputBitrate: 0,
    viewers: 0,
    uptime: 0,
    packetLoss: 0,
    latency: 0
  });

  const [health, setHealth] = useState<StreamHealth>({
    status: 'healthy',
    cpu: 0,
    memory: 0,
    disk: 0,
    network: 0
  });

  const [compliance, setCompliance] = useState<ComplianceStatus>({
    video: true,
    audio: true,
    scte: true,
    stream: true
  });

  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    connectWebSocket();
    startMetricsPolling();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, []);

  const connectWebSocket = () => {
    const ws = new WebSocket(`ws://${window.location.host}/api/stream/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'metrics') {
        setMetrics(data.metrics);
      } else if (data.type === 'health') {
        setHealth(data.health);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setTimeout(connectWebSocket, 5000);
    };
  };

  const startMetricsPolling = () => {
    metricsIntervalRef.current = setInterval(async () => {
      try {
        const [metricsResponse, healthResponse] = await Promise.all([
          fetch("/api/stream/metrics"),
          fetch("/api/stream/health")
        ]);

        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          setMetrics(metricsData);
        }

        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          setHealth(healthData);
        }
      } catch (error) {
        console.error("Error polling metrics:", error);
      }
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: StreamHealth['status']) => {
    switch (status) {
      case 'healthy': return 'medialive-status-running';
      case 'warning': return 'medialive-status-warning';
      case 'critical': return 'medialive-status-error';
      default: return 'medialive-status-stopped';
    }
  };

  const getComplianceColor = (compliant: boolean) => {
    return compliant ? 'medialive-badge-success' : 'medialive-badge-error';
  };

  const getHealthBarColor = (value: number) => {
    if (value < 50) return 'bg-green-500';
    if (value < 80) return 'bg-yellow-500';
    return 'bg-red-500';
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
                  <Network className="w-5 h-5 text-[#0f1419]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Distributor SRT Stream Management</h1>
                  <p className="text-sm text-[#a0aec0]">AWS Elemental MediaLive Compatible</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`medialive-status-indicator ${isConnected ? 'medialive-status-running' : 'medialive-status-error'}`}></div>
                <span className="text-sm text-[#a0aec0]">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <Badge className="medialive-badge medialive-badge-success">PRODUCTION READY</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="config" className="medialive-tabs">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config" className="medialive-tab">Stream Config</TabsTrigger>
            <TabsTrigger value="monitor" className="medialive-tab">Monitor</TabsTrigger>
            <TabsTrigger value="compliance" className="medialive-tab">Compliance</TabsTrigger>
            <TabsTrigger value="specs" className="medialive-tab">Specifications</TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <DistributorStreamConfig />
          </TabsContent>

          <TabsContent value="monitor" className="space-y-6">
            {/* Stream Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="medialive-panel rounded-lg">
                <CardContent className="medialive-panel-content p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#a0aec0]">Input Bitrate</p>
                      <p className="text-2xl font-bold text-white">{metrics.inputBitrate} kbps</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#232f3e] to-[#1a252f] rounded-lg flex items-center justify-center">
                      <Activity className="h-6 w-6 text-[#ff9900]" />
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="medialive-panel rounded-lg">
                <CardContent className="medialive-panel-content p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#a0aec0]">Output Bitrate</p>
                      <p className="text-2xl font-bold text-white">{metrics.outputBitrate} kbps</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#232f3e] to-[#1a252f] rounded-lg flex items-center justify-center">
                      <Zap className="h-6 w-6 text-[#ff9900]" />
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="medialive-panel rounded-lg">
                <CardContent className="medialive-panel-content p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#a0aec0]">Latency</p>
                      <p className="text-2xl font-bold text-white">{metrics.latency}ms</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#232f3e] to-[#1a252f] rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-[#ff9900]" />
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="medialive-panel rounded-lg">
                <CardContent className="medialive-panel-content p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#a0aec0]">Packet Loss</p>
                      <p className="text-2xl font-bold text-white">{metrics.packetLoss.toFixed(2)}%</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#232f3e] to-[#1a252f] rounded-lg flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-[#ff9900]" />
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>

            {/* System Health */}
            <div className="medialive-panel rounded-lg">
              <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-[#ff9900]" />
                  <h2 className="medialive-panel-title">System Health</h2>
                </div>
                <p className="medialive-panel-subtitle mt-1">
                  Real-time system resource monitoring
                </p>
              </div>
              <CardContent className="medialive-panel-content">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#a0aec0]">CPU Usage</span>
                      <span className="text-white">{health.cpu}%</span>
                    </div>
                    <div className="w-full bg-[#1a252f] rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getHealthBarColor(health.cpu)}`} 
                        style={{ width: `${health.cpu}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#a0aec0]">Memory Usage</span>
                      <span className="text-white">{health.memory}%</span>
                    </div>
                    <div className="w-full bg-[#1a252f] rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getHealthBarColor(health.memory)}`} 
                        style={{ width: `${health.memory}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#a0aec0]">Disk Usage</span>
                      <span className="text-white">{health.disk}%</span>
                    </div>
                    <div className="w-full bg-[#1a252f] rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getHealthBarColor(health.disk)}`} 
                        style={{ width: `${health.disk}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#a0aec0]">Network Usage</span>
                      <span className="text-white">{health.network}%</span>
                    </div>
                    <div className="w-full bg-[#1a252f] rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getHealthBarColor(health.network)}`} 
                        style={{ width: `${health.network}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="medialive-panel rounded-lg">
              <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-[#ff9900]" />
                  <h2 className="medialive-panel-title">Distributor Compliance Status</h2>
                </div>
                <p className="medialive-panel-subtitle mt-1">
                  Monitor compliance with distributor specifications
                </p>
              </div>
              <CardContent className="medialive-panel-content">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                      compliance.video ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {compliance.video ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                      )}
                    </div>
                    <h3 className="font-semibold text-white">Video Specs</h3>
                    <p className={`text-sm ${getComplianceColor(compliance.video)}`}>
                      {compliance.video ? 'Compliant' : 'Non-Compliant'}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                      compliance.audio ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {compliance.audio ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                      )}
                    </div>
                    <h3 className="font-semibold text-white">Audio Specs</h3>
                    <p className={`text-sm ${getComplianceColor(compliance.audio)}`}>
                      {compliance.audio ? 'Compliant' : 'Non-Compliant'}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                      compliance.scte ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {compliance.scte ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                      )}
                    </div>
                    <h3 className="font-semibold text-white">SCTE-35</h3>
                    <p className={`text-sm ${getComplianceColor(compliance.scte)}`}>
                      {compliance.scte ? 'Compliant' : 'Non-Compliant'}
                    </p>
                  </div>

                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                      compliance.stream ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {compliance.stream ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                      )}
                    </div>
                    <h3 className="font-semibold text-white">Stream Config</h3>
                    <p className={`text-sm ${getComplianceColor(compliance.stream)}`}>
                      {compliance.stream ? 'Compliant' : 'Non-Compliant'}
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="bg-[#1a252f] border border-[#232f3e] rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Compliant Specifications</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#a0aec0]">
                      <div>
                        <strong className="text-white">Video:</strong> 1920x1080, H.264, High@Auto, GOP 12, 5 B-Frames, 5 Mbps
                      </div>
                      <div>
                        <strong className="text-white">Audio:</strong> AAC-LC, 128 kbps, -20 dB LKFS, 48 kHz
                      </div>
                      <div>
                        <strong className="text-white">SCTE:</strong> PID 500, Null PID 8191, 2000ms latency
                      </div>
                      <div>
                        <strong className="text-white">Stream:</strong> SRT protocol with sequential event IDs
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </TabsContent>

          <TabsContent value="specs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">Video Specifications</h2>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    Required video encoding parameters
                  </p>
                </div>
                <CardContent className="medialive-panel-content">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#a0aec0]">Resolution</span>
                      <Badge className="medialive-badge">1920x1080</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0aec0]">Codec</span>
                      <Badge className="medialive-badge">H.264</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0aec0]">Profile Level</span>
                      <Badge className="medialive-badge">High@Auto</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0aec0]">GOP</span>
                      <Badge className="medialive-badge">12 frames</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0aec0]">B-Frames</span>
                      <Badge className="medialive-badge">5</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0aec0]">Bitrate</span>
                      <Badge className="medialive-badge">5 Mbps</Badge>
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">Audio Specifications</h2>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    Required audio encoding parameters
                  </p>
                </div>
                <CardContent className="medialive-panel-content">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#a0aec0]">Codec</span>
                      <Badge className="medialive-badge">AAC-LC</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0aec0]">Bitrate</span>
                      <Badge className="medialive-badge">128 kbps</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0aec0]">LKFS</span>
                      <Badge className="medialive-badge">-20 dB</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0aec0]">Sampling Rate</span>
                      <Badge className="medialive-badge">48 kHz</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0aec0]">Channels</span>
                      <Badge className="medialive-badge">Stereo</Badge>
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}