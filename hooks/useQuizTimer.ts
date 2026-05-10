"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseQuizTimerOptions {
  durationSeconds: number;
  enabled: boolean;
  onExpire?: () => void;
  onWarning?: (secondsLeft: number) => void;
  warningThreshold?: number;
}

export function useQuizTimer({
  durationSeconds,
  enabled,
  onExpire,
  onWarning,
  warningThreshold = 300, // 5 min default
}: UseQuizTimerOptions) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [hasExpired, setHasExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track which warning thresholds have already fired
  const warnedAt = useRef<Set<number>>(new Set());

  // USER REQUESTED FIX: Ensures retakes get a 100% fresh, full clock
  useEffect(() => {
    setSecondsLeft(durationSeconds);
    setHasExpired(false);
    warnedAt.current.clear();
  }, [durationSeconds, enabled]);

  const onExpireRef = useRef(onExpire);
  const onWarningRef = useRef(onWarning);
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);
  useEffect(() => { onWarningRef.current = onWarning; }, [onWarning]);

  // Warning thresholds: 5min, 1min, 10sec
  const WARNING_THRESHOLDS = [300, 60, 10];

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;

        // Fire warnings at each threshold (only once each)
        for (const threshold of WARNING_THRESHOLDS) {
          if (next <= threshold && !warnedAt.current.has(threshold)) {
            warnedAt.current.add(threshold);
            onWarningRef.current?.(next);
          }
        }

        if (next <= 0) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          setIsRunning(false);
          setHasExpired(true);
          onExpireRef.current?.();
          return 0;
        }
        return next;
      });
    }, 1000);
  }, []); // WARNING_THRESHOLDS is safe to omit from dependency array

  useEffect(() => {
    if (enabled && !isRunning && !hasExpired) {
      start();
    }
    if (!enabled) {
      stop();
    }
  }, [enabled, isRunning, hasExpired, start, stop]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const percentage = (secondsLeft / durationSeconds) * 100;

  const isWarning = secondsLeft <= 300 && secondsLeft > 60;   // 5min–1min: amber
  const isCritical = secondsLeft <= 60 && secondsLeft > 10;   // 1min–10s: orange/red
  const isFinalCountdown = secondsLeft <= 10 && secondsLeft > 0; // last 10s: red pulse

  const formatted = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return {
    seconds: secondsLeft,
    minutes,
    formatted,
    percentage,
    isRunning,
    hasExpired,
    isWarning,
    isCritical,
    isFinalCountdown,
    stop,
  };
}