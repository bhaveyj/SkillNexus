"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ExternalLink, GraduationCap, Video, CheckCircle2, AlarmClock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Session {
  id: string; title: string; instructorName: string; category: string;
  level: string; date: string; time: string; duration: number;
  meetLink: string; avatar: string | null;
}

type Status = "today" | "upcoming" | "completed";

const getStatus = (dateStr: string): Status => {
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (d < today) return "completed";
  if (d.getTime() === today.getTime()) return "today";
  return "upcoming";
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === tomorrow.getTime()) return "Tomorrow";
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

const STATUS_CONFIG = {
  today:     { label: "Today",    pill: "bg-rose-500/12 text-rose-300 border-rose-500/25",    border: "border-rose-500/20",    icon: <AlarmClock size={14} className="text-rose-400" /> },
  upcoming:  { label: "Upcoming", pill: "bg-violet-500/12 text-violet-300 border-violet-500/25", border: "border-violet-500/15", icon: <Clock size={14} className="text-violet-400" /> },
  completed: { label: "Done",     pill: "bg-emerald-500/12 text-emerald-300 border-emerald-500/25", border: "border-white/[0.06]",    icon: <CheckCircle2 size={14} className="text-emerald-400" /> },
};

const CAT_COLOR: Record<string, string> = {
  "AI/ML":           "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "Cloud":           "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "Web Development": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Data Science":    "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

function Spinner() {
  return <div className="w-6 h-6 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />;
}

export default function MySessionsPage() {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Status>("all");

  useEffect(() => {
    if (!session) return;
    fetch("/api/masterclass/my-sessions")
      .then(r => r.ok ? r.json() : [])
      .then(data => setSessions(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [session]);

  const sorted = [...sessions].sort((a, b) => {
    const order: Record<Status, number> = { today: 0, upcoming: 1, completed: 2 };
    const sa = getStatus(a.date), sb = getStatus(b.date);
    if (order[sa] !== order[sb]) return order[sa] - order[sb];
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const filtered = sorted.filter(s => filter === "all" || getStatus(s.date) === filter);
  const counts = { today: sorted.filter(s => getStatus(s.date) === "today").length, upcoming: sorted.filter(s => getStatus(s.date) === "upcoming").length, completed: sorted.filter(s => getStatus(s.date) === "completed").length };

  return (
    <div className="flex-1 overflow-auto">
      <div className="sticky top-0 z-10 border-b border-white/[0.05] bg-[#080612]/80 backdrop-blur-xl">
        <div className="px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold">My Sessions</h1>
              <p className="text-xs text-foreground/40 mt-0.5">Manage your learning and teaching sessions</p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
            {([
              { key: "all",       label: `All (${sessions.length})` },
              { key: "today",     label: `Today (${counts.today})` },
              { key: "upcoming",  label: `Upcoming (${counts.upcoming})` },
              { key: "completed", label: `Completed (${counts.completed})` },
            ] as const).map(tab => (
              <button key={tab.key} onClick={() => setFilter(tab.key)}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
                  filter === tab.key
                    ? "bg-violet-500/15 text-foreground border border-violet-500/25"
                    : "text-foreground/40 hover:text-foreground/65",
                )}>{tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-24"><Spinner /></div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-24 text-foreground/20">
            <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <GraduationCap size={32} />
            </div>
            <div className="text-center">
              <p className="text-base font-bold">No sessions yet</p>
              <p className="text-sm mt-1 text-foreground/30">Register for masterclasses to get started</p>
            </div>
            <Button size="sm" onClick={() => window.location.href = "/dashboard/masterclasses"} className="mt-2">
              Browse Masterclasses
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-foreground/25">
            <p className="text-sm font-semibold">No {filter} sessions</p>
          </div>
        ) : (
          <div className="space-y-3 max-w-4xl">
            {filtered.map(mc => {
              const status = getStatus(mc.date);
              const cfg = STATUS_CONFIG[status];
              const isCompleted = status === "completed";
              return (
                <div key={mc.id}
                  className={cn(
                    "relative rounded-2xl overflow-hidden p-5 transition-all duration-250",
                    "bg-white/[0.03] backdrop-blur-xl border",
                    cfg.border,
                    isCompleted ? "opacity-60" : "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20",
                  )}
                >
                  {!isCompleted && (
                    <div className={cn("absolute top-0 left-0 right-0 h-[1.5px]",
                      status === "today" ? "bg-gradient-to-r from-transparent via-rose-500/60 to-transparent" :
                                           "bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"
                    )} />
                  )}

                  <div className="flex items-center gap-5">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={mc.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mc.instructorName}`}
                        alt={mc.instructorName}
                        className="w-14 h-14 rounded-2xl ring-2 ring-white/[0.06] object-cover"
                      />
                      <div className={cn("absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#080612] flex items-center justify-center",
                        isCompleted ? "bg-emerald-500/20" : status === "today" ? "bg-rose-500/20" : "bg-violet-500/20",
                      )}>
                        {cfg.icon}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <h3 className="text-base font-bold">{mc.title}</h3>
                        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border", cfg.pill)}>{cfg.label}</span>
                        {mc.category && (
                          <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border hidden sm:inline-flex", CAT_COLOR[mc.category] || "bg-white/5 text-foreground/40 border-white/8")}>
                            {mc.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground/40 mb-2.5">with <span className="font-semibold text-foreground/60">{mc.instructorName}</span></p>

                      <div className="flex flex-wrap gap-4 text-xs text-foreground/30">
                        <span className="flex items-center gap-1.5"><Calendar size={11} />{formatDate(mc.date)}</span>
                        <span className="flex items-center gap-1.5"><Clock size={11} />{mc.time}</span>
                        <span className="flex items-center gap-1.5"><Video size={11} />{mc.duration} hrs</span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isCompleted ? (
                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400/60">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      ) : (
                        <Button size="sm" className="gap-1.5 h-9 text-xs"
                          onClick={() => window.open(mc.meetLink, "_blank")}>
                          <ExternalLink size={13} />
                          {status === "today" ? "Join Now" : "Join Session"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}