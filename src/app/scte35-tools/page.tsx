"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Upload, Download, FileVideo, Radio, Settings, Zap, Activity, Monitor, Database, Network } from "lucide-react";
import FFmpegCommandBuilder from "@/components/ffmpeg-command-builder";

export default function SCTE35Tools() {
  const [activeTab, setActiveTab] = useState("converter");
  const [inputData, setInputData] = useState("");
  const [inputFormat, setInputFormat] = useState<"base64" | "hex" | "bin">("base64");
  const [outputData, setOutputData] = useState("");
  const [outputFormat, setOutputFormat] = useState<"base64" | "hex" | "bin" | "json">("json");
  const [scte35File, setScte35File] = useState<File | null>(null);

  const handleConvert = async () => {
    try {
      const response = await fetch("/api/scte35/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: inputData,
          inputFormat,
          outputFormat
        }),
      });

      if (!response.ok) {
        throw new Error("Conversion failed");
      }

      const result = await response.json();
      setOutputData(result.data);
    } catch (error) {
      console.error("Error converting SCTE-35:", error);
      setOutputData("Error converting SCTE-35 data");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setScte35File(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInputData(content);
      };
      reader.readAsText(file);
    }
  };

  const downloadOutput = () => {
    if (!outputData) return;
    
    let mimeType = "text/plain";
    let extension = "txt";
    
    switch (outputFormat) {
      case "base64":
        mimeType = "text/plain";
        extension = "b64";
        break;
      case "hex":
        mimeType = "text/plain";
        extension = "hex";
        break;
      case "bin":
        mimeType = "application/octet-stream";
        extension = "bin";
        break;
      case "json":
        mimeType = "application/json";
        extension = "json";
        break;
    }

    const blob = new Blob([outputData], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scte35.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateSampleData = () => {
    const sampleData = "/DAvAAAAAAAAAP/wFAUAAAABf+/+AItfZn4AKTLgAAEAAAAWAhRDVUVJAAAAAX//AAApMuABACIBAIoXZrM=";
    setInputData(sampleData);
    setInputFormat("base64");
  };

  return (
    <div className="medialive-container">
      {/* AWS MediaLive-style Header */}
      <div className="bg-gradient-to-r from-[#16191f] to-[#0f1419] border-b border-[#232f3e] px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm" className="medialive-button medialive-button-secondary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#ff9900] to-[#ff8800] rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-[#0f1419]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">SCTE-35 Tools</h1>
                  <p className="text-sm text-[#a0aec0]">AWS Elemental MediaLive Compatible</p>
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="medialive-tabs w-full">
          <TabsList className="flex w-full bg-[#16191f] border border-[#232f3e] rounded-lg p-1">
            <TabsTrigger 
              value="converter" 
              className="medialive-tab flex-1 data-[state=active]:bg-[#ff9900] data-[state=active]:text-[#0f1419] data-[state=active]:font-semibold"
            >
              Data Converter
            </TabsTrigger>
            <TabsTrigger 
              value="analyzer" 
              className="medialive-tab flex-1 data-[state=active]:bg-[#ff9900] data-[state=active]:text-[#0f1419] data-[state=active]:font-semibold"
            >
              Analyzer
            </TabsTrigger>
            <TabsTrigger 
              value="generator" 
              className="medialive-tab flex-1 data-[state=active]:bg-[#ff9900] data-[state=active]:text-[#0f1419] data-[state=active]:font-semibold"
            >
              Generator
            </TabsTrigger>
            <TabsTrigger 
              value="ffmpeg" 
              className="medialive-tab flex-1 data-[state=active]:bg-[#ff9900] data-[state=active]:text-[#0f1419] data-[state=active]:font-semibold"
            >
              FFmpeg Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="converter" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Panel */}
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">Input Data</h2>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    Convert SCTE-35 data between different formats
                  </p>
                </div>
                <div className="medialive-panel-content space-y-4">
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Upload SCTE-35 File</label>
                    <input
                      type="file"
                      accept=".bin,.b64,.hex,.json"
                      onChange={handleFileUpload}
                      className="medialive-input"
                    />
                  </div>

                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Input Format</label>
                    <Select value={inputFormat} onValueChange={(value: any) => setInputFormat(value)}>
                      <SelectTrigger className="medialive-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base64">Base64</SelectItem>
                        <SelectItem value="hex">Hexadecimal</SelectItem>
                        <SelectItem value="bin">Binary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Input Data</label>
                    <textarea
                      value={inputData}
                      onChange={(e) => setInputData(e.target.value)}
                      placeholder="Paste SCTE-35 data here..."
                      rows={8}
                      className="medialive-textarea medialive-scrollbar font-mono text-sm"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <button onClick={generateSampleData} className="medialive-button medialive-button-secondary">
                      Load Sample
                    </button>
                    <button onClick={handleConvert} disabled={!inputData} className={`medialive-button medialive-button-primary flex-1 ${!inputData ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      Convert
                    </button>
                  </div>
                </div>
              </div>

              {/* Output Panel */}
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <div className="flex items-center space-x-2">
                    <Download className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">Output Data</h2>
                  </div>
                  <p className="medialive-panel-subtitle mt-1">
                    Converted SCTE-35 data in selected format
                  </p>
                </div>
                <div className="medialive-panel-content space-y-4">
                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Output Format</label>
                    <Select value={outputFormat} onValueChange={(value: any) => setOutputFormat(value)}>
                      <SelectTrigger className="medialive-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base64">Base64</SelectItem>
                        <SelectItem value="hex">Hexadecimal</SelectItem>
                        <SelectItem value="bin">Binary</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="medialive-form-group">
                    <label className="medialive-form-label">Output Data</label>
                    <textarea
                      value={outputData}
                      readOnly
                      placeholder="Converted data will appear here..."
                      rows={8}
                      className="medialive-textarea medialive-scrollbar font-mono text-sm"
                    />
                  </div>

                  {outputData && (
                    <div className="flex justify-between items-center">
                      <Badge className="medialive-badge">
                        {outputData.length} characters
                      </Badge>
                      <button onClick={downloadOutput} className="medialive-button medialive-button-secondary">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analyzer" className="space-y-6">
            <div className="medialive-panel rounded-lg">
              <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-[#ff9900]" />
                  <h2 className="medialive-panel-title">SCTE-35 Analyzer</h2>
                </div>
                <p className="medialive-panel-subtitle mt-1">
                  Parse and analyze SCTE-35 data structure
                </p>
              </div>
              <div className="medialive-panel-content space-y-4">
                <div className="medialive-form-group">
                  <label className="medialive-form-label">SCTE-35 Data (Base64)</label>
                  <textarea
                    placeholder="Paste SCTE-35 data to analyze..."
                    rows={6}
                    className="medialive-textarea medialive-scrollbar font-mono text-sm"
                  />
                </div>
                
                <button className="medialive-button medialive-button-primary">
                  Analyze SCTE-35
                </button>
                
                <div className="bg-[#1a252f] border border-[#232f3e] rounded-lg p-4">
                  <h4 className="font-medium text-white mb-3">Analysis Results</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#a0aec0]">Table ID</span>
                      <span className="text-white">0xFC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0aec0]">Section Length</span>
                      <span className="text-white">42 bytes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0aec0]">Protocol Version</span>
                      <span className="text-white">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0aec0]">Command Type</span>
                      <Badge className="medialive-badge">Splice Insert (5)</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0aec0]">Splice Event ID</span>
                      <span className="text-white">1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0aec0]">Out of Network</span>
                      <Badge className="medialive-badge medialive-badge-success">false</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0aec0]">Program Splice</span>
                      <Badge className="medialive-badge medialive-badge-success">true</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a0aec0]">Duration Flag</span>
                      <Badge className="medialive-badge medialive-badge-success">false</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="generator" className="space-y-6">
            <div className="medialive-panel rounded-lg">
              <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <Radio className="w-5 h-5 text-[#ff9900]" />
                  <h2 className="medialive-panel-title">SCTE-35 Generator</h2>
                </div>
                <p className="medialive-panel-subtitle mt-1">
                  Generate SCTE-35 cues for common scenarios
                </p>
              </div>
              <div className="medialive-panel-content space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Ad Break Templates</h3>
                    
                    <div className="space-y-2">
                      <button className="medialive-button medialive-button-secondary w-full justify-start">
                        <FileVideo className="w-4 h-4 mr-2" />
                        Pre-roll Ad (30s)
                      </button>
                      <button className="medialive-button medialive-button-secondary w-full justify-start">
                        <FileVideo className="w-4 h-4 mr-2" />
                        Mid-roll Ad (60s)
                      </button>
                      <button className="medialive-button medialive-button-secondary w-full justify-start">
                        <FileVideo className="w-4 h-4 mr-2" />
                        Post-roll Ad (15s)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Program Templates</h3>
                    
                    <div className="space-y-2">
                      <button className="medialive-button medialive-button-secondary w-full justify-start">
                        <Radio className="w-4 h-4 mr-2" />
                        Program Start
                      </button>
                      <button className="medialive-button medialive-button-secondary w-full justify-start">
                        <Radio className="w-4 h-4 mr-2" />
                        Program End
                      </button>
                      <button className="medialive-button medialive-button-secondary w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Time Signal
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Custom Generator</h3>
                  <div className="medialive-form-row-3">
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Event Type</label>
                      <Select>
                        <SelectTrigger className="medialive-select">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="splice-insert">Splice Insert</SelectItem>
                          <SelectItem value="time-signal">Time Signal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Duration (seconds)</label>
                      <input type="number" placeholder="30" className="medialive-input" />
                    </div>
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Event ID</label>
                      <input type="number" placeholder="1" className="medialive-input" />
                    </div>
                  </div>
                  
                  <button className="medialive-button medialive-button-primary">
                    Generate Custom SCTE-35
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ffmpeg" className="space-y-6">
            <FFmpegCommandBuilder />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}