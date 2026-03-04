"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

export interface ChatMessageData {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface InboundWSMessage {
  type: string;
  sessionId?: string;
  message?: ChatMessageData;
  userId?: string;
  [key: string]: unknown;
}

interface UseWebSocketOptions {
  /** WebSocket server URL (default: ws://localhost:3001) */
  url?: string;
  /** Auto-reconnect on disconnect */
  reconnect?: boolean;
  /** Max reconnection attempts */
  maxRetries?: number;
  /** Base delay between retries in ms */
  retryDelay?: number;
}

interface UseWebSocketReturn {
  status: ConnectionStatus;
  sendMessage: (sessionId: string, content: string) => void;
  joinSession: (sessionId: string) => void;
  leaveSession: (sessionId: string) => void;
  startTyping: (sessionId: string) => void;
  stopTyping: (sessionId: string) => void;
  onMessage: (handler: (msg: ChatMessageData) => void) => void;
  onTypingStart: (handler: (sessionId: string, userId: string) => void) => void;
  onTypingStop: (handler: (sessionId: string, userId: string) => void) => void;
  onUserOnline: (handler: (sessionId: string, userId: string) => void) => void;
  onUserOffline: (handler: (sessionId: string, userId: string) => void) => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001",
    reconnect = true,
    maxRetries = 5,
    retryDelay = 1000,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const tokenRef = useRef<string | null>(null);

  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  // Event handler refs — avoids re-creating the WebSocket on every handler change
  const messageHandlerRef = useRef<(msg: ChatMessageData) => void>(() => {});
  const typingStartHandlerRef = useRef<(sid: string, uid: string) => void>(() => {});
  const typingStopHandlerRef = useRef<(sid: string, uid: string) => void>(() => {});
  const userOnlineHandlerRef = useRef<(sid: string, uid: string) => void>(() => {});
  const userOfflineHandlerRef = useRef<(sid: string, uid: string) => void>(() => {});

  // ── Fetch a chat JWT ────────────────────────────────────────────────────
  const fetchToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch("/api/chat/token", { method: "POST" });
      if (!res.ok) return null;
      const data = await res.json();
      return data.token as string;
    } catch {
      return null;
    }
  }, []);

  // ── Connect ─────────────────────────────────────────────────────────────
  const connect = useCallback(async () => {
    // Prevent duplicate connections
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.CONNECTING ||
        wsRef.current.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    setStatus("connecting");

    // Get a fresh token if we don't have one
    if (!tokenRef.current) {
      tokenRef.current = await fetchToken();
    }

    if (!tokenRef.current) {
      setStatus("error");
      return;
    }

    const ws = new WebSocket(`${url}?token=${tokenRef.current}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      retriesRef.current = 0;
      console.log("[WS Client] Connected");
    };

    ws.onmessage = (event) => {
      try {
        const data: InboundWSMessage = JSON.parse(event.data);

        switch (data.type) {
          case "CHAT_MESSAGE":
            if (data.message) {
              messageHandlerRef.current(data.message);
            }
            break;
          case "TYPING_START":
            if (data.sessionId && data.userId) {
              typingStartHandlerRef.current(data.sessionId, data.userId);
            }
            break;
          case "TYPING_STOP":
            if (data.sessionId && data.userId) {
              typingStopHandlerRef.current(data.sessionId, data.userId);
            }
            break;
          case "USER_ONLINE":
            if (data.sessionId && data.userId) {
              userOnlineHandlerRef.current(data.sessionId, data.userId);
            }
            break;
          case "USER_OFFLINE":
            if (data.sessionId && data.userId) {
              userOfflineHandlerRef.current(data.sessionId, data.userId);
            }
            break;
          case "ERROR":
            console.error("[WS Client] Server error:", data.message);
            break;
        }
      } catch (err) {
        console.error("[WS Client] Failed to parse message:", err);
      }
    };

    ws.onclose = () => {
      setStatus("disconnected");
      wsRef.current = null;
      console.log("[WS Client] Disconnected");

      // Auto-reconnect with exponential backoff
      if (reconnect && retriesRef.current < maxRetries) {
        const delay = retryDelay * Math.pow(2, retriesRef.current);
        retriesRef.current++;
        tokenRef.current = null; // Force refresh token
        console.log(
          `[WS Client] Reconnecting in ${delay}ms (attempt ${retriesRef.current}/${maxRetries})`
        );
        reconnectTimerRef.current = setTimeout(connect, delay);
      }
    };

    ws.onerror = () => {
      setStatus("error");
    };
  }, [url, reconnect, maxRetries, retryDelay, fetchToken]);

  // ── Send helper ─────────────────────────────────────────────────────────
  const sendRaw = useCallback((data: Record<string, unknown>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  // ── Public API ──────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    (sessionId: string, content: string) => {
      sendRaw({ type: "CHAT_MESSAGE", sessionId, content });
    },
    [sendRaw]
  );

  const joinSession = useCallback(
    (sessionId: string) => {
      sendRaw({ type: "JOIN_SESSION", sessionId });
    },
    [sendRaw]
  );

  const leaveSession = useCallback(
    (sessionId: string) => {
      sendRaw({ type: "LEAVE_SESSION", sessionId });
    },
    [sendRaw]
  );

  const startTyping = useCallback(
    (sessionId: string) => {
      sendRaw({ type: "TYPING_START", sessionId });
    },
    [sendRaw]
  );

  const stopTyping = useCallback(
    (sessionId: string) => {
      sendRaw({ type: "TYPING_STOP", sessionId });
    },
    [sendRaw]
  );

  const onMessage = useCallback((handler: (msg: ChatMessageData) => void) => {
    messageHandlerRef.current = handler;
  }, []);

  const onTypingStart = useCallback(
    (handler: (sessionId: string, userId: string) => void) => {
      typingStartHandlerRef.current = handler;
    },
    []
  );

  const onTypingStop = useCallback(
    (handler: (sessionId: string, userId: string) => void) => {
      typingStopHandlerRef.current = handler;
    },
    []
  );

  const onUserOnline = useCallback(
    (handler: (sessionId: string, userId: string) => void) => {
      userOnlineHandlerRef.current = handler;
    },
    []
  );

  const onUserOffline = useCallback(
    (handler: (sessionId: string, userId: string) => void) => {
      userOfflineHandlerRef.current = handler;
    },
    []
  );

  // ── Lifecycle ───────────────────────────────────────────────────────────

  useEffect(() => {
    connect();

    return () => {
      clearTimeout(reconnectTimerRef.current);
      retriesRef.current = maxRetries; // prevent reconnects after unmount
      wsRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    sendMessage,
    joinSession,
    leaveSession,
    startTyping,
    stopTyping,
    onMessage,
    onTypingStart,
    onTypingStop,
    onUserOnline,
    onUserOffline,
  };
}
