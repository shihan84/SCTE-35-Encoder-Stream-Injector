"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

interface TimeSyncClockProps {
  onTimeUpdate?: (timestamp: number) => void;
  showSyncStatus?: boolean;
  className?: string;
}

export default function TimeSyncClock({ onTimeUpdate, showSyncStatus = true, className = "" }: TimeSyncClockProps) {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date(0)); // Start with epoch time
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [lastSync, setLastSync] = useState<Date>(() => new Date(0)); // Start with epoch time
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [isClient, setIsClient] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize client-side time after hydration
  useEffect(() => {
    setIsClient(true);
    const now = new Date();
    setCurrentTime(now);
    setLastSync(now);
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
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('Time sync error:', error);
      setSyncStatus('error');
    }
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
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'synced':
        return 'Synced';
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return 'Sync Error';
    }
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'synced':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'syncing':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
    }
  };

  const toggleClock = () => {
    setIsRunning(!isRunning);
  };

  const manualSync = () => {
    syncWithServer();
  };

  return (
    <Card className={`medialive-panel ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-[#ff9900]">
            <Clock className="w-5 h-5 text-[#ff9900]" />
            <span className="text-[#ff9900]">Synchronized Time Clock</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleClock}
              className="medialive-button-secondary text-[#ff9900]"
            >
              {isRunning ? 'Pause' : 'Resume'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={manualSync}
              className="medialive-button-secondary text-[#ff9900]"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Time Display */}
        <div className="text-center">
          <div className="text-4xl font-mono font-bold text-[#ff9900] mb-2">
            {isClient ? formatTime(currentTime) : "00:00:00"}
          </div>
          <div className="text-lg text-[#ff9900] font-mono">
            {isClient ? `${formatDate(currentTime)} UTC` : "Loading..."}
          </div>
        </div>

        {/* Sync Status */}
        {showSyncStatus && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getSyncStatusIcon()}
              <span className="text-sm text-[#ff9900]">
                {getSyncStatusText()}
              </span>
            </div>
            <Badge className={`text-xs ${getSyncStatusColor()}`}>
              {Math.abs(timeOffset) < 1000 ? '±0ms' : `${timeOffset > 0 ? '+' : ''}${timeOffset}ms`}
            </Badge>
          </div>
        )}

        {/* Last Sync Time */}
        <div className="text-xs text-[#ff9900] text-center">
          Last sync: {isClient ? formatTime(lastSync) : "00:00:00"}
        </div>

        {/* Time Information */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="bg-[#16191f] p-3 rounded-lg">
            <div className="text-[#ff9900] mb-1">Unix Timestamp</div>
            <div className="font-mono text-[#ff9900]">
              {isClient ? Math.floor(currentTime.getTime() / 1000) : "0"}
            </div>
          </div>
          <div className="bg-[#16191f] p-3 rounded-lg">
            <div className="text-[#ff9900] mb-1">Milliseconds</div>
            <div className="font-mono text-[#ff9900]">
              {isClient ? currentTime.getTime() : "0"}
            </div>
          </div>
        </div>

        {/* SCTE-35 Timing Info */}
        <div className="bg-[#16191f] p-3 rounded-lg">
          <div className="text-[#ff9900] text-xs mb-2">SCTE-35 Timing Reference</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[#ff9900]">PTS Reference:</span>
              <span className="font-mono text-[#ff9900]">
                {isClient ? Math.floor((currentTime.getTime() / 1000) * 90000) : "0"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#ff9900]">PCR Reference:</span>
              <span className="font-mono text-[#ff9900]">
                {isClient ? Math.floor((currentTime.getTime() / 1000) * 27000000) : "0"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
