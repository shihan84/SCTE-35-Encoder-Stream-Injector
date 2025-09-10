'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Server, 
  Zap, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Pause,
  Square
} from 'lucide-react';

interface MonitoringData {
  health: {
    status: string;
    uptime: string;
    timestamp: string;
  };
  stream: {
    status: string;
    activeStreams: number;
    totalStreams: number;
    timestamp: string;
  };
  metrics: {
    totalStreams: number;
    activeStreams: number;
    scte35Injections: number;
    averageResponseTime: number;
    timestamp: string;
  };
  scte35: {
    eventId: number;
    duration: number;
    advertiser: string;
    campaign: string;
    status: string;
    timestamp: string;
  };
}

export default function MonitorDashboard() {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  // Update elapsed time
  useEffect(() => {
    if (isMonitoring && startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime.getTime());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring, startTime]);

  // Fetch monitoring data
  const fetchMonitoringData = async () => {
    try {
      const [healthRes, streamRes, metricsRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/stream/status'),
        fetch('/api/stream/metrics')
      ]);

      const health = await healthRes.json();
      const stream = await streamRes.json();
      const metrics = await metricsRes.json();

      setMonitoringData({
        health: {
          status: health.status || 'unknown',
          uptime: health.uptime || 'N/A',
          timestamp: new Date().toISOString()
        },
        stream: {
          status: stream.status || 'unknown',
          activeStreams: stream.activeStreams || 0,
          totalStreams: stream.totalStreams || 0,
          timestamp: new Date().toISOString()
        },
        metrics: {
          totalStreams: metrics.totalStreams || 0,
          activeStreams: metrics.activeStreams || 0,
          scte35Injections: metrics.scte35Injections || 0,
          averageResponseTime: metrics.averageResponseTime || 0,
          timestamp: new Date().toISOString()
        },
        scte35: {
          eventId: 100033,
          duration: 30000,
          advertiser: 'ITAssist',
          campaign: '15-Minute Monitoring Test',
          status: 'active',
          timestamp: new Date().toISOString()
        }
      });

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch monitoring data');
    }
  };

  // Start monitoring
  const startMonitoring = () => {
    setIsMonitoring(true);
    setStartTime(new Date());
    setElapsedTime(0);
    
    // Initial fetch
    fetchMonitoringData();
    
    // Set up refresh interval
    const interval = setInterval(fetchMonitoringData, 5000); // Refresh every 5 seconds
    setRefreshInterval(interval);
  };

  // Stop monitoring
  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
    }
  };

  // Format elapsed time
  const formatElapsedTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'active':
      case 'running':
        return 'default';
      case 'warning':
        return 'secondary';
      case 'error':
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stream Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of ITAssist Breaking News stream with SCTE-35 injection
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {isMonitoring ? (
            <Button onClick={stopMonitoring} variant="destructive">
              <Square className="w-4 h-4 mr-2" />
              Stop Monitoring
            </Button>
          ) : (
            <Button onClick={startMonitoring}>
              <Play className="w-4 h-4 mr-2" />
              Start Monitoring
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Monitoring Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Monitoring Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {isMonitoring ? (
                  <Badge variant="default" className="text-lg px-3 py-1">
                    <Zap className="w-4 h-4 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    <Pause className="w-4 h-4 mr-1" />
                    Stopped
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Monitoring Status</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatElapsedTime(elapsedTime)}
              </div>
              <p className="text-sm text-muted-foreground">Elapsed Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {monitoringData ? (
                  <Badge variant={getStatusVariant(monitoringData.health.status)} className="text-lg px-3 py-1">
                    {monitoringData.health.status}
                  </Badge>
                ) : (
                  'N/A'
                )}
              </div>
              <p className="text-sm text-muted-foreground">System Health</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stream Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="w-5 h-5 mr-2" />
            Stream Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Input Stream</h4>
              <p className="text-sm text-muted-foreground break-all">
                https://cdn.itassist.one/BREAKING/NEWS/index.m3u8
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Output Stream</h4>
              <p className="text-sm text-muted-foreground break-all">
                srt://cdn.itassist.one:8888?streamid=#!::r=live/live,m=publish
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Resolution</h4>
              <p className="text-sm text-muted-foreground">1280x720</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Bitrate</h4>
              <p className="text-sm text-muted-foreground">3,150,000 bps</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SCTE-35 Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            SCTE-35 Pre-Roll Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Event ID</h4>
              <p className="text-sm text-muted-foreground">100033</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Duration</h4>
              <p className="text-sm text-muted-foreground">30 seconds</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Advertiser</h4>
              <p className="text-sm text-muted-foreground">ITAssist</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Campaign</h4>
              <p className="text-sm text-muted-foreground">15-Minute Monitoring Test</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      {monitoringData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Streams</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {monitoringData.stream.activeStreams}
              </div>
              <p className="text-xs text-muted-foreground">
                of {monitoringData.stream.totalStreams} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">SCTE-35 Injections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {monitoringData.metrics.scte35Injections}
              </div>
              <p className="text-xs text-muted-foreground">
                Pre-roll cues injected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {monitoringData.metrics.averageResponseTime.toFixed(0)}ms
              </div>
              <p className="text-xs text-muted-foreground">
                Average API response
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {monitoringData.health.uptime}
              </div>
              <p className="text-xs text-muted-foreground">
                Server uptime
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress Bar */}
      {isMonitoring && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Monitoring Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Elapsed Time</span>
                <span>{formatElapsedTime(elapsedTime)} / 15:00</span>
              </div>
              <Progress 
                value={(elapsedTime / (15 * 60 * 1000)) * 100} 
                className="w-full"
              />
              <p className="text-xs text-muted-foreground text-center">
                15-minute monitoring test in progress
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      {monitoringData && (
        <div className="text-center text-sm text-muted-foreground">
          Last updated: {new Date(monitoringData.health.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}
