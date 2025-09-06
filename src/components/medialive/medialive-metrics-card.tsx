"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import MediaLiveStatusIndicator, { MediaLiveStatus } from "./medialive-status-indicator";

interface MetricData {
  value: number;
  unit: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  status?: MediaLiveStatus;
  timestamp?: string;
}

interface MediaLiveMetricsCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  data: MetricData;
  showTrend?: boolean;
  showStatus?: boolean;
  refreshable?: boolean;
  downloadable?: boolean;
  className?: string;
  onRefresh?: () => void;
  onDownload?: () => void;
}

export default function MediaLiveMetricsCard({
  title,
  description,
  icon,
  data,
  showTrend = true,
  showStatus = false,
  refreshable = false,
  downloadable = false,
  className,
  onRefresh,
  onDownload
}: MediaLiveMetricsCardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const handleRefresh = async () => {
    if (isRefreshing || !onRefresh) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error refreshing metrics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case 'kbps':
        if (value >= 1000) {
          return `${(value / 1000).toFixed(1)} Mbps`;
        }
        return `${value} kbps`;
      case 'bytes':
        if (value >= 1024 * 1024 * 1024) {
          return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
        } else if (value >= 1024 * 1024) {
          return `${(value / (1024 * 1024)).toFixed(1)} MB`;
        } else if (value >= 1024) {
          return `${(value / 1024).toFixed(1)} KB`;
        }
        return `${value} B`;
      case 'seconds':
        if (value >= 3600) {
          const hours = Math.floor(value / 3600);
          const minutes = Math.floor((value % 3600) / 60);
          return `${hours}h ${minutes}m`;
        } else if (value >= 60) {
          const minutes = Math.floor(value / 60);
          const seconds = value % 60;
          return `${minutes}m ${seconds}s`;
        }
        return `${value}s`;
      case 'percentage':
        return `${value}%`;
      case 'count':
        return value.toLocaleString();
      default:
        return `${value} ${unit}`;
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Card className={cn("medialive-metrics-card", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="medialive-metrics-icon">
              {icon}
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {refreshable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              </Button>
            )}
            {downloadable && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDownload}
                className="h-8 w-8 p-0"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <div className="medialive-metrics-value">
              {formatValue(data.value, data.unit)}
            </div>
            
            {showTrend && data.trend && (
              <div className="flex items-center space-x-2">
                {getTrendIcon(data.trend)}
                {data.trendValue !== undefined && (
                  <span className={cn("text-sm font-medium", getTrendColor(data.trend))}>
                    {data.trendValue > 0 ? '+' : ''}{data.trendValue}%
                  </span>
                )}
                <span className="text-xs text-muted-foreground">from last period</span>
              </div>
            )}
            
            {showStatus && data.status && (
              <MediaLiveStatusIndicator
                status={data.status}
                size="sm"
                className="mt-2"
              />
            )}
          </div>
          
          {data.timestamp && (
            <div className="text-xs text-muted-foreground text-right">
              <div>Updated</div>
              <div>{new Date(data.timestamp).toLocaleTimeString()}</div>
            </div>
          )}
        </div>
        
        {lastUpdated && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last refreshed: {lastUpdated.toLocaleTimeString()}</span>
              {data.status === 'error' && (
                <div className="flex items-center space-x-1 text-orange-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Data may be delayed</span>
                </div>
              )}
              {data.status === 'running' && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  <span>Real-time data</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Specialized metrics cards for common use cases
interface StreamMetricsCardProps {
  title?: string;
  inputBitrate?: number;
  outputBitrate?: number;
  viewers?: number;
  uptime?: number;
  status?: MediaLiveStatus;
  className?: string;
  onRefresh?: () => void;
}

export function StreamMetricsCard({
  title = "Stream Metrics",
  inputBitrate = 0,
  outputBitrate = 0,
  viewers = 0,
  uptime = 0,
  status = 'stopped',
  className,
  onRefresh
}: StreamMetricsCardProps) {
  return (
    <MediaLiveMetricsCard
      title={title}
      description="Real-time stream performance metrics"
      icon={<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
        <div className="w-6 h-6 bg-blue-500 rounded" />
      </div>}
      data={{
        value: inputBitrate,
        unit: 'kbps',
        trend: inputBitrate > 0 ? 'up' : 'stable',
        status: status,
        timestamp: new Date().toISOString()
      }}
      showTrend={true}
      showStatus={true}
      refreshable={true}
      className={className}
      onRefresh={onRefresh}
    />
  );
}

interface SystemMetricsCardProps {
  title?: string;
  cpu?: number;
  memory?: number;
  disk?: number;
  network?: number;
  status?: MediaLiveStatus;
  className?: string;
  onRefresh?: () => void;
}

export function SystemMetricsCard({
  title = "System Health",
  cpu = 0,
  memory = 0,
  disk = 0,
  network = 0,
  status = 'running',
  className,
  onRefresh
}: SystemMetricsCardProps) {
  const maxUsage = Math.max(cpu, memory, disk, network);
  
  return (
    <MediaLiveMetricsCard
      title={title}
      description="System resource utilization"
      icon={<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
        <div className="w-6 h-6 bg-green-500 rounded-full" />
      </div>}
      data={{
        value: maxUsage,
        unit: 'percentage',
        trend: maxUsage > 80 ? 'up' : 'stable',
        status: status,
        timestamp: new Date().toISOString()
      }}
      showTrend={true}
      showStatus={true}
      refreshable={true}
      className={className}
      onRefresh={onRefresh}
    />
  );
}

interface SCTE35MetricsCardProps {
  title?: string;
  totalInjections?: number;
  successfulInjections?: number;
  failedInjections?: number;
  lastInjection?: string;
  status?: MediaLiveStatus;
  className?: string;
  onRefresh?: () => void;
}

export function SCTE35MetricsCard({
  title = "SCTE-35 Activity",
  totalInjections = 0,
  successfulInjections = 0,
  failedInjections = 0,
  lastInjection,
  status = 'idle',
  className,
  onRefresh
}: SCTE35MetricsCardProps) {
  const successRate = totalInjections > 0 ? (successfulInjections / totalInjections) * 100 : 0;
  
  return (
    <MediaLiveMetricsCard
      title={title}
      description="SCTE-35 injection statistics"
      icon={<div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
        <div className="w-6 h-6 bg-orange-500 rounded" />
      </div>}
      data={{
        value: totalInjections,
        unit: 'count',
        trend: totalInjections > 0 ? 'up' : 'stable',
        trendValue: successRate,
        status: status,
        timestamp: lastInjection
      }}
      showTrend={true}
      showStatus={true}
      refreshable={true}
      className={className}
      onRefresh={onRefresh}
    />
  );
}