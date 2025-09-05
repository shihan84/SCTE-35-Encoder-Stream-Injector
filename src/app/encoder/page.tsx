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
import { Copy, Download, Play, ArrowLeft } from "lucide-react";
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
            <h1 className="text-3xl font-bold tracking-tight">SCTE-35 Encoder</h1>
            <p className="text-muted-foreground">
              Create and encode SCTE-35 messages for digital video broadcasting
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle>Encoder Configuration</CardTitle>
              <CardDescription>
                Configure SCTE-35 parameters and encode your message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Splice Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Splice Info Section</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tableId">Table ID</Label>
                    <Input
                      id="tableId"
                      type="number"
                      value={spliceInfo.tableId}
                      onChange={(e) => setSpliceInfo({ ...spliceInfo, tableId: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="protocolVersion">Protocol Version</Label>
                    <Input
                      id="protocolVersion"
                      type="number"
                      value={spliceInfo.protocolVersion}
                      onChange={(e) => setSpliceInfo({ ...spliceInfo, protocolVersion: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ptsAdjustment">PTS Adjustment</Label>
                    <Input
                      id="ptsAdjustment"
                      type="number"
                      value={spliceInfo.ptsAdjustment}
                      onChange={(e) => setSpliceInfo({ ...spliceInfo, ptsAdjustment: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cwIndex">CW Index</Label>
                    <Input
                      id="cwIndex"
                      type="number"
                      value={spliceInfo.cwIndex}
                      onChange={(e) => setSpliceInfo({ ...spliceInfo, cwIndex: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="encryptedPacket"
                    checked={spliceInfo.encryptedPacket}
                    onCheckedChange={(checked) => setSpliceInfo({ ...spliceInfo, encryptedPacket: !!checked })}
                  />
                  <Label htmlFor="encryptedPacket">Encrypted Packet</Label>
                </div>
              </div>

              {/* Command Type Selection */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="splice-insert">Splice Insert</TabsTrigger>
                  <TabsTrigger value="time-signal">Time Signal</TabsTrigger>
                </TabsList>

                <TabsContent value="splice-insert" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="spliceEventId">Splice Event ID</Label>
                      <Input
                        id="spliceEventId"
                        type="number"
                        value={spliceInsert.spliceEventId}
                        onChange={(e) => setSpliceInsert({ ...spliceInsert, spliceEventId: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="uniqueProgramId">Unique Program ID</Label>
                      <Input
                        id="uniqueProgramId"
                        type="number"
                        value={spliceInsert.uniqueProgramId}
                        onChange={(e) => setSpliceInsert({ ...spliceInsert, uniqueProgramId: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="available">Available</Label>
                      <Input
                        id="available"
                        type="number"
                        value={spliceInsert.available}
                        onChange={(e) => setSpliceInsert({ ...spliceInsert, available: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expected">Expected</Label>
                      <Input
                        id="expected"
                        type="number"
                        value={spliceInsert.expected}
                        onChange={(e) => setSpliceInsert({ ...spliceInsert, expected: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="breakDuration">Break Duration</Label>
                      <Input
                        id="breakDuration"
                        type="number"
                        value={spliceInsert.breakDuration}
                        onChange={(e) => setSpliceInsert({ ...spliceInsert, breakDuration: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="spliceTimePts">Splice Time PTS</Label>
                    <Input
                      id="spliceTimePts"
                      type="number"
                      value={spliceInsert.spliceTimePts}
                      onChange={(e) => setSpliceInsert({ ...spliceInsert, spliceTimePts: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="outOfNetwork"
                        checked={spliceInsert.outOfNetworkIndicator}
                        onCheckedChange={(checked) => setSpliceInsert({ ...spliceInsert, outOfNetworkIndicator: !!checked })}
                      />
                      <Label htmlFor="outOfNetwork">Out of Network</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="programSplice"
                        checked={spliceInsert.programSpliceFlag}
                        onCheckedChange={(checked) => setSpliceInsert({ ...spliceInsert, programSpliceFlag: !!checked })}
                      />
                      <Label htmlFor="programSplice">Program Splice</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="durationFlag"
                        checked={spliceInsert.durationFlag}
                        onCheckedChange={(checked) => setSpliceInsert({ ...spliceInsert, durationFlag: !!checked })}
                      />
                      <Label htmlFor="durationFlag">Duration Flag</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="spliceImmediate"
                        checked={spliceInsert.spliceImmediateFlag}
                        onCheckedChange={(checked) => setSpliceInsert({ ...spliceInsert, spliceImmediateFlag: !!checked })}
                      />
                      <Label htmlFor="spliceImmediate">Splice Immediate</Label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="time-signal" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timeSignalPts">PTS</Label>
                      <Input
                        id="timeSignalPts"
                        type="number"
                        value={timeSignal.pts}
                        onChange={(e) => setTimeSignal({ ...timeSignal, pts: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="timeSpecified"
                        checked={timeSignal.timeSpecified}
                        onCheckedChange={(checked) => setTimeSignal({ ...timeSignal, timeSpecified: !!checked })}
                      />
                      <Label htmlFor="timeSpecified">Time Specified</Label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Output Format */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="outputFormat">Output Format:</Label>
                <Select value={outputFormat} onValueChange={(value: "base64" | "hex") => setOutputFormat(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="base64">Base64</SelectItem>
                    <SelectItem value="hex">Hex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleEncode} className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Encode SCTE-35
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card>
            <CardHeader>
              <CardTitle>Encoded Output</CardTitle>
              <CardDescription>
                Your encoded SCTE-35 message in {outputFormat} format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{outputFormat.toUpperCase()}</Badge>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadOutput}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Textarea
                value={encodedOutput}
                readOnly
                placeholder="Encoded SCTE-35 output will appear here..."
                className="min-h-64 font-mono text-sm"
              />
              {encodedOutput && (
                <div className="text-sm text-muted-foreground">
                  Length: {encodedOutput.length} characters
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}