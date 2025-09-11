"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Shield, 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  TrendingUp,
  Users,
  Settings,
  BarChart3,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react';

interface SystemMetrics {
  healthScore: number;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  cpuUsage: number;
  memoryUsage: number;
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
  activeStreams: number;
  scte35SuccessRate: number;
  errorRate: number;
}

const SimpleAdvancedDashboard: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    healthScore: 85,
    status: 'healthy',
    cpuUsage: 45,
    memoryUsage: 62,
    networkQuality: 'good',
    activeStreams: 3,
    scte35SuccessRate: 96.5,
    errorRate: 0.8
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        cpuUsage: Math.max(20, Math.min(80, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(30, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        scte35SuccessRate: Math.max(90, Math.min(100, prev.scte35SuccessRate + (Math.random() - 0.5) * 2)),
        errorRate: Math.max(0, Math.min(5, prev.errorRate + (Math.random() - 0.5) * 0.5))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'offline': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleAdvancedProcessing = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      console.log('Health check result:', result);
    } catch (error) {
      console.error('Health check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Advanced SCTE-35 Dashboard</h1>
          <p className="text-[#a0aec0] mt-1">Enterprise-grade stream processing with AI intelligence</p>
        </div>
        <Button 
          onClick={handleAdvancedProcessing}
          disabled={isLoading}
          className="medialive-button medialive-button-primary"
        >
          {isLoading ? (
            <>
              <Activity className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Start Advanced Processing
            </>
          )}
        </Button>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="medialive-panel">
          <CardHeader className="medialive-panel-header">
            <div className="flex items-center justify-between">
              <CardTitle className="medialive-panel-title flex items-center">
                <Activity className="w-5 h-5 text-[#ff9900] mr-2" />
                System Health
              </CardTitle>
              <Badge className={getStatusBadge(systemMetrics.status)}>
                {systemMetrics.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="medialive-panel-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#a0aec0]">Health Score</span>
                <span className="text-2xl font-bold text-white">{systemMetrics.healthScore}%</span>
              </div>
              <Progress value={systemMetrics.healthScore} className="h-2" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#a0aec0]">Active Streams</span>
                  <div className="text-white font-semibold">{systemMetrics.activeStreams}</div>
                </div>
                <div>
                  <span className="text-[#a0aec0]">Uptime</span>
                  <div className="text-white font-semibold">99.8%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medialive-panel">
          <CardHeader className="medialive-panel-header">
            <CardTitle className="medialive-panel-title flex items-center">
              <Shield className="w-5 h-5 text-[#ff9900] mr-2" />
              Security Status
            </CardTitle>
          </CardHeader>
          <CardContent className="medialive-panel-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#a0aec0]">Compliance Score</span>
                <span className="text-2xl font-bold text-white">92%</span>
              </div>
              <Progress value={92} className="h-2" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#a0aec0]">Active Sessions</span>
                  <div className="text-white font-semibold">12</div>
                </div>
                <div>
                  <span className="text-[#a0aec0]">Security Events</span>
                  <div className="text-white font-semibold">2</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medialive-panel">
          <CardHeader className="medialive-panel-header">
            <CardTitle className="medialive-panel-title flex items-center">
              <Brain className="w-5 h-5 text-[#ff9900] mr-2" />
              AI Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="medialive-panel-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#a0aec0]">Predictions Today</span>
                <span className="text-2xl font-bold text-white">15</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#a0aec0]">Optimizations</span>
                  <div className="text-white font-semibold">8</div>
                </div>
                <div>
                  <span className="text-[#a0aec0]">Content Analysis</span>
                  <div className="text-white font-semibold">24</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-[#a0aec0]">Adaptive Injection:</span>
                <Badge className="bg-green-500/20 text-green-400">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medialive-panel">
          <CardHeader className="medialive-panel-header">
            <CardTitle className="medialive-panel-title flex items-center">
              <Settings className="w-5 h-5 text-[#ff9900] mr-2" />
              Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="medialive-panel-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#a0aec0]">Risk Level</span>
                <Badge className="bg-green-500/20 text-green-400">
                  LOW
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#a0aec0]">Predicted Failures</span>
                  <div className="text-white font-semibold">2</div>
                </div>
                <div>
                  <span className="text-[#a0aec0]">Next Maintenance</span>
                  <div className="text-white font-semibold">3 days</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="medialive-tabs grid grid-cols-4 gap-1">
          <TabsTrigger value="performance" className="medialive-tab">Performance</TabsTrigger>
          <TabsTrigger value="security" className="medialive-tab">Security</TabsTrigger>
          <TabsTrigger value="intelligence" className="medialive-tab">AI Intelligence</TabsTrigger>
          <TabsTrigger value="maintenance" className="medialive-tab">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="medialive-panel">
              <CardHeader className="medialive-panel-header">
                <CardTitle className="medialive-panel-title flex items-center">
                  <Cpu className="w-5 h-5 text-[#ff9900] mr-2" />
                  Resource Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="medialive-panel-content">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#a0aec0]">CPU Usage</span>
                      <span className="text-sm text-white">{systemMetrics.cpuUsage}%</span>
                    </div>
                    <Progress value={systemMetrics.cpuUsage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#a0aec0]">Memory Usage</span>
                      <span className="text-sm text-white">{systemMetrics.memoryUsage}%</span>
                    </div>
                    <Progress value={systemMetrics.memoryUsage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-[#a0aec0]">SCTE-35 Success Rate</span>
                      <span className="text-sm text-white">{systemMetrics.scte35SuccessRate}%</span>
                    </div>
                    <Progress value={systemMetrics.scte35SuccessRate} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="medialive-panel">
              <CardHeader className="medialive-panel-header">
                <CardTitle className="medialive-panel-title flex items-center">
                  <Wifi className="w-5 h-5 text-[#ff9900] mr-2" />
                  Network Quality
                </CardTitle>
              </CardHeader>
              <CardContent className="medialive-panel-content">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">
                      {systemMetrics.networkQuality.toUpperCase()}
                    </div>
                    <Badge className={getStatusBadge(systemMetrics.networkQuality)}>
                      Network Status
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#a0aec0]">Error Rate</span>
                      <div className="text-white font-semibold">{systemMetrics.errorRate}%</div>
                    </div>
                    <div>
                      <span className="text-[#a0aec0]">Active Streams</span>
                      <div className="text-white font-semibold">{systemMetrics.activeStreams}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="medialive-panel">
              <CardHeader className="medialive-panel-header">
                <CardTitle className="medialive-panel-title flex items-center">
                  <Shield className="w-5 h-5 text-[#ff9900] mr-2" />
                  Security Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="medialive-panel-content">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0aec0]">Compliance Score</span>
                    <span className="text-2xl font-bold text-white">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[#a0aec0]">Active Sessions</span>
                      <div className="text-white font-semibold">12</div>
                    </div>
                    <div>
                      <span className="text-[#a0aec0]">Recent Logins</span>
                      <div className="text-white font-semibold">8</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-[#a0aec0]">MFA Enabled:</span>
                    <Badge className="bg-green-500/20 text-green-400">
                      Yes
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="medialive-panel">
              <CardHeader className="medialive-panel-header">
                <CardTitle className="medialive-panel-title flex items-center">
                  <AlertTriangle className="w-5 h-5 text-[#ff9900] mr-2" />
                  Security Events
                </CardTitle>
              </CardHeader>
              <CardContent className="medialive-panel-content">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">2</div>
                    <span className="text-sm text-[#a0aec0]">Events in Last 24h</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#a0aec0]">Failed Login Attempts</span>
                      <span className="text-white">2</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#a0aec0]">Suspicious Activity</span>
                      <span className="text-white">0</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#a0aec0]">Policy Violations</span>
                      <span className="text-white">0</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="medialive-panel">
              <CardHeader className="medialive-panel-header">
                <CardTitle className="medialive-panel-title flex items-center">
                  <Brain className="w-5 h-5 text-[#ff9900] mr-2" />
                  AI Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="medialive-panel-content">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">15</div>
                      <span className="text-sm text-[#a0aec0]">Predictions Today</span>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">8</div>
                      <span className="text-sm text-[#a0aec0]">Optimizations</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#a0aec0]">Content Analysis</span>
                      <span className="text-white">24 streams</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#a0aec0]">Risk Assessment</span>
                      <Badge className="bg-green-500/20 text-green-400">
                        LOW
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="medialive-panel">
              <CardHeader className="medialive-panel-header">
                <CardTitle className="medialive-panel-title flex items-center">
                  <TrendingUp className="w-5 h-5 text-[#ff9900] mr-2" />
                  Adaptive Features
                </CardTitle>
              </CardHeader>
              <CardContent className="medialive-panel-content">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#a0aec0]">Adaptive Injection</span>
                      <Badge className="bg-green-500/20 text-green-400">
                        Active
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#a0aec0]">Content Analysis</span>
                      <Badge className="bg-blue-500/20 text-blue-400">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#a0aec0]">Predictive Maintenance</span>
                      <Badge className="bg-purple-500/20 text-purple-400">Active</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="medialive-panel">
              <CardHeader className="medialive-panel-header">
                <CardTitle className="medialive-panel-title flex items-center">
                  <Clock className="w-5 h-5 text-[#ff9900] mr-2" />
                  Maintenance Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="medialive-panel-content">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">2</div>
                    <span className="text-sm text-[#a0aec0]">Predicted Failures</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#a0aec0]">Next Maintenance</span>
                      <span className="text-white">3 days from now</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#a0aec0]">System Uptime</span>
                      <span className="text-white">99.8%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#a0aec0]">Risk Level</span>
                      <Badge className="bg-green-500/20 text-green-400">
                        LOW
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="medialive-panel">
              <CardHeader className="medialive-panel-header">
                <CardTitle className="medialive-panel-title flex items-center">
                  <BarChart3 className="w-5 h-5 text-[#ff9900] mr-2" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="medialive-panel-content">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">99.8%</div>
                    <span className="text-sm text-[#a0aec0]">Average Uptime</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#a0aec0]">Last Maintenance</span>
                      <span className="text-white">7 days ago</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#a0aec0]">Maintenance Window</span>
                      <span className="text-white">2 hours</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#a0aec0]">Scheduled Downtime</span>
                      <span className="text-white">0.2%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimpleAdvancedDashboard;
