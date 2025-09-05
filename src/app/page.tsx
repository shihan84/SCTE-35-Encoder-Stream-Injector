"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Radio, Settings, Zap, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative w-24 h-24 md:w-32 md:h-32">
              <img
                src="/logo.svg"
                alt="Z.ai Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">SCTE-35 Encoder & Stream Injector</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional SCTE-35 encoding and real-time stream injection for digital video broadcasting
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/scte35-tools">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Settings className="w-6 h-6 text-orange-600" />
                  <CardTitle>SCTE-35 Tools</CardTitle>
                </div>
                <CardDescription>
                  Professional tools for conversion, analysis, and FFmpeg integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Converter</span>
                    <Badge variant="outline">Multi-format</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">FFmpeg Builder</span>
                    <Badge variant="outline">Advanced</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Analyzer</span>
                    <Badge variant="outline">Detailed</Badge>
                  </div>
                  <Button className="w-full mt-4">
                    Open Tools
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/encoder">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Radio className="w-6 h-6 text-blue-600" />
                  <CardTitle>SCTE-35 Encoder</CardTitle>
                </div>
                <CardDescription>
                  Create and encode SCTE-35 messages with comprehensive configuration options
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
                  <Button className="w-full mt-4">
                    Open Encoder
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/stream-injection">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="w-6 h-6 text-green-600" />
                  <CardTitle>Stream Injection</CardTitle>
                </div>
                <CardDescription>
                  Real-time SCTE-35 injection into live streams with multiple protocol support
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
                  <Button className="w-full mt-4">
                    Start Streaming
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/monitor">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Activity className="w-6 h-6 text-purple-600" />
                  <CardTitle>Stream Monitor</CardTitle>
                </div>
                <CardDescription>
                  Monitor stream health, SCTE-35 activity, and injection performance in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Live Monitoring</span>
                    <Badge variant="outline">Real-time</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SCTE-35 Detection</span>
                    <Badge variant="outline">Automatic</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Analytics</span>
                    <Badge variant="outline">Detailed</Badge>
                  </div>
                  <Button className="w-full mt-4">
                    View Monitor
                  </Button>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>Comprehensive SCTE-35 solution for professional broadcasting</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="text-center space-y-2">
                <Settings className="w-8 h-8 mx-auto text-blue-600" />
                <h3 className="font-semibold">Easy Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Intuitive interface for configuring SCTE-35 parameters
                </p>
              </div>
              <div className="text-center space-y-2">
                <Zap className="w-8 h-8 mx-auto text-green-600" />
                <h3 className="font-semibold">Real-time Injection</h3>
                <p className="text-sm text-muted-foreground">
                  Live SCTE-35 insertion into ongoing streams
                </p>
              </div>
              <div className="text-center space-y-2">
                <Activity className="w-8 h-8 mx-auto text-purple-600" />
                <h3 className="font-semibold">Stream Monitoring</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive monitoring and analytics
                </p>
              </div>
              <div className="text-center space-y-2">
                <Radio className="w-8 h-8 mx-auto text-red-600" />
                <h3 className="font-semibold">Multi-Protocol</h3>
                <p className="text-sm text-muted-foreground">
                  Support for SRT, HLS, DASH, and RTMP
                </p>
              </div>
              <div className="text-center space-y-2">
                <Settings className="w-8 h-8 mx-auto text-orange-600" />
                <h3 className="font-semibold">Distributor Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Full compliance with distributor specifications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}