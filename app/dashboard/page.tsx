"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Share2, RefreshCw, GraduationCap, Clock,
  ShoppingBag, BookOpen, UserCircle, ChevronRight,
  Bell, Sparkles, ArrowRight, TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface RegisteredSession {
  id: string; title: string; instructorName: string;
  date: string; time: string; category: string;
}
interface RecommendedExchange {
  id: string; reason: string; userName: string;
  matchedSkill: string; theyWantFromMe: string;
}
interface RecommendedMasterclass {
  id: string; reason: string; title: string;
  instructorName: string; category: string; level: string; date: string;
}
interface Recommendations {
  recommendedExchanges: RecommendedExchange[];
  recommendedMasterclasses: RecommendedMasterclass[];
  reasoning: string;
}
interface DashboardStats {
  skillsShared: number; activeExchanges: number;
  masterclasses: number; learningHours: number;
  creditBalance: number;
}
interface CreditTx {
  id: string;
  amount: number;
  type: string;
  source: string | null;
  sourceType?: "masterclass" | "exchange" | null;
  balanceAfter: number;
  createdAt: string;
}

const CACHE_PREFIX = "ai_rec:";

function StatCard({ label, value, icon, accent, loading, trend }: {
  label: string; value: string | number; icon: React.ReactNode;
  accent: "violet" | "rose" | "cyan" | "amber"; loading?: boolean;
  trend?: { label: string; up: boolean };
}) {
  const accents = {
    violet: { icon: "bg-violet-500/15 text-violet-400", border: "hover:border-violet-500/30", glow: "hover:shadow-violet-500/10", bar: "from-violet-500 to-violet-600", track: "bg-violet-500" },
    rose: { icon: "bg-rose-500/15 text-rose-400", border: "hover:border-rose-500/30", glow: "hover:shadow-rose-500/10", bar: "from-rose-500 to-rose-600", track: "bg-rose-500" },
    cyan: { icon: "bg-cyan-500/15 text-cyan-400", border: "hover:border-cyan-500/30", glow: "hover:shadow-cyan-500/10", bar: "from-cyan-500 to-cyan-600", track: "bg-cyan-500" },
    amber: { icon: "bg-amber-500/15 text-amber-400", border: "hover:border-amber-500/30", glow: "hover:shadow-amber-500/10", bar: "from-amber-500 to-amber-600", track: "bg-amber-500" },
  };
  const a = accents[accent];
  return (
    <div className={cn(
      "group relative rounded-2xl p-5 overflow-hidden cursor-default",
      "bg-white/3 backdrop-blur-xl border border-white/[0.07]",
      "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl",
      a.border, a.glow,
    )}>
      <div className={cn("absolute top-0 left-0 right-0 h-[1.5px] bg-linear-to-r opacity-60", a.bar)} />

      <div className={cn(
        "absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 ease-out rounded-b-2xl",
        a.track, "opacity-30",
      )} />

      <div className="flex items-start justify-between mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground/30">{label}</p>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110", a.icon)}>
          {icon}
        </div>
      </div>

      {loading ? (
        <div className="h-10 w-20 rounded-lg bg-white/5 animate-pulse mb-2" />
      ) : (
        <p className="text-5xl font-black text-foreground tracking-tighter mb-2">{value}</p>
      )}

      {trend && !loading && (
        <div className="flex items-center gap-1">
          <span className={cn("text-[10px] font-bold", trend.up ? "text-emerald-400" : "text-rose-400")}>
            {trend.up ? "↑" : "↓"} {trend.label}
          </span>
        </div>
      )}
      {!trend && !loading && (
        <p className="text-[10px] text-foreground/20 font-medium">this month</p>
      )}
    </div>
  );
}

