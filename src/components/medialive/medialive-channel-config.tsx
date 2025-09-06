"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Play, 
  Square, 
  Settings, 
  Copy, 
  Download, 
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Plus,
  Trash2,
  Edit
} from "lucide-react";
import MediaLiveStatusIndicator, { MediaLiveStatus } from "./medialive-status-indicator";

interface InputSource {
  id: string;
  name: string;
  type: 'srt' | 'rtmp' | 'rtsp' | 'udp' | 'file';
  url: string;
  primary: boolean;
  backup?: boolean;
}

interface OutputDestination {
  id: string;
  name: string;
  type: 'srt' | 'rtmp' | 'hls' | 'dash' | 'udp';
  url: string;
  enabled: boolean;
}

interface SCTE35Configuration {
  enabled: boolean;
  passthrough: boolean;
  insertionMode: 'auto' | 'manual' | 'scheduled';
  defaultDuration: number;
  timeSignal: boolean;
  spliceInsert: boolean;
}

interface MediaLiveChannelConfigProps {
  channelId?: string;
  initialConfig?: any;
  onSave?: (config: any) => void;
  onStart?: (config: any) => void;
  onStop?: () => void;
  className?: string;
}

export default function MediaLiveChannelConfig({
  channelId,
  initialConfig,
  onSave,
  onStart,
  onStop,
  className
}: MediaLiveChannelConfigProps) {
  const [activeTab, setActiveTab] = useState("input");
  const [channelStatus, setChannelStatus] = useState<MediaLiveStatus>('stopped');
  const [isConfigDirty, setIsConfigDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Basic channel configuration
  const [channelConfig, setChannelConfig] = useState({
    name: initialConfig?.name || `Channel ${channelId || '1'}`,
    description: initialConfig?.description || '',
    inputType: initialConfig?.inputType || 'srt',
    outputType: initialConfig?.outputType || 'srt',
    bitrate: initialConfig?.bitrate || 5000,
    resolution: initialConfig?.resolution || '1920x1080',
    codec: initialConfig?.codec || 'h264',
    frameRate: initialConfig?.frameRate || '30',
    keyFrameInterval: initialConfig?.keyFrameInterval || 2,
    profile: initialConfig?.profile || 'high',
    level: initialConfig?.level || '4.1'
  });

  // Input sources
  const [inputSources, setInputSources] = useState<InputSource[]>(initialConfig?.inputSources || [
    {
      id: '1',
      name: 'Primary Input',
      type: 'srt',
      url: 'srt://localhost:9000?streamid=live/stream',
      primary: true,
      backup: false
    }
  ]);

  // Output destinations
  const [outputDestinations, setOutputDestinations] = useState<OutputDestination[]>(initialConfig?.outputDestinations || [
    {
      id: '1',
      name: 'Primary Output',
      type: 'srt',
      url: 'srt://localhost:9001?streamid=live/output',
      enabled: true
    }
  ]);

  // SCTE-35 configuration
  const [scte35Config, setScte35Config] = useState<SCTE35Configuration>(initialConfig?.scte35Config || {
    enabled: true,
    passthrough: true,
    insertionMode: 'auto',
    defaultDuration: 30,
    timeSignal: true,
    spliceInsert: true
  });

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const config = {
        ...channelConfig,
        inputSources,
        outputDestinations,
        scte35Config
      };
      
      if (onSave) {
        await onSave(config);
      }
      
      setIsConfigDirty(false);
    } catch (error) {
      console.error('Error saving configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartChannel = () => {
    if (onStart) {
      onStart({
        ...channelConfig,
        inputSources,
        outputDestinations,
        scte35Config
      });
    }
    setChannelStatus('starting');
    setTimeout(() => setChannelStatus('running'), 2000);
  };

  const handleStopChannel = () => {
    if (onStop) {
      onStop();
    }
    setChannelStatus('stopped');
  };

  const addInputSource = () => {
    const newSource: InputSource = {
      id: Date.now().toString(),
      name: `Input ${inputSources.length + 1}`,
      type: 'srt',
      url: '',
      primary: false,
      backup: false
    };
    setInputSources([...inputSources, newSource]);
    setIsConfigDirty(true);
  };

  const removeInputSource = (id: string) => {
    setInputSources(inputSources.filter(source => source.id !== id));
    setIsConfigDirty(true);
  };

  const addOutputDestination = () => {
    const newDestination: OutputDestination = {
      id: Date.now().toString(),
      name: `Output ${outputDestinations.length + 1}`,
      type: 'srt',
      url: '',
      enabled: true
    };
    setOutputDestinations([...outputDestinations, newDestination]);
    setIsConfigDirty(true);
  };

  const removeOutputDestination = (id: string) => {
    setOutputDestinations(outputDestinations.filter(dest => dest.id !== id));
    setIsConfigDirty(true);
  };

  const duplicateConfig = () => {
    const configStr = JSON.stringify({
      ...channelConfig,
      inputSources,
      outputDestinations,
      scte35Config
    }, null, 2);
    navigator.clipboard.writeText(configStr);
  };

  const exportConfig = () => {
    const config = {
      ...channelConfig,
      inputSources,
      outputDestinations,
      scte35Config
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `channel-config-${channelConfig.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Channel Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center space-x-3">
                <span>Channel Configuration</span>
                <MediaLiveStatusIndicator 
                  status={channelStatus} 
                  showIcon={true}
                  size="sm"
                />
              </CardTitle>
              <CardDescription>
                Configure input sources, output destinations, and SCTE-35 settings for your MediaLive channel
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={duplicateConfig}
                disabled={isSaving}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Config
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportConfig}
                disabled={isSaving}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                onClick={handleSaveConfig}
                disabled={isSaving || !isConfigDirty}
                className="medialive-button-secondary"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              {channelStatus === 'stopped' ? (
                <Button
                  onClick={handleStartChannel}
                  className="medialive-button-primary"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Channel
                </Button>
              ) : (
                <Button
                  onClick={handleStopChannel}
                  variant="destructive"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Channel
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="medialive-tabs">
              <TabsTrigger value="input" className="medialive-tab">Input Sources</TabsTrigger>
              <TabsTrigger value="output" className="medialive-tab">Output Destinations</TabsTrigger>
              <TabsTrigger value="encoding" className="medialive-tab">Encoding Settings</TabsTrigger>
              <TabsTrigger value="scte35" className="medialive-tab">SCTE-35</TabsTrigger>
              <TabsTrigger value="advanced" className="medialive-tab">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="input" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Input Sources</h3>
                  <Button onClick={addInputSource} className="medialive-button-secondary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Input
                  </Button>
                </div>

                {inputSources.map((source, index) => (
                  <Card key={source.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Badge variant={source.primary ? "default" : "secondary"}>
                            {source.primary ? "Primary" : source.backup ? "Backup" : "Secondary"}
                          </Badge>
                          <h4 className="font-medium">{source.name}</h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInputSource(source.id)}
                          disabled={inputSources.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`input-name-${source.id}`}>Name</Label>
                          <Input
                            id={`input-name-${source.id}`}
                            value={source.name}
                            onChange={(e) => {
                              const newSources = inputSources.map(s => 
                                s.id === source.id ? { ...s, name: e.target.value } : s
                              );
                              setInputSources(newSources);
                              setIsConfigDirty(true);
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`input-type-${source.id}`}>Type</Label>
                          <Select 
                            value={source.type} 
                            onValueChange={(value: any) => {
                              const newSources = inputSources.map(s => 
                                s.id === source.id ? { ...s, type: value } : s
                              );
                              setInputSources(newSources);
                              setIsConfigDirty(true);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="srt">SRT</SelectItem>
                              <SelectItem value="rtmp">RTMP</SelectItem>
                              <SelectItem value="rtsp">RTSP</SelectItem>
                              <SelectItem value="udp">UDP</SelectItem>
                              <SelectItem value="file">File</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor={`input-url-${source.id}`}>URL</Label>
                          <Input
                            id={`input-url-${source.id}`}
                            placeholder="srt://localhost:9000?streamid=live/stream"
                            value={source.url}
                            onChange={(e) => {
                              const newSources = inputSources.map(s => 
                                s.id === source.id ? { ...s, url: e.target.value } : s
                              );
                              setInputSources(newSources);
                              setIsConfigDirty(true);
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`input-primary-${source.id}`}
                            checked={source.primary}
                            onCheckedChange={(checked) => {
                              const newSources = inputSources.map(s => ({
                                ...s,
                                primary: s.id === source.id ? checked : false,
                                backup: s.id === source.id ? false : s.backup
                              }));
                              setInputSources(newSources);
                              setIsConfigDirty(true);
                            }}
                          />
                          <Label htmlFor={`input-primary-${source.id}`}>Primary</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`input-backup-${source.id}`}
                            checked={source.backup}
                            onCheckedChange={(checked) => {
                              const newSources = inputSources.map(s => ({
                                ...s,
                                backup: s.id === source.id ? checked : s.backup,
                                primary: s.id === source.id ? false : s.primary
                              }));
                              setInputSources(newSources);
                              setIsConfigDirty(true);
                            }}
                          />
                          <Label htmlFor={`input-backup-${source.id}`}>Backup</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Alert>
                  <HelpCircle className="h-4 w-4" />
                  <AlertDescription>
                    Configure primary and backup input sources for automatic failover. The channel will automatically switch to backup sources if the primary input fails.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="output" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Output Destinations</h3>
                  <Button onClick={addOutputDestination} className="medialive-button-secondary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Output
                  </Button>
                </div>

                {outputDestinations.map((destination, index) => (
                  <Card key={destination.id} className="border">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium">{destination.name}</h4>
                          <Badge variant={destination.enabled ? "default" : "secondary"}>
                            {destination.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOutputDestination(destination.id)}
                          disabled={outputDestinations.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`output-name-${destination.id}`}>Name</Label>
                          <Input
                            id={`output-name-${destination.id}`}
                            value={destination.name}
                            onChange={(e) => {
                              const newDestinations = outputDestinations.map(d => 
                                d.id === destination.id ? { ...d, name: e.target.value } : d
                              );
                              setOutputDestinations(newDestinations);
                              setIsConfigDirty(true);
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`output-type-${destination.id}`}>Type</Label>
                          <Select 
                            value={destination.type} 
                            onValueChange={(value: any) => {
                              const newDestinations = outputDestinations.map(d => 
                                d.id === destination.id ? { ...d, type: value } : d
                              );
                              setOutputDestinations(newDestinations);
                              setIsConfigDirty(true);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="srt">SRT</SelectItem>
                              <SelectItem value="rtmp">RTMP</SelectItem>
                              <SelectItem value="hls">HLS</SelectItem>
                              <SelectItem value="dash">DASH</SelectItem>
                              <SelectItem value="udp">UDP</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor={`output-url-${destination.id}`}>URL</Label>
                          <Input
                            id={`output-url-${destination.id}`}
                            placeholder="srt://localhost:9001?streamid=live/output"
                            value={destination.url}
                            onChange={(e) => {
                              const newDestinations = outputDestinations.map(d => 
                                d.id === destination.id ? { ...d, url: e.target.value } : d
                              );
                              setOutputDestinations(newDestinations);
                              setIsConfigDirty(true);
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mt-4">
                        <Switch
                          id={`output-enabled-${destination.id}`}
                          checked={destination.enabled}
                          onCheckedChange={(checked) => {
                            const newDestinations = outputDestinations.map(d => 
                              d.id === destination.id ? { ...d, enabled: checked } : d
                            );
                            setOutputDestinations(newDestinations);
                            setIsConfigDirty(true);
                          }}
                        />
                        <Label htmlFor={`output-enabled-${destination.id}`}>Enabled</Label>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="encoding" className="p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Encoding Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <Label htmlFor="bitrate">Bitrate (kbps)</Label>
                    <Input
                      id="bitrate"
                      type="number"
                      value={channelConfig.bitrate}
                      onChange={(e) => {
                        setChannelConfig({ ...channelConfig, bitrate: parseInt(e.target.value) });
                        setIsConfigDirty(true);
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="resolution">Resolution</Label>
                    <Select 
                      value={channelConfig.resolution} 
                      onValueChange={(value) => {
                        setChannelConfig({ ...channelConfig, resolution: value });
                        setIsConfigDirty(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1920x1080">1920x1080 (1080p)</SelectItem>
                        <SelectItem value="1280x720">1280x720 (720p)</SelectItem>
                        <SelectItem value="854x480">854x480 (480p)</SelectItem>
                        <SelectItem value="640x360">640x360 (360p)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="codec">Codec</Label>
                    <Select 
                      value={channelConfig.codec} 
                      onValueChange={(value) => {
                        setChannelConfig({ ...channelConfig, codec: value });
                        setIsConfigDirty(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="h264">H.264</SelectItem>
                        <SelectItem value="h265">H.265</SelectItem>
                        <SelectItem value="av1">AV1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="frameRate">Frame Rate</Label>
                    <Select 
                      value={channelConfig.frameRate} 
                      onValueChange={(value) => {
                        setChannelConfig({ ...channelConfig, frameRate: value });
                        setIsConfigDirty(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24">24 fps</SelectItem>
                        <SelectItem value="25">25 fps</SelectItem>
                        <SelectItem value="30">30 fps</SelectItem>
                        <SelectItem value="50">50 fps</SelectItem>
                        <SelectItem value="60">60 fps</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="keyFrameInterval">Key Frame Interval (seconds)</Label>
                    <Input
                      id="keyFrameInterval"
                      type="number"
                      value={channelConfig.keyFrameInterval}
                      onChange={(e) => {
                        setChannelConfig({ ...channelConfig, keyFrameInterval: parseInt(e.target.value) });
                        setIsConfigDirty(true);
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="profile">Profile</Label>
                    <Select 
                      value={channelConfig.profile} 
                      onValueChange={(value) => {
                        setChannelConfig({ ...channelConfig, profile: value });
                        setIsConfigDirty(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baseline">Baseline</SelectItem>
                        <SelectItem value="main">Main</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scte35" className="p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">SCTE-35 Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="scte35-enabled"
                        checked={scte35Config.enabled}
                        onCheckedChange={(checked) => {
                          setScte35Config({ ...scte35Config, enabled: checked });
                          setIsConfigDirty(true);
                        }}
                      />
                      <Label htmlFor="scte35-enabled">Enable SCTE-35</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="scte35-passthrough"
                        checked={scte35Config.passthrough}
                        onCheckedChange={(checked) => {
                          setScte35Config({ ...scte35Config, passthrough: checked });
                          setIsConfigDirty(true);
                        }}
                      />
                      <Label htmlFor="scte35-passthrough">Passthrough SCTE-35</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="scte35-timesignal"
                        checked={scte35Config.timeSignal}
                        onCheckedChange={(checked) => {
                          setScte35Config({ ...scte35Config, timeSignal: checked });
                          setIsConfigDirty(true);
                        }}
                      />
                      <Label htmlFor="scte35-timesignal">Time Signal Support</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="scte35-spliceinsert"
                        checked={scte35Config.spliceInsert}
                        onCheckedChange={(checked) => {
                          setScte35Config({ ...scte35Config, spliceInsert: checked });
                          setIsConfigDirty(true);
                        }}
                      />
                      <Label htmlFor="scte35-spliceinsert">Splice Insert Support</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="insertion-mode">Insertion Mode</Label>
                      <Select 
                        value={scte35Config.insertionMode} 
                        onValueChange={(value: any) => {
                          setScte35Config({ ...scte35Config, insertionMode: value });
                          setIsConfigDirty(true);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Automatic</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="default-duration">Default Duration (seconds)</Label>
                      <Input
                        id="default-duration"
                        type="number"
                        value={scte35Config.defaultDuration}
                        onChange={(e) => {
                          setScte35Config({ ...scte35Config, defaultDuration: parseInt(e.target.value) });
                          setIsConfigDirty(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    SCTE-35 configuration enables automatic ad insertion and program segmentation. Configure insertion mode and default duration for your workflow.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="p-6">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Advanced Settings</h3>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Advanced settings should only be modified by experienced users. Incorrect configuration may affect stream quality and stability.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="level">Level</Label>
                    <Select 
                      value={channelConfig.level} 
                      onValueChange={(value) => {
                        setChannelConfig({ ...channelConfig, level: value });
                        setIsConfigDirty(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3.0">3.0</SelectItem>
                        <SelectItem value="3.1">3.1</SelectItem>
                        <SelectItem value="4.0">4.0</SelectItem>
                        <SelectItem value="4.1">4.1</SelectItem>
                        <SelectItem value="5.0">5.0</SelectItem>
                        <SelectItem value="5.1">5.1</SelectItem>
                        <SelectItem value="5.2">5.2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}