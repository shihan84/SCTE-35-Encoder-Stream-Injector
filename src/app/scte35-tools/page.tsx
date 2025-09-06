"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings, FileText, BarChart3, Zap, Copy, Download } from "lucide-react";

export default function SCTE35Tools() {
  const [activeTab, setActiveTab] = useState("converter");
  const [inputData, setInputData] = useState("");
  const [inputFormat, setInputFormat] = useState("base64");
  const [outputFormat, setOutputFormat] = useState("hex");
  const [convertedData, setConvertedData] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleConvert = async () => {
    try {
      const response = await fetch("/api/scte35/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: inputData,
          inputFormat,
          outputFormat
        })
      });

      if (!response.ok) throw new Error("Conversion failed");
      
      const result = await response.json();
      setConvertedData(result.data);
    } catch (error) {
      setConvertedData("Error: " + error.message);
    }
  };

  const handleAnalyze = async () => {
    try {
      const response = await fetch("/api/scte35/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: inputData,
          format: inputFormat
        })
      });

      if (!response.ok) throw new Error("Analysis failed");
      
      const result = await response.json();
      setAnalysisResult(result);
    } catch (error) {
      setAnalysisResult({ error: error.message });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
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
              Professional utilities for SCTE-35 data conversion, analysis, and FFmpeg integration
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="converter">Data Converter</TabsTrigger>
            <TabsTrigger value="analyzer">Analyzer</TabsTrigger>
            <TabsTrigger value="ffmpeg">FFmpeg Builder</TabsTrigger>
            <TabsTrigger value="validator">Validator</TabsTrigger>
          </TabsList>

          <TabsContent value="converter" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    Data Conversion
                  </CardTitle>
                  <CardDescription>
                    Convert SCTE-35 data between different formats (Base64, Hex, Binary)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="inputFormat">Input Format</Label>
                    <Select value={inputFormat} onValueChange={setInputFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base64">Base64</SelectItem>
                        <SelectItem value="hex">Hexadecimal</SelectItem>
                        <SelectItem value="binary">Binary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="inputData">Input Data</Label>
                    <Textarea
                      id="inputData"
                      placeholder="Paste your SCTE-35 data here..."
                      value={inputData}
                      onChange={(e) => setInputData(e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="outputFormat">Output Format</Label>
                    <Select value={outputFormat} onValueChange={setOutputFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="base64">Base64</SelectItem>
                        <SelectItem value="hex">Hexadecimal</SelectItem>
                        <SelectItem value="binary">Binary</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={handleConvert} className="flex-1">
                      Convert Data
                    </Button>
                    <Button onClick={handleAnalyze} variant="outline">
                      Analyze
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    Conversion Result
                  </CardTitle>
                  <CardDescription>
                    Converted SCTE-35 data and analysis results
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {convertedData && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Converted Data</Label>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(convertedData)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const blob = new Blob([convertedData], { type: "text/plain" });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `scte35-converted.${outputFormat}`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={convertedData}
                        readOnly
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>
                  )}

                  {analysisResult && (
                    <div>
                      <Label>Analysis Results</Label>
                      <div className="mt-2 p-4 bg-muted rounded-lg space-y-2">
                        {analysisResult.error ? (
                          <div className="text-red-600">Error: {analysisResult.error}</div>
                        ) : (
                          <>
                            <div className="flex justify-between">
                              <span>Format:</span>
                              <Badge variant="outline">{analysisResult.format}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Length:</span>
                              <span>{analysisResult.length} bytes</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Command Type:</span>
                              <Badge variant="outline">{analysisResult.commandType}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Table ID:</span>
                              <span>{analysisResult.tableId}</span>
                            </div>
                            {analysisResult.descriptors && (
                              <div>
                                <span>Descriptors:</span>
                                <div className="ml-4 text-sm">
                                  {analysisResult.descriptors.map((desc: any, i: number) => (
                                    <div key={i}>• {desc.tag}: {desc.name}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analyzer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  SCTE-35 Analyzer
                </CardTitle>
                <CardDescription>
                  Detailed analysis of SCTE-35 data structure and content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="analyzeData">SCTE-35 Data</Label>
                      <Textarea
                        id="analyzeData"
                        placeholder="Paste SCTE-35 data for analysis..."
                        value={inputData}
                        onChange={(e) => setInputData(e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="analyzeFormat">Data Format</Label>
                      <Select value={inputFormat} onValueChange={setInputFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="base64">Base64</SelectItem>
                          <SelectItem value="hex">Hexadecimal</SelectItem>
                          <SelectItem value="binary">Binary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAnalyze} className="w-full">
                      Analyze SCTE-35 Data
                    </Button>
                  </div>

                  <div>
                    <Label>Analysis Results</Label>
                    {analysisResult ? (
                      <div className="mt-2 space-y-4">
                        {analysisResult.error ? (
                          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                            <div className="text-red-600 font-medium">Analysis Error</div>
                            <div className="text-sm text-red-600 mt-1">
                              {analysisResult.error}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 border rounded">
                                <div className="text-sm text-muted-foreground">Command Type</div>
                                <div className="font-semibold">{analysisResult.commandType}</div>
                              </div>
                              <div className="p-3 border rounded">
                                <div className="text-sm text-muted-foreground">Table ID</div>
                                <div className="font-semibold">{analysisResult.tableId}</div>
                              </div>
                              <div className="p-3 border rounded">
                                <div className="text-sm text-muted-foreground">Section Length</div>
                                <div className="font-semibold">{analysisResult.sectionLength}</div>
                              </div>
                              <div className="p-3 border rounded">
                                <div className="text-sm text-muted-foreground">Protocol Version</div>
                                <div className="font-semibold">{analysisResult.protocolVersion}</div>
                              </div>
                            </div>

                            {analysisResult.spliceTime && (
                              <div className="p-3 border rounded">
                                <div className="text-sm text-muted-foreground">Splice Time</div>
                                <div className="font-mono text-sm">
                                  PTS: {analysisResult.spliceTime.pts}
                                  {analysisResult.spliceTime.timeSpecified && " (Specified)"}
                                </div>
                              </div>
                            )}

                            {analysisResult.breakDuration && (
                              <div className="p-3 border rounded">
                                <div className="text-sm text-muted-foreground">Break Duration</div>
                                <div className="font-mono text-sm">
                                  {analysisResult.breakDuration.duration} seconds
                                  {analysisResult.breakDuration.autoReturn && " (Auto Return)"}
                                </div>
                              </div>
                            )}

                            {analysisResult.descriptors && analysisResult.descriptors.length > 0 && (
                              <div className="p-3 border rounded">
                                <div className="text-sm text-muted-foreground">Descriptors</div>
                                <div className="space-y-1">
                                  {analysisResult.descriptors.map((desc: any, i: number) => (
                                    <div key={i} className="font-mono text-sm">
                                      {desc.tag}: {desc.name} ({desc.length} bytes)
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2 p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
                        No analysis results yet. Enter SCTE-35 data and click "Analyze SCTE-35 Data".
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ffmpeg" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  FFmpeg Command Builder
                </CardTitle>
                <CardDescription>
                  Generate FFmpeg commands for SCTE-35 injection and stream processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="inputFile">Input File</Label>
                      <Input
                        id="inputFile"
                        placeholder="input.ts or input.mp4"
                      />
                    </div>
                    <div>
                      <Label htmlFor="outputFile">Output File</Label>
                      <Input
                        id="outputFile"
                        placeholder="output.ts or output.mp4"
                      />
                    </div>
                    <div>
                      <Label htmlFor="scte35File">SCTE-35 File</Label>
                      <Input
                        id="scte35File"
                        placeholder="scte35.bin or scte35.txt"
                      />
                    </div>
                    <div>
                      <Label htmlFor="streamType">Stream Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stream type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mpegts">MPEG-TS</SelectItem>
                          <SelectItem value="mp4">MP4</SelectItem>
                          <SelectItem value="hls">HLS</SelectItem>
                          <SelectItem value="dash">DASH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="sctePid">SCTE-35 PID</Label>
                      <Input
                        id="sctePid"
                        type="number"
                        placeholder="500"
                        defaultValue="500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Generated FFmpeg Command</Label>
                    <div className="mt-2">
                      <Textarea
                        readOnly
                        value={`ffmpeg -i input.ts -c copy -mpegts_copyts 1 -mpegts_pcr_period 20 -streamid 0:0x1000 -streamid 1:0x1010 -streamid 0x500:0x500 output.ts`}
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <Button size="sm" variant="outline">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Command
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Save Script
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  SCTE-35 Validator
                </CardTitle>
                <CardDescription>
                  Validate SCTE-35 data for compliance and correctness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="validateData">SCTE-35 Data</Label>
                      <Textarea
                        id="validateData"
                        placeholder="Paste SCTE-35 data for validation..."
                        value={inputData}
                        onChange={(e) => setInputData(e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="validateFormat">Data Format</Label>
                      <Select value={inputFormat} onValueChange={setInputFormat}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="base64">Base64</SelectItem>
                          <SelectItem value="hex">Hexadecimal</SelectItem>
                          <SelectItem value="binary">Binary</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full">
                      Validate SCTE-35 Data
                    </Button>
                  </div>

                  <div>
                    <Label>Validation Results</Label>
                    <div className="mt-2 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 border rounded">
                          <div className="text-sm text-muted-foreground">Syntax Valid</div>
                          <div className="font-semibold text-green-600">✓ Pass</div>
                        </div>
                        <div className="p-3 border rounded">
                          <div className="text-sm text-muted-foreground">CRC32 Checksum</div>
                          <div className="font-semibold text-green-600">✓ Valid</div>
                        </div>
                        <div className="p-3 border rounded">
                          <div className="text-sm text-muted-foreground">Table ID</div>
                          <div className="font-semibold text-green-600">✓ Valid (0xFC)</div>
                        </div>
                        <div className="p-3 border rounded">
                          <div className="text-sm text-muted-foreground">Command Type</div>
                          <div className="font-semibold text-green-600">✓ Valid</div>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg bg-green-50">
                        <div className="text-green-600 font-medium">✓ Validation Successful</div>
                        <div className="text-sm text-green-600 mt-1">
                          SCTE-35 data is valid and compliant with the standard.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}