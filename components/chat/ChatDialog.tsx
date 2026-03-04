"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useWebSocket,
  ConnectionStatus,
  ChatMessageData,
} from "@/hooks/useWebSocket";
import {
  Send,
  Wifi,
  WifiOff,
  Loader2,
  ArrowLeftRight,
  MessageSquare,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface ExchangeMatch {
  id: string; // ExchangeRequest ID
  senderId: string;
  receiverId: string;
  senderSkill: Skill;
  receiverSkill: Skill;
  sender?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  receiver?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: ExchangeMatch;
}

// ─── Connection Status Badge ─────────────────────────────────────────────────

function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const config: Record<
    ConnectionStatus,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    connected: {
      label: "Online",
      className: "bg-green-500/10 text-green-500 border-green-500/20",
      icon: <Wifi className="w-3 h-3" />,
    },
    connecting: {
      label: "Connecting",
      className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
    },
    disconnected: {
      label: "Offline",
      className: "bg-red-500/10 text-red-500 border-red-500/20",
      icon: <WifiOff className="w-3 h-3" />,
    },
    error: {
      label: "Error",
      className: "bg-red-500/10 text-red-500 border-red-500/20",
      icon: <WifiOff className="w-3 h-3" />,
    },
  };

  const c = config[status];

  return (
    <Badge variant="outline" className={`text-xs gap-1 ${c.className}`}>
      {c.icon}
      {c.label}
    </Badge>
  );
}

// ─── Typing Indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-muted-foreground">typing…</span>
    </div>
  );
}

// ─── Single Message Bubble ───────────────────────────────────────────────────

function MessageBubble({
  message,
  isOwn,
}: {
  message: ChatMessageData;
  isOwn: boolean;
}) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap wrap-break-word">{message.content}</p>
        <p
          className={`text-[10px] mt-1 ${
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}

// ─── Chat Dialog ─────────────────────────────────────────────────────────────

export function ChatDialog({ open, onOpenChange, match }: ChatDialogProps) {
  const { data: authSession } = useSession();
  const userId = authSession?.user?.id;

  // Determine the other person
  const isUserSender = match.senderId === userId;
  const otherPerson = isUserSender ? match.receiver : match.sender;
  const mySkill = isUserSender ? match.senderSkill : match.receiverSkill;
  const theirSkill = isUserSender ? match.receiverSkill : match.senderSkill;

  // State
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [peerOnline, setPeerOnline] = useState(false);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isTypingRef = useRef(false);
  const messageIdsRef = useRef<Set<string>>(new Set());

  // WebSocket connection
  const ws = useWebSocket();

  // ── Auto-scroll ─────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  // ── Initialize chat session ─────────────────────────────────────────────
  useEffect(() => {
    if (!open || !match.id) return;

    let cancelled = false;

    async function init() {
      setLoading(true);
      try {
        // 1. Create or get chat session
        const sessionRes = await fetch("/api/chat/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exchangeRequestId: match.id }),
        });

        if (!sessionRes.ok) throw new Error("Failed to create chat session");
        const sessionData = await sessionRes.json();
        const sid = sessionData.session.id;

        if (cancelled) return;
        setChatSessionId(sid);

        // 2. Fetch existing messages
        const messagesRes = await fetch(`/api/chat/${sid}/messages`);
        if (messagesRes.ok) {
          const msgData = await messagesRes.json();
          if (!cancelled) {
            const msgs = msgData.messages as ChatMessageData[];
            setMessages(msgs);
            messageIdsRef.current = new Set(msgs.map((m) => m.id));
          }
        }

        // 3. Join the WebSocket room
        ws.joinSession(sid);
      } catch (err) {
        console.error("Failed to init chat:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (chatSessionId) {
        ws.leaveSession(chatSessionId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, match.id]);

  // ── Register WS event handlers ─────────────────────────────────────────
  useEffect(() => {
    ws.onMessage((msg) => {
      // Deduplicate (in case of reconnect overlap)
      if (messageIdsRef.current.has(msg.id)) return;
      messageIdsRef.current.add(msg.id);
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    ws.onTypingStart((_sid, uid) => {
      if (uid !== userId) setPeerTyping(true);
    });

    ws.onTypingStop((_sid, uid) => {
      if (uid !== userId) setPeerTyping(false);
    });

    ws.onUserOnline((_sid, uid) => {
      if (uid !== userId) setPeerOnline(true);
    });

    ws.onUserOffline((_sid, uid) => {
      if (uid !== userId) setPeerOnline(false);
    });
  }, [ws, userId, scrollToBottom]);

  // ── Scroll to bottom on initial load ────────────────────────────────────
  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom();
    }
  }, [loading, messages.length, scrollToBottom]);

  // ── Send message ────────────────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || !chatSessionId) return;

    ws.sendMessage(chatSessionId, text);
    setInputValue("");

    // Stop typing indicator
    if (isTypingRef.current) {
      ws.stopTyping(chatSessionId);
      isTypingRef.current = false;
      clearTimeout(typingTimerRef.current);
    }
  }, [inputValue, chatSessionId, ws]);

  // ── Handle typing indicator ─────────────────────────────────────────────
  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      if (!chatSessionId) return;

      if (!isTypingRef.current && value.length > 0) {
        isTypingRef.current = true;
        ws.startTyping(chatSessionId);
      }

      // Reset typing timeout
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        if (isTypingRef.current) {
          isTypingRef.current = false;
          ws.stopTyping(chatSessionId);
        }
      }, 2000);
    },
    [chatSessionId, ws]
  );

  // ── Cleanup leave on dialog close ───────────────────────────────────────
  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen && chatSessionId) {
        ws.leaveSession(chatSessionId);
        if (isTypingRef.current) {
          ws.stopTyping(chatSessionId);
          isTypingRef.current = false;
        }
        setChatSessionId(null);
        setMessages([]);
        setPeerTyping(false);
        setPeerOnline(false);
        messageIdsRef.current.clear();
      }
      onOpenChange(isOpen);
    },
    [chatSessionId, ws, onOpenChange]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg h-150 flex flex-col p-0 gap-0">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <DialogHeader className="px-4 py-3 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={
                    otherPerson?.image ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherPerson?.name}`
                  }
                  alt={otherPerson?.name || "User"}
                  className="w-9 h-9 rounded-full"
                />
                {peerOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>
              <div>
                <DialogTitle className="text-sm font-semibold">
                  {otherPerson?.name || "Unknown"}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {peerOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            <ConnectionBadge status={ws.status} />
          </div>

          {/* Skill exchange info */}
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <ArrowLeftRight className="w-3 h-3" />
            <span>
              Teaching <strong className="text-green-500">{mySkill.name}</strong>
              {" · "}
              Learning <strong className="text-blue-500">{theirSkill.name}</strong>
            </span>
          </div>
        </DialogHeader>

        {/* ── Messages ────────────────────────────────────────────────── */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-1"
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No messages yet</p>
              <p className="text-xs">
                Say hello to start your skill exchange! 👋
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.senderId === userId}
                />
              ))}
            </>
          )}

          {peerTyping && <TypingIndicator />}
        </div>

        {/* ── Input ───────────────────────────────────────────────────── */}
        <div className="px-4 py-3 border-t shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Type a message…"
              className="flex-1"
              disabled={ws.status !== "connected" || !chatSessionId}
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              disabled={
                !inputValue.trim() ||
                ws.status !== "connected" ||
                !chatSessionId
              }
              className="cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
