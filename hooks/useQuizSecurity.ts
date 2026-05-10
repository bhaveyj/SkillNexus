"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { flushSync } from "react-dom";

interface UseQuizSecurityOptions {
  enabled: boolean;
  onViolation?: (type: ViolationType, count: number) => void;
  maxViolations?: number;
  onMaxViolations?: () => void;
}

export type ViolationType =
  | "tab_switch"
  | "window_blur"
  | "fullscreen_exit"
  | "copy_attempt"
  | "paste_attempt"
  | "right_click"
  | "devtools_open"
  | "print_attempt";

export interface SecurityState {
  violations: number;
  lastViolation: ViolationType | null;
  isFullscreen: boolean;
  isWarningVisible: boolean;
  isForceExiting: boolean;
}

export function useQuizSecurity({
  enabled,
  onViolation,
  maxViolations = 3,
  onMaxViolations,
}: UseQuizSecurityOptions) {
  const [state, setState] = useState<SecurityState>({
    violations: 0,
    lastViolation: null,
    isFullscreen: false,
    isWarningVisible: false,
    isForceExiting: false,
  });

  const lastViolationAtRef = useRef(0);
  const violationsRef = useRef(0);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxReachedRef = useRef(false);

  // prevents internal cleanup exits from counting
  const isInternalExitRef = useRef(false);

  const onMaxViolationsRef = useRef(onMaxViolations);
  const onViolationRef = useRef(onViolation);

  useEffect(() => {
    onMaxViolationsRef.current = onMaxViolations;
  }, [onMaxViolations]);

  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  const addViolation = useCallback(
    (type: ViolationType) => {
      const now = Date.now();

      if (now - lastViolationAtRef.current < 700) {
        return;
      }

      lastViolationAtRef.current = now;

      if (maxReachedRef.current) return;

      violationsRef.current += 1;

      const count = violationsRef.current;

      setState((prev) => ({
        ...prev,
        violations: count,
        lastViolation: type,
        isWarningVisible: false,
      }));

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setState((prev) => ({
            ...prev,
            isWarningVisible: true,
          }));
        });
      });

      onViolationRef.current?.(type, count);

      // reset warning timer
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }

      warningTimerRef.current = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          isWarningVisible: false,
        }));
      }, 4000);

      // max violations reached
      if (count >= maxViolations && !maxReachedRef.current) {
        maxReachedRef.current = true;

        setState((prev) => ({
          ...prev,
          isForceExiting: true,
          isWarningVisible: false,
        }));

        onMaxViolationsRef.current?.();
      }
    },
    [maxViolations]
  );

  const dismissWarning = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isWarningVisible: false,
    }));
  }, []);

  const resetSecurityState = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    violationsRef.current = 0;
    maxReachedRef.current = false;
    lastViolationAtRef.current = 0;

    isInternalExitRef.current = false;

    setState({
      violations: 0,
      lastViolation: null,
      isFullscreen: !!document.fullscreenElement,
      isWarningVisible: false,
      isForceExiting: false,
    });
  }, []);

  const requestFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }

      setState((prev) => ({
        ...prev,
        isFullscreen: true,
      }));
    } catch {
      // fullscreen unsupported
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      isInternalExitRef.current = true;

      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      setState((prev) => ({
        ...prev,
        isFullscreen: false,
      }));

      setTimeout(() => {
        isInternalExitRef.current = false;
      }, 1200);
    } catch {
      isInternalExitRef.current = false;
    }
  }, []);

  useEffect(() => {
    // full reset every fresh quiz session
    if (enabled) {
      maxReachedRef.current = false;
      violationsRef.current = 0;
      lastViolationAtRef.current = 0;

      setState({
        violations: 0,
        lastViolation: null,
        isFullscreen: !!document.fullscreenElement,
        isWarningVisible: false,
        isForceExiting: false,
      });
    }

    if (!enabled) return;

    const onFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;

      // FlushSync ensures the UI updates the warning immediately 
      flushSync(() => {
        setState((prev) => ({
          ...prev,
          isFullscreen: isFs,
        }));
      });

      // user manually exited fullscreen
      if (
        !isFs &&
        enabled &&
        !maxReachedRef.current &&
        !isInternalExitRef.current
      ) {
        addViolation("fullscreen_exit");
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        addViolation("tab_switch");
      }
    };

    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation("copy_attempt");
    };

    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation("paste_attempt");
    };

    const onCut = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation("copy_attempt");
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addViolation("right_click");
    };

    const onBeforePrint = () => {
      addViolation("print_attempt");
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // block shortcuts
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();

        if (["c", "v", "x", "a", "p", "s", "u"].includes(key)) {
          e.preventDefault();

          if (key === "c" || key === "x") {
            addViolation("copy_attempt");
          }

          if (key === "v") {
            addViolation("paste_attempt");
          }
        }
      }

      // prevent default escape behavior where possible
      if (e.key === "Escape") {
        e.preventDefault();
      }

      // devtools
      if (e.key === "F12") {
        e.preventDefault();
        addViolation("devtools_open");
      }

      // prevent alt tab
      if (e.altKey && e.key === "Tab") {
        e.preventDefault();
      }
    };

    const onSelectStart = (e: Event) => {
      e.preventDefault();
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("cut", onCut);
    document.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("beforeprint", onBeforePrint);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("selectstart", onSelectStart);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("beforeprint", onBeforePrint);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("selectstart", onSelectStart);

      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, [enabled, addViolation]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  return {
    ...state,
    requestFullscreen,
    exitFullscreen,
    dismissWarning,
    resetSecurityState,
  };
}