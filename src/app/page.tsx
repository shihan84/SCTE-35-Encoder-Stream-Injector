"use client";

import { useState } from "react";
import Link from "next/link";
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
  Pause, 
  BarChart3, 
  Shield, 
  Monitor,
  Network,
  FileText,
  Database,
  Workflow,
  Layers
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-8 p-4">
        {/* Header */}
        <div className="text-center space-y-4 py-8">
          <div className="flex justify-center">
            <div className="relative w-32 h-32 md:w-40 md:h-40">
              <img
                src="/logo.svg"
                alt="Z.ai Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-5xl font-bold tracking-tight">SCTE-35 Broadcast Suite</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional SCTE-35 encoding, stream injection, and broadcast monitoring solution for digital video broadcasting
          </p>
        </div>

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="encoding">Encoding</TabsTrigger>
            <TabsTrigger value="streaming">Streaming</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Streams</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <Play className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">SCTE-35 Events</p>
                      <p className="text-2xl font-bold">24</p>
                    </div>
                    <Radio className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">System Health</p>
                      <p className="text-2xl font-bold">98%</p>
                    </div>
                    <Shield className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                      <p className="text-2xl font-bold">24h</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feature Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* SCTE-35 Encoding */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/encoder">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Radio className="w-6 h-6 text-blue-600" />
                      <CardTitle>SCTE-35 Encoding</CardTitle>
                    </div>
                    <CardDescription>
                      Create and encode SCTE-35 messages with professional-grade tools
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Splice Insert</span>
                        <Badge variant="outline">Supported</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Time Signal</span>
                        <Badge variant="outline">Supported</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Multiple Formats</span>
                        <Badge variant="outline">Base64/Hex</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">CRC Validation</span>
                        <Badge variant="outline">Automatic</Badge>
                      </div>
                      <Button className="w-full mt-4">
                        Open Encoder
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>

              {/* Live Stream Processing */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/stream-injection">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-6 h-6 text-green-600" />
                      <CardTitle>Live Stream Processing</CardTitle>
                    </div>
                    <CardDescription>
                      Real-time SCTE-35 injection and multi-protocol stream handling
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SRT Protocol</span>
                        <Badge variant="outline">Supported</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">HLS/DASH</span>
                        <Badge variant="outline">Supported</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">RTMP</span>
                        <Badge variant="outline">Supported</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Real-time Injection</span>
                        <Badge variant="outline">Live</Badge>
                      </div>
                      <Button className="w-full mt-4">
                        Start Streaming
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>

              {/* Broadcast Monitoring */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/monitor">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Monitor className="w-6 h-6 text-purple-600" />
                      <CardTitle>Broadcast Monitoring</CardTitle>
                    </div>
                    <CardDescription>
                      Comprehensive monitoring and analytics for broadcast operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Stream Health</span>
                        <Badge variant="outline">Real-time</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">SCTE-35 Tracking</span>
                        <Badge variant="outline">Automatic</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Quality Metrics</span>
                        <Badge variant="outline">Detailed</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Alert System</span>
                        <Badge variant="outline">Smart</Badge>
                      </div>
                      <Button className="w-full mt-4">
                        View Monitor
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </div>

            {/* Advanced Features */}
            <Card>
              <CardHeader>
                <CardTitle>Advanced Features</CardTitle>
                <CardDescription>
                  Professional-grade capabilities for broadcast operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center space-y-2">
                    <Layers className="w-8 h-8 mx-auto text-blue-600" />
                    <h3 className="font-semibold">Multi-Protocol</h3>
                    <p className="text-sm text-muted-foreground">
                      Support for SRT, HLS, DASH, RTMP
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <Network className="w-8 h-8 mx-auto text-green-600" />
                    <h3 className="font-semibold">Low Latency</h3>
                    <p className="text-sm text-muted-foreground">
                      Sub-second latency for live operations
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <Database className="w-8 h-8 mx-auto text-purple-600" />
                    <h3 className="font-semibold">High Availability</h3>
                    <p className="text-sm text-muted-foreground">
                      Redundant systems for reliability
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <Workflow className="w-8 h-8 mx-auto text-orange-600" />
                    <h3 className="font-semibold">Automation</h3>
                    <p className="text-sm text-muted-foreground">
                      Automated SCTE-35 scheduling
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Encoding Tab */}
          <TabsContent value="encoding" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">SCTE-35 Encoding Tools</h2>
              <p className="text-muted-foreground">
                Professional SCTE-35 message creation and encoding capabilities
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/encoder">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Radio className="w-6 h-6 text-blue-600" />
                      <CardTitle>Advanced Encoder</CardTitle>
                    </div>
                    <CardDescription>
                      Full-featured SCTE-35 encoder with comprehensive configuration options
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>• Splice Insert commands</div>
                      <div>• Time Signal commands</div>
                      <div>• Custom descriptors</div>
                      <div>• PTS timing control</div>
                      <div>• Multiple output formats</div>
                      <div>• CRC32 validation</div>
                    </div>
                    <Button className="w-full mt-4">
                      Open Advanced Encoder
                    </Button>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/encoder">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-6 h-6 text-green-600" />
                      <CardTitle>Quick Encoder</CardTitle>
                    </div>
                    <CardDescription>
                      Rapid SCTE-35 message generation for common use cases
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>• Pre-built templates</div>
                      <div>• Ad break start/end</div>
                      <div>• Program boundaries</div>
                      <div>• One-click encoding</div>
                      <div>• Batch processing</div>
                      <div>• Export options</div>
                    </div>
                    <Button className="w-full mt-4">
                      Open Quick Encoder
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            </div>
          </TabsContent>

          {/* Streaming Tab */}
          <TabsContent value="streaming" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Live Stream Processing</h2>
              <p className="text-muted-foreground">
                Real-time stream handling and SCTE-35 injection capabilities
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/stream-injection">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-6 h-6 text-blue-600" />
                      <CardTitle>Stream Injection</CardTitle>
                    </div>
                    <CardDescription>
                      Inject SCTE-35 cues into live streams in real-time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>• Live injection</div>
                      <div>• Scheduled events</div>
                      <div>• Multi-protocol support</div>
                      <div>• Real-time monitoring</div>
                    </div>
                    <Button className="w-full mt-4">
                      Open Stream Injector
                    </Button>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Network className="w-6 h-6 text-green-600" />
                    <CardTitle>Protocol Support</CardTitle>
                  </div>
                  <CardDescription>
                    Comprehensive protocol support for various streaming needs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>• SRT (Secure Reliable Transport)</div>
                    <div>• HLS (HTTP Live Streaming)</div>
                    <div>• DASH (Dynamic Adaptive Streaming)</div>
                    <div>• RTMP (Real-Time Messaging Protocol)</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Settings className="w-6 h-6 text-purple-600" />
                    <CardTitle>Stream Configuration</CardTitle>
                  </div>
                  <CardDescription>
                    Advanced stream configuration and quality control
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>• Bitrate control</div>
                    <div>• Resolution management</div>
                    <div>• Codec selection</div>
                    <div>• Quality profiles</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Broadcast Monitoring</h2>
              <p className="text-muted-foreground">
                Comprehensive monitoring and analytics for broadcast operations
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link href="/monitor">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Monitor className="w-6 h-6 text-blue-600" />
                      <CardTitle>Live Monitor</CardTitle>
                    </div>
                    <CardDescription>
                      Real-time monitoring of streams and SCTE-35 activity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>• Real-time metrics</div>
                      <div>• Stream health</div>
                      <div>• SCTE-35 tracking</div>
                      <div>• Quality monitoring</div>
                      <div>• Alert system</div>
                      <div>• Performance analytics</div>
                    </div>
                    <Button className="w-full mt-4">
                      Open Live Monitor
                    </Button>
                  </CardContent>
                </Link>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                    <CardTitle>Analytics Dashboard</CardTitle>
                  </div>
                  <CardDescription>
                    Comprehensive analytics and reporting for broadcast operations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>• Historical data</div>
                    <div>• Performance trends</div>
                    <div>• Error analysis</div>
                    <div>• Capacity planning</div>
                    <div>• Export reports</div>
                    <div>• Custom dashboards</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>System Status Overview</CardTitle>
                <CardDescription>
                  Current system status and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-green-600">98%</div>
                    <div className="text-sm text-muted-foreground">System Health</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-muted-foreground">Active Streams</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-purple-600">24</div>
                    <div className="text-sm text-muted-foreground">SCTE-35 Events</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-2xl font-bold text-orange-600">24h</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used features and tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/encoder">
                <Button variant="outline" className="w-full">
                  <Radio className="w-4 h-4 mr-2" />
                  Encode SCTE-35
                </Button>
              </Link>
              <Link href="/stream-injection">
                <Button variant="outline" className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Start Stream
                </Button>
              </Link>
              <Link href="/monitor">
                <Button variant="outline" className="w-full">
                  <Monitor className="w-4 h-4 mr-2" />
                  View Monitor
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}