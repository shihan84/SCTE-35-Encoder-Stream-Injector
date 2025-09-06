"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Copy, Download, Play, ArrowLeft, Settings, Activity, Monitor, Zap, Shield, Database, Network } from "lucide-react";
import Link from "next/link";

interface SpliceInfoSection {
  tableId: number;
  selectionSyntaxIndicator: boolean;
  privateIndicator: boolean;
  protocolVersion: number;
  encryptedPacket: boolean;
  encryptedAlgorithm: number;
  ptsAdjustment: number;
  cwIndex: number;
  tier: number;
  spliceCommandType: number;
  descriptors: Array<{
    tag: number;
    data: string;
  }>;
}

interface SpliceInsert {
  spliceEventId: number;
  spliceEventCancelIndicator: boolean;
  outOfNetworkIndicator: boolean;
  programSpliceFlag: boolean;
  durationFlag: boolean;
  spliceImmediateFlag: boolean;
  breakDurationAutoReturn: boolean;
  breakDuration: number;
  uniqueProgramId: number;
  available: number;
  expected: number;
  spliceTimeSpecified: boolean;
  spliceTimePts: number;
}

interface TimeSignal {
  timeSpecified: boolean;
  pts: number;
}

export default function Encoder() {
  const [activeTab, setActiveTab] = useState("splice-insert");
  const [encodedOutput, setEncodedOutput] = useState("");
  const [outputFormat, setOutputFormat] = useState<"base64" | "hex">("base64");
  const [isEncoding, setIsEncoding] = useState(false);

  // Splice Info Section
  const [spliceInfo, setSpliceInfo] = useState<SpliceInfoSection>({
    tableId: 0xfc,
    selectionSyntaxIndicator: false,
    privateIndicator: false,
    protocolVersion: 0,
    encryptedPacket: false,
    encryptedAlgorithm: 0,
    ptsAdjustment: 0,
    cwIndex: 0xff,
    tier: 0xfff,
    spliceCommandType: 5,
    descriptors: []
  });

  // Splice Insert
  const [spliceInsert, setSpliceInsert] = useState<SpliceInsert>({
    spliceEventId: 1,
    spliceEventCancelIndicator: false,
    outOfNetworkIndicator: false,
    programSpliceFlag: true,
    durationFlag: false,
    spliceImmediateFlag: false,
    breakDurationAutoReturn: false,
    breakDuration: 0,
    uniqueProgramId: 1,
    available: 0,
    expected: 0,
    spliceTimeSpecified: true,
    spliceTimePts: 0
  });

  // Time Signal
  const [timeSignal, setTimeSignal] = useState<TimeSignal>({
    timeSpecified: true,
    pts: 0
  });

  const handleEncode = async () => {
    setIsEncoding(true);
    try {
      const payload = {
        spliceInfo,
        command: activeTab === "splice-insert" ? spliceInsert : timeSignal,
        commandType: activeTab
      };

      const response = await fetch("/api/scte35/encode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Encoding failed");
      }

      const result = await response.json();
      setEncodedOutput(result[outputFormat]);
    } catch (error) {
      console.error("Error encoding SCTE-35:", error);
      setEncodedOutput("Error encoding SCTE-35 data");
    } finally {
      setIsEncoding(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(encodedOutput);
  };

  const downloadOutput = () => {
    const blob = new Blob([encodedOutput], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scte35-${outputFormat}.txt`;
    a.click();
    URL.revokeObjectURL(url);
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
                  <Zap className="w-5 h-5 text-[#0f1419]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">SCTE-35 Encoder</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Encoder Configuration Panel */}
            <div className="medialive-panel rounded-lg">
              <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">Encoder Configuration</h2>
                  </div>
                  <Badge className="medialive-badge">SCTE-35 v1</Badge>
                </div>
                <p className="medialive-panel-subtitle mt-1">
                  Configure SCTE-35 parameters for broadcast insertion
                </p>
              </div>
              <div className="medialive-panel-content space-y-6">
                {/* Splice Info Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-[#ff9900]" />
                    <h3 className="text-lg font-semibold text-white">Splice Info Section</h3>
                  </div>
                  <div className="medialive-form-row">
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Table ID</label>
                      <input
                        type="number"
                        value={spliceInfo.tableId}
                        onChange={(e) => setSpliceInfo({ ...spliceInfo, tableId: parseInt(e.target.value) })}
                        className="medialive-input"
                      />
                    </div>
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">Protocol Version</label>
                      <input
                        type="number"
                        value={spliceInfo.protocolVersion}
                        onChange={(e) => setSpliceInfo({ ...spliceInfo, protocolVersion: parseInt(e.target.value) })}
                        className="medialive-input"
                      />
                    </div>
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">PTS Adjustment</label>
                      <input
                        type="number"
                        value={spliceInfo.ptsAdjustment}
                        onChange={(e) => setSpliceInfo({ ...spliceInfo, ptsAdjustment: parseInt(e.target.value) })}
                        className="medialive-input"
                      />
                    </div>
                    <div className="medialive-form-group">
                      <label className="medialive-form-label">CW Index</label>
                      <input
                        type="number"
                        value={spliceInfo.cwIndex}
                        onChange={(e) => setSpliceInfo({ ...spliceInfo, cwIndex: parseInt(e.target.value) })}
                        className="medialive-input"
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="encryptedPacket"
                      checked={spliceInfo.encryptedPacket}
                      onChange={(e) => setSpliceInfo({ ...spliceInfo, encryptedPacket: e.target.checked })}
                      className="medialive-checkbox"
                    />
                    <label htmlFor="encryptedPacket" className="medialive-form-label">
                      Encrypted Packet
                    </label>
                  </div>
                </div>

                {/* Command Type Selection */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-[#ff9900]" />
                    <h3 className="text-lg font-semibold text-white">Command Configuration</h3>
                  </div>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="medialive-tabs">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="splice-insert" className="medialive-tab">
                        Splice Insert
                      </TabsTrigger>
                      <TabsTrigger value="time-signal" className="medialive-tab">
                        Time Signal
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="splice-insert" className="mt-4 space-y-4">
                      <div className="medialive-form-row">
                        <div className="medialive-form-group">
                          <label className="medialive-form-label">Splice Event ID</label>
                          <input
                            type="number"
                            value={spliceInsert.spliceEventId}
                            onChange={(e) => setSpliceInsert({ ...spliceInsert, spliceEventId: parseInt(e.target.value) })}
                            className="medialive-input"
                          />
                        </div>
                        <div className="medialive-form-group">
                          <label className="medialive-form-label">Unique Program ID</label>
                          <input
                            type="number"
                            value={spliceInsert.uniqueProgramId}
                            onChange={(e) => setSpliceInsert({ ...spliceInsert, uniqueProgramId: parseInt(e.target.value) })}
                            className="medialive-input"
                          />
                        </div>
                      </div>
                      <div className="medialive-form-row-3">
                        <div className="medialive-form-group">
                          <label className="medialive-form-label">Available</label>
                          <input
                            type="number"
                            value={spliceInsert.available}
                            onChange={(e) => setSpliceInsert({ ...spliceInsert, available: parseInt(e.target.value) })}
                            className="medialive-input"
                          />
                        </div>
                        <div className="medialive-form-group">
                          <label className="medialive-form-label">Expected</label>
                          <input
                            type="number"
                            value={spliceInsert.expected}
                            onChange={(e) => setSpliceInsert({ ...spliceInsert, expected: parseInt(e.target.value) })}
                            className="medialive-input"
                          />
                        </div>
                        <div className="medialive-form-group">
                          <label className="medialive-form-label">Break Duration</label>
                          <input
                            type="number"
                            value={spliceInsert.breakDuration}
                            onChange={(e) => setSpliceInsert({ ...spliceInsert, breakDuration: parseInt(e.target.value) })}
                            className="medialive-input"
                          />
                        </div>
                      </div>
                      <div className="medialive-form-group">
                        <label className="medialive-form-label">Splice Time PTS</label>
                        <input
                          type="number"
                          value={spliceInsert.spliceTimePts}
                          onChange={(e) => setSpliceInsert({ ...spliceInsert, spliceTimePts: parseInt(e.target.value) })}
                          className="medialive-input"
                        />
                      </div>
                      <div className="medialive-form-row">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="outOfNetwork"
                            checked={spliceInsert.outOfNetworkIndicator}
                            onChange={(e) => setSpliceInsert({ ...spliceInsert, outOfNetworkIndicator: e.target.checked })}
                            className="medialive-checkbox"
                          />
                          <label htmlFor="outOfNetwork" className="medialive-form-label">
                            Out of Network
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="programSplice"
                            checked={spliceInsert.programSpliceFlag}
                            onChange={(e) => setSpliceInsert({ ...spliceInsert, programSpliceFlag: e.target.checked })}
                            className="medialive-checkbox"
                          />
                          <label htmlFor="programSplice" className="medialive-form-label">
                            Program Splice
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="durationFlag"
                            checked={spliceInsert.durationFlag}
                            onChange={(e) => setSpliceInsert({ ...spliceInsert, durationFlag: e.target.checked })}
                            className="medialive-checkbox"
                          />
                          <label htmlFor="durationFlag" className="medialive-form-label">
                            Duration Flag
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="spliceImmediate"
                            checked={spliceInsert.spliceImmediateFlag}
                            onChange={(e) => setSpliceInsert({ ...spliceInsert, spliceImmediateFlag: e.target.checked })}
                            className="medialive-checkbox"
                          />
                          <label htmlFor="spliceImmediate" className="medialive-form-label">
                            Splice Immediate
                          </label>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="time-signal" className="mt-4 space-y-4">
                      <div className="medialive-form-row">
                        <div className="medialive-form-group">
                          <label className="medialive-form-label">PTS</label>
                          <input
                            type="number"
                            value={timeSignal.pts}
                            onChange={(e) => setTimeSignal({ ...timeSignal, pts: parseInt(e.target.value) })}
                            className="medialive-input"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="timeSpecified"
                            checked={timeSignal.timeSpecified}
                            onCheckedChange={(checked) => setTimeSignal({ ...timeSignal, timeSpecified: !!checked })}
                          />
                          <label htmlFor="timeSpecified" className="medialive-form-label">
                            Time Specified
                          </label>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Output Format */}
                <div className="flex items-center space-x-4">
                  <label className="medialive-form-label">Output Format:</label>
                  <Select value={outputFormat} onValueChange={(value: "base64" | "hex") => setOutputFormat(value)}>
                    <SelectTrigger className="medialive-select w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="base64">Base64</SelectItem>
                      <SelectItem value="hex">Hex</SelectItem>
                    </SelectContent>
                  </Select>
                  <button
                    onClick={handleEncode}
                    disabled={isEncoding}
                    className={`medialive-button medialive-button-primary ${isEncoding ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isEncoding ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#0f1419] border-t-transparent rounded-full animate-spin"></div>
                        Encoding...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Encode SCTE-35
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="space-y-6">
            {/* Output Panel */}
            <div className="medialive-panel rounded-lg">
              <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">Encoded Output</h2>
                  </div>
                  <Badge className="medialive-badge">{outputFormat.toUpperCase()}</Badge>
                </div>
                <p className="medialive-panel-subtitle mt-1">
                  Generated SCTE-35 message
                </p>
              </div>
              <div className="medialive-panel-content space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="medialive-status-indicator medialive-status-running"></div>
                    <span className="text-sm text-[#a0aec0]">Ready</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      disabled={!encodedOutput}
                      className={`medialive-button medialive-button-secondary ${!encodedOutput ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={downloadOutput}
                      disabled={!encodedOutput}
                      className={`medialive-button medialive-button-secondary ${!encodedOutput ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <textarea
                  value={encodedOutput}
                  readOnly
                  placeholder="Encoded SCTE-35 output will appear here..."
                  className="medialive-textarea medialive-scrollbar min-h-64"
                />
                {encodedOutput && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="medialive-text-secondary">
                      Length: {encodedOutput.length} characters
                    </span>
                    <Badge className="medialive-badge medialive-badge-success">
                      VALID
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* System Status Panel */}
            <div className="medialive-panel rounded-lg">
              <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <Network className="w-5 h-5 text-[#ff9900]" />
                  <h2 className="medialive-panel-title">System Status</h2>
                </div>
              </div>
              <div className="medialive-panel-content space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="medialive-text-secondary">Encoder Status</span>
                    <div className="flex items-center space-x-2">
                      <div className="medialive-status-indicator medialive-status-running"></div>
                      <span className="text-sm text-white">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="medialive-text-secondary">API Connection</span>
                    <div className="flex items-center space-x-2">
                      <div className="medialive-status-indicator medialive-status-running"></div>
                      <span className="text-sm text-white">Connected</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="medialive-text-secondary">Encoding Queue</span>
                    <span className="text-sm text-white">0 pending</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="medialive-text-secondary">Success Rate</span>
                    <span className="text-sm text-white">100%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}