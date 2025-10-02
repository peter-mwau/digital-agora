// Types for WebSocket messages, users, discussions, tags, and Gemini agent

export interface WebSocketMessage {
  type: string;
  payload: unknown;
  timestamp: string;
}

export interface TypingUser {
  userId: string;
  isTyping: boolean;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Reply {
  id: string;
  content: string;
}

export interface Discussion {
  id: string;
  content: string;
  title?: string;
  author: string;
  authorId: string; // Add this if missing
  createdAt: string;
  tags: string[];
  upvotes: number;
  replies: Reply[];
  views: number;
  media?: string;
  link?: string;
  aiAssist?: boolean;
}

export interface User {
  id: string;
  walletAddress: string;
  username: string;
  avatar?: string;
  createdAt: Date;
  isGeminiAgent?: boolean;
}

// Gemini agent type
export interface GeminiAgent extends User {
  isGeminiAgent: true;
  description: string;
}
