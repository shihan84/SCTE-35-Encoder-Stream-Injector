"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Radio, Settings, Zap, Activity, Shield, Database, Network, Monitor } from "lucide-react";

export default function Home() {
  return (
    <div className="medialive-container">
      {/* AWS MediaLive-style Header */}
      <div className="bg-gradient-to-r from-[#16191f] to-[#0f1419] border-b border-[#232f3e] px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#ff9900] to-[#ff8800] rounded-lg flex items-center justify-center">
                  <Zap className="w-8 h-8 text-[#0f1419]" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">SCTE-35 Encoder & Stream Injector</h1>
                  <p className="text-lg text-[#a0aec0] mt-1">AWS Elemental MediaLive Compatible</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="medialive-status-indicator medialive-status-running"></div>
                <span className="text-sm text-[#a0aec0]">System Active</span>
              </div>
              <Badge className="medialive-badge medialive-badge-success">PRODUCTION READY</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-12">
          <h2 className="text-3xl font-bold text-white">Professional SCTE-35 Solution</h2>
          <p className="text-xl text-[#a0aec0] max-w-3xl mx-auto">
            Enterprise-grade SCTE-35 encoding and real-time stream injection for digital video broadcasting, 
            fully compatible with AWS Elemental MediaLive workflows
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="medialive-panel hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105 cursor-pointer">
            <Link href="/scte35-tools">
              <CardHeader className="medialive-panel-header border-b border-[#232f3e]">
                <div className="flex items-center space-x-2">
                  <Settings className="w-6 h-6 text-[#ff9900]" />
                  <CardTitle className="medialive-panel-title">SCTE-35 Tools</CardTitle>
                </div>
                <CardDescription className="medialive-panel-subtitle">
                  Professional tools for conversion, analysis, and FFmpeg integration
                </CardDescription>
              </CardHeader>
              <CardContent className="medialive-panel-content">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0aec0]">Data Converter</span>
                    <Badge className="medialive-badge">Multi-format</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0aec0]">FFmpeg Builder</span>
                    <Badge className="medialive-badge">Advanced</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0aec0]">Analyzer</span>
                    <Badge className="medialive-badge">Detailed</Badge>
                  </div>
                  <Button className="medialive-button medialive-button-primary w-full mt-4">
                    Open Tools
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="medialive-panel hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105 cursor-pointer">
            <Link href="/encoder">
              <CardHeader className="medialive-panel-header border-b border-[#232f3e]">
                <div className="flex items-center space-x-2">
                  <Radio className="w-6 h-6 text-[#ff9900]" />
                  <CardTitle className="medialive-panel-title">SCTE-35 Encoder</CardTitle>
                </div>
                <CardDescription className="medialive-panel-subtitle">
                  Create and encode SCTE-35 messages with comprehensive configuration options
                </CardDescription>
              </CardHeader>
              <CardContent className="medialive-panel-content">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0aec0]">Splice Insert</span>
                    <Badge className="medialive-badge">Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0aec0]">Time Signal</span>
                    <Badge className="medialive-badge">Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0aec0]">Multiple Formats</span>
                    <Badge className="medialive-badge">Base64/Hex</Badge>
                  </div>
                  <Button className="medialive-button medialive-button-primary w-full mt-4">
                    Open Encoder
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="medialive-panel hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105 cursor-pointer">
            <Link href="/stream-injection">
              <CardHeader className="medialive-panel-header border-b border-[#232f3e]">
                <div className="flex items-center space-x-2">
                  <Zap className="w-6 h-6 text-[#ff9900]" />
                  <CardTitle className="medialive-panel-title">Stream Injection</CardTitle>
                </div>
                <CardDescription className="medialive-panel-subtitle">
                  Real-time SCTE-35 injection into live streams with multiple protocol support
                </CardDescription>
              </CardHeader>
              <CardContent className="medialive-panel-content">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0aec0]">SRT Protocol</span>
                    <Badge className="medialive-badge">Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0aec0]">HLS/DASH</span>
                    <Badge className="medialive-badge">Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0aec0]">RTMP</span>
                    <Badge className="medialive-badge">Supported</Badge>
                  </div>
                  <Button className="medialive-button medialive-button-primary w-full mt-4">
                    Start Streaming
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="medialive-panel hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105 cursor-pointer">
            <Link href="/monitor">
              <CardHeader className="medialive-panel-header border-b border-[#232f3e]">
                <div className="flex items-center space-x-2">
                  <Activity className="w-6 h-6 text-[#ff9900]" />
                  <CardTitle className="medialive-panel-title">Stream Monitor</CardTitle>
                </div>
                <CardDescription className="medialive-panel-subtitle">
                  Monitor stream health, SCTE-35 activity, and injection performance in real-time
                </CardDescription>
              </CardHeader>
              <CardContent className="medialive-panel-content">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0aec0]">Live Monitoring</span>
                    <Badge className="medialive-badge">Real-time</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0aec0]">SCTE-35 Detection</span>
                    <Badge className="medialive-badge">Automatic</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#a0aec0]">Analytics</span>
                    <Badge className="medialive-badge">Detailed</Badge>
                  </div>
                  <Button className="medialive-button medialive-button-primary w-full mt-4">
                    View Monitor
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="medialive-panel mb-12">
          <CardHeader className="medialive-panel-header border-b border-[#232f3e]">
            <CardTitle className="medialive-panel-title">Enterprise Features</CardTitle>
            <CardDescription className="medialive-panel-subtitle">
              Comprehensive SCTE-35 solution for professional broadcasting
            </CardDescription>
          </CardHeader>
          <CardContent className="medialive-panel-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-[#232f3e] to-[#1a252f] rounded-lg flex items-center justify-center mx-auto">
                  <Settings className="w-8 h-8 text-[#ff9900]" />
                </div>
                <h3 className="font-semibold text-white">Easy Configuration</h3>
                <p className="text-sm text-[#a0aec0]">
                  Intuitive interface for configuring SCTE-35 parameters
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-[#232f3e] to-[#1a252f] rounded-lg flex items-center justify-center mx-auto">
                  <Zap className="w-8 h-8 text-[#ff9900]" />
                </div>
                <h3 className="font-semibold text-white">Real-time Injection</h3>
                <p className="text-sm text-[#a0aec0]">
                  Live SCTE-35 insertion into ongoing streams
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-[#232f3e] to-[#1a252f] rounded-lg flex items-center justify-center mx-auto">
                  <Activity className="w-8 h-8 text-[#ff9900]" />
                </div>
                <h3 className="font-semibold text-white">Stream Monitoring</h3>
                <p className="text-sm text-[#a0aec0]">
                  Comprehensive monitoring and analytics
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-[#232f3e] to-[#1a252f] rounded-lg flex items-center justify-center mx-auto">
                  <Radio className="w-8 h-8 text-[#ff9900]" />
                </div>
                <h3 className="font-semibold text-white">Multi-Protocol</h3>
                <p className="text-sm text-[#a0aec0]">
                  Support for SRT, HLS, DASH, and RTMP
                </p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-br from-[#232f3e] to-[#1a252f] rounded-lg flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-[#ff9900]" />
                </div>
                <h3 className="font-semibold text-white">Enterprise Ready</h3>
                <p className="text-sm text-[#a0aec0]">
                  Full compliance with distributor specifications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="medialive-panel">
          <CardHeader className="medialive-panel-header border-b border-[#232f3e]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Network className="w-5 h-5 text-[#ff9900]" />
                <CardTitle className="medialive-panel-title">System Status</CardTitle>
              </div>
              <Badge className="medialive-badge medialive-badge-success">ALL SYSTEMS OPERATIONAL</Badge>
            </div>
          </CardHeader>
          <CardContent className="medialive-panel-content">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="medialive-status-indicator medialive-status-running"></div>
                  <div>
                    <span className="text-sm text-[#a0aec0]">Encoder Service</span>
                    <div className="text-white font-medium">Active</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="medialive-status-indicator medialive-status-running"></div>
                  <div>
                    <span className="text-sm text-[#a0aec0]">Stream Injection</span>
                    <div className="text-white font-medium">Ready</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="medialive-status-indicator medialive-status-running"></div>
                  <div>
                    <span className="text-sm text-[#a0aec0]">API Gateway</span>
                    <div className="text-white font-medium">Connected</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="medialive-status-indicator medialive-status-running"></div>
                  <div>
                    <span className="text-sm text-[#a0aec0]">Database</span>
                    <div className="text-white font-medium">Healthy</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}