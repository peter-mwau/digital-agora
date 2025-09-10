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

export interface Discussion {
  id: string;
  title: string;
  content: string;
  tags: Tag[] | string[];
  participants?: User[];
  createdAt: string | number;
  // optional fields used for local posts
  media?: string;
  link?: string;
  aiAssist?: boolean;
  metadataIpfs?: string;
  // author can be a simple string or a richer object
  author?: string | { name?: string; address?: string };
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
