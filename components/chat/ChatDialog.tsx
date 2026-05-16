"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import {
  useWebSocket,
  ConnectionStatus,
  ChatMessageData,
} from "@/hooks/useWebSocket";
import { Send, Wifi, WifiOff, Loader2, ArrowLeftRight, MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Skill { id: string; name: string; category: string; }
interface ExchangeMatch {
  id: string;
  senderId: string;
  receiverId: string;
  senderSkill?: Skill | null;
  receiverSkill: Skill;
  requestType?: "SWAP" | "PAID";
  sender?: { id: string; name: string | null; email: string; image: string | null };
  receiver?: { id: string; name: string | null; email: string; image: string | null };
}
interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: ExchangeMatch;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-violet-400/40 animate-bounce"
          style={{ animationDelay: `${i * 130}ms` }}
        />
      ))}
    </div>
  );
}

function Bubble({
  message, isOwn, showAvatar, avatarSrc,
}: {
  message: ChatMessageData;
  isOwn: boolean;
  showAvatar?: boolean;
  avatarSrc?: string | null;
}) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className={cn("flex items-end gap-2 mb-1", isOwn ? "justify-end" : "justify-start")}>
      {!isOwn && (
        <div className="w-6 shrink-0 mb-0.5">
          {showAvatar ? (
            <img
              src={avatarSrc || `https://api.dicebear.com/7.x/avataaars/svg?seed=user`}
              alt="avatar"
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : null}
        </div>
      )}

      <div className={cn(
        "group max-w-[68%] px-4 py-2.5 rounded-2xl relative",
        isOwn
          ? "bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-br-md shadow-lg shadow-violet-700/20"
          : "bg-white/[0.07] text-foreground border border-white/[0.08] rounded-bl-md",
      )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p className={cn(
          "text-[10px] mt-1 select-none opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          isOwn ? "text-white/50 text-right" : "text-foreground/30",
        )}>
          {time}
        </p>
      </div>
    </div>
  );
}

