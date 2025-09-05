"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings, Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";
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
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getComplianceColor = (compliant: boolean) => {
    return compliant ? 'text-green-600' : 'text-red-600';
  };

  const getHealthBarColor = (value: number) => {
    if (value < 50) return 'bg-green-500';
    if (value < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Distributor SRT Stream Management</h1>
              <p className="text-muted-foreground">
                Professional SRT streaming with distributor-specific specifications
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="config">Stream Config</TabsTrigger>
            <TabsTrigger value="monitor">Monitor</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <DistributorStreamConfig />
          </TabsContent>

          <TabsContent value="monitor" className="space-y-6">
            {/* Stream Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Input Bitrate</p>
                      <p className="text-2xl font-bold">{metrics.inputBitrate} kbps</p>
                    </div>
                    <Activity className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Output Bitrate</p>
                      <p className="text-2xl font-bold">{metrics.outputBitrate} kbps</p>
                    </div>
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Latency</p>
                      <p className="text-2xl font-bold">{metrics.latency}ms</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Packet Loss</p>
                      <p className="text-2xl font-bold">{metrics.packetLoss.toFixed(2)}%</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>
                  Real-time system resource monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>CPU Usage</span>
                      <span>{health.cpu}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getHealthBarColor(health.cpu)}`} 
                        style={{ width: `${health.cpu}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Memory Usage</span>
                      <span>{health.memory}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getHealthBarColor(health.memory)}`} 
                        style={{ width: `${health.memory}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Disk Usage</span>
                      <span>{health.disk}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getHealthBarColor(health.disk)}`} 
                        style={{ width: `${health.disk}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Network Usage</span>
                      <span>{health.network}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getHealthBarColor(health.network)}`} 
                        style={{ width: `${health.network}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Distributor Compliance Status</CardTitle>
                <CardDescription>
                  Monitor compliance with distributor specifications
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                    <h3 className="font-semibold">Video Specs</h3>
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
                    <h3 className="font-semibold">Audio Specs</h3>
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
                    <h3 className="font-semibold">SCTE-35</h3>
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
                    <h3 className="font-semibold">Stream Config</h3>
                    <p className={`text-sm ${getComplianceColor(compliance.stream)}`}>
                      {compliance.stream ? 'Compliant' : 'Non-Compliant'}
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Compliant Specifications</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
                      <div>
                        <strong>Video:</strong> 1920x1080, H.264, High@Auto, GOP 12, 5 B-Frames, 5 Mbps
                      </div>
                      <div>
                        <strong>Audio:</strong> AAC-LC, 128 kbps, -20 dB LKFS, 48 kHz
                      </div>
                      <div>
                        <strong>SCTE:</strong> PID 500, Null PID 8191, 2000ms latency
                      </div>
                      <div>
                        <strong>Stream:</strong> SRT protocol with sequential event IDs
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specs" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Video Specifications</CardTitle>
                  <CardDescription>
                    Required video encoding parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Resolution</span>
                      <Badge variant="outline">1920x1080</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Codec</span>
                      <Badge variant="outline">H.264</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Profile@Level</span>
                      <Badge variant="outline">High@Auto</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>GOP</span>
                      <Badge variant="outline">12</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>B Frames</span>
                      <Badge variant="outline">5</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Bitrate</span>
                      <Badge variant="outline">5 Mbps</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Chroma</span>
                      <Badge variant="outline">4:2:0</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Aspect Ratio</span>
                      <Badge variant="outline">16:9</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>PCR</span>
                      <Badge variant="outline">Video Embedded</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Audio Specifications</CardTitle>
                  <CardDescription>
                    Required audio encoding parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Codec</span>
                      <Badge variant="outline">AAC-LC</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Bitrate</span>
                      <Badge variant="outline">128 kbps</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>LKFS</span>
                      <Badge variant="outline">-20 dB</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Sampling Rate</span>
                      <Badge variant="outline">48 kHz</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SCTE-35 Specifications</CardTitle>
                  <CardDescription>
                    Required SCTE-35 parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Data PID</span>
                      <Badge variant="outline">500</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Null PID</span>
                      <Badge variant="outline">8191</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Latency</span>
                      <Badge variant="outline">2000ms</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Event IDs</span>
                      <Badge variant="outline">Sequential</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Pre-roll Duration</span>
                      <Badge variant="outline">0-10 seconds</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Stream Specifications</CardTitle>
                  <CardDescription>
                    Required stream parameters
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Protocol</span>
                      <Badge variant="outline">SRT</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Stream Name</span>
                      <Badge variant="outline">Service Name</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Ad Duration</span>
                      <Badge variant="outline">Configurable</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>CUE Commands</span>
                      <Badge variant="outline">CUE-OUT/CUE-IN</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Crash Recovery</span>
                      <Badge variant="outline">Emergency CUE-IN</Badge>
                    </div>
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