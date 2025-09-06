"use client";

import { useState } from "react";
import Link from "next/link";
import MediaLiveHeader from "@/components/medialive/medialive-header";
import MediaLiveSidebar from "@/components/medialive/medialive-sidebar";
import MediaLiveMetricsCard, { StreamMetricsCard, SystemMetricsCard, SCTE35MetricsCard } from "@/components/medialive/medialive-metrics-card";
import MediaLiveStatusIndicator from "@/components/medialive/medialive-status-indicator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Radio, 
  Settings, 
  Zap, 
  Activity, 
  Play, 
  Square, 
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Wifi,
  Cpu,
  HardDrive,
  BarChart3,
  FileText,
  HelpCircle,
  Cloud,
  Shield,
  Database
} from "lucide-react";

export default function Home() {
  const [channelStatus, setChannelStatus] = useState<'running' | 'stopped' | 'starting' | 'error'>('stopped');
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for metrics
  const [metrics, setMetrics] = useState({
    inputBitrate: 4850,
    outputBitrate: 4620,
    viewers: 42,
    uptime: 3600,
    packetLoss: 0.8,
    latency: 145,
    cpu: 45,
    memory: 62,
    disk: 34,
    network: 28,
    totalInjections: 156,
    successfulInjections: 154,
    failedInjections: 2,
    lastInjection: new Date().toISOString()
  });

  const handleStartChannel = () => {
    setChannelStatus('starting');
    setTimeout(() => setChannelStatus('running'), 2000);
  };

  const handleStopChannel = () => {
    setChannelStatus('stopped');
  };

  const handleRefreshMetrics = () => {
    // Simulate metrics refresh
    setMetrics(prev => ({
      ...prev,
      inputBitrate: Math.floor(Math.random() * 1000) + 4500,
      outputBitrate: Math.floor(Math.random() * 800) + 4200,
      viewers: Math.floor(Math.random() * 50) + 10,
      packetLoss: Math.random() * 2,
      latency: Math.floor(Math.random() * 100) + 100,
      cpu: Math.floor(Math.random() * 40) + 30,
      memory: Math.floor(Math.random() * 30) + 50,
      network: Math.floor(Math.random() * 40) + 20
    }));
  };

  return (
    <div className="medialive-container">
      <MediaLiveHeader 
        title="AWS Elemental MediaLive"
        subtitle="SCTE-35 Encoder & Stream Injector"
        showChannelInfo={true}
        channelStatus={channelStatus}
        channelName="Production Channel 1"
        channelId="ml-1234567890"
      />
      
      <div className="flex">
        <MediaLiveSidebar />
        
        <main className="medialive-main-content flex-1">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Monitor your MediaLive channels and SCTE-35 activity</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button 
                  onClick={handleRefreshMetrics}
                  variant="outline"
                  size="sm"
                  className="medialive-button-secondary"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                {channelStatus === 'stopped' ? (
                  <Button 
                    onClick={handleStartChannel}
                    className="medialive-button-primary"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Channel
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStopChannel}
                    variant="destructive"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Channel
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="medialive-tabs">
              <TabsTrigger value="overview" className="medialive-tab">Overview</TabsTrigger>
              <TabsTrigger value="channels" className="medialive-tab">Channels</TabsTrigger>
              <TabsTrigger value="scte35" className="medialive-tab">SCTE-35</TabsTrigger>
              <TabsTrigger value="analytics" className="medialive-tab">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StreamMetricsCard
                  inputBitrate={metrics.inputBitrate}
                  outputBitrate={metrics.outputBitrate}
                  viewers={metrics.viewers}
                  uptime={metrics.uptime}
                  status={channelStatus}
                  onRefresh={handleRefreshMetrics}
                />
                
                <SystemMetricsCard
                  cpu={metrics.cpu}
                  memory={metrics.memory}
                  disk={metrics.disk}
                  network={metrics.network}
                  status={channelStatus === 'running' ? 'running' : 'stopped'}
                  onRefresh={handleRefreshMetrics}
                />
                
                <SCTE35MetricsCard
                  totalInjections={metrics.totalInjections}
                  successfulInjections={metrics.successfulInjections}
                  failedInjections={metrics.failedInjections}
                  lastInjection={metrics.lastInjection}
                  status={channelStatus === 'running' ? 'running' : 'idle'}
                  onRefresh={handleRefreshMetrics}
                />
                
                <MediaLiveMetricsCard
                  title="Stream Quality"
                  description="Network performance metrics"
                  icon={<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Wifi className="w-6 h-6 text-purple-500" />
                  </div>}
                  data={{
                    value: metrics.latency,
                    unit: 'ms',
                    trend: metrics.latency > 200 ? 'up' : 'stable',
                    status: metrics.latency > 1000 ? 'error' : metrics.latency > 500 ? 'warning' : 'running',
                    timestamp: new Date().toISOString()
                  }}
                  showTrend={true}
                  showStatus={true}
                  refreshable={true}
                  onRefresh={handleRefreshMetrics}
                />
              </div>

              {/* Quick Actions */}
              <Card className="medialive-panel">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Common tasks for managing your MediaLive channels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/encoder">
                      <Button className="medialive-button-secondary w-full justify-start">
                        <Radio className="w-4 h-4 mr-2" />
                        SCTE-35 Encoder
                      </Button>
                    </Link>
                    <Link href="/stream-injection">
                      <Button className="medialive-button-secondary w-full justify-start">
                        <Zap className="w-4 h-4 mr-2" />
                        Stream Injection
                      </Button>
                    </Link>
                    <Link href="/monitor">
                      <Button className="medialive-button-secondary w-full justify-start">
                        <Activity className="w-4 h-4 mr-2" />
                        Monitor
                      </Button>
                    </Link>
                    <Link href="/channels/create">
                      <Button className="medialive-button-primary w-full justify-start">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Channel
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="medialive-panel">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      Recent SCTE-35 Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <div className="font-medium">Ad Break Start</div>
                            <div className="text-sm text-gray-600">Channel 1 • 2 minutes ago</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Success
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-blue-500" />
                          <div>
                            <div className="font-medium">Program Start</div>
                            <div className="text-sm text-gray-600">Channel 1 • 15 minutes ago</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          Scheduled
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                          <div>
                            <div className="font-medium">Injection Failed</div>
                            <div className="text-sm text-gray-600">Channel 2 • 1 hour ago</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          Failed
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="medialive-panel">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5" />
                      System Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Cpu className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">CPU Usage</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${metrics.cpu}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{metrics.cpu}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <HardDrive className="w-5 h-5 text-green-500" />
                          <span className="font-medium">Memory Usage</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${metrics.memory}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{metrics.memory}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Wifi className="w-5 h-5 text-purple-500" />
                          <span className="font-medium">Network Usage</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full" 
                              style={{ width: `${metrics.network}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{metrics.network}%</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Database className="w-5 h-5 text-orange-500" />
                          <span className="font-medium">Disk Usage</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full" 
                              style={{ width: `${metrics.disk}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{metrics.disk}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="channels" className="space-y-6">
              <Card className="medialive-panel">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Radio className="w-5 h-5" />
                        MediaLive Channels
                      </CardTitle>
                      <CardDescription>
                        Manage your MediaLive channels and configurations
                      </CardDescription>
                    </div>
                    <Link href="/channels/create">
                      <Button className="medialive-button-primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Channel
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Channel List */}
                    <div className="border rounded-lg">
                      <div className="grid grid-cols-12 gap-4 p-4 border-b bg-gray-50 font-medium text-sm text-gray-700">
                        <div className="col-span-4">Channel Name</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2">Input</div>
                        <div className="col-span-2">Output</div>
                        <div className="col-span-2">Actions</div>
                      </div>
                      
                      <div className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-gray-50">
                        <div className="col-span-4">
                          <div className="font-medium">Production Channel 1</div>
                          <div className="text-sm text-gray-600">ml-1234567890</div>
                        </div>
                        <div className="col-span-2">
                          <MediaLiveStatusIndicator status={channelStatus} size="sm" />
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm">SRT</div>
                          <div className="text-xs text-gray-600">9000</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm">SRT</div>
                          <div className="text-xs text-gray-600">9001</div>
                        </div>
                        <div className="col-span-2">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm" variant="outline">Monitor</Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50">
                        <div className="col-span-4">
                          <div className="font-medium">Backup Channel</div>
                          <div className="text-sm text-gray-600">ml-0987654321</div>
                        </div>
                        <div className="col-span-2">
                          <MediaLiveStatusIndicator status="stopped" size="sm" />
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm">RTMP</div>
                          <div className="text-xs text-gray-600">1935</div>
                        </div>
                        <div className="col-span-2">
                          <div className="text-sm">HLS</div>
                          <div className="text-xs text-gray-600">/live/stream</div>
                        </div>
                        <div className="col-span-2">
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">Edit</Button>
                            <Button size="sm" variant="outline">Monitor</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="scte35" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="medialive-panel">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Radio className="w-5 h-5" />
                      SCTE-35 Encoder
                    </CardTitle>
                    <CardDescription>
                      Create and encode SCTE-35 messages for ad insertion
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                          <select className="medialive-select w-full">
                            <option>Ad Break Start</option>
                            <option>Ad Break End</option>
                            <option>Program Start</option>
                            <option>Program End</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
                          <input type="number" className="medialive-input w-full" placeholder="30" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cue ID</label>
                        <input type="text" className="medialive-input w-full" placeholder="1" />
                      </div>
                      
                      <Link href="/encoder">
                        <Button className="medialive-button-primary w-full">
                          Open SCTE-35 Encoder
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card className="medialive-panel">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5" />
                      Stream Injection
                    </CardTitle>
                    <CardDescription>
                      Inject SCTE-35 cues into live streams
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Stream Type</label>
                          <select className="medialive-select w-full">
                            <option>SRT</option>
                            <option>HLS</option>
                            <option>DASH</option>
                            <option>RTMP</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Injection Mode</label>
                          <select className="medialive-select w-full">
                            <option>Manual</option>
                            <option>Scheduled</option>
                            <option>Automatic</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SCTE-35 Data</label>
                        <textarea className="medialive-input w-full" rows={3} placeholder="Paste SCTE-35 data here..." />
                      </div>
                      
                      <Link href="/stream-injection">
                        <Button className="medialive-button-primary w-full">
                          Open Stream Injection
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card className="medialive-panel">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    Analytics Dashboard
                  </CardTitle>
                  <CardDescription>
                    Detailed analytics and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Coming Soon</h3>
                    <p className="text-gray-600 mb-4">
                      Advanced analytics and reporting features will be available soon.
                    </p>
                    <Link href="/monitor">
                      <Button className="medialive-button-primary">
                        View Monitor
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}