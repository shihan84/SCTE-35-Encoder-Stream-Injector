"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Copy, Download, Play, Settings, FileVideo, Radio } from "lucide-react";

interface FFmpegConfig {
  inputUrl: string;
  scte35File: string;
  outputUrl: string;
  videoCodec: string;
  videoPreset: string;
  videoProfile: string;
  videoLevel: string;
  resolution: string;
  videoBitrate: string;
  maxBitrate: string;
  bufsize: string;
  gopSize: string;
  audioCodec: string;
  audioBitrate: string;
  audioSampleRate: string;
  audioChannels: string;
  loudnormI: string;
  loudnormTP: string;
  loudnormLRA: string;
  muxrate: string;
  muxdelay: string;
  mpegtsStartPid: string;
  scte35Pid: string;
  metadata: {
    program_id: string;
    provider: string;
    stream_id: string;
    title: string;
    scte35_cue_id: string;
    scte35_cue_type: string;
    scte35_duration: string;
    scte35_event_id: string;
    scte35_timestamp: string;
    service_name: string;
    service_provider: string;
  };
}

export default function FFmpegCommandBuilder() {
  const [config, setConfig] = useState<FFmpegConfig>({
    inputUrl: "https://itassist.one/tv/live/index.m3u8",
    scte35File: "scte35_cue_1757064884.bin",
    outputUrl: "srt://itassist.one:8888?streamid=#!::r=live/live,m=publish",
    videoCodec: "libx264",
    videoPreset: "ultrafast",
    videoProfile: "high",
    videoLevel: "4.1",
    resolution: "1920x1080",
    videoBitrate: "5000k",
    maxBitrate: "5000k",
    bufsize: "10000k",
    gopSize: "60",
    audioCodec: "aac",
    audioBitrate: "128k",
    audioSampleRate: "48000",
    audioChannels: "2",
    loudnormI: "-20",
    loudnormTP: "-1.5",
    loudnormLRA: "11",
    muxrate: "6000k",
    muxdelay: "0.1",
    mpegtsStartPid: "0x1000",
    scte35Pid: "0x500",
    metadata: {
      program_id: "1",
      provider: "ITAssist",
      stream_id: "0",
      title: "ITAssist_Live",
      scte35_cue_id: "pre_roll_1757064884",
      scte35_cue_type: "pre_roll",
      scte35_duration: "30",
      scte35_event_id: "100023",
      scte35_timestamp: "1757064884",
      service_name: "ITAssist_Live",
      service_provider: "ITAssist"
    }
  });

  const [generatedCommand, setGeneratedCommand] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  const generateCommand = () => {
    const cmd = [
      "E:\\NEW DOWNLOADS\\ffmpeg-N-120864-g9a34ddc345-win64-gpl\\ffmpeg-N-120864-g9a34ddc345-win64-gpl\\bin\\ffmpeg.exe",
      "-i", config.inputUrl,
      "-f", "data",
      "-i", config.scte35File,
      "-map", "0:v",
      "-map", "0:a",
      "-map", "1:d",
      "-c:v", config.videoCodec,
      "-preset", config.videoPreset,
      "-tune", "zerolatency",
      "-profile:v", config.videoProfile,
      "-level:v", config.videoLevel,
      "-s", config.resolution,
      "-b:v", config.videoBitrate,
      "-maxrate", config.maxBitrate,
      "-bufsize", config.bufsize,
      "-g", config.gopSize,
      "-bf", "2",
      "-pix_fmt", "yuv420p",
      "-aspect", "16:9",
      "-c:a", config.audioCodec,
      "-b:a", config.audioBitrate,
      "-ar", config.audioSampleRate,
      "-ac", config.audioChannels,
      "-af", `loudnorm=I=${config.loudnormI}:TP=${config.loudnormTP}:LRA=${config.loudnormLRA}`,
      "-c:d", "copy",
      ...generateMetadataFlags(),
      "-f", "mpegts",
      "-muxrate", config.muxrate,
      "-muxdelay", config.muxdelay,
      "-mpegts_start_pid", config.mpegtsStartPid,
      "-mpegts_start_pid", "0x101",
      "-mpegts_start_pid", "0x102",
      "-mpegts_start_pid", config.scte35Pid,
      config.outputUrl,
      "-y"
    ].join(" ");

    setGeneratedCommand(cmd);
  };

  const generateMetadataFlags = () => {
    const flags: string[] = [];
    const metadata = config.metadata;

    // Basic metadata
    flags.push("-metadata", `program_id=${metadata.program_id}`);
    flags.push("-metadata", `provider=${metadata.provider}`);
    flags.push("-metadata", `stream_id=${metadata.stream_id}`);
    flags.push("-metadata", `title=${metadata.title}`);

    // SCTE-35 metadata
    flags.push("-metadata", `scte35_cue_id=${metadata.scte35_cue_id}`);
    flags.push("-metadata", `scte35_cue_type=${metadata.scte35_cue_type}`);
    flags.push("-metadata", `scte35_duration=${metadata.scte35_duration}`);
    flags.push("-metadata", `scte35_event_id=${metadata.scte35_event_id}`);
    flags.push("-metadata", `scte35_timestamp=${metadata.scte35_timestamp}`);
    flags.push("-metadata", `scte35_pid=${config.scte35Pid}`);
    flags.push("-metadata", `scte35_stream_type=0x86`);
    flags.push("-metadata", `scte35_codec_type=data`);
    flags.push("-metadata", `scte35_language=eng`);

    // Service metadata
    flags.push("-metadata", `service_name=${metadata.service_name}`);
    flags.push("-metadata", `service_provider=${metadata.service_provider}`);

    // Video metadata
    flags.push("-metadata", `video_codec=${config.videoCodec}`);
    flags.push("-metadata", `video_profile=${config.videoProfile}`);
    flags.push("-metadata", `video_level=${config.videoLevel}`);
    const [width, height] = config.resolution.split('x');
    flags.push("-metadata", `video_width=${width}`);
    flags.push("-metadata", `video_height=${height}`);
    flags.push("-metadata", `video_fps=30.0`);
    flags.push("-metadata", `video_bitrate=4885`);
    flags.push("-metadata", `video_pid=1280`);

    // Audio metadata
    flags.push("-metadata", `audio_codec=${config.audioCodec}`);
    flags.push("-metadata", `audio_channels=${config.audioChannels}`);
    flags.push("-metadata", `audio_sample_rate=${config.audioSampleRate}`);
    flags.push("-metadata", `audio_bitrate=4`);
    flags.push("-metadata", `audio_pid=1281`);

    // Tracks JSON
    const tracksJson = `[
      {
        "avg_fps": 30.0,
        "avg_gop": ${config.gopSize},
        "bframes": 17,
        "bitrate": 4885,
        "closed_captions": [],
        "codec": "${config.videoCodec}",
        "content": "video",
        "fps": 30.0,
        "height": ${height},
        "last_gop": ${config.gopSize},
        "length_size": 4,
        "level": "${config.videoLevel}",
        "num_refs_frames": 4,
        "pid": 1280,
        "pix_fmt": "yuv420p",
        "pixel_height": ${height},
        "pixel_width": ${width},
        "profile": "${config.videoProfile}",
        "sar_height": 1,
        "sar_width": 1,
        "track_id": "v1",
        "width": ${width}
      },
      {
        "avg_fps": 46.87,
        "aze": 4,
        "pid": 1281,
        "pix_fmt": "yuv420p",
        "sample_rate": ${config.audioSampleRate},
        "sar_height": 1,
        "sar_width": 1,
        "track_id": "a1"
      }
    ]`;
    flags.push("-metadata", `tracks_json=${tracksJson.replace(/\s+/g, ' ')}`);

    // Metadata JSON
    const metadataJson = `{
      "program_id": ${metadata.program_id},
      "provider": "${metadata.provider}",
      "stream_id": ${metadata.stream_id},
      "title": "${metadata.title}",
      "tracks": ${tracksJson}
    }`;
    flags.push("-metadata", `metadata_json=${metadataJson.replace(/\s+/g, ' ')}`);

    return flags;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCommand);
  };

  const downloadCommand = () => {
    const blob = new Blob([generatedCommand], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ffmpeg-scte35-command.bat";
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadExample = () => {
    setConfig({
      inputUrl: "https://itassist.one/tv/live/index.m3u8",
      scte35File: "scte35_cue_1757064884.bin",
      outputUrl: "srt://itassist.one:8888?streamid=#!::r=live/live,m=publish",
      videoCodec: "libx264",
      videoPreset: "ultrafast",
      videoProfile: "high",
      videoLevel: "4.1",
      resolution: "1920x1080",
      videoBitrate: "5000k",
      maxBitrate: "5000k",
      bufsize: "10000k",
      gopSize: "60",
      audioCodec: "aac",
      audioBitrate: "128k",
      audioSampleRate: "48000",
      audioChannels: "2",
      loudnormI: "-20",
      loudnormTP: "-1.5",
      loudnormLRA: "11",
      muxrate: "6000k",
      muxdelay: "0.1",
      mpegtsStartPid: "0x1000",
      scte35Pid: "0x500",
      metadata: {
        program_id: "1",
        provider: "ITAssist",
        stream_id: "0",
        title: "ITAssist_Live",
        scte35_cue_id: "pre_roll_1757064884",
        scte35_cue_type: "pre_roll",
        scte35_duration: "30",
        scte35_event_id: "100023",
        scte35_timestamp: "1757064884",
        service_name: "ITAssist_Live",
        service_provider: "ITAssist"
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="medialive-panel rounded-lg">
        <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#ff9900]" />
            <h2 className="medialive-panel-title">FFmpeg SCTE-35 Command Builder</h2>
          </div>
          <p className="medialive-panel-subtitle mt-1">
            Build professional FFmpeg commands for SCTE-35 injection based on your example
          </p>
        </div>
        <div className="medialive-panel-content">
          <div className="flex space-x-2 mb-4">
            <Button onClick={loadExample} variant="outline" size="sm" className="medialive-button-secondary">
              Load Example
            </Button>
            <Button onClick={generateCommand} size="sm" className="medialive-button medialive-button-primary">
              <Play className="w-4 h-4 mr-2" />
              Generate Command
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="medialive-tabs w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#16191f] border border-[#232f3e] rounded-lg p-1">
          <TabsTrigger value="basic" className="medialive-tab data-[state=active]:bg-[#ff9900] data-[state=active]:text-[#0f1419] data-[state=active]:font-semibold">Basic Config</TabsTrigger>
          <TabsTrigger value="advanced" className="medialive-tab data-[state=active]:bg-[#ff9900] data-[state=active]:text-[#0f1419] data-[state=active]:font-semibold">Advanced</TabsTrigger>
          <TabsTrigger value="metadata" className="medialive-tab data-[state=active]:bg-[#ff9900] data-[state=active]:text-[#0f1419] data-[state=active]:font-semibold">Metadata</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="medialive-panel rounded-lg">
              <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                <h3 className="medialive-panel-title text-lg">Input/Output</h3>
              </div>
              <div className="medialive-panel-content space-y-4">
                <div className="medialive-form-group">
                  <label htmlFor="inputUrl" className="medialive-form-label">Input URL</label>
                  <input
                    id="inputUrl"
                    className="medialive-input"
                    value={config.inputUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, inputUrl: e.target.value }))}
                    placeholder="https://example.com/live/stream.m3u8"
                  />
                </div>
                <div className="medialive-form-group">
                  <label htmlFor="scte35File" className="medialive-form-label">SCTE-35 File</label>
                  <input
                    id="scte35File"
                    className="medialive-input"
                    value={config.scte35File}
                    onChange={(e) => setConfig(prev => ({ ...prev, scte35File: e.target.value }))}
                    placeholder="scte35_cue.bin"
                  />
                </div>
                <div className="medialive-form-group">
                  <label htmlFor="outputUrl" className="medialive-form-label">Output URL</label>
                  <input
                    id="outputUrl"
                    className="medialive-input"
                    value={config.outputUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, outputUrl: e.target.value }))}
                    placeholder="srt://localhost:8888?streamid=live"
                  />
                </div>
              </div>
            </div>

            <div className="medialive-panel rounded-lg">
              <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                <h3 className="medialive-panel-title text-lg">Video Settings</h3>
              </div>
              <div className="medialive-panel-content space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="videoCodec">Codec</Label>
                    <Select value={config.videoCodec} onValueChange={(value) => setConfig(prev => ({ ...prev, videoCodec: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="libx264">H.264</SelectItem>
                        <SelectItem value="libx265">H.265</SelectItem>
                        <SelectItem value="libvpx">VP8</SelectItem>
                        <SelectItem value="libvpx-vp9">VP9</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="videoPreset">Preset</Label>
                    <Select value={config.videoPreset} onValueChange={(value) => setConfig(prev => ({ ...prev, videoPreset: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ultrafast">Ultrafast</SelectItem>
                        <SelectItem value="superfast">Superfast</SelectItem>
                        <SelectItem value="veryfast">Veryfast</SelectItem>
                        <SelectItem value="faster">Faster</SelectItem>
                        <SelectItem value="fast">Fast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="resolution">Resolution</Label>
                    <Select value={config.resolution} onValueChange={(value) => setConfig(prev => ({ ...prev, resolution: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1920x1080">1920x1080</SelectItem>
                        <SelectItem value="1280x720">1280x720</SelectItem>
                        <SelectItem value="854x480">854x480</SelectItem>
                        <SelectItem value="640x360">640x360</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="videoBitrate">Bitrate</Label>
                    <Input
                      id="videoBitrate"
                      value={config.videoBitrate}
                      onChange={(e) => setConfig(prev => ({ ...prev, videoBitrate: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Audio Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="audioCodec">Codec</Label>
                    <Select value={config.audioCodec} onValueChange={(value) => setConfig(prev => ({ ...prev, audioCodec: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aac">AAC</SelectItem>
                        <SelectItem value="libmp3lame">MP3</SelectItem>
                        <SelectItem value="libopus">Opus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="audioBitrate">Bitrate</Label>
                    <Input
                      id="audioBitrate"
                      value={config.audioBitrate}
                      onChange={(e) => setConfig(prev => ({ ...prev, audioBitrate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="audioSampleRate">Sample Rate</Label>
                    <Select value={config.audioSampleRate} onValueChange={(value) => setConfig(prev => ({ ...prev, audioSampleRate: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="44100">44.1 kHz</SelectItem>
                        <SelectItem value="48000">48 kHz</SelectItem>
                        <SelectItem value="96000">96 kHz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="audioChannels">Channels</Label>
                    <Select value={config.audioChannels} onValueChange={(value) => setConfig(prev => ({ ...prev, audioChannels: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Mono</SelectItem>
                        <SelectItem value="2">Stereo</SelectItem>
                        <SelectItem value="6">5.1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Muxing Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="muxrate">Muxrate</Label>
                    <Input
                      id="muxrate"
                      value={config.muxrate}
                      onChange={(e) => setConfig(prev => ({ ...prev, muxrate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="muxdelay">Muxdelay</Label>
                    <Input
                      id="muxdelay"
                      value={config.muxdelay}
                      onChange={(e) => setConfig(prev => ({ ...prev, muxdelay: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="mpegtsStartPid">Start PID</Label>
                    <Input
                      id="mpegtsStartPid"
                      value={config.mpegtsStartPid}
                      onChange={(e) => setConfig(prev => ({ ...prev, mpegtsStartPid: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="scte35Pid">SCTE-35 PID</Label>
                    <Input
                      id="scte35Pid"
                      value={config.scte35Pid}
                      onChange={(e) => setConfig(prev => ({ ...prev, scte35Pid: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">SCTE-35 Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cueId">Cue ID</Label>
                  <Input
                    id="cueId"
                    value={config.metadata.scte35_cue_id}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      metadata: { ...prev.metadata, scte35_cue_id: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="cueType">Cue Type</Label>
                  <Input
                    id="cueType"
                    value={config.metadata.scte35_cue_type}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      metadata: { ...prev.metadata, scte35_cue_type: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    value={config.metadata.scte35_duration}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      metadata: { ...prev.metadata, scte35_duration: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="eventId">Event ID</Label>
                  <Input
                    id="eventId"
                    value={config.metadata.scte35_event_id}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      metadata: { ...prev.metadata, scte35_event_id: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Service Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serviceName">Service Name</Label>
                  <Input
                    id="serviceName"
                    value={config.metadata.service_name}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      metadata: { ...prev.metadata, service_name: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="serviceProvider">Service Provider</Label>
                  <Input
                    id="serviceProvider"
                    value={config.metadata.service_provider}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      metadata: { ...prev.metadata, service_provider: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={config.metadata.title}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      metadata: { ...prev.metadata, title: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Input
                    id="provider"
                    value={config.metadata.provider}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      metadata: { ...prev.metadata, provider: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {generatedCommand && (
        <div className="medialive-panel rounded-lg">
          <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h3 className="medialive-panel-title">Generated FFmpeg Command</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="medialive-button-secondary">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={downloadCommand} className="medialive-button-secondary">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="medialive-panel-content">
            <textarea
              value={generatedCommand}
              readOnly
              className="medialive-textarea min-h-32 font-mono text-sm w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}