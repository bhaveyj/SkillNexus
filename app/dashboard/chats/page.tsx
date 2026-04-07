"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { useWebSocket, ChatMessageData } from "@/hooks/useWebSocket";
import { Send, ArrowLeftRight, MessageSquare, Wifi, WifiOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Skill { id: string; name: string; category: string; }
type SessionStatus = "pending" | "accepted" | "completed";
type SessionType = "exchange" | "paid";

interface SessionCompletionState {
  status: SessionStatus;
  sessionType: SessionType;
  teacherCompleted: boolean;
  learnerCompleted: boolean;
}

interface ExchangeMatch {
  id: string; senderId: string; receiverId: string;
  senderSkill: Skill; receiverSkill: Skill; createdAt: string;
  sessionStatus: SessionStatus;
  sessionType: SessionType;
  teacherCompleted: boolean;
  learnerCompleted: boolean;
  sender?: { id: string; name: string | null; email: string; image: string | null };
  receiver?: { id: string; name: string | null; email: string; image: string | null };
}
interface ChatSession {
  id: string; exchangeRequestId: string;
  participant1Id: string; participant2Id: string;
  status: SessionStatus;
  sessionType: SessionType;
  teacherCompleted: boolean;
  learnerCompleted: boolean;
  participant1: { id: string; name: string | null; email: string; image: string | null };
  participant2: { id: string; name: string | null; email: string; image: string | null };
  exchangeRequest: { id: string; senderId: string; receiverId: string; senderSkill: Skill; receiverSkill: Skill };
  messages: { id: string; content: string; createdAt: string; sender: { id: string; name: string | null } }[];
  updatedAt: string;
}

function sessionToMatch(s: ChatSession): ExchangeMatch {
  return {
    id: s.exchangeRequest.id,
    senderId: s.exchangeRequest.senderId,
    receiverId: s.exchangeRequest.receiverId,
    senderSkill: s.exchangeRequest.senderSkill,
    receiverSkill: s.exchangeRequest.receiverSkill,
    createdAt: s.updatedAt,
    sessionStatus: s.status,
    sessionType: s.sessionType,
    teacherCompleted: s.teacherCompleted,
    learnerCompleted: s.learnerCompleted,
    sender: s.participant1,
    receiver: s.participant2,
  };
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-2">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400/40 animate-bounce"
          style={{ animationDelay: `${i * 130}ms` }} />
      ))}
    </div>
  );
}

