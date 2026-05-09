"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";

interface QuizTimerProps {
  formatted: string;
  percentage: number;
  isWarning: boolean;
  isCritical: boolean;
  isFinalCountdown: boolean;
  hasExpired: boolean;
  seconds: number;
}

export function QuizTimer({
  formatted,
  percentage,
  isWarning,
  isCritical,
  isFinalCountdown,
  hasExpired,
  seconds,
}: QuizTimerProps) {
  const circumference = 2 * Math.PI * 24;

  const strokeColor = hasExpired || isFinalCountdown
    ? "#f43f5e"   // rose
    : isCritical
    ? "#f97316"   // orange
    : isWarning
    ? "#f59e0b"   // amber
    : "#8b5cf6";  // violet

  const glowColor = hasExpired || isFinalCountdown
    ? "rgba(244,63,94,0.35)"
    : isCritical
    ? "rgba(249,115,22,0.3)"
    : isWarning
    ? "rgba(245,158,11,0.25)"
    : "rgba(139,92,246,0.2)";

  const isUrgent = isFinalCountdown || hasExpired;
  const isElevated = isCritical || isWarning;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all duration-500",
        isUrgent
          ? "bg-rose-500/10 border-rose-500/30"
          : isCritical
          ? "bg-orange-500/10 border-orange-500/25"
          : isWarning
          ? "bg-amber-500/8 border-amber-500/20"
          : "bg-white/[0.03] border-white/[0.07]"
      )}
      style={{
        boxShadow: isElevated || isUrgent ? `0 0 20px ${glowColor}` : undefined,
      }}
    >
      {/* Circular progress ring */}
      <div className="relative w-12 h-12 shrink-0">
        <svg
          className={cn("w-full h-full -rotate-90", isFinalCountdown && "animate-pulse")}
          viewBox="0 0 56 56"
        >
          {/* Background track */}
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="3.5"
          />
          {/* Glow circle behind progress */}
          {(isWarning || isCritical || isFinalCountdown) && (
            <circle
              cx="28"
              cy="28"
              r="24"
              fill="none"
              stroke={strokeColor}
              strokeWidth="6"
              strokeOpacity="0.08"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={`${circumference * (1 - percentage / 100)}`}
            />
          )}
          {/* Main progress arc */}
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${circumference * (1 - percentage / 100)}`}
            stroke={strokeColor}
            style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
          />
        </svg>

        {/* Icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isUrgent ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <AlertTriangle size={12} className="text-rose-400" />
            </motion.div>
          ) : (
            <Clock
              size={12}
              className={cn(
                "transition-colors duration-300",
                isCritical ? "text-orange-400" : isWarning ? "text-amber-400" : "text-foreground/35"
              )}
            />
          )}
        </div>
      </div>

      {/* Time text */}
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-foreground/30 leading-none mb-1">
          Time Left
        </p>
        <motion.p
          key={isFinalCountdown ? seconds : "stable"} // re-mount animation on final countdown each second
          initial={isFinalCountdown ? { scale: 1.15, opacity: 0.7 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.18 }}
          className={cn(
            "text-xl font-black tabular-nums leading-none transition-colors duration-300",
            hasExpired
              ? "text-rose-400"
              : isFinalCountdown
              ? "text-rose-400"
              : isCritical
              ? "text-orange-400"
              : isWarning
              ? "text-amber-400"
              : "text-foreground"
          )}
        >
          {hasExpired ? "00:00" : formatted}
        </motion.p>

        {/* Status label below time */}
        <AnimatePresence mode="wait">
          {(isWarning || isCritical || isFinalCountdown) && (
            <motion.p
              key={isFinalCountdown ? "final" : isCritical ? "critical" : "warning"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "text-[8px] font-black uppercase tracking-wider mt-0.5",
                isFinalCountdown ? "text-rose-400" : isCritical ? "text-orange-400" : "text-amber-400"
              )}
            >
              {isFinalCountdown ? "⚠ FINAL SECONDS" : isCritical ? "RUNNING LOW" : "TIME WARNING"}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}