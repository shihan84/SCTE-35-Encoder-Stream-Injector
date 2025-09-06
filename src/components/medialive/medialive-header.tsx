"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  Settings, 
  HelpCircle, 
  Bell, 
  User, 
  ChevronDown,
  Cloud
} from "lucide-react";

interface MediaLiveHeaderProps {
  title?: string;
  subtitle?: string;
  showChannelInfo?: boolean;
  channelStatus?: 'running' | 'stopped' | 'starting' | 'error';
  channelName?: string;
  channelId?: string;
}

export default function MediaLiveHeader({
  title = "AWS Elemental MediaLive",
  subtitle = "SCTE-35 Encoder & Stream Injector",
  showChannelInfo = false,
  channelStatus = 'stopped',
  channelName = "",
  channelId = ""
}: MediaLiveHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'medialive-status-running';
      case 'starting': return 'medialive-status-starting';
      case 'error': return 'medialive-status-error';
      default: return 'medialive-status-stopped';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'Running';
      case 'starting': return 'Starting';
      case 'error': return 'Error';
      default: return 'Stopped';
    }
  };

  return (
    <header className="medialive-header">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and Title */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-300">{subtitle}</p>
              )}
            </div>
          </Link>

          {/* Channel Info */}
          {showChannelInfo && channelName && (
            <div className="hidden md:flex items-center space-x-3 ml-8 pl-8 border-l border-gray-600">
              <div>
                <div className="text-sm text-gray-300">Channel</div>
                <div className="text-white font-medium">{channelName}</div>
              </div>
              <div className={`medialive-status ${getStatusColor(channelStatus)}`}>
                <div className={`medialive-status-dot medialive-status-dot-${channelStatus}`}></div>
                {getStatusText(channelStatus)}
              </div>
              {channelId && (
                <div className="text-sm text-gray-400">ID: {channelId}</div>
              )}
            </div>
          )}
        </div>

        {/* Right side - Navigation and User */}
        <div className="flex items-center space-x-4">
          {/* Region Selector */}
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-sm text-gray-300">Region:</span>
            <select className="bg-transparent text-white border border-gray-600 rounded px-2 py-1 text-sm">
              <option value="us-east-1">US East (N. Virginia)</option>
              <option value="us-west-2">US West (Oregon)</option>
              <option value="eu-west-1">EU (Ireland)</option>
              <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
            </select>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
            <Bell className="w-5 h-5" />
            <Badge variant="secondary" className="ml-1 bg-orange-500 text-white">3</Badge>
          </Button>

          {/* Help */}
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
            <HelpCircle className="w-5 h-5" />
          </Button>

          {/* Settings */}
          <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700">
            <Settings className="w-5 h-5" />
          </Button>

          {/* User Menu */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-gray-700"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <User className="w-5 h-5 mr-2" />
              MediaLive User
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="font-medium text-gray-900">MediaLive User</div>
                  <div className="text-sm text-gray-500">user@example.com</div>
                </div>
                <div className="py-2">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    My Profile
                  </Link>
                  <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </Link>
                  <Link href="/billing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Billing & Cost Management
                  </Link>
                </div>
                <div className="py-2 border-t border-gray-200">
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden text-white hover:bg-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-gray-600">
          <div className="pt-4 space-y-3">
            {/* Mobile Channel Info */}
            {showChannelInfo && channelName && (
              <div className="px-4 py-3 bg-gray-800 rounded">
                <div className="text-sm text-gray-300">Channel</div>
                <div className="text-white font-medium">{channelName}</div>
                <div className={`medialive-status ${getStatusColor(channelStatus)} mt-2`}>
                  <div className={`medialive-status-dot medialive-status-dot-${channelStatus}`}></div>
                  {getStatusText(channelStatus)}
                </div>
              </div>
            )}

            {/* Mobile Region Selector */}
            <div className="px-4">
              <label className="text-sm text-gray-300">Region:</label>
              <select className="w-full mt-1 bg-gray-800 text-white border border-gray-600 rounded px-3 py-2">
                <option value="us-east-1">US East (N. Virginia)</option>
                <option value="us-west-2">US West (Oregon)</option>
                <option value="eu-west-1">EU (Ireland)</option>
                <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
              </select>
            </div>

            {/* Mobile Navigation */}
            <div className="px-4 space-y-2">
              <Link href="/encoder" className="block py-2 text-white hover:bg-gray-800 rounded px-3">
                SCTE-35 Encoder
              </Link>
              <Link href="/stream-injection" className="block py-2 text-white hover:bg-gray-800 rounded px-3">
                Stream Injection
              </Link>
              <Link href="/monitor" className="block py-2 text-white hover:bg-gray-800 rounded px-3">
                Monitor
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}