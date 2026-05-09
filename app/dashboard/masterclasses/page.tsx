"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Toast } from "@/components/ui/toast";
import { QuizFullScreen } from "@/components/quiz/QuizFullScreen";
import { Search, Plus, Users, Calendar, Clock, Award, Play, FileQuestion, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Instructor {
  id: string; name: string | null; image: string | null;
  github: string | null; linkedin: string | null; twitter: string | null; gmail: string | null;
}
interface Masterclass {
  id: string; title: string; instructorName: string; date: Date; time: string;
  duration: string; enrollmentCount: number; avatar?: string; level: string;
  category: string; description?: string; meetLink: string; maxStudents?: number;
  creditCost: number;
  isRegistered?: boolean; instructor?: Instructor;
}

interface QuizAttemptPreview {
  id: string;
  score: number;
  maxScore: number;
  createdAt: string;
}

interface RegisteredMasterclass {
  id: string;
  title: string;
  description?: string | null;
  instructorName: string;
  category: string;
  level: string;
  date: Date;
  time: string;
  duration: string;
  meetLink: string;
  avatar?: string;
  registeredAt: string;
  endAt: string | null;
  isCompleted: boolean;
  latestQuizAttempt?: QuizAttemptPreview | null;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption?: number;
}

interface QuizPayload {
  id: string;
  masterclassId: string;
  title: string;
  questions: QuizQuestion[];
}

interface QuizAttemptFeedback {
  questionId: string;
  selectedOption: number;
  correctOption: number;
  isCorrect: boolean;
  explanation: string;
}

interface QuizAttemptResult {
  id: string;
  score: number;
  maxScore: number;
  summary: string;
  feedback: QuizAttemptFeedback[];
  createdAt: string;
}

const CATS = ["All", "AI/ML", "Cloud", "Web Development", "Data Science"];

const LEVEL_STYLES: Record<string, { pill: string; dot: string }> = {
  BEGINNER:     { pill: "bg-emerald-500/12 text-emerald-400 border-emerald-500/25", dot: "bg-emerald-400" },
  INTERMEDIATE: { pill: "bg-amber-500/12 text-amber-400 border-amber-500/25",       dot: "bg-amber-400" },
  ADVANCED:     { pill: "bg-rose-500/12 text-rose-400 border-rose-500/25",           dot: "bg-rose-400" },
};

const CAT_STYLES: Record<string, string> = {
  "AI/ML":           "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "Cloud":           "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "Web Development": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Data Science":    "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

function Spinner() {
  return <div className="w-5 h-5 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />;
}

function formatDate(d: Date) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function MasterclassesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCat, setSelectedCat] = useState("All");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") ?? "");
  const [registering, setRegistering] = useState<string | null>(null);
  const [selected, setSelected] = useState<Masterclass | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" | "info" } | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">("upcoming");

  // Quiz state
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizSession, setQuizSession] = useState<RegisteredMasterclass | null>(null);
  const [quizPayload, setQuizPayload] = useState<QuizPayload | null>(null);
  const [quizAttempt, setQuizAttempt] = useState<QuizAttemptResult | null>(null);
  const [quizReviewQuestions, setQuizReviewQuestions] = useState<QuizQuestion[] | null>(null);
  const [quizTitle, setQuizTitle] = useState("");

  const catParam = selectedCat !== "All" ? `?category=${selectedCat}` : "";
  const { data: mcData, isLoading, mutate } = useSWR(`/api/masterclass${catParam}`, fetcher, { revalidateOnFocus: false });
  const { data: allMcData } = useSWR("/api/masterclass", fetcher, { revalidateOnFocus: false, dedupingInterval: 120000 });
  const { data: profileData } = useSWR("/api/user/profile", fetcher, { revalidateOnFocus: false });
  const { data: mySessionsData, isLoading: sessionsLoading, mutate: mutateSessions } = useSWR(
    "/api/masterclass/my-sessions",
    fetcher,
    { revalidateOnFocus: false }
  );

  const masterclasses: Masterclass[] = mcData?.masterclasses ?? [];
  const allMasterclasses: Masterclass[] = allMcData?.masterclasses ?? [];
