"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  const [activeTab, setActiveTab] = useState("basic");
  const [generatedCommand, setGeneratedCommand] = useState<string>("");
  
  const [config, setConfig] = useState<FFmpegConfig>({
    inputUrl: "",
    scte35File: "",
    outputUrl: "",
    videoCodec: "libx264",
    videoPreset: "veryfast",
    videoProfile: "high",
    videoLevel: "4.1",
    resolution: "1920x1080",
    videoBitrate: "5000k",
    maxBitrate: "6000k",
    bufsize: "10000k",
    gopSize: "60",
    audioCodec: "aac",
    audioBitrate: "128k",
    audioSampleRate: "48000",
    audioChannels: "2",
    loudnormI: "-16",
    loudnormTP: "-1.5",
    loudnormLRA: "11",
    muxrate: "10000000",
    muxdelay: "0",
    mpegtsStartPid: "0x100",
    scte35Pid: "0x103",
    metadata: {
      program_id: "1",
      provider: "ITAssist",
      stream_id: "live",
      title: "Live Stream",
      scte35_cue_id: "1",
      scte35_cue_type: "splice_insert",
      scte35_duration: "30000",
      scte35_event_id: "1",
      scte35_timestamp: "1757064884",
      service_name: "ITAssist Live",
      service_provider: "ITAssist"
    }
  });

  const generateCommand = () => {
    const cmd = [
      "ffmpeg",
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

    // Service metadata
    flags.push("-metadata", `service_name=${metadata.service_name}`);
    flags.push("-metadata", `service_provider=${metadata.service_provider}`);

    // JSON metadata for complex data
    const tracksJson = JSON.stringify([
      { "type": "video", "codec": config.videoCodec, "bitrate": config.videoBitrate },
      { "type": "audio", "codec": config.audioCodec, "bitrate": config.audioBitrate },
      { "type": "data", "codec": "copy", "pid": config.scte35Pid }
    ]);

    const metadataJson = `{
      "program_id": "${metadata.program_id}",
      "provider": "${metadata.provider}",
      "stream_id": "${metadata.stream_id}",
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
      videoPreset: "veryfast",
      videoProfile: "high",
      videoLevel: "4.1",
      resolution: "1920x1080",
      videoBitrate: "5000k",
      maxBitrate: "6000k",
      bufsize: "10000k",
      gopSize: "60",
      audioCodec: "aac",
      audioBitrate: "128k",
      audioSampleRate: "48000",
      audioChannels: "2",
      loudnormI: "-16",
      loudnormTP: "-1.5",
      loudnormLRA: "11",
      muxrate: "10000000",
      muxdelay: "0",
      mpegtsStartPid: "0x100",
      scte35Pid: "0x103",
      metadata: {
        program_id: "1",
        provider: "ITAssist",
        stream_id: "live",
        title: "Live Stream",
        scte35_cue_id: "1",
        scte35_cue_type: "splice_insert",
        scte35_duration: "30000",
        scte35_event_id: "1",
        scte35_timestamp: "1757064884",
        service_name: "ITAssist Live",
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

      <div className="medialive-tabs w-full">
        <div className="grid w-full grid-cols-3 bg-[#16191f] border border-[#232f3e] rounded-lg p-1">
          <button
            onClick={() => setActiveTab("basic")}
            className={`medialive-tab ${activeTab === "basic" ? "bg-[#ff9900] text-[#0f1419] font-semibold" : ""}`}
          >
            Basic Config
          </button>
          <button
            onClick={() => setActiveTab("advanced")}
            className={`medialive-tab ${activeTab === "advanced" ? "bg-[#ff9900] text-[#0f1419] font-semibold" : ""}`}
          >
            Advanced
          </button>
          <button
            onClick={() => setActiveTab("metadata")}
            className={`medialive-tab ${activeTab === "metadata" ? "bg-[#ff9900] text-[#0f1419] font-semibold" : ""}`}
          >
            Metadata
          </button>
        </div>

        {activeTab === "basic" && (
          <div className="space-y-4 mt-4">
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
                  <div className="medialive-form-row">
                    <div className="medialive-form-group">
                      <label htmlFor="videoCodec" className="medialive-form-label">Codec</label>
                      <select
                        id="videoCodec"
                        className="medialive-select"
                        value={config.videoCodec}
                        onChange={(e) => setConfig(prev => ({ ...prev, videoCodec: e.target.value }))}
                      >
                        <option value="libx264">H.264</option>
                        <option value="libx265">H.265</option>
                        <option value="libvpx">VP8</option>
                        <option value="libvpx-vp9">VP9</option>
                      </select>
                  </div>
                    <div className="medialive-form-group">
                      <label htmlFor="videoPreset" className="medialive-form-label">Preset</label>
                      <select
                        id="videoPreset"
                        className="medialive-select"
                        value={config.videoPreset}
                        onChange={(e) => setConfig(prev => ({ ...prev, videoPreset: e.target.value }))}
                      >
                        <option value="ultrafast">Ultrafast</option>
                        <option value="superfast">Superfast</option>
                        <option value="veryfast">Veryfast</option>
                        <option value="faster">Faster</option>
                        <option value="fast">Fast</option>
                        <option value="medium">Medium</option>
                        <option value="slow">Slow</option>
                        <option value="slower">Slower</option>
                        <option value="veryslow">Veryslow</option>
                      </select>
                  </div>
                </div>
                  <div className="medialive-form-row">
                    <div className="medialive-form-group">
                      <label htmlFor="resolution" className="medialive-form-label">Resolution</label>
                      <input
                        id="resolution"
                        className="medialive-input"
                        value={config.resolution}
                        onChange={(e) => setConfig(prev => ({ ...prev, resolution: e.target.value }))}
                        placeholder="1920x1080"
                      />
                  </div>
                    <div className="medialive-form-group">
                      <label htmlFor="videoBitrate" className="medialive-form-label">Bitrate</label>
                      <input
                      id="videoBitrate"
                        className="medialive-input"
                      value={config.videoBitrate}
                      onChange={(e) => setConfig(prev => ({ ...prev, videoBitrate: e.target.value }))}
                        placeholder="5000k"
                    />
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "advanced" && (
          <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <h3 className="medialive-panel-title text-lg">Audio Settings</h3>
                </div>
                <div className="medialive-panel-content space-y-4">
                  <div className="medialive-form-row">
                    <div className="medialive-form-group">
                      <label htmlFor="audioCodec" className="medialive-form-label">Codec</label>
                      <select
                        id="audioCodec"
                        className="medialive-select"
                        value={config.audioCodec}
                        onChange={(e) => setConfig(prev => ({ ...prev, audioCodec: e.target.value }))}
                      >
                        <option value="aac">AAC</option>
                        <option value="mp3">MP3</option>
                        <option value="ac3">AC-3</option>
                        <option value="eac3">E-AC-3</option>
                      </select>
                  </div>
                    <div className="medialive-form-group">
                      <label htmlFor="audioBitrate" className="medialive-form-label">Bitrate</label>
                      <input
                      id="audioBitrate"
                        className="medialive-input"
                      value={config.audioBitrate}
                      onChange={(e) => setConfig(prev => ({ ...prev, audioBitrate: e.target.value }))}
                        placeholder="128k"
                    />
                  </div>
                </div>
                  </div>
                </div>

              <div className="medialive-panel rounded-lg">
                <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                  <h3 className="medialive-panel-title text-lg">Muxing Settings</h3>
                </div>
                <div className="medialive-panel-content space-y-4">
                  <div className="medialive-form-row">
                    <div className="medialive-form-group">
                      <label htmlFor="muxrate" className="medialive-form-label">Muxrate</label>
                      <input
                      id="muxrate"
                        className="medialive-input"
                      value={config.muxrate}
                      onChange={(e) => setConfig(prev => ({ ...prev, muxrate: e.target.value }))}
                        placeholder="10000000"
                    />
                  </div>
                    <div className="medialive-form-group">
                      <label htmlFor="scte35Pid" className="medialive-form-label">SCTE-35 PID</label>
                      <input
                        id="scte35Pid"
                        className="medialive-input"
                        value={config.scte35Pid}
                        onChange={(e) => setConfig(prev => ({ ...prev, scte35Pid: e.target.value }))}
                        placeholder="0x103"
                    />
                  </div>
                </div>
                  </div>
                  </div>
                </div>
          </div>
        )}

        {activeTab === "metadata" && (
          <div className="space-y-4 mt-4">
            <div className="medialive-panel rounded-lg">
              <div className="medialive-panel-header px-6 py-4 rounded-t-lg">
                <h3 className="medialive-panel-title text-lg">SCTE-35 Metadata</h3>
                </div>
              <div className="medialive-panel-content space-y-4">
                <div className="medialive-form-row">
                  <div className="medialive-form-group">
                    <label htmlFor="program_id" className="medialive-form-label">Program ID</label>
                    <input
                      id="program_id"
                      className="medialive-input"
                      value={config.metadata.program_id}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                        metadata: { ...prev.metadata, program_id: e.target.value }
                    }))}
                  />
                </div>
                  <div className="medialive-form-group">
                    <label htmlFor="provider" className="medialive-form-label">Provider</label>
                    <input
                      id="provider"
                      className="medialive-input"
                      value={config.metadata.provider}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                        metadata: { ...prev.metadata, provider: e.target.value }
                    }))}
                  />
                </div>
              </div>
                <div className="medialive-form-row">
                  <div className="medialive-form-group">
                    <label htmlFor="title" className="medialive-form-label">Title</label>
                    <input
                    id="title"
                      className="medialive-input"
                    value={config.metadata.title}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                      metadata: { ...prev.metadata, title: e.target.value }
                    }))}
                  />
                </div>
                  <div className="medialive-form-group">
                    <label htmlFor="stream_id" className="medialive-form-label">Stream ID</label>
                    <input
                      id="stream_id"
                      className="medialive-input"
                      value={config.metadata.stream_id}
                    onChange={(e) => setConfig(prev => ({ 
                      ...prev, 
                        metadata: { ...prev.metadata, stream_id: e.target.value }
                    }))}
                  />
                </div>
              </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
