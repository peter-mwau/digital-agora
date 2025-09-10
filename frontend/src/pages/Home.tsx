import {
  ConnectButton,
  darkTheme,
  lightTheme,
  useActiveAccount,
} from "thirdweb/react";
import { inAppWallet } from "thirdweb/wallets";
import { defineChain } from "thirdweb/chains";
import { thirdwebClient } from "../client";
import {
  Bell,
  Search,
  Sun,
  Moon,
  Plus,
  MessageSquare,
  ThumbsUp,
  Share,
  MoreHorizontal,
  Calendar,
  ChevronDown,
  Eye,
  Tag,
  Users,
  TrendingUp,
  Zap,
  Globe,
  Filter,
  BarChart3,
  Activity,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import type { User, Discussion } from "../types";
import CreateDiscussion from "../components/CreateDiscussion";
import DiscussionFeed from "../components/DiscussionFeed";
import { uploadFileToPinata, uploadMetadataToIPFS } from "../services/pinata";
import useDiscussions from "../contexts/useDiscussions";

function Home() {
  type PinataResp = { IpfsHash?: string; ipfsHash?: string };

  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );

  const activeAccount = useActiveAccount();
  const {
    discussions,
    loading: discussionsLoading,
    addDiscussion,
    insertDiscussion,
  } = useDiscussions();
  const discussion = discussions[0];
  const discussionLoading = false;

  const [showCreateDiscussion, setShowCreateDiscussion] = useState(false);
  const [hoverTimestamp, setHoverTimestamp] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [activeCategory, setActiveCategory] = useState("all");
  const wsRef = useRef<WebSocket | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");
    wsRef.current = ws;

    ws.addEventListener("message", (ev) => {
      try {
        const data = JSON.parse(ev.data as string);
        if (data && data.type === "new-discussion" && data.payload) {
          insertDiscussion(data.payload as Discussion);
        }
      } catch (err) {
        console.error("Invalid WS message", err);
      }
    });

    ws.addEventListener("close", () => {
      console.log("WS disconnected");
      wsRef.current = null;
    });

    return () => {
      ws.close();
    };
  }, [insertDiscussion]);

  // Handle mouse movement to show timestamps
  // Just track mouse position, don't set hoverTimestamp
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setHoverPosition({ x: e.clientX, y: e.clientY });
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const user: User | null = activeAccount
    ? {
        id: activeAccount.address,
        walletAddress: activeAccount.address,
        username: activeAccount.address.slice(0, 8),
        avatar: undefined,
        createdAt: new Date(),
      }
    : null;

  const wallets = [
    inAppWallet({
      auth: { options: ["discord", "passkey", "google", "github", "facebook"] },
      metadata: {
        name: "Test App",
        image: {
          src: "/public/vite.svg",
          width: 50,
          height: 50,
        },
      },
      executionMode: {
        mode: "EIP7702",
        sponsorGas: true,
      },
      smartAccount: {
        chain: defineChain(1020352220),
        sponsorGas: true,
      },
    }),
  ];

  type WithMeta = Discussion & { metadataIpfs?: string };

  const customTheme = isDark
    ? darkTheme({
        colors: {
          separatorLine: "hsl(188, 100%, 42%)",
          accentText: "hsl(188, 100%, 42%)",
          modalBg: "hsl(217, 33%, 8%)",
          borderColor: "hsl(217, 33%, 15%)",
          selectedTextColor: "hsl(217, 33%, 20%)",
          primaryText: "hsl(0, 0%, 98%)",
          secondaryText: "hsl(0, 0%, 75%)",
          accentButtonBg: "hsl(188, 100%, 42%)",
          accentButtonText: "hsl(217, 33%, 8%)",
        },
      })
    : lightTheme({
        colors: {
          separatorLine: "hsl(188, 100%, 42%)",
          accentText: "hsl(188, 100%, 42%)",
          modalBg: "hsl(0, 0%, 100%)",
          borderColor: "hsl(0, 0%, 90%)",
          selectedTextColor: "hsl(188, 100%, 95%)",
          primaryText: "hsl(217, 33%, 8%)",
          secondaryText: "hsl(0, 0%, 40%)",
          accentButtonBg: "hsl(188, 100%, 42%)",
          accentButtonText: "hsl(0, 0%, 100%)",
          connectedButtonBg: "hsl(188, 100%, 42%)",
          connectedButtonBgHover: "hsl(188, 100%, 38%)",
        },
      });

  // Enhanced categories with futuristic styling
  const categories = [
    { id: "all", name: "All Topics", icon: Globe, count: 1247 },
    { id: "core", name: "Core Protocol", icon: Zap, count: 342 },
    { id: "erc", name: "ERC Standards", icon: BarChart3, count: 156 },
    { id: "ui", name: "UX & Design", icon: Eye, count: 89 },
    { id: "security", name: "Security", icon: Activity, count: 67 },
    { id: "governance", name: "Governance", icon: Users, count: 45 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-cyan-900 text-slate-900 dark:text-slate-100 transition-all duration-300">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-cyan-300 dark:bg-cyan-600 rounded-full opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-8 w-96 h-96 bg-blue-300 dark:bg-blue-600 rounded-full opacity-5 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-10 right-1/3 w-80 h-80 bg-purple-300 dark:bg-purple-600 rounded-full opacity-5 blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Hover timestamp indicator */}
      {hoverTimestamp && (
        <div
          className="fixed z-50 px-4 py-2.5 text-xs rounded-xl bg-slate-900/90 dark:bg-slate-100/90 text-white dark:text-slate-900 pointer-events-none shadow-2xl backdrop-blur-sm border border-cyan-500/30"
          style={{ left: hoverPosition.x + 15, top: hoverPosition.y - 15 }}
        >
          <div className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-2" />
            {hoverTimestamp}
          </div>
        </div>
      )}

      {/* Futuristic Navigation */}
      <nav className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5"></div>
        <div className="relative max-w-[80%] mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-20 blur group-hover:opacity-40 transition-opacity"></div>
                <img
                  src="/vite.svg"
                  alt="ABYA Logo"
                  className="relative h-10 w-10"
                />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ABYA Forum
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Decentralized Discussions
                </p>
              </div>

              <div className="hidden lg:flex ml-12 space-x-8">
                {[
                  { name: "Home", active: true },
                  { name: "Topics" },
                  { name: "Categories" },
                  { name: "Users" },
                ].map((item) => (
                  <a
                    key={item.name}
                    href="#"
                    className={`relative py-2 px-1 text-sm font-medium transition-all duration-200 ${
                      item.active
                        ? "text-cyan-600 dark:text-cyan-400"
                        : "text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400"
                    }`}
                  >
                    {item.name}
                    {item.active && (
                      <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
                    )}
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="search"
                    placeholder="Search discussions..."
                    className="pl-11 pr-4 py-3 w-80 rounded-xl border border-slate-200/50 dark:border-slate-700/50 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-sm transition-all duration-200"
                  />
                </div>
              </div>

              <button
                onClick={() => setIsDark(!isDark)}
                className="relative p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all duration-200 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  {isDark ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </div>
              </button>

              <button className="relative p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all duration-200 group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full shadow-lg">
                    3
                  </span>
                </div>
              </button>

              <div className="relative">
                <ConnectButton
                  client={thirdwebClient}
                  wallets={wallets}
                  connectButton={{
                    label: "Connect Wallet",
                    style: {
                      background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      padding: "12px 24px",
                      fontSize: "14px",
                      fontWeight: "600",
                      boxShadow: "0 8px 32px rgba(6, 182, 212, 0.3)",
                    },
                  }}
                  connectModal={{
                    size: "wide",
                    showThirdwebBranding: false,
                    welcomeScreen: {
                      title: "Connect to ABYA Discussion",
                      subtitle: "Choose your preferred sign-in method",
                    },
                    privacyPolicyUrl: `${window.location.origin}/privacy`,
                    termsOfServiceUrl: `${window.location.origin}/terms`,
                  }}
                  theme={customTheme}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Category Navigation */}
        <div className="border-t border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/80 via-white/80 to-slate-50/80 dark:from-slate-800/80 dark:via-slate-900/80 dark:to-slate-800/80 backdrop-blur-sm">
          <div className="max-w-[80%] mx-auto px-6">
            <div className="flex overflow-x-auto scrollbar-hide py-4">
              <div className="flex space-x-2">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 group ${
                        activeCategory === category.id
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                          : "bg-white/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-700/70 border border-slate-200/50 dark:border-slate-700/50"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {category.name}
                      <span
                        className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                          activeCategory === category.id
                            ? "bg-white/20 text-white"
                            : "bg-slate-200/50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {category.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[80%] mx-auto px-6 py-8">
        <div className="flex flex-col xl:flex-row gap-8">
          {/* Main Content Area */}
          <div className="w-full xl:w-3/4">
            {/* Enhanced Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="relative">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-cyan-600 to-blue-600 dark:from-slate-100 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">
                  Community Discussions
                </h2>
                <div className="flex items-center space-x-6 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1.5" />
                    {discussions.length} topics
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1.5" />
                    128 participants
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1.5" />
                    342 replies
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 mt-6 lg:mt-0">
                <div className="relative group">
                  <select className="appearance-none bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 rounded-xl py-3 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all duration-200">
                    <option>Latest Activity</option>
                    <option>Most Viewed</option>
                    <option>Most Liked</option>
                    <option>Trending</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                <button
                  onClick={() => setShowCreateDiscussion(true)}
                  className="relative flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg shadow-cyan-500/25 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  <Plus className="w-4 h-4 mr-2 relative z-10" />
                  <span className="relative z-10">New Discussion</span>
                </button>
              </div>
            </div>

            {/* Create Discussion Form */}
            {showCreateDiscussion && (
              <div className="mb-8">
                <CreateDiscussion
                  currentUser={user}
                  onClose={() => setShowCreateDiscussion(false)}
                  onCreated={async (payload) => {
                    const tags = (payload.topic || "")
                      .replace(/[^a-zA-Z0-9\s]/g, " ")
                      .toLowerCase()
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 3)
                      .map((t) => `#${t}`);

                    let mediaIpfs: string | undefined;
                    try {
                      if (payload.mediaFile) {
                        try {
                          const jr = await uploadFileToPinata(
                            payload.mediaFile as File
                          );
                          const maybeHash =
                            typeof jr === "string"
                              ? jr
                              : (jr as unknown as PinataResp)?.IpfsHash ||
                                (jr as unknown as PinataResp)?.ipfsHash ||
                                (jr as unknown as PinataResp)?.IpfsHash;
                          if (maybeHash) mediaIpfs = maybeHash;
                        } catch (e) {
                          console.warn("uploadFileToPinata failed", e);
                        }
                      }
                    } catch (err) {
                      console.error("Media upload failed", err);
                    }

                    const discussion: Discussion = {
                      id: Date.now().toString(),
                      title: payload.topic,
                      content: payload.body,
                      tags: tags.map((t) => (t.startsWith("#") ? t : `#${t}`)),
                      author: user?.username || "anonymous",
                      createdAt: new Date().toISOString(),
                      media: mediaIpfs ? `ipfs://${mediaIpfs}` : undefined,
                      link: payload.link || undefined,
                      aiAssist: payload.aiAssist || false,
                      upvotes: 0,
                      replies: [],
                      views: 0,
                    } as Discussion;

                    try {
                      const jr = await uploadMetadataToIPFS(
                        JSON.parse(JSON.stringify(discussion))
                      );
                      const maybeMetaHash =
                        typeof jr === "string"
                          ? jr
                          : (jr as unknown as PinataResp)?.IpfsHash ||
                            (jr as unknown as PinataResp)?.ipfsHash ||
                            (jr as unknown as PinataResp)?.IpfsHash;
                      if (maybeMetaHash) {
                        const d = discussion as WithMeta;
                        d.metadataIpfs = `ipfs://${maybeMetaHash}`;
                      }
                    } catch (err) {
                      console.error("uploadMetadataToIPFS failed", err);
                    }

                    try {
                      wsRef.current?.send(
                        JSON.stringify({
                          type: "new-discussion",
                          payload: discussion,
                        })
                      );
                    } catch (err) {
                      console.error("WS send failed", err);
                    }

                    try {
                      await addDiscussion(
                        discussion as Omit<Discussion, "id" | "createdAt">
                      );
                    } catch (e) {
                      console.warn(
                        "addDiscussion failed, falling back to insertDiscussion",
                        e
                      );
                      insertDiscussion(discussion);
                    }
                    setShowCreateDiscussion(false);
                  }}
                />
              </div>
            )}

            {/* Enhanced Discussion List */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
              {/* Table Header */}
              <div className="bg-gradient-to-r from-slate-100/80 via-white/80 to-slate-100/80 dark:from-slate-700/80 dark:via-slate-800/80 dark:to-slate-700/80 border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <div className="col-span-6">Topic</div>
                  <div className="col-span-2 text-center">Replies</div>
                  <div className="col-span-2 text-center">Views</div>
                  <div className="col-span-2">Activity</div>
                </div>
              </div>

              {/* Discussion Feed */}
              <div
                ref={feedRef}
                className="overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent"
                style={{ maxHeight: "calc(100vh - 320px)" }}
              >
                <DiscussionFeed
                  discussions={discussions}
                  loading={discussionsLoading || discussionLoading}
                />
              </div>
            </div>

            {/* Enhanced Pagination */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg px-6 py-4">
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-4 sm:mb-0">
                Showing <span className="font-medium">1-20</span> of{" "}
                <span className="font-medium">124</span> topics
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-200/80 dark:hover:bg-slate-600/80 transition-all duration-200">
                  Previous
                </button>
                <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium shadow-lg shadow-cyan-500/25">
                  1
                </button>
                <button className="px-4 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-200/80 dark:hover:bg-slate-600/80 transition-all duration-200">
                  2
                </button>
                <button className="px-4 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-200/80 dark:hover:bg-slate-600/80 transition-all duration-200">
                  3
                </button>
                <button className="px-4 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400 text-sm font-medium hover:bg-slate-200/80 dark:hover:bg-slate-600/80 transition-all duration-200">
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          {/* Collapsible Sidebar */}
          <div className="flex h-full items-start">
            {/* Vertical Timeline - Positioned relative to sidebar */}
            <div className="relative mr-4">
              <div
                className="relative w-6 cursor-pointer"
                ref={timelineRef}
                style={{ height: "500px" }} // Fixed height
                onMouseMove={(e) => {
                  if (!discussions.length) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const ratio = Math.max(0, Math.min(1, y / rect.height));
                  const idx = Math.min(
                    discussions.length - 1,
                    Math.floor(ratio * discussions.length)
                  );
                  const post = discussions[idx];
                  if (post) {
                    setHoverTimestamp(
                      new Date(post.createdAt).toLocaleString()
                    );
                    setHoverPosition({
                      x: rect.right + 10, // Position to the right of timeline
                      y: e.clientY,
                    });
                  }
                }}
                onMouseLeave={() => setHoverTimestamp(null)}
                onClick={(e) => {
                  if (!discussions.length) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const ratio = Math.max(0, Math.min(1, y / rect.height));
                  const idx = Math.min(
                    discussions.length - 1,
                    Math.floor(ratio * discussions.length)
                  );
                  const post = discussions[idx];

                  if (post) {
                    const element = document.getElementById(`post-${post.id}`);
                    element?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }
                }}
              >
                {/* Vertical Line */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-slate-400 dark:bg-slate-500 h-full rounded-full"></div>

                {/* Subtle hover effect */}
                <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-2 bg-blue-400/20 h-full rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Sidebar - Positioned next to timeline */}
            <div className="relative">
              {/* Sidebar Toggle */}
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="group relative w-3 h-96 bg-gradient-to-b from-cyan-500/20 via-blue-500/20 to-purple-500/20 hover:from-cyan-500/40 hover:via-blue-500/40 hover:to-purple-500/40 rounded-full transition-all duration-300 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-all duration-200" />
                </button>
              )}

              {/* Expandable Sidebar */}
              <div
                className={`absolute left-0 top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl transition-all duration-500 ease-out ${
                  sidebarOpen
                    ? "w-80 opacity-100 scale-100 transform-gpu"
                    : "w-0 opacity-0 scale-95 transform-gpu pointer-events-none"
                }`}
                style={{
                  height: "calc(100vh - 200px)",
                  maxHeight: "800px",
                  transformOrigin: "left center",
                }}
              >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200/50 dark:border-slate-700/50">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Community Info
                  </h3>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-700/50 transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/30 scrollbar-track-transparent p-4 space-y-6">
                  {/* Sidebar Component */}
                  <Sidebar user={user} discussionId={discussion?.id} />

                  {/* Live Activity Widget */}
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 dark:from-green-500/20 dark:via-emerald-500/20 dark:to-teal-500/20 border-b border-slate-200/50 dark:border-slate-700/50 px-4 py-3">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        Live Activity
                      </h4>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                          <div key={i} className="relative group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900/50 dark:to-blue-900/50 flex items-center justify-center text-xs font-semibold text-cyan-700 dark:text-cyan-300 border border-cyan-200/50 dark:border-cyan-700/50">
                              U{i}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 border border-white dark:border-slate-800 shadow-sm"></div>
                          </div>
                        ))}
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            42
                          </span>{" "}
                          users active
                        </p>
                        <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full w-3/4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Forum Stats */}
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-purple-500/10 dark:from-blue-500/20 dark:via-cyan-500/20 dark:to-purple-500/20 border-b border-slate-200/50 dark:border-slate-700/50 px-4 py-3">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center">
                        <BarChart3 className="w-3 h-3 mr-2 text-blue-600 dark:text-blue-400" />
                        Forum Metrics
                      </h4>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        {
                          label: "Topics",
                          value: "1.2k",
                          change: "+12%",
                          color: "cyan",
                        },
                        {
                          label: "Replies",
                          value: "5.8k",
                          change: "+8%",
                          color: "blue",
                        },
                        {
                          label: "Members",
                          value: "842",
                          change: "+24%",
                          color: "purple",
                        },
                        {
                          label: "Active Today",
                          value: "156",
                          change: "+5%",
                          color: "green",
                        },
                      ].map((stat, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 dark:bg-slate-700/50 border border-slate-200/30 dark:border-slate-600/30"
                        >
                          <div>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {stat.label}
                            </p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {stat.value}
                            </p>
                          </div>
                          <div
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              stat.color === "cyan"
                                ? "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300"
                                : stat.color === "blue"
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                : stat.color === "purple"
                                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                                : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            }`}
                          >
                            {stat.change}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Contributors */}
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 dark:from-amber-500/20 dark:via-orange-500/20 dark:to-red-500/20 border-b border-slate-200/50 dark:border-slate-700/50 px-4 py-3">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center">
                        <TrendingUp className="w-3 h-3 mr-2 text-orange-600 dark:text-orange-400" />
                        Top Contributors
                      </h4>
                    </div>
                    <div className="p-4 space-y-3">
                      {[
                        {
                          rank: 1,
                          name: "CryptoWizard",
                          posts: 372,
                          avatar: "CW",
                          gradient: "from-yellow-400 to-orange-500",
                        },
                        {
                          rank: 2,
                          name: "BlockBuilder",
                          posts: 248,
                          avatar: "BB",
                          gradient: "from-gray-400 to-gray-600",
                        },
                        {
                          rank: 3,
                          name: "DeFiExplorer",
                          posts: 186,
                          avatar: "DE",
                          gradient: "from-amber-600 to-amber-800",
                        },
                      ].map((contributor, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 dark:bg-slate-700/50 border border-slate-200/30 dark:border-slate-600/30 hover:bg-slate-100/80 dark:hover:bg-slate-600/50 transition-all duration-200"
                        >
                          <div className="flex items-center">
                            <div className="relative">
                              <div
                                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${contributor.gradient} flex items-center justify-center text-xs font-bold text-white shadow-lg`}
                              >
                                {contributor.avatar}
                              </div>
                              <div
                                className={`absolute -top-0.5 -left-0.5 w-4 h-4 rounded-md flex items-center justify-center text-xs font-bold text-white shadow-md ${
                                  contributor.rank === 1
                                    ? "bg-gradient-to-br from-yellow-400 to-orange-500"
                                    : contributor.rank === 2
                                    ? "bg-gradient-to-br from-gray-400 to-gray-600"
                                    : "bg-gradient-to-br from-amber-600 to-amber-800"
                                }`}
                              >
                                {contributor.rank}
                              </div>
                            </div>
                            <div className="ml-2">
                              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                {contributor.name}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Level {contributor.rank + 4}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 text-cyan-700 dark:text-cyan-300 px-2 py-1 rounded-full font-medium border border-cyan-200/50 dark:border-cyan-700/50">
                            {contributor.posts}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trending Tags */}
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-red-500/10 dark:from-pink-500/20 dark:via-rose-500/20 dark:to-red-500/20 border-b border-slate-200/50 dark:border-slate-700/50 px-4 py-3">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center">
                        <Tag className="w-3 h-3 mr-2 text-pink-600 dark:text-pink-400" />
                        Trending Tags
                      </h4>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          {
                            name: "defi",
                            count: 234,
                            color: "from-blue-500 to-cyan-500",
                          },
                          {
                            name: "nft",
                            count: 189,
                            color: "from-purple-500 to-pink-500",
                          },
                          {
                            name: "web3",
                            count: 156,
                            color: "from-green-500 to-teal-500",
                          },
                          {
                            name: "dao",
                            count: 134,
                            color: "from-orange-500 to-red-500",
                          },
                          {
                            name: "layer2",
                            count: 98,
                            color: "from-indigo-500 to-purple-500",
                          },
                          {
                            name: "ethereum",
                            count: 87,
                            color: "from-gray-600 to-gray-800",
                          },
                        ].map((tag, i) => (
                          <button
                            key={i}
                            className={`px-2 py-1 rounded-lg bg-gradient-to-r ${tag.color} text-white text-xs font-medium shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105`}
                          >
                            #{tag.name}
                            <span className="ml-1 px-1 py-0.5 bg-white/20 rounded-full text-xs">
                              {tag.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Feed */}
                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-blue-500/10 dark:from-teal-500/20 dark:via-cyan-500/20 dark:to-blue-500/20 border-b border-slate-200/50 dark:border-slate-700/50 px-4 py-3">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center">
                        <Activity className="w-3 h-3 mr-2 text-teal-600 dark:text-teal-400" />
                        Recent Activity
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      {[
                        {
                          user: "Alice",
                          action: "replied to",
                          topic: "ERC-4337 Implementation",
                          time: "2m ago",
                          type: "reply",
                        },
                        {
                          user: "Bob",
                          action: "created",
                          topic: "New DeFi Protocol Discussion",
                          time: "5m ago",
                          type: "topic",
                        },
                        {
                          user: "Charlie",
                          action: "liked",
                          topic: "Layer 2 Scaling Solutions",
                          time: "8m ago",
                          type: "like",
                        },
                        {
                          user: "Diana",
                          action: "replied to",
                          topic: "DAO Governance Proposal",
                          time: "12m ago",
                          type: "reply",
                        },
                        {
                          user: "Eve",
                          action: "created",
                          topic: "Smart Contract Security",
                          time: "15m ago",
                          type: "topic",
                        },
                      ].map((activity, i) => (
                        <div
                          key={i}
                          className="flex items-start space-x-2 p-2 rounded-lg hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-all duration-200"
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                              activity.type === "reply"
                                ? "bg-blue-500"
                                : activity.type === "topic"
                                ? "bg-green-500"
                                : "bg-pink-500"
                            }`}
                          ></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-900 dark:text-white">
                              <span className="font-medium">
                                {activity.user}
                              </span>
                              <span className="text-slate-600 dark:text-slate-400">
                                {" "}
                                {activity.action}{" "}
                              </span>
                              <span className="font-medium truncate">
                                {activity.topic}
                              </span>
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {activity.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Tooltip */}
            {hoverTimestamp && (
              <div
                className="fixed bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium px-3 py-2 rounded-lg shadow-xl pointer-events-none z-50 border border-slate-700 dark:border-slate-300"
                style={{
                  left: hoverPosition.x,
                  top: hoverPosition.y,
                  transform: "translateY(-50%)",
                }}
              >
                <div className="font-semibold">📅 {hoverTimestamp}</div>
                <div className="text-xs opacity-80 mt-1">
                  Click to jump to post
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
