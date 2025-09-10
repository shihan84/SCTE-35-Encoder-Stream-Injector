"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Activity,
  Zap,
  Globe,
  Server,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import TimelineMonitor from "./timeline-monitor";

interface TimeSyncClockProps {
  onTimeUpdate?: (timestamp: number) => void;
  showSyncStatus?: boolean;
  className?: string;
}

interface SyncMetrics {
  latency: number;
  jitter: number;
  offset: number;
  accuracy: number;
  uptime: number;
}

export default function ModernTimeSyncClock({ onTimeUpdate, showSyncStatus = true, className = "" }: TimeSyncClockProps) {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date(0));
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'warning'>('synced');
  const [lastSync, setLastSync] = useState<Date>(() => new Date(0));
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [syncMetrics, setSyncMetrics] = useState<SyncMetrics>({
    latency: 0,
    jitter: 0,
    offset: 0,
    accuracy: 100,
    uptime: 0
  });
  const [syncHistory, setSyncHistory] = useState<number[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize client-side time after hydration
  useEffect(() => {
    setIsClient(true);
    const now = new Date();
    setCurrentTime(now);
    setLastSync(now);
    setSyncMetrics(prev => ({ ...prev, uptime: Date.now() }));
  }, []);

  // Update time every second
  useEffect(() => {
    if (isClient && isRunning) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        setCurrentTime(new Date(now.getTime() + timeOffset));
        onTimeUpdate?.(now.getTime() + timeOffset);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isClient, isRunning, timeOffset, onTimeUpdate]);

  // Sync with server time every 30 seconds
  useEffect(() => {
    if (isClient && isRunning) {
      syncIntervalRef.current = setInterval(() => {
        syncWithServer();
      }, 30000);
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isClient, isRunning]);

  // Update metrics every 5 seconds
  useEffect(() => {
    if (isClient && isRunning) {
      metricsIntervalRef.current = setInterval(() => {
        updateMetrics();
      }, 5000);
    }

    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
    };
  }, [isClient, isRunning]);

  const syncWithServer = async () => {
    setSyncStatus('syncing');
    try {
      const response = await fetch('/api/time/sync', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (response.ok) {
        const serverTime = await response.json();
        const serverTimestamp = new Date(serverTime.timestamp).getTime();
        const clientTimestamp = Date.now();
        const offset = serverTimestamp - clientTimestamp;
        
        setTimeOffset(offset);
        setLastSync(new Date());
        setSyncStatus(Math.abs(offset) < 1000 ? 'synced' : 'warning');
        
        // Update sync history
        setSyncHistory(prev => [...prev.slice(-9), offset].slice(-10));
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Time sync error:', error);
      setSyncStatus('error');
    }
  };

  const updateMetrics = () => {
    const latency = Math.random() * 50 + 10; // Simulate latency
    const jitter = Math.random() * 10 + 1; // Simulate jitter
    const accuracy = Math.max(95, 100 - Math.abs(timeOffset) / 100);
    
    setSyncMetrics(prev => ({
      ...prev,
      latency: Math.round(latency),
      jitter: Math.round(jitter * 10) / 10,
      offset: timeOffset,
      accuracy: Math.round(accuracy)
    }));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'UTC'
    });
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'synced':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'syncing':
        return <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'synced':
        return 'Synchronized';
      case 'syncing':
        return 'Synchronizing...';
      case 'warning':
        return 'Drift Detected';
      case 'error':
        return 'Sync Failed';
    }
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'synced':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'syncing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 99) return 'text-green-400';
    if (accuracy >= 95) return 'text-yellow-400';
    return 'text-red-400';
  };

  const toggleClock = () => {
    setIsRunning(!isRunning);
  };

  const manualSync = () => {
    syncWithServer();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Time Display */}
      <div className="medialive-panel rounded-xl overflow-hidden">
        <div className="medialive-panel-header px-8 py-6 bg-gradient-to-r from-[#1a252f] to-[#16191f]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#ff9900]/20 rounded-lg">
                <Clock className="w-6 h-6 text-[#ff9900]" />
              </div>
              <div>
                <h2 className="medialive-panel-title text-xl">Time Synchronization</h2>
                <p className="medialive-panel-subtitle text-sm">Precision timing for SCTE-35 injection</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className={`px-3 py-1 text-sm font-medium ${getSyncStatusColor()}`}>
                <div className="flex items-center space-x-2">
                  {getSyncStatusIcon()}
                  <span>{getSyncStatusText()}</span>
                </div>
              </Badge>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleClock}
                  className="medialive-button-secondary"
                >
                  {isRunning ? 'Pause' : 'Resume'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={manualSync}
                  className="medialive-button-secondary"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="medialive-panel-content p-8">
          {/* Time Display */}
          <div className="text-center mb-8">
            <div className="text-6xl font-mono font-bold text-[#ff9900] mb-4 tracking-wider">
              {isClient ? formatTime(currentTime) : "00:00:00"}
            </div>
            <div className="text-xl text-[#a0aec0] font-mono mb-2">
              {isClient ? `${formatDate(currentTime)} UTC` : "Loading..."}
            </div>
            <div className="text-sm text-[#a0aec0]">
              Last sync: {isClient ? formatTime(lastSync) : "00:00:00"}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#16191f] p-4 rounded-lg border border-[#232f3e]">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-[#a0aec0]">Latency</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {syncMetrics.latency}ms
              </div>
            </div>
            
            <div className="bg-[#16191f] p-4 rounded-lg border border-[#232f3e]">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-[#a0aec0]">Jitter</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {syncMetrics.jitter}ms
              </div>
            </div>
            
            <div className="bg-[#16191f] p-4 rounded-lg border border-[#232f3e]">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-[#a0aec0]">Offset</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {Math.abs(timeOffset) < 1000 ? '±0ms' : `${timeOffset > 0 ? '+' : ''}${timeOffset}ms`}
              </div>
            </div>
            
            <div className="bg-[#16191f] p-4 rounded-lg border border-[#232f3e]">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-[#a0aec0]">Accuracy</span>
              </div>
              <div className={`text-2xl font-bold ${getAccuracyColor(syncMetrics.accuracy)}`}>
                {syncMetrics.accuracy}%
              </div>
            </div>
          </div>

          {/* Accuracy Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#a0aec0]">Synchronization Accuracy</span>
              <span className={`text-sm font-medium ${getAccuracyColor(syncMetrics.accuracy)}`}>
                {syncMetrics.accuracy}%
              </span>
            </div>
            <Progress 
              value={syncMetrics.accuracy} 
              className="h-2 bg-[#16191f]"
            />
          </div>

          {/* SCTE-35 Timing Reference */}
          <div className="bg-[#16191f] p-6 rounded-lg border border-[#232f3e]">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="w-5 h-5 text-[#ff9900]" />
              <h3 className="medialive-panel-title text-lg">SCTE-35 Timing Reference</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-[#a0aec0] mb-2">Unix Timestamp</div>
                <div className="font-mono text-white text-lg">
                  {isClient ? Math.floor(currentTime.getTime() / 1000) : "0"}
                </div>
              </div>
              <div>
                <div className="text-sm text-[#a0aec0] mb-2">PTS Reference (90kHz)</div>
                <div className="font-mono text-white text-lg">
                  {isClient ? Math.floor((currentTime.getTime() / 1000) * 90000) : "0"}
                </div>
              </div>
              <div>
                <div className="text-sm text-[#a0aec0] mb-2">PCR Reference (27MHz)</div>
                <div className="font-mono text-white text-lg">
                  {isClient ? Math.floor((currentTime.getTime() / 1000) * 27000000) : "0"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Monitor */}
      <TimelineMonitor 
        currentTime={currentTime.getTime()}
        onEventClick={(event) => {
          console.log('Timeline event clicked:', event);
        }}
      />

      {/* Sync History Chart */}
      {syncHistory.length > 0 && (
        <div className="medialive-panel rounded-xl">
          <div className="medialive-panel-header px-6 py-4">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-[#ff9900]" />
              <h3 className="medialive-panel-title">Sync History</h3>
            </div>
          </div>
          <div className="medialive-panel-content p-6">
            <div className="flex items-end space-x-1 h-20">
              {syncHistory.map((offset, index) => (
                <div
                  key={index}
                  className={`flex-1 rounded-t ${
                    Math.abs(offset) < 1000 
                      ? 'bg-green-400' 
                      : Math.abs(offset) < 5000 
                        ? 'bg-yellow-400' 
                        : 'bg-red-400'
                  }`}
                  style={{ 
                    height: `${Math.min(100, (Math.abs(offset) / 100) + 10)}%` 
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between text-xs text-[#a0aec0] mt-2">
              <span>10 syncs ago</span>
              <span>Latest</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
