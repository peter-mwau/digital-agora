import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPinnedData } from "../services/pinata";
// import { User } from "../types";
// Removed Card, Badge, Button imports
// import AiAgentsPanel from "./ai-agents-panel";
import {
  Database,
  Users,
  Tag,
  TrendingUp,
  Activity,
  Clock,
} from "lucide-react";

interface SidebarProps {
  user: User | null;
  discussionId?: string;
}

interface IPFSStats {
  ipfs: {
    totalSize: number;
    fileCount: number;
    connected: boolean;
    provider: string;
  };
  realtime: {
    activeUsers: number;
    activeDiscussions: number;
  };
}

interface OnlineUser {
  id: string;
  username: string;
  status: string;
  lastSeen: Date;
}

// Mock trending tags - in production this would come from analytics
const trendingTags = [
  "#decentralization",
  "#web3",
  "#ipfs",
  "#ai",
  "#blockchain",
];

// Mock online users - in production this would come from WebSocket data
const mockOnlineUsers: OnlineUser[] = [
  {
    id: "1",
    username: "johndoe.eth",
    status: "Discussing Web3",
    lastSeen: new Date(),
  },
  {
    id: "2",
    username: "alice.eth",
    status: "Reading",
    lastSeen: new Date(),
  },
];

export default function Sidebar({ user, discussionId }: SidebarProps) {
  const [stats, setStats] = useState<IPFSStats | null>(null);

  const { data: pinnedRows, isLoading: statsLoading } = useQuery({
    queryKey: ["ipfs-pins"],
    queryFn: () => getPinnedData(),
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (pinnedRows) {
      // derive some lightweight stats from pinned rows
      const files = pinnedRows || [];
      const totalSize = files.reduce(
        (acc: number, r: any) => acc + (r.size || 0),
        0
      );
      const fileCount = files.length;
      setStats({
        ipfs: {
          totalSize,
          fileCount,
          connected: true,
          provider: "Pinata",
        },
        realtime: {
          activeUsers: mockOnlineUsers.length + 2,
          activeDiscussions: Math.max(1, fileCount),
        },
      });
    }
  }, [pinnedRows]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const getStatusColor = (status: string) => {
    if (status.toLowerCase().includes("discussing")) return "text-blue-400";
    if (status.toLowerCase().includes("reading")) return "text-green-400";
    return "text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      {/* AI Agents Panel */}

      {/* AI Agents Panel */}
      {/* <div className="mb-6">
        <AiAgentsPanel user={user} discussionId={discussionId} />
      </div> */}

      {/* Trending Topics */}
      <div
        className="bg-white dark:bg-cyan-900 rounded-lg shadow p-4 mb-6"
        data-testid="card-trending-topics"
      >
        <div className="flex items-center text-base font-semibold mb-2">
          <TrendingUp className="h-5 w-5 mr-2" />
          Trending Topics
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map((tag, index) => (
            <div
              key={index}
              className="px-2 py-1 rounded bg-cyan-200 dark:bg-cyan-800 text-cyan-900 dark:text-cyan-100 cursor-pointer hover:bg-cyan-300/70 dark:hover:bg-cyan-700/70 transition-colors text-sm flex items-center"
              data-testid={`trending-tag-${index}`}
            >
              <Tag className="h-3 w-3 mr-1" />
              {tag}
            </div>
          ))}
        </div>
      </div>

      {/* IPFS Storage Status */}
      <div
        className="bg-white dark:bg-cyan-900 rounded-lg shadow p-4 mb-6"
        data-testid="card-ipfs-status"
      >
        <div className="flex items-center text-base font-semibold mb-2">
          <Database className="h-5 w-5 mr-2 text-green-400" />
          IPFS Status
        </div>
        {statsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Connection</span>
              <span
                className="text-green-400 flex items-center"
                data-testid="text-ipfs-connection"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                {stats?.ipfs.connected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pinning Service</span>
              <span className="text-green-400" data-testid="text-ipfs-provider">
                {stats?.ipfs.provider || "Pinata"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Storage Used</span>
              <span data-testid="text-ipfs-storage">
                {stats?.ipfs.totalSize
                  ? formatBytes(stats.ipfs.totalSize)
                  : "2.3 GB"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Files Stored</span>
              <span data-testid="text-ipfs-files">
                {stats?.ipfs.fileCount || 0}
              </span>
            </div>

            <div className="pt-3 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2 flex items-center">
                <Activity className="h-3 w-3 mr-1" />
                Recent Activity
              </div>
              <div className="text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span>Discussion pinned</span>
                  <span className="text-green-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />2 min ago
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Comment stored</span>
                  <span className="text-green-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />5 min ago
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* </div> */}

      {/* Active Users */}
      <div
        className="bg-white dark:bg-cyan-900 rounded-lg shadow p-4 mb-6"
        data-testid="card-active-users"
      >
        <div className="flex items-center text-base font-semibold mb-2">
          <Users className="h-5 w-5 mr-2" />
          Active Now
        </div>
        <div className="space-y-3">
          {mockOnlineUsers.map((onlineUser) => (
            <div
              key={onlineUser.id}
              className="flex items-center space-x-3"
              data-testid={`active-user-${onlineUser.id}`}
            >
              <div className="relative">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-xs">
                    {getInitials(onlineUser.username)}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
              </div>
              <div className="flex-1">
                <div
                  className="font-medium text-sm"
                  data-testid={`user-name-${onlineUser.id}`}
                >
                  {onlineUser.username}
                </div>
                <div
                  className={`text-xs ${getStatusColor(onlineUser.status)}`}
                  data-testid={`user-status-${onlineUser.id}`}
                >
                  {onlineUser.status}
                </div>
              </div>
            </div>
          ))}

          {stats?.realtime && (
            <div className="text-center pt-2">
              <span
                className="text-xs text-muted-foreground"
                data-testid="text-total-active"
              >
                +
                {Math.max(
                  0,
                  stats.realtime.activeUsers - mockOnlineUsers.length
                )}{" "}
                others online
              </span>
            </div>
          )}
        </div>
      </div>
      {/* </div> */}

      {/* Real-time Statistics */}
      {stats?.realtime && (
        <div
          className="bg-white dark:bg-cyan-900 rounded-lg shadow p-4 mb-6"
          data-testid="card-realtime-stats"
        >
          <div className="flex items-center text-base font-semibold mb-2">
            <Activity className="h-5 w-5 mr-2 text-primary" />
            Real-time Stats
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Users</span>
              <span
                className="font-medium"
                data-testid="text-active-users-count"
              >
                {stats.realtime.activeUsers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active Discussions</span>
              <span
                className="font-medium"
                data-testid="text-active-discussions-count"
              >
                {stats.realtime.activeDiscussions}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
