import { useEffect, useRef, useState, useCallback } from "react";
import type { WebSocketMessage, TypingUser } from "@/types";

interface UseWebSocketOptions {
  userId?: string;
  discussionId?: string;
  onMessage?: (message: WebSocketMessage) => void;
}

export function useWebSocket({ userId, discussionId, onMessage }: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);

        // Join user session if userId provided
        if (userId) {
          ws.send(JSON.stringify({
            type: "join_user",
            payload: { userId },
            timestamp: new Date().toISOString(),
          }));
        }

        // Join discussion if discussionId provided
        if (discussionId) {
          ws.send(JSON.stringify({
            type: "join_discussion",
            payload: { discussionId },
            timestamp: new Date().toISOString(),
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Handle built-in message types
          switch (message.type) {
            case "user_typing":
              setTypingUsers(prev => {
                const filtered = prev.filter(u => u.userId !== message.payload.userId);
                if (message.payload.isTyping) {
                  return [...filtered, message.payload];
                }
                return filtered;
              });
              break;
          }

          // Call custom message handler
          if (onMessage) {
            onMessage(message);
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
    }
  }, [userId, discussionId, onMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message: Omit<WebSocketMessage, "timestamp">) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString(),
      }));
    }
  }, []);

  const startTyping = useCallback(() => {
    if (discussionId) {
      sendMessage({
        type: "typing_start",
        payload: { discussionId },
      });
    }
  }, [discussionId, sendMessage]);

  const stopTyping = useCallback(() => {
    if (discussionId) {
      sendMessage({
        type: "typing_stop",
        payload: { discussionId },
      });
    }
  }, [discussionId, sendMessage]);

  const handleTyping = useCallback(() => {
    startTyping();
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  }, [startTyping, stopTyping]);

  // Connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    handleTyping,
    connect,
    disconnect,
  };
}
