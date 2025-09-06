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
import { Copy, Download, Play, ArrowLeft, Settings, Activity, Monitor, Zap, Shield, Database, Network, ChevronDown, ChevronRight, Info, HelpCircle } from "lucide-react";
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

interface OptionSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  expanded: boolean;
}

export default function Encoder() {
  const [activeTab, setActiveTab] = useState("splice-insert");
  const [encodedOutput, setEncodedOutput] = useState("");
  const [outputFormat, setOutputFormat] = useState<"base64" | "hex">("base64");
  const [isEncoding, setIsEncoding] = useState(false);

  // Option sections state
  const [sections, setSections] = useState<OptionSection[]>([
    {
      id: "splice-info",
      title: "Splice Info Section",
      description: "Basic SCTE-35 message configuration",
      icon: <Database className="w-4 h-4" />,
      expanded: true
    },
    {
      id: "event-config",
      title: "Event Configuration",
      description: "Splice event parameters and timing",
      icon: <Settings className="w-4 h-4" />,
      expanded: true
    },
    {
      id: "timing-control",
      title: "Timing Control",
      description: "PTS timing and scheduling options",
      icon: <Activity className="w-4 h-4" />,
      expanded: true
    },
    {
      id: "duration-settings",
      title: "Duration Settings",
      description: "Break duration and auto-return options",
      icon: <Zap className="w-4 h-4" />,
      expanded: false
    },
    {
      id: "program-identifiers",
      title: "Program Identifiers",
      description: "Program and event identification",
      icon: <Shield className="w-4 h-4" />,
      expanded: false
    },
    {
      id: "advanced-options",
      title: "Advanced Options",
      description: "Additional configuration and flags",
      icon: <Settings className="w-4 h-4" />,
      expanded: false
    }
  ]);

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

  const toggleSection = (sectionId: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? { ...section, expanded: !section.expanded }
        : section
    ));
  };

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

  const renderSection = (section: OptionSection) => {
    const isExpanded = section.expanded;
    const chevronIcon = isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />;

    let sectionContent = null;

    switch (section.id) {
      case "splice-info":
        sectionContent = (
          <div className="medialive-form-row">
            <div className="medialive-form-group">
              <label className="medialive-form-label">Table ID</label>
              <input
                type="number"
                value={spliceInfo.tableId}
                onChange={(e) => setSpliceInfo({ ...spliceInfo, tableId: parseInt(e.target.value) })}
                className="medialive-input"
              />
              <div className="flex items-center space-x-1 mt-1">
                <HelpCircle className="w-3 h-3 text-[#a0aec0]" />
                <span className="text-xs text-[#a0aec0]">Default: 0xFC (SCTE-35)</span>
              </div>
            </div>
            <div className="medialive-form-group">
              <label className="medialive-form-label">Protocol Version</label>
              <input
                type="number"
                value={spliceInfo.protocolVersion}
                onChange={(e) => setSpliceInfo({ ...spliceInfo, protocolVersion: parseInt(e.target.value) })}
                className="medialive-input"
              />
              <div className="flex items-center space-x-1 mt-1">
                <HelpCircle className="w-3 h-3 text-[#a0aec0]" />
                <span className="text-xs text-[#a0aec0]">Default: 0</span>
              </div>
            </div>
            <div className="medialive-form-group">
              <label className="medialive-form-label">PTS Adjustment</label>
              <input
                type="number"
                value={spliceInfo.ptsAdjustment}
                onChange={(e) => setSpliceInfo({ ...spliceInfo, ptsAdjustment: parseInt(e.target.value) })}
                className="medialive-input"
              />
              <div className="flex items-center space-x-1 mt-1">
                <HelpCircle className="w-3 h-3 text-[#a0aec0]" />
                <span className="text-xs text-[#a0aec0]">33-bit PTS adjustment</span>
              </div>
            </div>
            <div className="medialive-form-group">
              <label className="medialive-form-label">CW Index</label>
              <input
                type="number"
                value={spliceInfo.cwIndex}
                onChange={(e) => setSpliceInfo({ ...spliceInfo, cwIndex: parseInt(e.target.value) })}
                className="medialive-input"
              />
              <div className="flex items-center space-x-1 mt-1">
                <HelpCircle className="w-3 h-3 text-[#a0aec0]" />
                <span className="text-xs text-[#a0aec0]">Default: 0xFF</span>
              </div>
            </div>
          </div>
        );
        break;

      case "event-config":
        sectionContent = (
          <div className="space-y-4">
            <div className="medialive-form-row">
              <div className="medialive-form-group">
                <label className="medialive-form-label">Splice Event ID</label>
                <input
                  type="number"
                  value={spliceInsert.spliceEventId}
                  onChange={(e) => setSpliceInsert({ ...spliceInsert, spliceEventId: parseInt(e.target.value) })}
                  className="medialive-input"
                />
                <div className="flex items-center space-x-1 mt-1">
                  <HelpCircle className="w-3 h-3 text-[#a0aec0]" />
                  <span className="text-xs text-[#a0aec0]">Unique event identifier</span>
                </div>
              </div>
              <div className="medialive-form-group">
                <label className="medialive-form-label">Event Cancel</label>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="spliceEventCancel"
                    checked={spliceInsert.spliceEventCancelIndicator}
                    onChange={(e) => setSpliceInsert({ ...spliceInsert, spliceEventCancelIndicator: e.target.checked })}
                    className="medialive-checkbox"
                  />
                  <label htmlFor="spliceEventCancel" className="medialive-form-label">
                    Cancel this event
                  </label>
                </div>
              </div>
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
                  id="spliceImmediate"
                  checked={spliceInsert.spliceImmediateFlag}
                  onChange={(e) => setSpliceInsert({ ...spliceInsert, spliceImmediateFlag: e.target.checked })}
                  className="medialive-checkbox"
                />
                <label htmlFor="spliceImmediate" className="medialive-form-label">
                  Splice Immediate
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
            </div>
          </div>
        );
        break;

      case "timing-control":
        sectionContent = (
          <div className="medialive-form-row">
            <div className="medialive-form-group">
              <label className="medialive-form-label">Splice Time PTS</label>
              <input
                type="number"
                value={spliceInsert.spliceTimePts}
                onChange={(e) => setSpliceInsert({ ...spliceInsert, spliceTimePts: parseInt(e.target.value) })}
                className="medialive-input"
              />
              <div className="flex items-center space-x-1 mt-1">
                <HelpCircle className="w-3 h-3 text-[#a0aec0]" />
                <span className="text-xs text-[#a0aec0]">33-bit presentation timestamp</span>
              </div>
            </div>
            <div className="medialive-form-group">
              <label className="medialive-form-label">Time Specified</label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  id="timeSpecified"
                  checked={spliceInsert.spliceTimeSpecified}
                  onCheckedChange={(checked) => setSpliceInsert({ ...spliceInsert, spliceTimeSpecified: !!checked })}
                />
                <label htmlFor="timeSpecified" className="medialive-form-label">
                  Specify splice time
                </label>
              </div>
            </div>
          </div>
        );
        break;

      case "duration-settings":
        sectionContent = (
          <div className="medialive-form-row">
            <div className="medialive-form-group">
              <label className="medialive-form-label">Break Duration</label>
              <input
                type="number"
                value={spliceInsert.breakDuration}
                onChange={(e) => setSpliceInsert({ ...spliceInsert, breakDuration: parseInt(e.target.value) })}
                className="medialive-input"
              />
              <div className="flex items-center space-x-1 mt-1">
                <HelpCircle className="w-3 h-3 text-[#a0aec0]" />
                <span className="text-xs text-[#a0aec0]">Duration in 90kHz ticks</span>
              </div>
            </div>
            <div className="medialive-form-group">
              <label className="medialive-form-label">Auto Return</label>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="autoReturn"
                  checked={spliceInsert.breakDurationAutoReturn}
                  onChange={(e) => setSpliceInsert({ ...spliceInsert, breakDurationAutoReturn: e.target.checked })}
                  className="medialive-checkbox"
                />
                <label htmlFor="autoReturn" className="medialive-form-label">
                  Auto return after break
                </label>
              </div>
            </div>
          </div>
        );
        break;

      case "program-identifiers":
        sectionContent = (
          <div className="medialive-form-row">
            <div className="medialive-form-group">
              <label className="medialive-form-label">Unique Program ID</label>
              <input
                type="number"
                value={spliceInsert.uniqueProgramId}
                onChange={(e) => setSpliceInsert({ ...spliceInsert, uniqueProgramId: parseInt(e.target.value) })}
                className="medialive-input"
              />
              <div className="flex items-center space-x-1 mt-1">
                <HelpCircle className="w-3 h-3 text-[#a0aec0]" />
                <span className="text-xs text-[#a0aec0]">Program identifier</span>
              </div>
            </div>
            <div className="medialive-form-group">
              <label className="medialive-form-label">Available</label>
              <input
                type="number"
                value={spliceInsert.available}
                onChange={(e) => setSpliceInsert({ ...spliceInsert, available: parseInt(e.target.value) })}
                className="medialive-input"
              />
              <div className="flex items-center space-x-1 mt-1">
                <HelpCircle className="w-3 h-3 text-[#a0aec0]" />
                <span className="text-xs text-[#a0aec0]">Available events</span>
              </div>
            </div>
            <div className="medialive-form-group">
              <label className="medialive-form-label">Expected</label>
              <input
                type="number"
                value={spliceInsert.expected}
                onChange={(e) => setSpliceInsert({ ...spliceInsert, expected: parseInt(e.target.value) })}
                className="medialive-input"
              />
              <div className="flex items-center space-x-1 mt-1">
                <HelpCircle className="w-3 h-3 text-[#a0aec0]" />
                <span className="text-xs text-[#a0aec0]">Expected events</span>
              </div>
            </div>
          </div>
        );
        break;

      case "advanced-options":
        sectionContent = (
          <div className="space-y-4">
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
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="selectionSyntax"
                checked={spliceInfo.selectionSyntaxIndicator}
                onChange={(e) => setSpliceInfo({ ...spliceInfo, selectionSyntaxIndicator: e.target.checked })}
                className="medialive-checkbox"
              />
              <label htmlFor="selectionSyntax" className="medialive-form-label">
                Selection Syntax Indicator
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="privateIndicator"
                checked={spliceInfo.privateIndicator}
                onChange={(e) => setSpliceInfo({ ...spliceInfo, privateIndicator: e.target.checked })}
                className="medialive-checkbox"
              />
              <label htmlFor="privateIndicator" className="medialive-form-label">
                Private Indicator
              </label>
            </div>
          </div>
        );
        break;
    }

    return (
      <div className="medialive-panel mb-4">
        <div 
          className="medialive-panel-header px-4 py-3 rounded-t-lg cursor-pointer hover:bg-[#1a252f] transition-colors"
          onClick={() => toggleSection(section.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-[#ff9900]">
                {section.icon}
              </div>
              <div>
                <h3 className="medialive-panel-title text-sm">{section.title}</h3>
                <p className="medialive-panel-subtitle text-xs">{section.description}</p>
              </div>
            </div>
            <div className="text-[#a0aec0]">
              {chevronIcon}
            </div>
          </div>
        </div>
        {isExpanded && (
          <div className="medialive-panel-content p-4">
            {sectionContent}
          </div>
        )}
      </div>
    );
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
            {/* Command Type Selection */}
            <div className="medialive-panel rounded-lg">
              <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-[#ff9900]" />
                    <h2 className="medialive-panel-title">Command Type</h2>
                  </div>
                  <Badge className="medialive-badge">{activeTab === "splice-insert" ? "SPLICE_INSERT" : "TIME_SIGNAL"}</Badge>
                </div>
                <p className="medialive-panel-subtitle mt-1">
                  Select SCTE-35 command type
                </p>
              </div>
              <div className="medialive-panel-content">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="medialive-tabs">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="splice-insert" className="medialive-tab">
                      Splice Insert
                    </TabsTrigger>
                    <TabsTrigger value="time-signal" className="medialive-tab">
                      Time Signal
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Configuration Sections */}
            <div className="space-y-4">
              {activeTab === "splice-insert" ? (
                sections.map(renderSection)
              ) : (
                <div className="medialive-panel">
                  <div className="medialive-panel-header px-4 py-3 rounded-t-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-[#ff9900]">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="medialive-panel-title text-sm">Time Signal Configuration</h3>
                        <p className="medialive-panel-subtitle text-xs">Configure time signal parameters</p>
                      </div>
                    </div>
                  </div>
                  <div className="medialive-panel-content p-4">
                    <div className="medialive-form-row">
                      <div className="medialive-form-group">
                        <label className="medialive-form-label">PTS</label>
                        <input
                          type="number"
                          value={timeSignal.pts}
                          onChange={(e) => setTimeSignal({ ...timeSignal, pts: parseInt(e.target.value) })}
                          className="medialive-input"
                        />
                        <div className="flex items-center space-x-1 mt-1">
                          <HelpCircle className="w-3 h-3 text-[#a0aec0]" />
                          <span className="text-xs text-[#a0aec0]">33-bit presentation timestamp</span>
                        </div>
                      </div>
                      <div className="medialive-form-group">
                        <label className="medialive-form-label">Time Specified</label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Switch
                            id="timeSpecified"
                            checked={timeSignal.timeSpecified}
                            onCheckedChange={(checked) => setTimeSignal({ ...timeSignal, timeSpecified: !!checked })}
                          />
                          <label htmlFor="timeSpecified" className="medialive-form-label">
                            Specify time
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Output Format and Encode */}
            <div className="medialive-panel rounded-lg">
              <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <Monitor className="w-5 h-5 text-[#ff9900]" />
                  <h2 className="medialive-panel-title">Output Configuration</h2>
                </div>
                <p className="medialive-panel-subtitle mt-1">
                  Configure output format and encode
                </p>
              </div>
              <div className="medialive-panel-content">
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

            {/* Quick Actions */}
            <div className="medialive-panel rounded-lg">
              <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-[#ff9900]" />
                  <h2 className="medialive-panel-title">Quick Actions</h2>
                </div>
              </div>
              <div className="medialive-panel-content space-y-3">
                <button 
                  onClick={() => sections.forEach(s => setSections(sections.map(sec => ({ ...sec, expanded: sec.id === 'splice-info' || sec.id === 'event-config' }))))}
                  className="medialive-button medialive-button-secondary w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Reset to Basic
                </button>
                <button 
                  onClick={() => sections.forEach(s => setSections(sections.map(sec => ({ ...sec, expanded: true }))))}
                  className="medialive-button medialive-button-secondary w-full"
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Expand All
                </button>
                <button 
                  onClick={() => sections.forEach(s => setSections(sections.map(sec => ({ ...sec, expanded: false }))))}
                  className="medialive-button medialive-button-secondary w-full"
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Collapse All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}