"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  Activity,
  Wifi,
  WifiOff,
  Zap,
  Pause,
  Play
} from "lucide-react";

export type MediaLiveStatus = 'running' | 'stopped' | 'starting' | 'error' | 'warning' | 'idle';

interface MediaLiveStatusIndicatorProps {
  status: MediaLiveStatus;
  text?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

export default function MediaLiveStatusIndicator({
  status,
  text,
  showIcon = true,
  size = 'md',
  className,
  animated = true
}: MediaLiveStatusIndicatorProps) {
  const getStatusConfig = (status: MediaLiveStatus) => {
    switch (status) {
      case 'running':
        return {
          color: 'medialive-status-running',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
          icon: Play,
          pulseColor: 'bg-green-500'
        };
      case 'stopped':
        return {
          color: 'medialive-status-stopped',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          icon: Pause,
          pulseColor: 'bg-red-500'
        };
      case 'starting':
        return {
          color: 'medialive-status-starting',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          icon: Clock,
          pulseColor: 'bg-yellow-500'
        };
      case 'error':
        return {
          color: 'medialive-status-error',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          icon: XCircle,
          pulseColor: 'bg-red-500'
        };
      case 'warning':
        return {
          color: 'medialive-status-warning',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200',
          icon: AlertCircle,
          pulseColor: 'bg-yellow-500'
        };
      case 'idle':
        return {
          color: 'medialive-status-idle',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          icon: Activity,
          pulseColor: 'bg-gray-500'
        };
      default:
        return {
          color: 'medialive-status-stopped',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          icon: XCircle,
          pulseColor: 'bg-red-500'
        };
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          badge: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3',
          dot: 'w-2 h-2'
        };
      case 'lg':
        return {
          badge: 'px-3 py-2 text-sm',
          icon: 'w-5 h-5',
          dot: 'w-3 h-3'
        };
      default:
        return {
          badge: 'px-2 py-1 text-xs',
          icon: 'w-4 h-4',
          dot: 'w-2.5 h-2.5'
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = getSizeClasses(size);
  const displayText = text || status.charAt(0).toUpperCase() + status.slice(1);
  const Icon = config.icon;

  if (size === 'sm' && !showIcon) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          config.bgColor,
          config.textColor,
          config.borderColor,
          sizeClasses.badge,
          className
        )}
      >
        {displayText}
      </Badge>
    );
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Status Dot */}
      <div className="relative">
        <div 
          className={cn(
            "rounded-full",
            sizeClasses.dot,
            animated && status === 'running' && 'animate-pulse',
            config.pulseColor
          )}
        />
        {showIcon && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className={cn("text-white", sizeClasses.icon)} />
          </div>
        )}
      </div>
      
      {/* Status Text */}
      <span className={cn(
        "font-medium",
        config.textColor,
        size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'
      )}>
        {displayText}
      </span>
    </div>
  );
}

// Specialized status indicators for specific use cases
interface MediaLiveConnectionStatusProps {
  connected: boolean;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MediaLiveConnectionStatus({
  connected,
  text,
  size = 'md',
  className
}: MediaLiveConnectionStatusProps) {
  const status: MediaLiveStatus = connected ? 'running' : 'stopped';
  const displayText = text || (connected ? 'Connected' : 'Disconnected');
  const Icon = connected ? Wifi : WifiOff;

  return (
    <MediaLiveStatusIndicator
      status={status}
      text={displayText}
      showIcon={true}
      size={size}
      className={className}
      animated={connected}
    />
  );
}

interface MediaLiveStreamStatusProps {
  streaming: boolean;
  viewers?: number;
  bitrate?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MediaLiveStreamStatus({
  streaming,
  viewers,
  bitrate,
  size = 'md',
  className
}: MediaLiveStreamStatusProps) {
  const status: MediaLiveStatus = streaming ? 'running' : 'stopped';
  const baseText = streaming ? 'Live' : 'Offline';
  let additionalText = '';

  if (streaming && viewers !== undefined) {
    additionalText = ` • ${viewers} viewers`;
  }
  if (streaming && bitrate !== undefined) {
    additionalText += additionalText ? ` • ${bitrate} kbps` : ` • ${bitrate} kbps`;
  }

  const displayText = baseText + additionalText;

  return (
    <MediaLiveStatusIndicator
      status={status}
      text={displayText}
      showIcon={true}
      size={size}
      className={className}
      animated={streaming}
    />
  );
}

interface MediaLiveHealthStatusProps {
  health: 'good' | 'degraded' | 'poor';
  metrics?: {
    cpu?: number;
    memory?: number;
    network?: number;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MediaLiveHealthStatus({
  health,
  metrics,
  size = 'md',
  className
}: MediaLiveHealthStatusProps) {
  const statusMap = {
    good: 'running' as MediaLiveStatus,
    degraded: 'warning' as MediaLiveStatus,
    poor: 'error' as MediaLiveStatus
  };

  const status = statusMap[health];
  let displayText = health.charAt(0).toUpperCase() + health.slice(1);

  if (metrics) {
    const issues = [];
    if (metrics.cpu && metrics.cpu > 80) issues.push('CPU');
    if (metrics.memory && metrics.memory > 80) issues.push('Memory');
    if (metrics.network && metrics.network > 80) issues.push('Network');
    
    if (issues.length > 0) {
      displayText += ` • ${issues.join(', ')}`;
    }
  }

  return (
    <MediaLiveStatusIndicator
      status={status}
      text={displayText}
      showIcon={true}
      size={size}
      className={className}
      animated={health === 'good'}
    />
  );
}