function RecCard({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative rounded-xl p-4 overflow-hidden cursor-pointer",
        "bg-white/2 border border-white/6",
        "hover:bg-white/4 hover:border-violet-500/20",
        "transition-all duration-200 hover:-translate-y-0.5",
      )}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-linear-to-br from-violet-500/3 to-transparent" />
      <div className="relative">{children}</div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [recentSessions, setRecentSessions] = useState<RegisteredSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [recs, setRecs] = useState<Recommendations | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [recsError, setRecsError] = useState<string | null>(null);
  const [creditHistory, setCreditHistory] = useState<CreditTx[]>([]);
  const [loadingCredits, setLoadingCredits] = useState(true);

  const fetchRecs = async (force = false) => {
    const key = session?.user?.id ? `${CACHE_PREFIX}${session.user.id}` : null;
    if (!key) return;
    if (force) localStorage.removeItem(key);
    setLoadingRecs(true); setRecsError(null);
    try {
      const res = await fetch("/api/ai/recommendations");
      if (res.ok) {
        const data = await res.json();
        if (data.success) { setRecs(data.data); localStorage.setItem(key, JSON.stringify(data.data)); }
        else setRecsError("Failed to get recommendations");
      } else setRecsError("Failed to get recommendations");
    } catch { setRecsError("Failed to get recommendations"); }
    finally { setLoadingRecs(false); }
  };

  useEffect(() => {
    if (!session) { setLoadingSessions(false); setLoadingRecs(false); setLoadingCredits(false); return; }
    fetch("/api/masterclass/my-sessions").then(r => r.ok ? r.json() : [])
      .then(data => setRecentSessions((Array.isArray(data) ? data : []).filter((s: RegisteredSession) => new Date(s.date) >= new Date()).slice(0, 3)))
      .finally(() => setLoadingSessions(false));
    fetch("/api/user/stats").then(r => r.ok ? r.json() : null).then(d => { if (d) setStats(d); });
    fetch("/api/user/credits?limit=5").then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.transactions) setCreditHistory(d.transactions); })
      .finally(() => setLoadingCredits(false));
    fetch("/api/exchange-requests?type=received").then(r => r.ok ? r.json() : { data: [] })
      .then(d => setPendingCount((Array.isArray(d?.data) ? d.data : []).filter((x: { status?: string }) => x.status === "PENDING").length));

    const key = session.user?.id ? `${CACHE_PREFIX}${session.user.id}` : null;
    if (!key) { setLoadingRecs(false); return; }
    const cached = localStorage.getItem(key);
    if (cached) { try { setRecs(JSON.parse(cached)); setLoadingRecs(false); } catch { localStorage.removeItem(key); fetchRecs(); } }
    else fetchRecs();
  }, [session]);

  const formatDate = (d: string, t: string) => {
    const date = new Date(d);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const sd = new Date(date); sd.setHours(0, 0, 0, 0);
    const tom = new Date(today); tom.setDate(tom.getDate() + 1);
    if (sd.getTime() === today.getTime()) return `Today · ${t}`;
    if (sd.getTime() === tom.getTime()) return `Tomorrow · ${t}`;
    return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${t}`;
  };

  const initials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const STATS = [
    { label: "Credits", value: stats?.creditBalance ?? "—", icon: <ShoppingBag size={16} />, accent: "violet" as const, trend: stats ? { label: stats.creditBalance > 0 ? "wallet funded" : "earn credits", up: stats.creditBalance > 0 } : undefined },
    { label: "Skills Shared", value: stats?.skillsShared ?? "—", icon: <Share2 size={16} />, accent: "violet" as const, trend: stats ? { label: `${stats.skillsShared > 0 ? "active" : "add skills"}`, up: stats.skillsShared > 0 } : undefined },
    { label: "Active Exchanges", value: stats?.activeExchanges ?? "—", icon: <RefreshCw size={16} />, accent: "rose" as const, trend: stats ? { label: stats.activeExchanges > 0 ? `${stats.activeExchanges} ongoing` : "browse marketplace", up: stats.activeExchanges > 0 } : undefined },
    { label: "Masterclasses", value: stats?.masterclasses ?? "—", icon: <GraduationCap size={16} />, accent: "cyan" as const, trend: stats ? { label: stats.masterclasses > 0 ? "sessions joined" : "explore sessions", up: stats.masterclasses > 0 } : undefined },
    { label: "Learning Hours", value: stats ? `${stats.learningHours}h` : "—", icon: <Clock size={16} />, accent: "amber" as const, trend: stats ? { label: stats.learningHours > 0 ? "hours invested" : "start learning", up: stats.learningHours > 0 } : undefined },
  ];

  const QUICK = [
    { label: "Browse Marketplace", href: "/dashboard/marketplace", icon: <ShoppingBag size={16} />, accent: "violet" as const, desc: "Find skill partners" },
    { label: "View Masterclasses", href: "/dashboard/masterclasses", icon: <BookOpen size={16} />, accent: "rose" as const, desc: "Learn from experts" },
    { label: "Edit Profile", href: "/dashboard/profile", icon: <UserCircle size={16} />, accent: "cyan" as const, desc: "Update your skills" },
  ];

  const accentPill = (color: string) => ({
    violet: "bg-violet-500/10 text-violet-300 border border-violet-500/20",
    rose: "bg-rose-500/10 text-rose-300 border border-rose-500/20",
    cyan: "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20",
    amber: "bg-amber-500/10 text-amber-300 border border-amber-500/20",
    green: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
    orange: "bg-orange-500/10 text-orange-300 border border-orange-500/20",
  } as Record<string, string>)[color] || "";

  const formatCreditLabel = (tx: CreditTx) => {
    if (tx.type === "ONBOARDING") return "Onboarding bonus";
    if (tx.type === "TEACH_REWARD") return "Teaching reward";
    if (tx.type === "LEARN_SPEND") {
      return tx.sourceType === "masterclass"
        ? "Masterclass registration"
        : "Learning spend";
    }
    if (tx.type === "REFUND") return "Refund";
    return "Credit update";
  };

  return (
    <div className="flex-1 overflow-auto">

      <div className="sticky top-0 z-10 border-b border-white/5 bg-[#080612]/80 backdrop-blur-xl">
        <div className="px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg lg:text-xl font-bold leading-tight">
              Welcome back,{" "}
              <span className="gradient-text-violet">{session?.user?.name ?? "—"}</span>
            </h1>
            <p className="text-xs text-foreground/40 mt-0.5">Track your learning progress and upcoming sessions</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.push("/dashboard/marketplace?tab=requests")}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-white/4 border border-white/[0.07] text-foreground/50 hover:text-foreground hover:bg-white/[0.07] transition-all"
            >
              <Bell size={16} />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8 space-y-6">

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {STATS.map((s, i) => (
            <StatCard key={i} label={s.label} value={s.value} icon={s.icon} accent={s.accent} loading={!stats} trend={s.trend} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2">
            <div className="relative rounded-2xl overflow-hidden bg-white/3 backdrop-blur-xl border border-white/[0.07]">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">AI Learning Advisor</h2>
                    <p className="text-xs text-foreground/35">Personalized recommendations</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => fetchRecs(true)} disabled={loadingRecs} className="gap-1.5 text-xs h-8">
                  {loadingRecs
                    ? <><div className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" /><span>Analyzing…</span></>
                    : <><Sparkles size={12} /><span>Get Recommendations</span></>
                  }
                </Button>
              </div>

              <div className="p-6">
                {recsError && (
                  <p className="text-sm text-rose-400 text-center py-4">{recsError}</p>
                )}
                {!recs && !loadingRecs && !recsError && (
                  <div className="flex flex-col items-center gap-3 py-10 text-foreground/25">
                    <div className="w-14 h-14 rounded-2xl bg-white/3 border border-white/6 flex items-center justify-center">
                      <Sparkles size={22} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">No recommendations yet</p>
                      <p className="text-xs mt-0.5">
                        {"Click \"Get Recommendations\" to receive AI-powered suggestions"}
                      </p>                    </div>
                  </div>
                )}
                {loadingRecs && (
                  <div className="flex flex-col items-center gap-3 py-10">
                    <div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
                    <p className="text-sm text-foreground/35">Analyzing your learning profile…</p>
                  </div>
                )}
                {recs && !loadingRecs && (
                  <div className="space-y-5">
                    <div className="px-4 py-3 rounded-xl bg-violet-500/5 border border-violet-500/12">
                      <div className="flex items-start gap-2">
                        <TrendingUp size={13} className="text-violet-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-foreground/55 leading-relaxed">{recs.reasoning}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/30 flex items-center gap-1.5 mb-3">
                          <RefreshCw size={10} /> Recommended Exchanges
                        </p>
                        <div className="space-y-2">
                          {recs.recommendedExchanges.map(ex => (
                            <RecCard key={ex.id} onClick={() => router.push(`/dashboard/marketplace?search=${encodeURIComponent(ex.userName)}`)}>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold truncate">{ex.userName}</p>
                                <ArrowRight size={13} className="text-foreground/25 shrink-0" />
                              </div>
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", accentPill("green"))}>Learn: {ex.matchedSkill}</span>
                                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", accentPill("orange"))}>Teach: {ex.theyWantFromMe}</span>
                              </div>
                              <p className="text-[11px] text-foreground/35 leading-snug line-clamp-2">{ex.reason}</p>
                            </RecCard>
                          ))}
                          {recs.recommendedExchanges.length === 0 && (
                            <p className="text-xs text-foreground/30 py-3">No exchange recommendations</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-foreground/30 flex items-center gap-1.5 mb-3">
                          <GraduationCap size={10} /> Recommended Masterclasses
                        </p>
                        <div className="space-y-2">
                          {recs.recommendedMasterclasses.map(mc => (
                            <RecCard key={mc.id} onClick={() => router.push(`/dashboard/masterclasses?search=${encodeURIComponent(mc.title)}`)}>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-bold truncate">{mc.title}</p>
                                <ArrowRight size={13} className="text-foreground/25 shrink-0" />
                              </div>
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", accentPill("violet"))}>{mc.category}</span>
                                <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", accentPill("rose"))}>{mc.level}</span>
                              </div>
                              <p className="text-[11px] text-foreground/35 leading-snug line-clamp-2">{mc.reason}</p>
                            </RecCard>
                          ))}
                          {recs.recommendedMasterclasses.length === 0 && (
                            <p className="text-xs text-foreground/30 py-3">No masterclass recommendations</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-white/3 backdrop-blur-xl border border-white/[0.07] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-sm font-bold">Wallet</h2>
                <span className="text-xs font-bold text-amber-300">
                  {stats ? `${stats.creditBalance} credits` : "— credits"}
                </span>
              </div>
              <div className="p-4 space-y-3">
                {loadingCredits ? (
                  <div className="flex items-center gap-2 text-xs text-foreground/35">
                    <div className="w-3 h-3 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
                    Loading credit history…
                  </div>
                ) : creditHistory.length === 0 ? (
                  <div className="text-xs text-foreground/35">
                    No credit activity yet. Earn credits by teaching.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {creditHistory.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-foreground/75">
                            {formatCreditLabel(tx)}
                          </p>
                          <p className="text-[10px] text-foreground/35">
                            {new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        </div>
                        <span className={cn(
                          "font-bold",
                          tx.amount >= 0 ? "text-emerald-300" : "text-rose-300"
                        )}>
                          {tx.amount >= 0 ? "+" : ""}{tx.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="px-5 py-3 text-[10px] text-foreground/35 border-t border-white/5">
                Earn credits by teaching. Spend them on exchanges and masterclasses.
              </div>
            </div>

            <div className="rounded-2xl bg-white/3 backdrop-blur-xl border border-white/[0.07] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <h2 className="text-sm font-bold">Quick Access</h2>
              </div>
              <div className="p-3 space-y-1">
                {QUICK.map(q => (
                  <Link key={q.href} href={q.href}>
                    <div className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/4 border border-transparent hover:border-white/[0.07] transition-all duration-200 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center",
                          q.accent === "violet" ? "bg-violet-500/12 text-violet-400" :
                            q.accent === "rose" ? "bg-rose-500/12 text-rose-400" :
                              "bg-cyan-500/12 text-cyan-400",
                        )}>
                          {q.icon}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground/75 group-hover:text-foreground transition-colors">{q.label}</p>
                          <p className="text-[10px] text-foreground/30">{q.desc}</p>
                        </div>
                      </div>
                      <ChevronRight size={13} className="text-foreground/20 group-hover:text-foreground/40 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-linear-to-br from-violet-500/8 via-purple-500/5 to-rose-500/6 border border-violet-500/15 p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-violet-400" />
                <p className="text-xs font-bold text-violet-300">Learning streak</p>
              </div>
              <p className="text-3xl font-black text-foreground mb-1">🔥 Active</p>
              <p className="text-xs text-foreground/35">
                {"Keep going — you're on a roll!"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white/3 backdrop-blur-xl border border-white/[0.07] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-sm font-bold">Upcoming Sessions</h2>
            <Link href="/dashboard/my-sessions">
              <span className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors">View all →</span>
            </Link>
          </div>

          {loadingSessions ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
            </div>
          ) : recentSessions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-foreground/25">
              <div className="w-12 h-12 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-center">
                <GraduationCap size={18} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">No upcoming sessions</p>
                <p className="text-xs mt-0.5">Register for masterclasses to get started</p>
              </div>
              <Link href="/dashboard/masterclasses">
                <Button variant="glass" size="sm" className="mt-1 text-xs h-8">Browse Masterclasses</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/4">
              {recentSessions.map(s => (
                <div key={s.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/2 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-violet-600 to-violet-800 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-lg shadow-violet-500/20">
                    {initials(s.instructorName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-violet-300 transition-colors">{s.title}</p>
                    <p className="text-xs text-foreground/35 mt-0.5">{s.instructorName}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold text-foreground/50">{formatDate(s.date, s.time)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}