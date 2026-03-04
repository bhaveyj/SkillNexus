"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  useWebSocket,
  ChatMessageData,
} from "@/hooks/useWebSocket";
import { Send, ArrowLeftRight, Loader2, MessageSquare, Wifi, WifiOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Skill {
  id: string;
  name: string;
  category: string;
}

interface ExchangeMatch {
  id: string; // exchangeRequest id
  senderId: string;
  receiverId: string;
  senderSkill: Skill;
  receiverSkill: Skill;
  createdAt: string;
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

interface ChatSession {
  id: string;
  exchangeRequestId: string;
  participant1Id: string;
  participant2Id: string;
  participant1: { id: string; name: string | null; email: string; image: string | null };
  participant2: { id: string; name: string | null; email: string; image: string | null };
  exchangeRequest: {
    id: string;
    senderId: string;
    receiverId: string;
    senderSkill: Skill;
    receiverSkill: Skill;
  };
  messages: { id: string; content: string; createdAt: string; sender: { id: string; name: string | null } }[];
  updatedAt: string;
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

// ─── Message Bubble ───────────────────────────────────────────────────────────

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
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
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

// ─── Chat Panel ───────────────────────────────────────────────────────────────

function ChatPanel({
  match,
  userId,
  ws,
}: {
  match: ExchangeMatch;
  userId: string;
  ws: ReturnType<typeof useWebSocket>;
}) {
  const isUserSender = match.senderId === userId;
  const otherPerson = isUserSender ? match.receiver : match.sender;
  const mySkill = isUserSender ? match.senderSkill : match.receiverSkill;
  const theirSkill = isUserSender ? match.receiverSkill : match.senderSkill;

  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [peerOnline, setPeerOnline] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isTypingRef = useRef(false);
  const messageIdsRef = useRef<Set<string>>(new Set());
  const currentSessionIdRef = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, []);

  // Init / re-init when match changes
  useEffect(() => {
    let cancelled = false;

    // Leave previous session
    if (currentSessionIdRef.current) {
      ws.leaveSession(currentSessionIdRef.current);
      currentSessionIdRef.current = null;
    }

    setMessages([]);
    setChatSessionId(null);
    setPeerTyping(false);
    setPeerOnline(false);
    messageIdsRef.current.clear();

    async function init() {
      setLoading(true);
      try {
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
        currentSessionIdRef.current = sid;

        const messagesRes = await fetch(`/api/chat/${sid}/messages`);
        if (messagesRes.ok) {
          const msgData = await messagesRes.json();
          if (!cancelled) {
            const msgs = msgData.messages as ChatMessageData[];
            setMessages(msgs);
            messageIdsRef.current = new Set(msgs.map((m) => m.id));
          }
        }

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
      if (currentSessionIdRef.current) {
        ws.leaveSession(currentSessionIdRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.id]);

  // Register ws handlers
  useEffect(() => {
    ws.onMessage((msg) => {
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

  useEffect(() => {
    if (!loading && messages.length > 0) scrollToBottom();
  }, [loading, messages.length, scrollToBottom]);

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || !chatSessionId) return;
    ws.sendMessage(chatSessionId, text);
    setInputValue("");
    if (isTypingRef.current) {
      ws.stopTyping(chatSessionId);
      isTypingRef.current = false;
      clearTimeout(typingTimerRef.current);
    }
  }, [inputValue, chatSessionId, ws]);

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      if (!chatSessionId) return;
      if (!isTypingRef.current && value.length > 0) {
        isTypingRef.current = true;
        ws.startTyping(chatSessionId);
      }
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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0 bg-background">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={
                otherPerson?.image ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherPerson?.name}`
              }
              alt={otherPerson?.name || "User"}
              className="w-10 h-10 rounded-full object-cover"
            />
            {peerOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background" />
            )}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              {otherPerson?.name || "Unknown"}
            </p>
            <p className={`text-xs ${peerOnline ? "text-green-500" : "text-muted-foreground"}`}>
              {peerOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowLeftRight className="w-3 h-3" />
            <span>
              Teaching <strong className="text-green-500">{mySkill.name}</strong>
              {" · "}
              Learning <strong className="text-blue-500">{theirSkill.name}</strong>
            </span>
          </div>
          <span
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
              peerOnline
                ? "bg-green-500/10 text-green-500 border-green-500/20"
                : "bg-red-500/10 text-red-500 border-red-500/20"
            }`}
          >
            {peerOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {peerOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs">Say hello to start your skill exchange! 👋</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} isOwn={msg.senderId === userId} />
          ))
        )}
        {peerTyping && <TypingIndicator />}
      </div>

      {/* Input */}
      <div className="px-5 py-3 border-t border-border shrink-0">
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
            disabled={!inputValue.trim() || ws.status !== "connected" || !chatSessionId}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

// Convert a ChatSession into the ExchangeMatch shape that ChatPanel expects
function sessionToMatch(session: ChatSession): ExchangeMatch {
  return {
    id: session.exchangeRequest.id,
    senderId: session.exchangeRequest.senderId,
    receiverId: session.exchangeRequest.receiverId,
    senderSkill: session.exchangeRequest.senderSkill,
    receiverSkill: session.exchangeRequest.receiverSkill,
    createdAt: session.updatedAt,
    sender: session.participant1,
    receiver: session.participant2,
  };
}

export default function ChatsPage() {
  const { data: authSession } = useSession();
  const userId = authSession?.user?.id;

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const ws = useWebSocket();

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch("/api/chat/sessions");
        const data = await res.json();
        const list: ChatSession[] = data.sessions || [];
        setSessions(list);
        if (list.length > 0) setSelectedSessionId(list[0].id);
      } catch (err) {
        console.error("Failed to fetch chat sessions:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSessions();
  }, []);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) ?? null;
  const selectedMatch = selectedSession ? sessionToMatch(selectedSession) : null;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Left panel: conversation list ── */}
      <div className="w-80 shrink-0 border-r border-border flex flex-col bg-background">
        <div className="px-4 py-5 border-b border-border">
          <h1 className="text-lg font-semibold text-foreground">Chats</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {sessions.length} conversation{sessions.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-4 text-center">
              <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No chats yet</p>
              <p className="text-xs mt-1">
                Start a conversation from the Marketplace Matches tab.
              </p>
            </div>
          ) : (
            sessions.map((session) => {
              const match = sessionToMatch(session);
              const isUserSender = match.senderId === userId;
              const otherPerson = isUserSender ? match.receiver : match.sender;
              const mySkill = isUserSender ? match.senderSkill : match.receiverSkill;
              const theirSkill = isUserSender ? match.receiverSkill : match.senderSkill;
              const lastMsg = session.messages[0];
              const isSelected = selectedSessionId === session.id;

              return (
                <button
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors ${
                    isSelected ? "bg-muted" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        otherPerson?.image ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherPerson?.name}`
                      }
                      alt={otherPerson?.name || "User"}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {otherPerson?.name || "Unknown"}
                      </p>
                      {lastMsg ? (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {lastMsg.sender.id === userId ? "You: " : ""}{lastMsg.content}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                          <ArrowLeftRight className="w-3 h-3 shrink-0" />
                          <span className="text-green-500 truncate">{mySkill.name}</span>
                          <span>·</span>
                          <span className="text-blue-500 truncate">{theirSkill.name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right panel: messages ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedMatch && userId ? (
          <ChatPanel key={selectedSessionId!} match={selectedMatch} userId={userId} ws={ws} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">Select a conversation</p>
            <p className="text-xs mt-1">Choose a match from the left to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
