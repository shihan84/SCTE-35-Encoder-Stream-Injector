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
import { ArrowLeft, Upload, Download, FileVideo, Radio, Settings } from "lucide-react";
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SCTE-35 Tools</h1>
            <p className="text-muted-foreground">
              Professional tools for SCTE-35 conversion, analysis, and FFmpeg integration
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="converter">Data Converter</TabsTrigger>
            <TabsTrigger value="analyzer">Analyzer</TabsTrigger>
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="ffmpeg">FFmpeg Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="converter" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>Input Data</span>
                  </CardTitle>
                  <CardDescription>
                    Convert SCTE-35 data between different formats
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="fileUpload">Upload SCTE-35 File</Label>
                    <Input
                      id="fileUpload"
                      type="file"
                      accept=".bin,.b64,.hex,.json"
                      onChange={handleFileUpload}
                    />
                  </div>

                  <div>
                    <Label htmlFor="inputFormat">Input Format</Label>
                    <Select value={inputFormat} onValueChange={(value: any) => setInputFormat(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base64">Base64</SelectItem>
                        <SelectItem value="hex">Hexadecimal</SelectItem>
                        <SelectItem value="bin">Binary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="inputData">Input Data</Label>
                    <Textarea
                      id="inputData"
                      value={inputData}
                      onChange={(e) => setInputData(e.target.value)}
                      placeholder="Paste SCTE-35 data here..."
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={generateSampleData} variant="outline" size="sm">
                      Load Sample
                    </Button>
                    <Button onClick={handleConvert} disabled={!inputData} className="flex-1">
                      Convert
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="w-5 h-5" />
                    <span>Output Data</span>
                  </CardTitle>
                  <CardDescription>
                    Converted SCTE-35 data in selected format
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="outputFormat">Output Format</Label>
                    <Select value={outputFormat} onValueChange={(value: any) => setOutputFormat(value)}>
                      <SelectTrigger>
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

                  <div>
                    <Label htmlFor="outputData">Output Data</Label>
                    <Textarea
                      id="outputData"
                      value={outputData}
                      readOnly
                      placeholder="Converted data will appear here..."
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>

                  {outputData && (
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">
                        {outputData.length} characters
                      </Badge>
                      <Button onClick={downloadOutput} variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analyzer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SCTE-35 Analyzer</CardTitle>
                <CardDescription>
                  Parse and analyze SCTE-35 data structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="analyzeData">SCTE-35 Data (Base64)</Label>
                    <Textarea
                      id="analyzeData"
                      placeholder="Paste SCTE-35 data to analyze..."
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <Button>Analyze SCTE-35</Button>
                  
                  <div className="bg-muted p-4 rounded">
                    <h4 className="font-medium mb-2">Analysis Results</h4>
                    <div className="space-y-2 text-sm">
                      <div>Table ID: 0xFC</div>
                      <div>Section Length: 42 bytes</div>
                      <div>Protocol Version: 0</div>
                      <div>Command Type: Splice Insert (5)</div>
                      <div>Splice Event ID: 1</div>
                      <div>Out of Network: false</div>
                      <div>Program Splice: true</div>
                      <div>Duration Flag: false</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SCTE-35 Generator</CardTitle>
                <CardDescription>
                  Generate SCTE-35 cues for common scenarios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Ad Break Templates</h3>
                    
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <FileVideo className="w-4 h-4 mr-2" />
                        Pre-roll Ad (30s)
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileVideo className="w-4 h-4 mr-2" />
                        Mid-roll Ad (60s)
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <FileVideo className="w-4 h-4 mr-2" />
                        Post-roll Ad (15s)
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Program Templates</h3>
                    
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Radio className="w-4 h-4 mr-2" />
                        Program Start
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Radio className="w-4 h-4 mr-2" />
                        Program End
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="w-4 h-4 mr-2" />
                        Time Signal
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Custom Generator</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Event Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="splice-insert">Splice Insert</SelectItem>
                          <SelectItem value="time-signal">Time Signal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Duration (seconds)</Label>
                      <Input type="number" placeholder="30" />
                    </div>
                    <div>
                      <Label>Event ID</Label>
                      <Input type="number" placeholder="1" />
                    </div>
                  </div>
                  
                  <Button className="mt-4">Generate Custom SCTE-35</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ffmpeg" className="space-y-6">
            <FFmpegCommandBuilder />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}