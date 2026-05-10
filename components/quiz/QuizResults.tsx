"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Trophy, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption?: number;
}

interface QuizResultsProps {
  attempt: QuizAttemptResult;
  questions: QuizQuestion[];
  quizTitle: string;
  onClose: () => void;
}

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

function getScoreGrade(score: number, max: number) {
  const pct = (score / max) * 100;
  if (pct >= 90) return { label: "Excellent", color: "emerald", emoji: "🏆" };
  if (pct >= 75) return { label: "Great", color: "violet", emoji: "⭐" };
  if (pct >= 60) return { label: "Good", color: "amber", emoji: "👍" };
  if (pct >= 40) return { label: "Fair", color: "amber", emoji: "📚" };
  return { label: "Needs Work", color: "rose", emoji: "💪" };
}

export function QuizResults({
  attempt,
  questions,
  quizTitle,
  onClose,
}: QuizResultsProps) {
  const grade = getScoreGrade(attempt.score, attempt.maxScore);
  const pct = Math.round((attempt.score / attempt.maxScore) * 100);
  const feedbackById = new Map(attempt.feedback.map((f) => [f.questionId, f]));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-8 py-6 border-b border-white/[0.05] flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-foreground/30">
            Quiz Results
          </p>
          <h2 className="text-lg font-bold mt-0.5">{quizTitle}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.05] border border-white/[0.08] text-foreground/40 hover:text-foreground hover:bg-white/[0.09] transition-all"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Score hero */}
        <div className="px-8 py-8 border-b border-white/[0.05]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col md:flex-row items-center gap-8"
          >
            {/* Score ring */}
            <div className="relative w-36 h-36 shrink-0">
              <svg
                className="w-full h-full -rotate-90"
                viewBox="0 0 144 144"
              >
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="8"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 62}`}
                  strokeDashoffset={`${2 * Math.PI * 62 * (1 - pct / 100)}`}
                  className={cn(
                    "transition-all duration-1000",
                    grade.color === "emerald"
                      ? "stroke-emerald-400"
                      : grade.color === "violet"
                      ? "stroke-violet-400"
                      : grade.color === "amber"
                      ? "stroke-amber-400"
                      : "stroke-rose-400"
                  )}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black">{pct}%</span>
                <span className="text-xs text-foreground/40 font-semibold">
                  {attempt.score}/{attempt.maxScore}
                </span>
              </div>
            </div>

            {/* Grade info */}
            <div className="text-center md:text-left">
              <div className="text-4xl mb-2">{grade.emoji}</div>
              <h3
                className={cn(
                  "text-2xl font-black",
                  grade.color === "emerald"
                    ? "text-emerald-300"
                    : grade.color === "violet"
                    ? "text-violet-300"
                    : grade.color === "amber"
                    ? "text-amber-300"
                    : "text-rose-300"
                )}
              >
                {grade.label}
              </h3>
              <p className="text-sm text-foreground/55 mt-2 leading-relaxed max-w-md">
                {attempt.summary}
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 size={13} />
                  {attempt.score} correct
                </div>
                <div className="w-px h-4 bg-white/[0.1]" />
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                  <XCircle size={13} />
                  {attempt.maxScore - attempt.score} incorrect
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Question review */}
        <div className="px-8 py-6 space-y-4">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-foreground/30 mb-4">
            Question Review
          </p>

          {questions.map((q, idx) => {
            const fb = feedbackById.get(q.id);
            const correctOption = fb?.correctOption ?? q.correctOption;
            const selectedOption = fb?.selectedOption ?? -1;
            const isCorrect = fb?.isCorrect ?? false;

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                className={cn(
                  "rounded-2xl border p-5",
                  isCorrect
                    ? "bg-emerald-500/[0.04] border-emerald-500/15"
                    : "bg-rose-500/[0.04] border-rose-500/15"
                )}
              >
                {/* Question */}
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={cn(
                      "shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5",
                      isCorrect
                        ? "bg-emerald-500/15"
                        : "bg-rose-500/15"
                    )}
                  >
                    {isCorrect ? (
                      <CheckCircle2 size={14} className="text-emerald-400" />
                    ) : (
                      <XCircle size={14} className="text-rose-400" />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-foreground leading-relaxed select-none">
                    Q{idx + 1}. {q.question}
                  </p>
                </div>

                {/* Options */}
                <div className="grid gap-2 mb-4 ml-10">
                  {q.options.map((opt, optIdx) => {
                    const isCorrectOpt = correctOption === optIdx;
                    const isSelectedOpt = selectedOption === optIdx;
                    const label = OPTION_LABELS[optIdx] || String(optIdx + 1);

                    return (
                      <div
                        key={optIdx}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs font-semibold",
                          isCorrectOpt
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                            : isSelectedOpt && !isCorrectOpt
                            ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                            : "border-white/[0.06] bg-white/[0.02] text-foreground/50"
                        )}
                      >
                        <span
                          className={cn(
                            "shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black",
                            isCorrectOpt
                              ? "bg-emerald-500/20 text-emerald-300"
                              : isSelectedOpt && !isCorrectOpt
                              ? "bg-rose-500/20 text-rose-300"
                              : "bg-white/[0.05] text-foreground/30"
                          )}
                        >
                          {label}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isCorrectOpt && (
                          <span className="text-[9px] font-black text-emerald-400 uppercase tracking-wider">
                            Correct
                          </span>
                        )}
                        {isSelectedOpt && !isCorrectOpt && (
                          <span className="text-[9px] font-black text-rose-400 uppercase tracking-wider">
                            Your answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {fb?.explanation && (
                  <div className="ml-10 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <p className="text-[9px] font-black uppercase tracking-[0.14em] text-foreground/30 mb-1.5">
                      Explanation
                    </p>
                    <p className="text-xs text-foreground/55 leading-relaxed">
                      {fb.explanation}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom padding */}
        <div className="h-8" />
      </div>
    </div>
  );
}