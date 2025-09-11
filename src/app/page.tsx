"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioWave, Settings, Zap, Activity, Shield, Database, Network, Monitor, ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Memoized feature cards data for performance
  const featureCards = useMemo(() => [
    {
      id: 'stream-injection',
      title: 'Stream Injection',
      description: 'Complete SCTE-35 solution with encoding, injection, and monitoring',
      icon: Zap,
      href: '/stream-injection',
      features: [
        { label: 'SCTE-35 Tools', badge: 'Integrated' },
        { label: 'Live Injection', badge: 'Real-time' },
        { label: 'Multi-Protocol', badge: 'SRT/HLS/RTMP' }
      ],
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'scte35-tools',
      title: 'Professional Tools',
      description: 'Advanced tools for conversion, analysis, and FFmpeg integration',
      icon: Settings,
      href: '/scte35-tools',
      features: [
        { label: 'Data Converter', badge: 'Multi-format' },
        { label: 'FFmpeg Builder', badge: 'Advanced' },
        { label: 'Stream Analyzer', badge: 'Detailed' }
      ],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'monitor',
      title: 'Stream Monitor',
      description: 'Monitor stream health, SCTE-35 activity, and injection performance in real-time',
      icon: Activity,
      href: '/monitor',
      features: [
        { label: 'Live Monitoring', badge: 'Real-time' },
        { label: 'SCTE-35 Detection', badge: 'Automatic' },
        { label: 'Analytics', badge: 'Detailed' }
      ],
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'encoder',
      title: 'Legacy Encoder',
      description: 'Standalone SCTE-35 encoder for advanced users',
      icon: RadioWave,
      href: '/encoder',
      features: [
        { label: 'Splice Insert', badge: 'Supported' },
        { label: 'Time Signal', badge: 'Supported' },
        { label: 'Multiple Formats', badge: 'Base64/Hex' }
      ],
      color: 'from-purple-500 to-pink-500'
    }
  ], []);

  // Memoized enterprise features data
  const enterpriseFeatures = useMemo(() => [
    {
      icon: Settings,
      title: 'Easy Configuration',
      description: 'Intuitive interface for configuring SCTE-35 parameters',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'Real-time Injection',
      description: 'Live SCTE-35 insertion into ongoing streams',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Activity,
      title: 'Stream Monitoring',
      description: 'Comprehensive monitoring and analytics',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: RadioWave,
      title: 'Multi-Protocol',
      description: 'Support for SRT, HLS, DASH, and RTMP',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Enterprise Ready',
      description: 'Full compliance with distributor specifications',
      color: 'from-indigo-500 to-blue-500'
    }
  ], []);

  // Memoized system status data
  const systemStatus = useMemo(() => [
    { service: 'Encoder Service', status: 'Active', healthy: true },
    { service: 'Stream Injection', status: 'Ready', healthy: true },
    { service: 'API Gateway', status: 'Connected', healthy: true },
    { service: 'Database', status: 'Healthy', healthy: true }
  ], []);

  return (
    <div className="medialive-container">
      {/* AWS MediaLive-style Header */}
      <header className="bg-gradient-to-r from-[#16191f] to-[#0f1419] border-b border-[#232f3e] px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#ff9900] to-[#ff8800] rounded-lg flex items-center justify-center animate-pulse-glow">
                  <Zap className="w-8 h-8 text-[#0f1419]" aria-hidden="true" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">SCTE-35 Encoder & Stream Injector</h1>
                  <p className="text-lg text-[#a0aec0] mt-1">AWS Elemental MediaLive Compatible</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="medialive-status-indicator medialive-status-running" aria-label="System Status: Active"></div>
                <span className="text-sm text-[#a0aec0]">System Active</span>
              </div>
              <Badge className="medialive-badge medialive-badge-success" role="status" aria-label="Production Ready">PRODUCTION READY</Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Hero Section */}
        <section className="text-center space-y-6 mb-12" aria-labelledby="hero-title">
          <h2 id="hero-title" className="text-3xl font-bold text-white">Professional SCTE-35 Solution</h2>
          <p className="text-xl text-[#a0aec0] max-w-3xl mx-auto">
            Enterprise-grade SCTE-35 encoding and real-time stream injection for digital video broadcasting, 
            fully compatible with AWS Elemental MediaLive workflows
          </p>
        </section>

        {/* Feature Cards */}
        <section className="flex flex-wrap justify-center items-start gap-[80px] mb-16 max-w-7xl mx-auto px-8" aria-labelledby="features-title">
          <h2 id="features-title" className="sr-only">Main Features</h2>
          {featureCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Card
                key={card.id}
                className={`medialive-panel hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105 cursor-pointer w-[300px] h-[400px] flex-shrink-0 ${hoveredCard === card.id ? 'shadow-xl border-white/20' : ''}`}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <Link href={card.href} className="h-full flex flex-col">
                  <CardHeader className="medialive-panel-header border-b border-[#232f3e] p-4 flex-shrink-0">
                <div className="flex items-center space-x-2">
                      <IconComponent className="w-5 h-5 text-[#ff9900]" aria-hidden="true" />
                      <CardTitle className="medialive-panel-title text-sm">{card.title}</CardTitle>
                </div>
                    <CardDescription className="medialive-panel-subtitle text-xs leading-tight mt-2">
                      {card.description}
                </CardDescription>
              </CardHeader>
                  <CardContent className="medialive-panel-content flex flex-col justify-between flex-1 p-4">
                    <div className="space-y-2 flex-1">
                      {card.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-xs text-[#a0aec0]">{feature.label}</span>
                          <Badge className="medialive-badge text-xs px-2 py-1">{feature.badge}</Badge>
                  </div>
                      ))}
                  </div>
                    <Button className="medialive-button medialive-button-primary w-full mt-4 text-sm py-2 h-8 flex items-center justify-center gap-2">
                      {card.id === 'stream-injection' ? 'Start Streaming' : card.id === 'monitor' ? 'View Monitor' : 'Open Tools'}
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Button>
              </CardContent>
            </Link>
          </Card>
            );
          })}
        </section>

        {/* Enterprise Features Section */}
        <section className="mb-16" aria-labelledby="enterprise-features-title">
          <Card className="medialive-panel">
              <CardHeader className="medialive-panel-header border-b border-[#232f3e]">
              <CardTitle id="enterprise-features-title" className="medialive-panel-title">Enterprise Features</CardTitle>
            <CardDescription className="medialive-panel-subtitle">
              Comprehensive SCTE-35 solution for professional broadcasting
            </CardDescription>
          </CardHeader>
          <CardContent className="medialive-panel-content">
              <div className="flex flex-wrap justify-center items-center gap-12 px-8">
                {enterpriseFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="text-center space-y-3 flex-1 min-w-[200px] max-w-[250px] mx-4 my-4 group">
                      <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                        <IconComponent className="w-8 h-8 text-white" aria-hidden="true" />
                </div>
                      <h3 className="font-semibold text-white group-hover:text-[#ff9900] transition-colors duration-300">{feature.title}</h3>
                      <p className="text-sm text-[#a0aec0] group-hover:text-white transition-colors duration-300">
                        {feature.description}
                </p>
              </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
        </section>

        {/* System Status */}
        <section className="mb-8" aria-labelledby="system-status-title">
        <Card className="medialive-panel">
          <CardHeader className="medialive-panel-header border-b border-[#232f3e]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                  <Network className="w-5 h-5 text-[#ff9900]" aria-hidden="true" />
                  <CardTitle id="system-status-title" className="medialive-panel-title">System Status</CardTitle>
              </div>
                <Badge className="medialive-badge medialive-badge-success" role="status" aria-label="All Systems Operational">ALL SYSTEMS OPERATIONAL</Badge>
            </div>
          </CardHeader>
          <CardContent className="medialive-panel-content">
              <div className="flex flex-wrap justify-center items-center gap-12 px-8">
                {systemStatus.map((status, index) => (
                  <div key={index} className="flex items-center justify-between flex-1 min-w-[200px] mx-4 my-4 group">
                <div className="flex items-center space-x-3">
                      <div className={`medialive-status-indicator ${status.healthy ? 'medialive-status-running' : 'medialive-status-error'} group-hover:scale-110 transition-transform duration-300`} aria-label={`${status.service} status: ${status.status}`}></div>
                  <div>
                        <span className="text-sm text-[#a0aec0] group-hover:text-white transition-colors duration-300">{status.service}</span>
                        <div className="text-white font-medium group-hover:text-[#ff9900] transition-colors duration-300 flex items-center gap-2">
                          {status.status}
                          {status.healthy && <CheckCircle className="w-4 h-4 text-green-400" aria-hidden="true" />}
                  </div>
                </div>
              </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        </section>
      </main>
    </div>
  );
}