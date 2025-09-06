"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Radio, 
  Zap, 
  Activity, 
  Settings, 
  FileText, 
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Database,
  Shield,
  BarChart3
} from "lucide-react";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
  children?: SidebarItem[];
}

interface MediaLiveSidebarProps {
  className?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
    description: "Overview and quick access"
  },
  {
    name: "Channels",
    href: "/channels",
    icon: Radio,
    description: "Manage MediaLive channels",
    children: [
      {
        name: "Create Channel",
        href: "/channels/create",
        icon: Radio,
        description: "Create a new channel"
      },
      {
        name: "Channel Templates",
        href: "/channels/templates",
        icon: Radio,
        description: "Use predefined templates"
      }
    ]
  },
  {
    name: "SCTE-35 Encoder",
    href: "/encoder",
    icon: Radio,
    description: "Encode SCTE-35 messages",
    badge: "NEW"
  },
  {
    name: "Stream Injection",
    href: "/stream-injection",
    icon: Zap,
    description: "Inject SCTE-35 into live streams"
  },
  {
    name: "Monitor",
    href: "/monitor",
    icon: Activity,
    description: "Monitor stream health and metrics"
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "View detailed analytics",
    children: [
      {
        name: "Stream Analytics",
        href: "/analytics/streams",
        icon: BarChart3,
        description: "Stream performance data"
      },
      {
        name: "SCTE-35 Analytics",
        href: "/analytics/scte35",
        icon: BarChart3,
        description: "SCTE-35 insertion analytics"
      }
    ]
  },
  {
    name: "Inputs",
    href: "/inputs",
    icon: Database,
    description: "Manage input sources"
  },
  {
    name: "Security",
    href: "/security",
    icon: Shield,
    description: "Security and access control"
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "System configuration",
    children: [
      {
        name: "General Settings",
        href: "/settings/general",
        icon: Settings,
        description: "General system settings"
      },
      {
        name: "Stream Settings",
        href: "/settings/streams",
        icon: Settings,
        description: "Stream configuration"
      },
      {
        name: "SCTE-35 Settings",
        href: "/settings/scte35",
        icon: Settings,
        description: "SCTE-35 configuration"
      }
    ]
  },
  {
    name: "Documentation",
    href: "/docs",
    icon: FileText,
    description: "Documentation and guides"
  },
  {
    name: "Help & Support",
    href: "/support",
    icon: HelpCircle,
    description: "Get help and support"
  }
];

export default function MediaLiveSidebar({ className }: MediaLiveSidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (href: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(href)) {
      newExpanded.delete(href);
    } else {
      newExpanded.add(href);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const isExpanded = expandedItems.has(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.href);

    return (
      <div key={item.href}>
        <Link
          href={hasChildren ? '#' : item.href}
          onClick={hasChildren ? (e) => {
            e.preventDefault();
            toggleExpanded(item.href);
          } : undefined}
          className={cn(
            "flex items-center px-4 py-3 text-sm font-medium transition-colors",
            level > 0 && "pl-8",
            active
              ? "bg-orange-50 text-orange-700 border-r-2 border-orange-500"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          <item.icon className={cn("mr-3 h-5 w-5", active && "text-orange-500")} />
          <span className="flex-1">{item.name}</span>
          <div className="flex items-center space-x-2">
            {item.badge && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                {item.badge}
              </span>
            )}
            {hasChildren && (
              <span className="ml-2">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>
            )}
          </div>
        </Link>
        
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {item.children.map((child) => renderSidebarItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={cn("medialive-sidebar w-64", className)}>
      <div className="p-4">
        <nav className="space-y-1">
          {sidebarItems.map((item) => renderSidebarItem(item))}
        </nav>
      </div>
      
      {/* Bottom Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 mb-2">AWS Elemental MediaLive</div>
        <div className="text-xs text-gray-400">Version 2.0.0</div>
        <div className="mt-2">
          <Link 
            href="/docs/release-notes" 
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Release Notes
          </Link>
        </div>
      </div>
    </aside>
  );
}