export function ChatDialog({ open, onOpenChange, match }: ChatDialogProps) {
  const { data: authSession } = useSession();
  const userId = authSession?.user?.id;

  const isUserSender = match.senderId === userId;
  const otherPerson = isUserSender ? match.receiver : match.sender;
  const mySkill = isUserSender ? match.senderSkill : match.receiverSkill;
  const theirSkill = isUserSender ? match.receiverSkill : match.senderSkill;
  const skillSummary = (() => {
    if (mySkill && theirSkill) {
      return (
        <>
          Teaching{" "}
          <span className="font-bold text-emerald-400">{mySkill.name}</span>
          <span className="text-foreground/20 mx-1.5">·</span>
          Learning{" "}
          <span className="font-bold text-violet-400">{theirSkill.name}</span>
        </>
      );
    }
    if (mySkill) {
      return (
        <>
          Teaching{" "}
          <span className="font-bold text-emerald-400">{mySkill.name}</span>
        </>
      );
    }
    if (theirSkill) {
      return (
        <>
          Learning{" "}
          <span className="font-bold text-violet-400">{theirSkill.name}</span>
        </>
      );
    }
    return <span className="text-foreground/40">Skill details unavailable</span>;
  })();

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

  const ws = useWebSocket();

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
  }, []);

  useEffect(() => {
    if (!open || !match.id) return;
    let cancelled = false;

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

        const messagesRes = await fetch(`/api/chat/${sid}/messages`);
        if (messagesRes.ok) {
          const msgData = await messagesRes.json();
          if (!cancelled) {
            const msgs = msgData.messages as ChatMessageData[];
            setMessages(msgs);
            messageIdsRef.current = new Set(msgs.map(m => m.id));
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
      if (chatSessionId) ws.leaveSession(chatSessionId);
    };
  }, [open, match.id]);

  useEffect(() => {
    ws.onMessage(msg => {
      if (messageIdsRef.current.has(msg.id)) return;
      messageIdsRef.current.add(msg.id);
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
    });
    ws.onTypingStart((_sid, uid) => { if (uid !== userId) setPeerTyping(true); });
    ws.onTypingStop((_sid, uid) => { if (uid !== userId) setPeerTyping(false); });
    ws.onUserOnline((_sid, uid) => { if (uid !== userId) setPeerOnline(true); });
    ws.onUserOffline((_sid, uid) => { if (uid !== userId) setPeerOnline(false); });
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

  const handleInputChange = useCallback((value: string) => {
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
  }, [chatSessionId, ws]);

  const handleClose = useCallback(() => {
    if (chatSessionId) {
      ws.leaveSession(chatSessionId);
      if (isTypingRef.current) { ws.stopTyping(chatSessionId); isTypingRef.current = false; }
      setChatSessionId(null);
      setMessages([]);
      setPeerTyping(false);
      setPeerOnline(false);
      messageIdsRef.current.clear();
    }
    onOpenChange(false);
  }, [chatSessionId, ws, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={handleClose}
      />

      <div className="relative z-10 flex flex-col w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
        style={{ height: "min(600px, 90vh)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/70 to-transparent z-10" />

        <div className="absolute inset-0 bg-[#0d0a1e]/95 backdrop-blur-2xl border border-white/[0.08]" />

        <div className="relative shrink-0 px-5 py-4 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={otherPerson?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherPerson?.name}`}
                  alt={otherPerson?.name || "User"}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/[0.07]"
                />
                <span className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0d0a1e]",
                  peerOnline ? "bg-emerald-400" : "bg-white/20",
                )} />
              </div>
              <div>
                <p className="text-sm font-bold">{otherPerson?.name || "Unknown"}</p>
                <p className={cn("text-xs font-medium", peerOnline ? "text-emerald-400" : "text-foreground/35")}>
                  {peerOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={cn(
                "flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border",
                peerOnline
                  ? "bg-emerald-500/8 text-emerald-400 border-emerald-500/18"
                  : "bg-white/[0.04] text-foreground/35 border-white/[0.08]",
              )}>
                {peerOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
                {peerOnline ? "Online" : "Offline"}
              </span>

              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.04] border border-white/[0.07] text-foreground/40 hover:text-foreground hover:bg-white/[0.08] transition-all"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <ArrowLeftRight size={11} className="text-foreground/30 shrink-0" />
            <p className="text-xs text-foreground/40">{skillSummary}</p>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="relative flex-1 overflow-y-auto px-5 py-4 overscroll-contain"
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-foreground/20">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                <MessageSquare size={22} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold">No messages yet</p>
                <p className="text-xs mt-1">Say hello to start your skill exchange! 👋</p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isOwn = msg.senderId === userId;
              const prev = messages[i - 1];
              const showAvatar = !isOwn && (!prev || prev.senderId !== msg.senderId);
              return (
                <Bubble
                  key={msg.id}
                  message={msg}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  avatarSrc={!isOwn ? (otherPerson?.image || null) : null}
                />
              );
            })
          )}
          {peerTyping && <TypingDots />}
        </div>

        <div className="relative shrink-0 px-4 py-3.5 border-t border-white/[0.06] bg-[#0d0a1e]/60 backdrop-blur-sm">
          <form
            onSubmit={e => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2.5"
          >
            <input
              value={inputValue}
              onChange={e => handleInputChange(e.target.value)}
              placeholder="Type a message…"
              disabled={ws.status !== "connected" || !chatSessionId}
              autoFocus
              className={cn(
                "flex-1 px-4 py-2.5 rounded-xl text-sm text-foreground",
                "bg-white/[0.05] border border-white/[0.09]",
                "placeholder:text-foreground/20",
                "focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                "transition-all duration-200",
              )}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || ws.status !== "connected" || !chatSessionId}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                "bg-violet-600 hover:bg-violet-500 text-white",
                "shadow-lg shadow-violet-600/25",
                "transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0",
                "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0",
              )}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}