const mySessions: RegisteredMasterclass[] = Array.isArray(mySessionsData)
  ? mySessionsData
  : Array.isArray(mySessionsData?.sessions)
    ? mySessionsData.sessions
    : [];
      const userRole: string | null = profileData?.role ?? null;

  const completedSessions = mySessions.filter((s) => s.isCompleted);
  const baseForCounts = activeTab === "upcoming" ? allMasterclasses : completedSessions;
  const catCounts = baseForCounts.reduce((acc, mc) => {
    acc[mc.category] = (acc[mc.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredUpcoming = masterclasses.filter(mc =>
    mc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCompleted = completedSessions.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCat === "All" || s.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleRegister = async (id: string) => {
    if (!session) { setToast({ message: "Please sign in to register", type: "warning" }); return; }
    setRegistering(id);
    try {
      const res = await fetch("/api/masterclass/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterclassId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register");
      setToast({ message: "Registered! Check your email for the Meet link.", type: "success" });
      mutate();
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Failed", type: "error" });
    } finally { setRegistering(null); }
  };

  const resetQuizState = () => {
    setQuizOpen(false);
    setQuizLoading(false);
    setQuizSubmitting(false);
    setQuizSession(null);
    setQuizPayload(null);
    setQuizAttempt(null);
    setQuizReviewQuestions(null);
    setQuizTitle("");
  };

  const openQuiz = async (sessionItem: RegisteredMasterclass) => {
    setQuizSession(sessionItem);
    setQuizPayload(null);
    setQuizAttempt(null);
    setQuizReviewQuestions(null);
    setQuizTitle(sessionItem.title);
    setQuizLoading(true);
    setQuizOpen(true);

    try {
      const res = await fetch("/api/masterclass/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterclassId: sessionItem.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load quiz");
      setQuizPayload(data.quiz);
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Failed to load quiz", type: "error" });
      resetQuizState();
    } finally {
      setQuizLoading(false);
    }
  };

  const openQuizResults = async (sessionItem: RegisteredMasterclass) => {
    setQuizSession(sessionItem);
    setQuizPayload(null);
    setQuizAttempt(null);
    setQuizReviewQuestions(null);
    setQuizTitle(sessionItem.title);
    setQuizLoading(true);
    setQuizOpen(true);

    try {
      const res = await fetch(`/api/masterclass/quiz/attempt?masterclassId=${sessionItem.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load quiz results");
      setQuizAttempt(data.attempt);
      setQuizReviewQuestions(data.quiz?.questions ?? []);
      if (data.quiz?.title) setQuizTitle(data.quiz.title);
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Failed to load quiz results", type: "error" });
      resetQuizState();
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSubmitQuiz = async (answers: { questionId: string; selectedOption: number }[]) => {
    if (!quizSession) return;
    setQuizSubmitting(true);
    try {
      const res = await fetch("/api/masterclass/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ masterclassId: quizSession.id, answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit quiz");
      setQuizAttempt(data.attempt);
      setQuizReviewQuestions(quizPayload?.questions ?? []);
      setQuizPayload(null);
      await mutateSessions();
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Failed to submit quiz", type: "error" });
    } finally {
      setQuizSubmitting(false);
    }
  };

  const isFull = (mc: Masterclass) => mc.maxStudents != null && mc.enrollmentCount >= mc.maxStudents;
  const enrollPct = (mc: Masterclass) => mc.maxStudents ? Math.min(100, (mc.enrollmentCount / mc.maxStudents) * 100) : 0;

  return (
    <div className="flex-1 overflow-auto">
      {/* Fullscreen quiz overlay */}
      <QuizFullScreen
        isOpen={quizOpen}
        quizPayload={quizPayload}
        quizAttempt={quizAttempt}
        quizReviewQuestions={quizReviewQuestions}
        quizTitle={quizTitle}
        quizSession={quizSession}
        isLoading={quizLoading}
        onClose={resetQuizState}
        onSubmit={handleSubmitQuiz}
        isSubmitting={quizSubmitting}
      />

      <div className="sticky top-0 z-10 border-b border-white/[0.05] bg-[#080612]/80 backdrop-blur-xl">
        <div className="px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Masterclasses</h1>
            <p className="text-xs text-foreground/40 mt-0.5">Learn from industry experts in live sessions</p>
          </div>
          {(userRole === "INSTRUCTOR" || userRole === "ADMIN") && (
            <Button size="sm" onClick={() => router.push("/dashboard/masterclasses/create")} className="gap-1.5 h-8 text-xs">
              <Plus size={13} /> Create
            </Button>
          )}
        </div>
      </div>

      <div className="p-6 lg:p-8 space-y-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            {[
              { key: "upcoming", label: "Upcoming", count: allMasterclasses.length },
              { key: "completed", label: "Completed", count: completedSessions.length },
            ].map(tab => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as "upcoming" | "completed")}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200",
                    isActive
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-sm shadow-emerald-500/10"
                      : "bg-white/[0.03] border-white/[0.07] text-foreground/45 hover:text-foreground/70 hover:border-white/[0.12]",
                  )}
                >
                  {tab.label}
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-md text-[10px] font-black tabular-nums",
                    isActive ? "bg-emerald-500/25 text-emerald-200" : "bg-white/[0.06] text-foreground/30",
                  )}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {CATS.map(cat => {
                const count = cat === "All" ? baseForCounts.length : catCounts[cat] ?? 0;
                const isActive = selectedCat === cat;
                return (
                  <button key={cat} onClick={() => setSelectedCat(cat)}
                    className={cn(
                      "flex items-center gap-1.5 pl-3.5 pr-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200",
                      isActive
                        ? "bg-violet-500/15 border-violet-500/30 text-violet-300 shadow-sm shadow-violet-500/10"
                        : "bg-white/[0.03] border-white/[0.07] text-foreground/45 hover:text-foreground/70 hover:border-white/[0.12]",
                    )}>
                    {cat}
                    {count > 0 && (
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-md text-[10px] font-black tabular-nums",
                        isActive ? "bg-violet-500/25 text-violet-200" : "bg-white/[0.06] text-foreground/30",
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder={activeTab === "completed" ? "Search completed…" : "Search masterclasses…"}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 transition-all" />
            </div>
          </div>
        </div>

        {activeTab === "upcoming" ? (
          isLoading ? (
            <div className="flex items-center justify-center py-24"><Spinner /></div>
          ) : filteredUpcoming.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-foreground/25">
              <Award size={28} className="opacity-40" />
              <p className="text-sm font-semibold">No masterclasses found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUpcoming.map(mc => {
                const level = LEVEL_STYLES[mc.level] || LEVEL_STYLES.BEGINNER;
                const pct = enrollPct(mc);
                return (
                  <div key={mc.id}
                    className="group relative rounded-2xl overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.07] hover:border-white/[0.12] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 p-5"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-start gap-5">
                      <div className="relative shrink-0">
                        <img
                          src={mc.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mc.instructorName}`}
                          alt={mc.instructorName}
                          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/[0.07] group-hover:ring-violet-500/20 transition-all"
                        />
                        <span className={cn("absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#080612]", level.dot)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-foreground truncate group-hover:text-violet-300 transition-colors">{mc.title}</h3>
                            <p className="text-xs text-foreground/40 mt-0.5">by <span className="text-foreground/60 font-semibold">{mc.instructorName}</span></p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border", level.pill)}>{mc.level}</span>
                            {mc.category && (
                              <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border hidden sm:inline-flex", CAT_STYLES[mc.category] || "bg-white/5 text-foreground/40 border-white/8")}>
                                {mc.category}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-foreground/35 mb-3">
                          <span className="flex items-center gap-1.5"><Calendar size={11} />{formatDate(mc.date)}</span>
                          <span className="flex items-center gap-1.5"><Clock size={11} />{mc.time} · {mc.duration}</span>
                          <span className="flex items-center gap-1.5"><Users size={11} />
                            {mc.enrollmentCount}{mc.maxStudents ? ` / ${mc.maxStudents}` : ""} enrolled
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Award size={11} />{mc.creditCost > 0 ? `${mc.creditCost} credits` : "Free"}
                          </span>
                        </div>
                        {mc.maxStudents && (
                          <div className="mb-3">
                            <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden w-48">
                              <div
                                className={cn("h-full rounded-full transition-all", pct > 80 ? "bg-rose-500" : "bg-violet-500")}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Button variant="glass" size="sm" className="h-8 text-xs" onClick={() => setSelected(mc)}>
                            Details
                          </Button>
                          <Button size="sm" className="h-8 text-xs gap-1.5"
                            onClick={() => handleRegister(mc.id)}
                            disabled={mc.isRegistered || registering === mc.id || isFull(mc)}
                          >
                            {registering === mc.id
                              ? <><Spinner />Registering…</>
                              : mc.isRegistered
                                ? "✓ Registered"
                                : isFull(mc)
                                  ? "Full"
                                  : <><Play size={11} />Register</>
                            }
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          sessionsLoading ? (
            <div className="flex items-center justify-center py-24"><Spinner /></div>
          ) : !session ? (
            <div className="flex flex-col items-center gap-3 py-24 text-foreground/25">
              <CheckCircle2 size={28} className="opacity-40" />
              <p className="text-sm font-semibold">Sign in to view completed masterclasses</p>
            </div>
          ) : filteredCompleted.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-24 text-foreground/25">
              <CheckCircle2 size={28} className="opacity-40" />
              <p className="text-sm font-semibold">No completed masterclasses yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCompleted.map((sessionItem) => {
                const level = LEVEL_STYLES[sessionItem.level] || LEVEL_STYLES.BEGINNER;
                const hasAttempt = !!sessionItem.latestQuizAttempt;
                return (
                  <div
                    key={sessionItem.id}
                    className="group relative rounded-2xl overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.07] hover:border-white/[0.12] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 p-5"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-start gap-5">
                      <div className="relative shrink-0">
                        <img
                          src={sessionItem.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sessionItem.instructorName}`}
                          alt={sessionItem.instructorName}
                          className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/[0.07] group-hover:ring-emerald-500/20 transition-all"
                        />
                        <span className={cn("absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#080612]", level.dot)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-foreground truncate group-hover:text-emerald-300 transition-colors">{sessionItem.title}</h3>
                            <p className="text-xs text-foreground/40 mt-0.5">by <span className="text-foreground/60 font-semibold">{sessionItem.instructorName}</span></p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border", level.pill)}>{sessionItem.level}</span>
                            {sessionItem.category && (
                              <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border hidden sm:inline-flex", CAT_STYLES[sessionItem.category] || "bg-white/5 text-foreground/40 border-white/8")}>
                                {sessionItem.category}
                              </span>
                            )}
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-emerald-500/12 text-emerald-300 border-emerald-500/25">
                              Completed
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-foreground/35 mb-3">
                          <span className="flex items-center gap-1.5"><Calendar size={11} />{formatDate(sessionItem.date)}</span>
                          <span className="flex items-center gap-1.5"><Clock size={11} />{sessionItem.time} · {sessionItem.duration}</span>
                          {sessionItem.latestQuizAttempt && (
                            <span className="flex items-center gap-1.5">
                              <Award size={11} />{sessionItem.latestQuizAttempt.score}/{sessionItem.latestQuizAttempt.maxScore} latest score
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {hasAttempt ? (
                            <>
                              <Button variant="glass" size="sm" className="h-8 text-xs gap-1.5" onClick={() => openQuizResults(sessionItem)}>
                                <CheckCircle2 size={12} /> View Results
                              </Button>
                              <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => openQuiz(sessionItem)}>
                                <FileQuestion size={12} /> Retake Quiz
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => openQuiz(sessionItem)}>
                              <FileQuestion size={12} /> Take Quiz
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* Details dialog (unchanged) */}
      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0d0a1e] border-white/[0.08] shadow-2xl p-0">
          {selected && (
            <>
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/60 to-transparent rounded-t-2xl" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                <div className="md:col-span-2 p-6 space-y-5 border-r border-white/[0.05]">
                  <DialogHeader>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <DialogTitle className="text-xl font-bold leading-tight">{selected.title}</DialogTitle>
                        <p className="text-sm text-foreground/40 mt-1">by <span className="text-foreground/60 font-semibold">{selected.instructorName}</span></p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border", LEVEL_STYLES[selected.level]?.pill || "")}>{selected.level}</span>
                        {selected.category && (
                          <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border", CAT_STYLES[selected.category] || "")}>{selected.category}</span>
                        )}
                      </div>
                    </div>
                  </DialogHeader>
                  <div className="rounded-xl p-4 bg-white/[0.03] border border-white/[0.06]">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-foreground/30 mb-2">Description</p>
                    <p className="text-sm text-foreground/60 leading-relaxed">{selected.description || "No description provided."}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: <Calendar size={14} />, label: "Date",     value: formatDate(selected.date) },
                      { icon: <Clock size={14} />,    label: "Time",     value: selected.time },
                      { icon: <Clock size={14} />,    label: "Duration", value: selected.duration },
                      { icon: <Users size={14} />,    label: "Enrolled", value: `${selected.enrollmentCount}${selected.maxStudents ? ` / ${selected.maxStudents}` : ""}` },
                      { icon: <Award size={14} />,    label: "Credits",  value: selected.creditCost > 0 ? `${selected.creditCost} credits` : "Free" },
                    ].map(item => (
                      <div key={item.label} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <span className="text-violet-400/60 mt-0.5 shrink-0">{item.icon}</span>
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-foreground/25">{item.label}</p>
                          <p className="text-sm font-semibold mt-0.5">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selected.maxStudents && (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-foreground/40 font-semibold">Enrollment</span>
                        <span className="font-bold text-foreground/60">{selected.enrollmentCount}/{selected.maxStudents}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06]">
                        <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all"
                          style={{ width: `${enrollPct(selected)}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button className="flex-1 h-10 font-bold"
                      onClick={() => { handleRegister(selected.id); setSelected(null); }}
                      disabled={selected.isRegistered || registering === selected.id || isFull(selected)}
                    >
                      {selected.isRegistered ? "✓ Already Registered" : isFull(selected) ? "Session Full" : "Register Now"}
                    </Button>
                    <Button variant="glass" className="h-10" onClick={() => setSelected(null)}>Close</Button>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-foreground/30 mb-5">Instructor</p>
                  <div className="flex flex-col items-center text-center mb-5">
                    <img
                      src={selected.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selected.instructorName}`}
                      alt={selected.instructorName}
                      className="w-20 h-20 rounded-2xl ring-2 ring-violet-500/20 shadow-xl shadow-violet-500/10 mb-3"
                    />
                    <h4 className="font-bold text-base">{selected.instructorName}</h4>
                  </div>
                  {selected.instructor && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-foreground/25 mb-2">Connect</p>
                      {[
                        { label: "GitHub",   href: selected.instructor.github },
                        { label: "LinkedIn", href: selected.instructor.linkedin },
                        { label: "Twitter",  href: selected.instructor.twitter },
                        { label: "Email",    href: selected.instructor.gmail ? `mailto:${selected.instructor.gmail}` : null },
                      ].filter(l => l.href).map(l => (
                        <a key={l.label} href={l.href!} target="_blank" rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-violet-500/25 hover:bg-white/[0.05] text-xs font-semibold transition-all">
                          {l.label}
                        </a>
                      ))}
                      {!selected.instructor.github && !selected.instructor.linkedin && !selected.instructor.twitter && !selected.instructor.gmail && (
                        <p className="text-xs text-foreground/25 text-center py-4">No social links available</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}