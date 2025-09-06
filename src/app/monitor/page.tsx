"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Activity, Wifi, Zap, AlertCircle, CheckCircle, Clock } from "lucide-react";

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
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
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
              <h1 className="text-3xl font-bold tracking-tight">Stream Monitor</h1>
              <p className="text-muted-foreground">
                Real-time monitoring of SCTE-35 injection and stream health
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        {/* Stream Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Input Bitrate</p>
                  <p className="text-2xl font-bold">{metrics.inputBitrate} kbps</p>
                </div>
                <Wifi className="h-8 w-8 text-blue-600" />
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
                <Zap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Viewers</p>
                  <p className="text-2xl font-bold">{metrics.viewers}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                  <p className="text-2xl font-bold">{formatTime(metrics.uptime)}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(health.status)}
              <span>System Health</span>
              <Badge variant="outline" className={getStatusColor(health.status)}>
                {health.status.toUpperCase()}
              </Badge>
            </CardTitle>
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

        {/* Stream Quality Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Stream Quality</CardTitle>
              <CardDescription>
                Performance and quality metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Packet Loss</span>
                  <Badge variant={metrics.packetLoss > 5 ? "destructive" : "outline"}>
                    {metrics.packetLoss.toFixed(2)}%
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Latency</span>
                  <Badge variant={metrics.latency > 1000 ? "destructive" : "outline"}>
                    {metrics.latency}ms
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Bitrate Efficiency</span>
                  <Badge variant="outline">
                    {metrics.inputBitrate > 0 ? ((metrics.outputBitrate / metrics.inputBitrate) * 100).toFixed(1) : 0}%
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span>Connection Status</span>
                  <Badge variant={isConnected ? "default" : "destructive"}>
                    {isConnected ? "Stable" : "Unstable"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SCTE-35 Activity</CardTitle>
              <CardDescription>
                Recent SCTE-35 injection and detection events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {activities.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    No SCTE-35 activity detected
                  </div>
                ) : (
                  activities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{activity.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <Badge 
                        variant={activity.type === 'injection' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {activity.type}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts and Notifications */}
        {health.status === 'critical' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Critical system resources detected. Please check system performance and consider scaling resources.
            </AlertDescription>
          </Alert>
        )}

        {metrics.packetLoss > 5 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              High packet loss detected ({metrics.packetLoss.toFixed(2)}%). This may affect stream quality.
            </AlertDescription>
          </Alert>
        )}

        {metrics.latency > 1000 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              High latency detected ({metrics.latency}ms). Consider optimizing network configuration.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}