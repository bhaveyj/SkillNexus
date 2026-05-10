"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

interface QuizPaletteProps {
  totalQuestions: number;
  currentIndex: number;
  answeredQuestions: Set<string>;
  questionIds: string[];
  onJumpTo: (index: number) => void;
}

export function QuizPalette({
  totalQuestions,
  currentIndex,
  answeredQuestions,
  questionIds,
  onJumpTo,
}: QuizPaletteProps) {
  const answeredCount = answeredQuestions.size;
  const remainingCount = totalQuestions - answeredCount;
  const progressPct = (answeredCount / totalQuestions) * 100;

  return (
    <div className="flex flex-col gap-5 w-full">

      {/* ── Progress bar ── */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30">Progress</p>
          <span className="text-xs font-black text-violet-400 tabular-nums">{answeredCount}/{totalQuestions}</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              background: answeredCount === totalQuestions
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : "linear-gradient(90deg, #7c3aed, #8b5cf6, #a78bfa)",
              boxShadow: answeredCount > 0
                ? answeredCount === totalQuestions
                  ? "0 0 8px rgba(52,211,153,0.6)"
                  : "0 0 8px rgba(139,92,246,0.6)"
                : "none",
            }}
          />
        </div>
      </div>

      {/* ── Question grid ── */}
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-2.5">Questions</p>
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: totalQuestions }).map((_, idx) => {
            const qId = questionIds[idx];
            const isAnswered = answeredQuestions.has(qId);
            const isCurrent = idx === currentIndex;

            return (
              <button
                key={idx}
                onClick={() => onJumpTo(idx)}
                title={`Q${idx + 1}${isAnswered ? " ✓" : ""}`}
                className={cn(
                  "relative w-full aspect-square rounded-lg text-[10px] font-black",
                  "flex items-center justify-center transition-all duration-150 border",
                  isCurrent
                    ? "border-violet-500/70 text-violet-200"
                    : isAnswered
                    ? "border-emerald-500/30 text-emerald-400 hover:border-emerald-400/60"
                    : "border-white/[0.08] text-foreground/30 hover:border-white/20 hover:text-foreground/60"
                )}
                style={
                  isCurrent
                    ? {
                        background: "rgba(139,92,246,0.2)",
                        boxShadow: "0 0 12px rgba(139,92,246,0.35), inset 0 0 8px rgba(139,92,246,0.1)",
                      }
                    : isAnswered
                    ? {
                        background: "rgba(16,185,129,0.08)",
                        boxShadow: "0 0 6px rgba(52,211,153,0.15)",
                      }
                    : { background: "rgba(255,255,255,0.02)" }
                }
              >
                {idx + 1}
                {/* Answered checkmark dot */}
                {isAnswered && !isCurrent && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#080612]"
                    style={{
                      background: "#10b981",
                      boxShadow: "0 0 4px rgba(52,211,153,0.8)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="space-y-1.5">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-2">Legend</p>
        {[
          {
            bg: "rgba(139,92,246,0.2)",
            border: "rgba(139,92,246,0.7)",
            glow: "0 0 8px rgba(139,92,246,0.4)",
            label: "Current",
          },
          {
            bg: "rgba(16,185,129,0.08)",
            border: "rgba(52,211,153,0.3)",
            glow: "0 0 6px rgba(52,211,153,0.2)",
            label: "Answered",
          },
          {
            bg: "rgba(255,255,255,0.02)",
            border: "rgba(255,255,255,0.08)",
            glow: "none",
            label: "Unanswered",
          },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2.5">
            <div
              className="w-4 h-4 rounded-md shrink-0 border"
              style={{
                background: item.bg,
                borderColor: item.border,
                boxShadow: item.glow,
              }}
            />
            <span className="text-[10px] text-foreground/40 font-semibold">{item.label}</span>
          </div>
        ))}
      </div>

      {/* ── Stats card ── */}
      <div
        className="rounded-xl border p-3.5 space-y-2.5"
        style={{
          background: "rgba(255,255,255,0.015)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        {/* Answered row */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-foreground/35 font-semibold">Answered</span>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: "#10b981",
                boxShadow: "0 0 6px rgba(52,211,153,0.8)",
              }}
            />
            <span className="text-[10px] font-black text-emerald-400 tabular-nums">{answeredCount}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.05]" />

        {/* Remaining row */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-foreground/35 font-semibold">Remaining</span>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={
                remainingCount === 0
                  ? { background: "#10b981", boxShadow: "0 0 6px rgba(52,211,153,0.8)" }
                  : remainingCount <= 3
                  ? { background: "#a78bfa", boxShadow: "0 0 6px rgba(167,139,250,0.7)" }
                  : { background: "rgba(255,255,255,0.2)" }
              }
            />
            <span
              className="text-[10px] font-black tabular-nums"
              style={{
                color: remainingCount === 0 ? "#34d399" : remainingCount <= 3 ? "#a78bfa" : "rgba(255,255,255,0.4)",
              }}
            >
              {remainingCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}