function Bubble({ message, isOwn, showAvatar, avatar }: {
  message: ChatMessageData; isOwn: boolean; showAvatar?: boolean; avatar?: string | null;
}) {
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <div className={cn("flex items-end gap-2 mb-1", isOwn ? "justify-end" : "justify-start")}>
      {!isOwn && (
        <div className="w-6 h-6 shrink-0 mb-0.5">
          {showAvatar && (
            <img src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=user`}
              alt="avatar" className="w-6 h-6 rounded-full object-cover" />
          )}
        </div>
      )}
      <div className={cn(
        "max-w-[68%] px-4 py-2.5 rounded-2xl relative group",
        isOwn
          ? "bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-br-md shadow-lg shadow-violet-700/20"
          : "bg-white/[0.06] text-foreground border border-white/[0.07] rounded-bl-md",
      )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        <p className={cn(
          "text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
          isOwn ? "text-white/50" : "text-foreground/30",
        )}>{time}</p>
      </div>
    </div>
  );
}

function ChatPanel({ match, userId, ws }: {
  match: ExchangeMatch; userId: string; ws: ReturnType<typeof useWebSocket>;
}) {
  const isSender = match.senderId === userId;
  const other = isSender ? match.receiver : match.sender;
  const mySkill = isSender ? match.senderSkill : match.receiverSkill;
  const theirSkill = isSender ? match.receiverSkill : match.senderSkill;

  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [peerOnline, setPeerOnline] = useState(false);
  const [completionState, setCompletionState] = useState<SessionCompletionState>({
    status: match.sessionStatus,
    sessionType: match.sessionType,
    teacherCompleted: match.teacherCompleted,
    learnerCompleted: match.learnerCompleted,
  });
  const [markingComplete, setMarkingComplete] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isTyping = useRef(false);
  const msgIds = useRef<Set<string>>(new Set());
  const curSessionId = useRef<string | null>(null);
  const hasCurrentUserMarkedComplete = isSender
    ? completionState.teacherCompleted
    : completionState.learnerCompleted;
  const isSessionCompleted = completionState.status === "completed";

  const scrollBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
  }, []);

  useEffect(() => {
    setCompletionState({
      status: match.sessionStatus,
      sessionType: match.sessionType,
      teacherCompleted: match.teacherCompleted,
      learnerCompleted: match.learnerCompleted,
    });
    setCompletionError(null);
    setMarkingComplete(false);
  }, [
    match.id,
    match.sessionStatus,
    match.sessionType,
    match.teacherCompleted,
    match.learnerCompleted,
  ]);

  useEffect(() => {
    let cancelled = false;
    if (curSessionId.current) { ws.leaveSession(curSessionId.current); curSessionId.current = null; }
    setMessages([]); setChatSessionId(null); setPeerTyping(false); setPeerOnline(false); msgIds.current.clear();

    async function init() {
      setLoading(true);
      try {
        const sr = await fetch("/api/chat/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ exchangeRequestId: match.id }) });
        if (!sr.ok) throw new Error();
        const sd = await sr.json();
        const sid = sd.session.id;
        if (cancelled) return;
        setCompletionState({
          status: sd.session.status as SessionStatus,
          sessionType: sd.session.sessionType as SessionType,
          teacherCompleted: Boolean(sd.session.teacherCompleted),
          learnerCompleted: Boolean(sd.session.learnerCompleted),
        });
        setCompletionError(null);
        setChatSessionId(sid); curSessionId.current = sid;
        const mr = await fetch(`/api/chat/${sid}/messages`);
        if (mr.ok) {
          const md = await mr.json();
          if (!cancelled) {
            const msgs = md.messages as ChatMessageData[];
            setMessages(msgs); msgIds.current = new Set(msgs.map(m => m.id));
          }
        }
        ws.joinSession(sid);
      } catch { /* noop */ }
      finally { if (!cancelled) setLoading(false); }
    }
    init();
    return () => { cancelled = true; if (curSessionId.current) ws.leaveSession(curSessionId.current); };
  }, [match.id]);

  useEffect(() => {
    ws.onMessage(msg => {
      if (msgIds.current.has(msg.id)) return;
      msgIds.current.add(msg.id);
      setMessages(prev => [...prev, msg]);
      scrollBottom();
    });
    ws.onTypingStart((_, uid) => { if (uid !== userId) setPeerTyping(true); });
    ws.onTypingStop((_, uid) => { if (uid !== userId) setPeerTyping(false); });
    ws.onUserOnline((_, uid) => { if (uid !== userId) setPeerOnline(true); });
    ws.onUserOffline((_, uid) => { if (uid !== userId) setPeerOnline(false); });
  }, [ws, userId, scrollBottom]);

  useEffect(() => { if (!loading && messages.length > 0) scrollBottom(); }, [loading, messages.length, scrollBottom]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text || !chatSessionId) return;
    ws.sendMessage(chatSessionId, text);
    setInput("");
    if (isTyping.current) { ws.stopTyping(chatSessionId); isTyping.current = false; clearTimeout(typingTimer.current); }
  }, [input, chatSessionId, ws]);

  const onInput = useCallback((val: string) => {
    setInput(val);
    if (!chatSessionId) return;
    if (!isTyping.current && val.length > 0) { isTyping.current = true; ws.startTyping(chatSessionId); }
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      if (isTyping.current) { isTyping.current = false; ws.stopTyping(chatSessionId); }
    }, 2000);
  }, [chatSessionId, ws]);

  const markComplete = useCallback(async () => {
    if (
      !chatSessionId ||
      markingComplete ||
      hasCurrentUserMarkedComplete ||
      isSessionCompleted
    ) {
      return;
    }

    setMarkingComplete(true);
    setCompletionError(null);

    try {
      const response = await fetch("/api/sessions/mark-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: chatSessionId }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setCompletionError(
          data && typeof data.error === "string"
            ? data.error
            : "Failed to mark session as completed"
        );
        return;
      }

      if (data?.session) {
        setCompletionState({
          status: data.session.status as SessionStatus,
          sessionType: data.session.sessionType as SessionType,
          teacherCompleted: Boolean(data.session.teacherCompleted),
          learnerCompleted: Boolean(data.session.learnerCompleted),
        });
      }
    } catch {
      setCompletionError("Failed to mark session as completed");
    } finally {
      setMarkingComplete(false);
    }
  }, [
    chatSessionId,
    hasCurrentUserMarkedComplete,
    isSessionCompleted,
    markingComplete,
  ]);

  const completionMessage = isSessionCompleted
    ? "Session Completed ✅"
    : hasCurrentUserMarkedComplete
      ? "Waiting for other user to confirm..."
      : "Mark this session complete when your exchange ends.";

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between shrink-0 bg-[#080612]/60 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={other?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other?.name}`}
              alt={other?.name || "User"} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/[0.06]" />
            {peerOnline && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#080612]" />}
          </div>
          <div>
            <p className="text-sm font-bold">{other?.name || "Unknown"}</p>
            <p className={cn("text-xs font-medium", peerOnline ? "text-emerald-400" : "text-foreground/30")}>
              {peerOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs">
            <ArrowLeftRight size={11} className="text-foreground/30" />
            <span className="text-emerald-400 font-semibold">{mySkill.name}</span>
            <span className="text-foreground/20">·</span>
            <span className="text-violet-400 font-semibold">{theirSkill.name}</span>
          </div>
          <span className={cn(
            "flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border",
            peerOnline
              ? "bg-emerald-500/8 text-emerald-400 border-emerald-500/18"
              : "bg-rose-500/8 text-rose-400 border-rose-500/18",
          )}>
            {peerOnline ? <Wifi size={11} /> : <WifiOff size={11} />}
            {peerOnline ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      <div className="px-5 py-2.5 border-b border-white/[0.05] bg-[#080612]/40 backdrop-blur-sm flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div>
          <p
            className={cn(
              "text-xs font-semibold",
              isSessionCompleted
                ? "text-emerald-400"
                : hasCurrentUserMarkedComplete
                  ? "text-amber-300"
                  : "text-foreground/50"
            )}
          >
            {completionMessage}
          </p>
          {completionError && (
            <p className="text-[11px] text-rose-400 mt-1">{completionError}</p>
          )}
        </div>

        <Button
          type="button"
          onClick={markComplete}
          disabled={
            !chatSessionId ||
            markingComplete ||
            hasCurrentUserMarkedComplete ||
            isSessionCompleted
          }
          className="h-8 px-3 text-xs font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:hover:bg-violet-600"
        >
          {isSessionCompleted
            ? "Session Completed"
            : hasCurrentUserMarkedComplete
              ? "Completion Confirmed"
              : markingComplete
                ? "Marking..."
                : "Mark Session as Completed"}
        </Button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-0.5">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-foreground/20">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <MessageSquare size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold">No messages yet</p>
              <p className="text-xs mt-1">Say hello to start your skill exchange!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isOwn = msg.senderId === userId;
              const prev = messages[i - 1];
              const showAvatar = !isOwn && (!prev || prev.senderId !== msg.senderId);
              return (
                <Bubble key={msg.id} message={msg} isOwn={isOwn}
                  showAvatar={showAvatar}
                  avatar={!isOwn ? (other?.image || null) : null}
                />
              );
            })}
          </>
        )}
        {peerTyping && <TypingDots />}
      </div>

      <div className="px-4 py-3 border-t border-white/[0.05] shrink-0 bg-[#080612]/40 backdrop-blur-sm">
        <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2.5 items-center">
          <input
            value={input}
            onChange={e => onInput(e.target.value)}
            placeholder="Type a message…"
            disabled={ws.status !== "connected" || !chatSessionId}
            autoFocus
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 transition-all disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={!input.trim() || ws.status !== "connected" || !chatSessionId}
            className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-600/25 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ChatsPage() {
  const { data: authSession } = useSession();
  const userId = authSession?.user?.id;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: sessionsData, isLoading } = useSWR("/api/chat/sessions", fetcher, {
    revalidateOnFocus: false, dedupingInterval: 60000,
  });
  const sessions: ChatSession[] = sessionsData?.sessions ?? [];

  useEffect(() => {
    if (sessions.length > 0 && !selectedId) setSelectedId(sessions[0].id);
  }, [sessions, selectedId]);

  const ws = useWebSocket();
  const selected = sessions.find(s => s.id === selectedId) ?? null;
  const selectedMatch = selected ? sessionToMatch(selected) : null;

  const filteredSessions = sessions.filter(s => {
    const match = sessionToMatch(s);
    const isSender = match.senderId === userId;
    const other = isSender ? match.receiver : match.sender;
    return !searchQuery || other?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-72 shrink-0 border-r border-white/[0.05] flex flex-col" style={{ background: "rgba(8,6,18,0.85)" }}>
        <div className="px-4 py-4 border-b border-white/[0.05]">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-bold">Chats</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
              {sessions.length}
            </span>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
            <input
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.07] text-xs text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-violet-500/40 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-foreground/20 px-4 text-center">
              <MessageSquare size={24} className="opacity-30" />
              <p className="text-xs font-semibold">No chats yet</p>
              <p className="text-[10px] leading-relaxed">Accept exchanges in the Marketplace to start chatting</p>
            </div>
          ) : (
            filteredSessions.map(session => {
              const match = sessionToMatch(session);
              const isSender = match.senderId === userId;
              const other = isSender ? match.receiver : match.sender;
              const mySkill = isSender ? match.senderSkill : match.receiverSkill;
              const theirSkill = isSender ? match.receiverSkill : match.senderSkill;
              const lastMsg = session.messages[0];
              const isActive = selectedId === session.id;

              return (
                <button key={session.id} onClick={() => setSelectedId(session.id)}
                  className={cn(
                    "w-full text-left px-4 py-3.5 border-b border-white/[0.04] transition-all duration-200 relative",
                    isActive
                      ? "bg-violet-500/10 border-l-2 border-l-violet-500"
                      : "hover:bg-white/[0.03] border-l-2 border-l-transparent",
                  )}>
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={other?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other?.name}`}
                        alt={other?.name || "User"}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-bold truncate mb-0.5", isActive ? "text-violet-300" : "text-foreground/80")}>
                        {other?.name || "Unknown"}
                      </p>
                      {lastMsg ? (
                        <p className="text-xs text-foreground/30 truncate">
                          {lastMsg.sender.id === userId ? "You: " : ""}{lastMsg.content}
                        </p>
                      ) : (
                        <p className="text-[10px] flex items-center gap-1 text-foreground/25">
                          <span className="text-emerald-400">{mySkill.name}</span>
                          <span>↔</span>
                          <span className="text-violet-400">{theirSkill.name}</span>
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

      <div className="flex-1 flex flex-col overflow-hidden bg-[#080612]">
        {selectedMatch && userId ? (
          <ChatPanel key={selectedId!} match={selectedMatch} userId={userId} ws={ws} />
        ) : (
        <div className="flex flex-col items-center justify-center h-full gap-6 relative overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-violet-600/5 blur-[80px] animate-pulse" style={{ animationDuration: "3s" }} />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-rose-600/4 blur-[60px] animate-pulse" style={{ animationDuration: "4s", animationDelay: "1s" }} />

          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }} />

          <div className="relative flex flex-col items-center gap-5 text-center max-w-xs">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shadow-xl">
                <MessageSquare size={32} className="text-foreground/20" />
              </div>
              <div className="absolute -top-2 -right-3 w-8 h-8 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center animate-bounce" style={{ animationDuration: "2.5s" }}>
                <span className="text-xs">💬</span>
              </div>
              <div className="absolute -bottom-2 -left-3 w-7 h-7 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center animate-bounce" style={{ animationDuration: "3s", animationDelay: "0.5s" }}>
                <span className="text-xs">🤝</span>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-foreground/60 mb-1.5">No conversation selected</h3>
              <p className="text-sm text-foreground/30 leading-relaxed">
                Accept a skill exchange in the Marketplace to unlock chat with your match.
              </p>
            </div>

            <a
              href="/dashboard/marketplace?tab=matches"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500/12 border border-violet-500/25 text-sm font-bold text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/40 transition-all duration-200 hover:-translate-y-0.5"
            >
              <ArrowLeftRight size={14} />
              Go to Matches
            </a>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}