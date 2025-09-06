"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Activity, Wifi, Zap, AlertCircle, CheckCircle, Clock, Shield, Network, Database, Monitor } from "lucide-react";

interface StreamMetrics {
  inputBitrate: number;
  outputBitrate: number;
  viewers: number;
  uptime: number;
  packetLoss: number;
  latency: number;
}

interface SCTE35Activity {
  timestamp: string;
  type: 'injection' | 'detection';
  data: string;
  description: string;
}

interface StreamHealth {
  status: 'healthy' | 'warning' | 'critical';
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export default function Monitor() {
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

  const [activities, setActivities] = useState<SCTE35Activity[]>([]);
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
      } else if (data.type === 'activity') {
        setActivities(prev => [data.activity, ...prev].slice(0, 50)); // Keep last 50 activities
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setTimeout(connectWebSocket, 5000);
    };

    ws.onerror = () => {
      setIsConnected(false);
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

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: StreamHealth['status']) => {
    switch (status) {
      case 'healthy': return 'medialive-status-running';
      case 'warning': return 'medialive-status-warning';
      case 'critical': return 'medialive-status-error';
      default: return 'medialive-status-stopped';
    }
  };

  const getStatusIcon = (status: StreamHealth['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getHealthBarColor = (value: number) => {
    if (value < 50) return 'bg-green-500';
    if (value < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getHealthBarClass = (value: number) => {
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
                  <Monitor className="w-5 h-5 text-[#0f1419]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Stream Monitor</h1>
                  <p className="text-sm text-[#a0aec0]">AWS Elemental MediaLive Compatible</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`medialive-status-indicator ${isConnected ? 'medialive-status-running' : 'medialive-status-error'}`}></div>
                <span className="text-sm text-[#a0aec0]">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              <Badge className="medialive-badge medialive-badge-success">LIVE MONITORING</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
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
                  <Wifi className="h-6 w-6 text-[#ff9900]" />
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
                  <p className="text-sm text-[#a0aec0]">Viewers</p>
                  <p className="text-2xl font-bold text-white">{metrics.viewers}</p>
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
                  <p className="text-sm text-[#a0aec0]">Uptime</p>
                  <p className="text-2xl font-bold text-white">{formatTime(metrics.uptime)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#232f3e] to-[#1a252f] rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-[#ff9900]" />
                </div>
              </div>
            </CardContent>
          </div>
        </div>

        {/* System Health */}
        <div className="medialive-panel rounded-lg">
          <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-[#ff9900]" />
                <h2 className="medialive-panel-title">System Health</h2>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(health.status)}
                <Badge className={`medialive-badge ${
                  health.status === 'healthy' ? 'medialive-badge-success' : 
                  health.status === 'warning' ? 'medialive-badge-warning' : 'medialive-badge-error'
                }`}>
                  {health.status.toUpperCase()}
                </Badge>
              </div>
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
                    className={`h-2 rounded-full ${getHealthBarClass(health.cpu)}`} 
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
                    className={`h-2 rounded-full ${getHealthBarClass(health.memory)}`} 
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
                    className={`h-2 rounded-full ${getHealthBarClass(health.disk)}`} 
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
                    className={`h-2 rounded-full ${getHealthBarClass(health.network)}`} 
                    style={{ width: `${health.network}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </div>

        {/* Stream Quality Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="medialive-panel rounded-lg">
            <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Network className="w-5 h-5 text-[#ff9900]" />
                <h2 className="medialive-panel-title">Stream Quality</h2>
              </div>
              <p className="medialive-panel-subtitle mt-1">
                Performance and quality metrics
              </p>
            </div>
            <CardContent className="medialive-panel-content">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#a0aec0]">Packet Loss</span>
                  <Badge className={`medialive-badge ${
                    metrics.packetLoss > 5 ? 'medialive-badge-error' : 'medialive-badge-success'
                  }`}>
                    {metrics.packetLoss.toFixed(2)}%
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[#a0aec0]">Latency</span>
                  <Badge className={`medialive-badge ${
                    metrics.latency > 1000 ? 'medialive-badge-error' : 'medialive-badge-success'
                  }`}>
                    {metrics.latency}ms
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#a0aec0]">Bitrate Efficiency</span>
                  <Badge className="medialive-badge medialive-badge-success">
                    {metrics.inputBitrate > 0 ? ((metrics.outputBitrate / metrics.inputBitrate) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#a0aec0]">Connection Status</span>
                  <Badge className={`medialive-badge ${
                    isConnected ? 'medialive-badge-success' : 'medialive-badge-error'
                  }`}>
                    {isConnected ? "Stable" : "Unstable"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </div>

          <div className="medialive-panel rounded-lg">
            <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-[#ff9900]" />
                <h2 className="medialive-panel-title">SCTE-35 Activity</h2>
              </div>
              <p className="medialive-panel-subtitle mt-1">
                Recent SCTE-35 injection and detection events
              </p>
            </div>
            <CardContent className="medialive-panel-content">
              <div className="space-y-2 max-h-64 overflow-y-auto medialive-scrollbar">
                {activities.length === 0 ? (
                  <div className="text-center text-[#a0aec0] py-4">
                    No SCTE-35 activity detected
                  </div>
                ) : (
                  activities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#1a252f] border border-[#232f3e] rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{activity.description}</div>
                        <div className="text-xs text-[#a0aec0]">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <Badge 
                        className={`medialive-badge ${
                          activity.type === 'injection' ? 'medialive-badge-success' : 'medialive-badge-warning'
                        } text-xs`}
                      >
                        {activity.type}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </div>
        </div>

        {/* Alerts and Notifications */}
        {health.status === 'critical' && (
          <div className="medialive-panel rounded-lg border-2 border-red-500">
            <div className="medialive-panel-header px-6 py-4 rounded-t-lg bg-red-900/20">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <h2 className="medialive-panel-title text-red-500">Critical Alert</h2>
              </div>
            </div>
            <CardContent className="medialive-panel-content">
              <AlertDescription className="text-red-400">
                Critical system resources detected. Please check system performance and consider scaling resources.
              </AlertDescription>
            </CardContent>
          </div>
        )}

        {metrics.packetLoss > 5 && (
          <div className="medialive-panel rounded-lg border-2 border-yellow-500">
            <div className="medialive-panel-header px-6 py-4 rounded-t-lg bg-yellow-900/20">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <h2 className="medialive-panel-title text-yellow-500">Packet Loss Warning</h2>
              </div>
            </div>
            <CardContent className="medialive-panel-content">
              <AlertDescription className="text-yellow-400">
                High packet loss detected ({metrics.packetLoss.toFixed(2)}%). This may affect stream quality.
              </AlertDescription>
            </CardContent>
          </div>
        )}

        {metrics.latency > 1000 && (
          <div className="medialive-panel rounded-lg border-2 border-orange-500">
            <div className="medialive-panel-header px-6 py-4 rounded-t-lg bg-orange-900/20">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <h2 className="medialive-panel-title text-orange-500">Latency Warning</h2>
              </div>
            </div>
            <CardContent className="medialive-panel-content">
              <AlertDescription className="text-orange-400">
                High latency detected ({metrics.latency}ms). Consider optimizing network configuration.
              </AlertDescription>
            </CardContent>
          </div>
        )}
      </div>
    </div>
  );
}