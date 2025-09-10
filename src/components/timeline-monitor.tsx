"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Radio,
  Calendar,
  Timer,
  Activity
} from "lucide-react";

interface TimelineEvent {
  id: string;
  timestamp: number;
  type: 'scte35' | 'sync' | 'injection' | 'warning' | 'error';
  title: string;
  description: string;
  duration?: number;
  status: 'active' | 'completed' | 'pending' | 'failed';
}

interface TimelineMonitorProps {
  currentTime: number;
  onEventClick?: (event: TimelineEvent) => void;
  className?: string;
}

export default function TimelineMonitor({ currentTime, onEventClick, className = "" }: TimelineMonitorProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timelinePosition, setTimelinePosition] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<number>(300000); // 5 minutes in milliseconds
  const timelineRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate sample events for demonstration
  useEffect(() => {
    const sampleEvents: TimelineEvent[] = [
      {
        id: '1',
        timestamp: currentTime - 240000, // 4 minutes ago
        type: 'scte35',
        title: 'SCTE-35 Cue Insert',
        description: 'Ad break insertion point',
        duration: 30000,
        status: 'completed'
      },
      {
        id: '2',
        timestamp: currentTime - 180000, // 3 minutes ago
        type: 'sync',
        title: 'Time Sync',
        description: 'Server synchronization',
        status: 'completed'
      },
      {
        id: '3',
        timestamp: currentTime - 120000, // 2 minutes ago
        type: 'injection',
        title: 'Stream Injection',
        description: 'SCTE-35 data injection',
        status: 'completed'
      },
      {
        id: '4',
        timestamp: currentTime - 60000, // 1 minute ago
        type: 'warning',
        title: 'Drift Warning',
        description: 'Time offset detected',
        status: 'completed'
      },
      {
        id: '5',
        timestamp: currentTime + 30000, // 30 seconds from now
        type: 'scte35',
        title: 'Upcoming Cue',
        description: 'Next ad break',
        duration: 30000,
        status: 'pending'
      },
      {
        id: '6',
        timestamp: currentTime + 120000, // 2 minutes from now
        type: 'injection',
        title: 'Scheduled Injection',
        description: 'Planned SCTE-35 injection',
        status: 'pending'
      }
    ];
    setEvents(sampleEvents);
  }, [currentTime]);

  // Update timeline position
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setTimelinePosition(Date.now());
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'scte35':
        return <Radio className="w-4 h-4" />;
      case 'sync':
        return <Clock className="w-4 h-4" />;
      case 'injection':
        return <Zap className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: TimelineEvent['type'], status: TimelineEvent['status']) => {
    if (status === 'failed') return 'bg-red-500';
    if (status === 'pending') return 'bg-yellow-500';
    
    switch (type) {
      case 'scte35':
        return 'bg-blue-500';
      case 'sync':
        return 'bg-green-500';
      case 'injection':
        return 'bg-purple-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
    }
  };

  const getEventStatusColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-400';
      case 'completed':
        return 'text-blue-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getRelativeTime = (timestamp: number) => {
    const diff = timestamp - currentTime;
    const absDiff = Math.abs(diff);
    
    if (absDiff < 60000) { // Less than 1 minute
      return diff > 0 ? `in ${Math.round(diff / 1000)}s` : `${Math.round(absDiff / 1000)}s ago`;
    } else if (absDiff < 3600000) { // Less than 1 hour
      return diff > 0 ? `in ${Math.round(diff / 60000)}m` : `${Math.round(absDiff / 60000)}m ago`;
    } else {
      return diff > 0 ? `in ${Math.round(diff / 3600000)}h` : `${Math.round(absDiff / 3600000)}h ago`;
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetTimeline = () => {
    setTimelinePosition(currentTime);
  };

  const zoomIn = () => {
    setTimeRange(prev => Math.max(60000, prev / 2)); // Minimum 1 minute
  };

  const zoomOut = () => {
    setTimeRange(prev => Math.min(1800000, prev * 2)); // Maximum 30 minutes
  };

  // Calculate event positions on timeline
  const getEventPosition = (event: TimelineEvent) => {
    const startTime = currentTime - timeRange / 2;
    const endTime = currentTime + timeRange / 2;
    const totalRange = endTime - startTime;
    const eventOffset = event.timestamp - startTime;
    return Math.max(0, Math.min(100, (eventOffset / totalRange) * 100));
  };

  const isEventVisible = (event: TimelineEvent) => {
    const startTime = currentTime - timeRange / 2;
    const endTime = currentTime + timeRange / 2;
    return event.timestamp >= startTime && event.timestamp <= endTime;
  };

  const visibleEvents = events.filter(isEventVisible);

  return (
    <div className={`medialive-panel rounded-xl overflow-hidden ${className}`}>
      <div className="medialive-panel-header px-6 py-4 bg-gradient-to-r from-[#1a252f] to-[#16191f]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#ff9900]/20 rounded-lg">
              <Activity className="w-5 h-5 text-[#ff9900]" />
            </div>
            <div>
              <h3 className="medialive-panel-title text-lg">Timeline Monitor</h3>
              <p className="medialive-panel-subtitle text-sm">Real-time event visualization</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              className="medialive-button-secondary"
            >
              -
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              className="medialive-button-secondary"
            >
              +
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetTimeline}
              className="medialive-button-secondary"
            >
              <Square className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlayback}
              className="medialive-button-secondary"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="medialive-panel-content p-6">
        {/* Timeline Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-[#a0aec0]">
            Time Range: {Math.round(timeRange / 60000)} minutes
          </div>
          <div className="text-sm text-[#a0aec0]">
            Current: {formatTime(currentTime)}
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="relative mb-6">
          <div 
            ref={timelineRef}
            className="relative h-16 bg-[#16191f] rounded-lg border border-[#232f3e] overflow-hidden"
          >
            {/* Timeline Grid */}
            <div className="absolute inset-0 flex">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className="flex-1 border-r border-[#232f3e] last:border-r-0"
                />
              ))}
            </div>

            {/* Current Time Indicator */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-[#ff9900] left-1/2 transform -translate-x-1/2 z-10">
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#ff9900] rounded-full"></div>
            </div>

            {/* Events */}
            {visibleEvents.map((event) => {
              const position = getEventPosition(event);
              const isPast = event.timestamp < currentTime;
              const isFuture = event.timestamp > currentTime;
              
              return (
                <div
                  key={event.id}
                  className={`absolute top-2 bottom-2 w-3 rounded-full cursor-pointer transition-all duration-200 hover:scale-110 ${getEventColor(event.type, event.status)} ${
                    isPast ? 'opacity-80' : isFuture ? 'opacity-60' : 'opacity-100'
                  }`}
                  style={{ left: `${position}%` }}
                  onClick={() => onEventClick?.(event)}
                  title={`${event.title} - ${formatTime(event.timestamp)}`}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-[#a0aec0] whitespace-nowrap">
                    {formatTime(event.timestamp)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Event List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-[#a0aec0] mb-3">Recent Events</h4>
          {events.slice(0, 6).map((event) => (
            <div
              key={event.id}
              className="flex items-center space-x-3 p-3 bg-[#16191f] rounded-lg border border-[#232f3e] hover:border-[#ff9900]/30 transition-colors cursor-pointer"
              onClick={() => onEventClick?.(event)}
            >
              <div className={`p-2 rounded-lg ${getEventColor(event.type, event.status)}`}>
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium text-white truncate">
                    {event.title}
                  </h5>
                  <Badge className={`text-xs ${getEventStatusColor(event.status)}`}>
                    {event.status}
                  </Badge>
                </div>
                <p className="text-xs text-[#a0aec0] truncate">
                  {event.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-[#a0aec0]">
                    {formatTime(event.timestamp)}
                  </span>
                  <span className="text-xs text-[#a0aec0]">
                    ({getRelativeTime(event.timestamp)})
                  </span>
                  {event.duration && (
                    <span className="text-xs text-[#a0aec0]">
                      • {Math.round(event.duration / 1000)}s
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Controls */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#232f3e]">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-[#a0aec0]">SCTE-35</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-[#a0aec0]">Sync</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-xs text-[#a0aec0]">Injection</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-xs text-[#a0aec0]">Warning</span>
            </div>
          </div>
          <div className="text-xs text-[#a0aec0]">
            {visibleEvents.length} events visible
          </div>
        </div>
      </div>
    </div>
  );
}
