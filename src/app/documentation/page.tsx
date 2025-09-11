"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, FileText, Code, Play, Settings, Monitor, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#16191f] text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#16191f] to-[#0f1419] border-b border-[#232f3e] px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="secondary" className="medialive-button medialive-button-secondary">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#ff9900] to-[#ff8800] rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#0f1419]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Documentation</h1>
                  <p className="text-sm text-white">Complete usage guide and API reference</p>
                </div>
              </div>
            </div>
            <Badge className="medialive-badge bg-green-500/20 text-green-400 border-green-500/30">
              <BookOpen className="w-4 h-4 mr-2" /> Latest
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="quick-start" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#16191f] border border-[#232f3e] rounded-lg p-2 gap-2 mb-8">
            <TabsTrigger 
              value="quick-start" 
              className="medialive-tab data-[state=active]:bg-[#ff9900] data-[state=active]:text-[#0f1419] data-[state=active]:font-semibold px-4 py-2 text-sm"
            >
              <Play className="w-4 h-4 mr-2" /> Quick Start
            </TabsTrigger>
            <TabsTrigger 
              value="step-by-step" 
              className="medialive-tab data-[state=active]:bg-[#ff9900] data-[state=active]:text-[#0f1419] data-[state=active]:font-semibold px-4 py-2 text-sm"
            >
              <FileText className="w-4 h-4 mr-2" /> Step-by-Step
            </TabsTrigger>
            <TabsTrigger 
              value="api-reference" 
              className="medialive-tab data-[state=active]:bg-[#ff9900] data-[state=active]:text-[#0f1419] data-[state=active]:font-semibold px-4 py-2 text-sm"
            >
              <Code className="w-4 h-4 mr-2" /> API Reference
            </TabsTrigger>
            <TabsTrigger 
              value="examples" 
              className="medialive-tab data-[state=active]:bg-[#ff9900] data-[state=active]:text-[#0f1419] data-[state=active]:font-semibold px-4 py-2 text-sm"
            >
              <Settings className="w-4 h-4 mr-2" /> Examples
            </TabsTrigger>
          </TabsList>

          {/* Quick Start Tab */}
          <TabsContent value="quick-start" className="space-y-6">
            <Card className="medialive-panel rounded-xl overflow-hidden">
              <CardHeader className="medialive-panel-header px-8 py-6 bg-gradient-to-r from-[#1a252f] to-[#16191f]">
                <div className="flex items-center space-x-3">
                  <Play className="w-6 h-6 text-[#ff9900]" />
                  <CardTitle className="medialive-panel-title text-xl">Quick Start Guide</CardTitle>
                </div>
                <CardDescription className="medialive-panel-subtitle text-sm mt-2">
                  Get up and running with SCTE-35 Stream Injector in minutes
                </CardDescription>
              </CardHeader>
              <CardContent className="medialive-panel-content p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Prerequisites</h3>
                    <ul className="space-y-2 text-white">
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Node.js 18+ installed</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>FFmpeg installed and in PATH</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Modern web browser</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Installation</h3>
                    <div className="bg-[#16191f] p-4 rounded-lg border border-[#232f3e]">
                      <code className="text-sm text-[#ff9900]">
                        npm install<br/>
                        npm run dev
                      </code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="medialive-panel rounded-xl overflow-hidden">
              <CardHeader className="medialive-panel-header px-8 py-6 bg-gradient-to-r from-[#1a252f] to-[#16191f]">
                <div className="flex items-center space-x-3">
                  <Zap className="w-6 h-6 text-[#ff9900]" />
                  <CardTitle className="medialive-panel-title text-xl">30-Second Pre-roll Example</CardTitle>
                </div>
                <CardDescription className="medialive-panel-subtitle text-sm mt-2">
                  Complete example: HLS input → SRT output with SCTE-35 pre-roll
                </CardDescription>
              </CardHeader>
              <CardContent className="medialive-panel-content p-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#16191f] p-4 rounded-lg border border-[#232f3e]">
                      <h4 className="font-semibold text-white mb-2">1. Stream Setup</h4>
                      <p className="text-sm text-white">Configure input/output URLs</p>
                      <div className="mt-2 text-xs text-[#ff9900]">
                        Input: HLS<br/>
                        Output: SRT
                      </div>
                    </div>
                    <div className="bg-[#16191f] p-4 rounded-lg border border-[#232f3e]">
                      <h4 className="font-semibold text-white mb-2">2. Generate SCTE-35</h4>
                      <p className="text-sm text-white">Create Base64 cue data</p>
                      <div className="mt-2 text-xs text-[#ff9900]">
                        Type: Splice Insert<br/>
                        Duration: 30s
                      </div>
                    </div>
                    <div className="bg-[#16191f] p-4 rounded-lg border border-[#232f3e]">
                      <h4 className="font-semibold text-white mb-2">3. Monitor & Deploy</h4>
                      <p className="text-sm text-white">Start stream and monitor</p>
                      <div className="mt-2 text-xs text-[#ff9900]">
                        Real-time metrics<br/>
                        SCTE-35 detection
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#16191f] p-4 rounded-lg border border-[#232f3e]">
                    <h4 className="font-semibold text-white mb-2">Generated FFmpeg Command</h4>
                    <code className="text-sm text-white block">
                      ffmpeg -i "https://cdn.itassist.one/BREAKING/NEWS/index.m3u8" \<br/>
                      &nbsp;&nbsp;-c:v copy -c:a copy \<br/>
                      &nbsp;&nbsp;-bsf:v "scte35_inject=inject=base64:DATA" \<br/>
                      &nbsp;&nbsp;-f srt "srt://itassist.one:8888?streamid=#!::r=live/live,m=publish"
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step-by-Step Tab */}
          <TabsContent value="step-by-step" className="space-y-6">
            <Card className="medialive-panel rounded-xl overflow-hidden">
              <CardHeader className="medialive-panel-header px-8 py-6 bg-gradient-to-r from-[#1a252f] to-[#16191f]">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-[#ff9900]" />
                  <CardTitle className="medialive-panel-title text-xl">Detailed Step-by-Step Guide</CardTitle>
                </div>
                <CardDescription className="medialive-panel-subtitle text-sm mt-2">
                  Complete walkthrough for 30-second pre-roll SCTE-35 implementation
                </CardDescription>
              </CardHeader>
              <CardContent className="medialive-panel-content p-8">
                <div className="space-y-6">
                  {[
                    {
                      step: 1,
                      title: "Start the Application",
                      description: "Launch the development server and access the dashboard",
                      commands: ["npm run dev", "Open: http://localhost:3000"]
                    },
                    {
                      step: 2,
                      title: "Configure Stream Settings",
                      description: "Set up input/output URLs and stream parameters",
                      details: [
                        "Stream Name: Live_Service",
                        "Input: https://cdn.itassist.one/BREAKING/NEWS/index.m3u8",
                        "Output: srt://itassist.one:8888?streamid=#!::r=live/live,m=publish",
                        "Pre-roll Duration: 30 seconds"
                      ]
                    },
                    {
                      step: 3,
                      title: "Generate SCTE-35 Cue",
                      description: "Create Base64 encoded SCTE-35 data for injection",
                      details: [
                        "Cue Type: Splice Insert",
                        "Event ID: 12345",
                        "Duration: 30 seconds",
                        "Format: Base64"
                      ]
                    },
                    {
                      step: 4,
                      title: "Set Injection Points",
                      description: "Configure when and where to inject SCTE-35 cues",
                      details: [
                        "Time Offset: 0 (immediate)",
                        "SCTE-35 Data: Paste Base64 from Step 3",
                        "Description: 30s Pre-roll Ad"
                      ]
                    },
                    {
                      step: 5,
                      title: "Start Stream Processing",
                      description: "Launch the stream and begin SCTE-35 injection",
                      details: [
                        "Click 'Start Stream' button",
                        "Monitor status indicator",
                        "Watch for 'Running' status"
                      ]
                    },
                    {
                      step: 6,
                      title: "Monitor and Verify",
                      description: "Use Live Monitor to verify SCTE-35 injection",
                      details: [
                        "Check Stream Health: Should show 'Healthy'",
                        "Monitor SCTE-35 Activity: Should detect injected cue",
                        "Verify Timeline: 30-second pre-roll period visible"
                      ]
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-[#ff9900] rounded-full flex items-center justify-center text-[#0f1419] font-bold">
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                        <p className="text-white mb-3">{item.description}</p>
                        {item.commands && (
                          <div className="bg-[#16191f] p-3 rounded-lg border border-[#232f3e] mb-3">
                            {item.commands.map((cmd, i) => (
                              <code key={i} className="text-sm text-[#ff9900] block">{cmd}</code>
                            ))}
                          </div>
                        )}
                        {item.details && (
                          <ul className="space-y-1">
                            {item.details.map((detail, i) => (
                              <li key={i} className="text-sm text-white flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 bg-[#ff9900] rounded-full"></div>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Reference Tab */}
          <TabsContent value="api-reference" className="space-y-6">
            <Card className="medialive-panel rounded-xl overflow-hidden">
              <CardHeader className="medialive-panel-header px-8 py-6 bg-gradient-to-r from-[#1a252f] to-[#16191f]">
                <div className="flex items-center space-x-3">
                  <Code className="w-6 h-6 text-[#ff9900]" />
                  <CardTitle className="medialive-panel-title text-xl">API Reference</CardTitle>
                </div>
                <CardDescription className="medialive-panel-subtitle text-sm mt-2">
                  Complete API documentation for all endpoints
                </CardDescription>
              </CardHeader>
              <CardContent className="medialive-panel-content p-8">
                <div className="space-y-6">
                  {[
                    {
                      method: "GET",
                      endpoint: "/api/health",
                      description: "Check system health status",
                      response: {
                        status: "healthy",
                        timestamp: "2024-01-01T00:00:00Z",
                        uptime: 3600
                      }
                    },
                    {
                      method: "GET",
                      endpoint: "/api/time/sync",
                      description: "Get time synchronization data",
                      response: {
                        serverTime: "2024-01-01T00:00:00Z",
                        offset: 0,
                        accuracy: "high"
                      }
                    },
                    {
                      method: "POST",
                      endpoint: "/api/stream/start",
                      description: "Start stream processing",
                      body: {
                        inputUrl: "string",
                        outputUrl: "string",
                        scte35Data: "string"
                      }
                    },
                    {
                      method: "POST",
                      endpoint: "/api/scte35/generate",
                      description: "Generate SCTE-35 cue data",
                      body: {
                        cueType: "splice_insert",
                        eventId: 12345,
                        duration: 30
                      }
                    }
                  ].map((api, index) => (
                    <div key={index} className="bg-[#16191f] p-6 rounded-lg border border-[#232f3e]">
                      <div className="flex items-center space-x-3 mb-4">
                        <Badge className={`medialive-badge ${
                          api.method === 'GET' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                          api.method === 'POST' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {api.method}
                        </Badge>
                        <code className="text-[#ff9900] font-mono">{api.endpoint}</code>
                      </div>
                      <p className="text-white mb-4">{api.description}</p>
                      {api.body && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-white mb-2">Request Body:</h4>
                          <pre className="bg-[#0f1419] p-3 rounded text-xs text-white overflow-x-auto">
                            {JSON.stringify(api.body, null, 2)}
                          </pre>
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-white mb-2">Response:</h4>
                        <pre className="bg-[#0f1419] p-3 rounded text-xs text-white overflow-x-auto">
                          {JSON.stringify(api.response, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            <Card className="medialive-panel rounded-xl overflow-hidden">
              <CardHeader className="medialive-panel-header px-8 py-6 bg-gradient-to-r from-[#1a252f] to-[#16191f]">
                <div className="flex items-center space-x-3">
                  <Settings className="w-6 h-6 text-[#ff9900]" />
                  <CardTitle className="medialive-panel-title text-xl">Configuration Examples</CardTitle>
                </div>
                <CardDescription className="medialive-panel-subtitle text-sm mt-2">
                  Ready-to-use configuration examples for common scenarios
                </CardDescription>
              </CardHeader>
              <CardContent className="medialive-panel-content p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      title: "30-Second Pre-roll",
                      description: "HLS input with SRT output and pre-roll ad",
                      config: {
                        input: "HLS",
                        output: "SRT",
                        duration: "30s",
                        cueType: "Splice Insert"
                      }
                    },
                    {
                      title: "Mid-roll Ad Break",
                      description: "RTMP input with HLS output and mid-roll ads",
                      config: {
                        input: "RTMP",
                        output: "HLS",
                        duration: "60s",
                        cueType: "Splice Insert"
                      }
                    },
                    {
                      title: "Program Boundary",
                      description: "SRT input with SRT output and program markers",
                      config: {
                        input: "SRT",
                        output: "SRT",
                        duration: "N/A",
                        cueType: "Time Signal"
                      }
                    },
                    {
                      title: "Chapter Markers",
                      description: "HLS input with segmentation cues",
                      config: {
                        input: "HLS",
                        output: "HLS",
                        duration: "Variable",
                        cueType: "Segmentation"
                      }
                    }
                  ].map((example, index) => (
                    <div key={index} className="bg-[#16191f] p-6 rounded-lg border border-[#232f3e]">
                      <h3 className="text-lg font-semibold text-white mb-2">{example.title}</h3>
                      <p className="text-white mb-4">{example.description}</p>
                      <div className="space-y-2">
                        {Object.entries(example.config).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-white">{key}:</span>
                            <span className="text-[#ff9900]">{value}</span>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full mt-4 medialive-button medialive-button-primary">
                        Load Example
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
