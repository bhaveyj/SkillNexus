"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  Loader2,
  Maximize2,
  ShieldAlert,
  ShieldOff,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useQuizSecurity, type ViolationType } from "@/hooks/useQuizSecurity";
import { useQuizTimer } from "@/hooks/useQuizTimer";
import { QuizTimer } from "@/components/quiz/QuizTimer";
import QuizQuestion from "@/components/quiz/QuizQuestion";
import { QuizPalette } from "@/components/quiz/QuizPalette";
import { QuizResults } from "@/components/quiz/QuizResults";

interface QuizQuestionData {
  id: string;
  question: string;
  options: string[];
  correctOption?: number;
}

interface QuizPayload {
  id: string;
  masterclassId: string;
  title: string;
  questions: QuizQuestionData[];
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

interface RegisteredMasterclass {
  id: string;
  title: string;
  category: string;
  level: string;
}

interface QuizFullScreenProps {
  isOpen: boolean;
  quizPayload: QuizPayload | null;
  quizAttempt: QuizAttemptResult | null;
  quizReviewQuestions: QuizQuestionData[] | null;
  quizTitle: string;
  quizSession: RegisteredMasterclass | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (
    answers: { questionId: string; selectedOption: number }[]
  ) => Promise<void>;
  isSubmitting: boolean;
}

const QUIZ_DURATION_SECONDS = 10 * 60;
const MAX_VIOLATIONS = 3;

const VIOLATION_MESSAGES: Record<
  ViolationType,
  { title: string; body: string }
> = {
  tab_switch: {
    title: "Tab Switch Detected",
    body: "Switching tabs is not allowed during the exam.",
  },
  window_blur: {
    title: "Window Focus Lost",
    body: "You left the exam window.",
  },
  fullscreen_exit: {
    title: "Fullscreen Exited",
    body: "Fullscreen mode is required during the assessment.",
  },
  copy_attempt: {
    title: "Copy Attempt Blocked",
    body: "Copying content is not allowed.",
  },
  paste_attempt: {
    title: "Paste Attempt Blocked",
    body: "Pasting content is not allowed.",
  },
  right_click: {
    title: "Right Click Disabled",
    body: "Context menu is disabled.",
  },
  devtools_open: {
    title: "Developer Tools Detected",
    body: "Developer tools are restricted.",
  },
  print_attempt: {
    title: "Print Attempt Blocked",
    body: "Printing is not allowed.",
  },
};

interface TimerToast {
  id: string;
  type: "warning" | "critical" | "final";
  message: string;
  sub: string;
}

export function QuizFullScreen({
  isOpen,
  quizPayload,
  quizAttempt,
  quizReviewQuestions,
  quizTitle,
  quizSession,
  isLoading,
  onClose,
  onSubmit,
  isSubmitting,
}: QuizFullScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [navDirection, setNavDirection] = useState<"next" | "prev">("next");

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const [timerActive, setTimerActive] = useState(false);
  const [timerToasts, setTimerToasts] = useState<TimerToast[]>([]);

  const [isTerminated, setIsTerminated] = useState(false);
  const [showRulesScreen, setShowRulesScreen] = useState(true);

  const onCloseRef = useRef(onClose);
  const timerStopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const questions = quizPayload?.questions ?? [];
  const isResultsMode = !!quizAttempt;
  const reviewQuestions = quizReviewQuestions ?? questions;

  // Initialize security first so it can be called in the setup effect
  const security = useQuizSecurity({
    enabled:
      isOpen &&
      !showRulesScreen &&
      !isResultsMode &&
      !!quizPayload &&
      !isLoading &&
      !isTerminated,

    onViolation: (type, count) => {
      console.warn("[Quiz violation]", type, count);
    },

    maxViolations: MAX_VIOLATIONS,

    onMaxViolations: async () => {
      if (isTerminated) return;

      setIsTerminated(true);
      timerStopRef.current?.();
      security.dismissWarning();
      await security.exitFullscreen();

      setTimeout(() => {
        security.resetSecurityState();
        onCloseRef.current();
      }, 2600);
    },
  });

  useEffect(() => {
    if (!isOpen || !quizPayload || quizAttempt) return;

    // HARD RESET EVERYTHING FIRST
    setCurrentIndex(0);
    setAnswers({});
    setNavDirection("next");
    setShowSubmitConfirm(false);
    setTimerToasts([]);
    setTimerActive(false);
    setIsTerminated(false);
    setShowRulesScreen(true);

    // IMPORTANT:
    // clear security state BEFORE first paint
    security.dismissWarning();
    security.resetSecurityState();

    // allow reset render to complete first
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        security.requestFullscreen();
      });
    });

  }, [isOpen, quizPayload, quizAttempt]);

  useEffect(() => {
    if (!isOpen) {
      setIsTerminated(false);
      setShowRulesScreen(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const pushTimerToast = useCallback(
    (toast: Omit<TimerToast, "id">) => {
      const id = Math.random().toString(36).slice(2);

      setTimerToasts((prev) => [...prev, { ...toast, id }]);

      setTimeout(() => {
        setTimerToasts((prev) => prev.filter((t) => t.id !== id));
      }, 6000);
    },
    []
  );

  const timer = useQuizTimer({
    durationSeconds: QUIZ_DURATION_SECONDS,
    enabled:
      timerActive &&
      !showRulesScreen &&
      isOpen &&
      !isResultsMode &&
      !!quizPayload &&
      !isTerminated,

    onExpire: () => {
      pushTimerToast({
        type: "final",
        message: "Time's Up!",
        sub: "Submitting your answers...",
      });

      setTimeout(async () => {
        if (!quizPayload) {
          onCloseRef.current();
          return;
        }

        const ans = quizPayload.questions.map((q) => ({
          questionId: q.id,
          selectedOption: answers[q.id] !== undefined ? answers[q.id] : -1,
        }));

        try {
          await onSubmit(ans);
        } catch {
          onCloseRef.current();
        }
      }, 1400);
    },

    onWarning: (time) => {
      if (time <= 10) {
        pushTimerToast({
          type: "final",
          message: "Final 10 Seconds",
          sub: "Complete your answer quickly.",
        });
      } else if (time <= 60) {
        pushTimerToast({
          type: "critical",
          message: "1 Minute Remaining",
          sub: "Review your answers.",
        });
      } else if (time <= 300) {
        pushTimerToast({
          type: "warning",
          message: "5 Minutes Remaining",
          sub: "You're entering final review time.",
        });
      }
    },
  });

  useEffect(() => {
    timerStopRef.current = timer.stop;
  }, [timer.stop]);

  const handleAnswerSelect = useCallback(
    (questionId: string, optionIndex: number) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: optionIndex,
      }));
    },
    []
  );

  const goNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setNavDirection("next");
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, questions.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setNavDirection("prev");
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const jumpTo = useCallback(
    (idx: number) => {
      setNavDirection(idx > currentIndex ? "next" : "prev");
      setCurrentIndex(idx);
    },
    [currentIndex]
  );

  const handleSubmit = useCallback(() => {
    setShowSubmitConfirm(true);
  }, []);

  const handleConfirmSubmit = useCallback(async () => {
    setShowSubmitConfirm(false);

    if (!quizPayload) return;

    const ans = quizPayload.questions.map((q) => ({
      questionId: q.id,
      selectedOption: answers[q.id] !== undefined ? answers[q.id] : -1,
    }));

    timer.stop();

    try {
      await onSubmit(ans);
    } catch (error) {
      console.error(error);

      pushTimerToast({
        type: "critical",
        message: "Submission Failed",
        sub: "Please try again.",
      });
    }
  }, [quizPayload, answers, timer, onSubmit, pushTimerToast]);

  const handleClose = useCallback(async () => {
    timer.stop();
    security.dismissWarning();
    await security.exitFullscreen();
    onClose();
  }, [timer, security, onClose]);

  const answeredSet = new Set(
    Object.entries(answers)
      .filter(([, v]) => v !== undefined)
      .map(([k]) => k)
  );

  const answeredCount = answeredSet.size;
  const currentQuestion = questions[currentIndex];
  const unansweredCount = questions.length - answeredCount;
  const violationsLeft = MAX_VIOLATIONS - security.violations;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="quiz-fullscreen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[9999] flex flex-col overflow-hidden"
        style={{
          background: "#080612",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* BACKGROUND */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.07]"
            style={{
              background: "radial-gradient(circle, #8b5cf6, transparent 70%)",
            }}
          />

          <div
            className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.05]"
            style={{
              background: "radial-gradient(circle, #f43f5e, transparent 70%)",
            }}
          />
        </div>

        {/* RESULTS */}
        {isResultsMode ? (
          <div className="flex-1 overflow-hidden flex flex-col max-w-5xl mx-auto w-full px-4">
            <QuizResults
              attempt={quizAttempt!}
              questions={reviewQuestions}
              quizTitle={quizTitle}
              onClose={handleClose}
            />
          </div>
        ) : (
          <>
            {/* TOP BAR */}
            <div className="relative z-10 shrink-0 flex items-center gap-4 px-6 py-3 border-b border-white/[0.05] bg-[#080612]/60 backdrop-blur-xl">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center shrink-0">
                  <FileQuestion
                    size={14}
                    className="text-violet-400"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-foreground/30">
                    Quiz
                  </p>

                  <p className="text-sm font-bold truncate">
                    {quizTitle}
                  </p>
                </div>
              </div>

              {!isLoading && quizPayload && (
                <QuizTimer
                  formatted={isSubmitting ? "00:00" : timer.formatted}
                  percentage={isSubmitting ? 0 : timer.percentage}
                  isWarning={isSubmitting ? false : timer.isWarning}
                  isCritical={isSubmitting ? false : timer.isCritical}
                  isFinalCountdown={isSubmitting ? false : timer.isFinalCountdown}
                  hasExpired={isSubmitting ? true : timer.hasExpired}
                  seconds={isSubmitting ? 0 : timer.seconds}
                />
              )}

              <div className="flex items-center gap-2">
                {security.violations > 0 && (
                  <div
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border",
                      violationsLeft === 1
                        ? "bg-rose-500/15 border-rose-500/30"
                        : "bg-amber-500/10 border-amber-500/20"
                    )}
                  >
                    <ShieldAlert
                      size={11}
                      className={
                        violationsLeft === 1
                          ? "text-rose-400"
                          : "text-amber-400"
                      }
                    />

                    <span
                      className={cn(
                        "text-[10px] font-bold",
                        violationsLeft === 1
                          ? "text-rose-400"
                          : "text-amber-400"
                      )}
                    >
                      {security.violations}/{MAX_VIOLATIONS}
                    </span>
                  </div>
                )}

                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-foreground/30 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* FULLSCREEN RE-ENTRY */}
            <AnimatePresence>
              {!showRulesScreen &&
                !security.isFullscreen &&
                !isTerminated &&
                !isLoading &&
                quizPayload && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -14,
                      scale: 0.96,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -14,
                      scale: 0.96,
                    }}
                    transition={{ duration: 0.22 }}
                    className="fixed top-24 left-1/2 -translate-x-1/2 z-[10001]"
                  >
                    <div
                      className="relative overflow-hidden rounded-2xl border px-5 py-4 backdrop-blur-2xl"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(20,14,38,0.96), rgba(12,9,24,0.94))",
                        borderColor: "rgba(139,92,246,0.22)",
                        boxShadow:
                          "0 10px 40px rgba(0,0,0,0.45), 0 0 30px rgba(139,92,246,0.12)",
                      }}
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-[1px]"
                        style={{
                          background:
                            "linear-gradient(to right, transparent, rgba(167,139,250,0.7), transparent)",
                        }}
                      />

                      <div className="flex items-center gap-4">
                        <div
                          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                          style={{
                            background: "rgba(139,92,246,0.14)",
                            border: "1px solid rgba(139,92,246,0.24)",
                          }}
                        >
                          <Maximize2
                            size={18}
                            className="text-violet-300"
                          />
                        </div>

                        <div>
                          <p className="text-sm font-black text-violet-100">
                            Fullscreen Required
                          </p>

                          <p className="text-xs text-foreground/45 mt-1">
                            Return to fullscreen mode to continue the assessment securely.
                          </p>
                        </div>

                        <button
                          onClick={security.requestFullscreen}
                          className="shrink-0 px-4 h-10 rounded-xl text-xs font-black transition-all"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(139,92,246,0.24), rgba(124,58,237,0.2))",
                            border: "1px solid rgba(139,92,246,0.28)",
                            color: "#e9d5ff",
                          }}
                        >
                          Re-enter
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>

            {/* SECURITY WARNING ALERT */}
            <AnimatePresence>
              {security.isWarningVisible &&
                security.lastViolation &&
                !isTerminated && (
                  <motion.div
                    key={`${security.lastViolation}-${security.violations}`}
                    initial={{
                      opacity: 0,
                      y: -20,
                      scale: 0.96,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -20,
                      scale: 0.96,
                    }}
                    transition={{
                      duration: 0.22,
                    }}
                    className="fixed top-24 right-6 z-[10002]"
                  >
                    <div
                      className={cn(
                        "relative overflow-hidden rounded-2xl border px-5 py-4 w-[360px] backdrop-blur-2xl",
                        security.violations >= MAX_VIOLATIONS - 1
                          ? "border-rose-500/30"
                          : "border-amber-500/25"
                      )}
                      style={{
                        background:
                          security.violations >= MAX_VIOLATIONS - 1
                            ? "linear-gradient(135deg, rgba(38,12,18,0.96), rgba(24,8,12,0.96))"
                            : "linear-gradient(135deg, rgba(36,24,10,0.96), rgba(24,16,8,0.96))",
                        boxShadow:
                          security.violations >= MAX_VIOLATIONS - 1
                            ? "0 12px 40px rgba(244,63,94,0.14)"
                            : "0 12px 40px rgba(245,158,11,0.14)",
                      }}
                    >
                      {/* glow line */}
                      <div
                        className="absolute top-0 left-0 right-0 h-[1px]"
                        style={{
                          background:
                            security.violations >= MAX_VIOLATIONS - 1
                              ? "linear-gradient(to right, transparent, rgba(251,113,133,0.8), transparent)"
                              : "linear-gradient(to right, transparent, rgba(251,191,36,0.8), transparent)",
                        }}
                      />

                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "w-11 h-11 rounded-2xl flex items-center justify-center shrink-0",
                            security.violations >= MAX_VIOLATIONS - 1
                              ? "bg-rose-500/14 border border-rose-500/24"
                              : "bg-amber-500/14 border border-amber-500/24"
                          )}
                        >
                          <AlertTriangle
                            size={18}
                            className={
                              security.violations >= MAX_VIOLATIONS - 1
                                ? "text-rose-300"
                                : "text-amber-300"
                            }
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-sm font-black tracking-tight",
                              security.violations >= MAX_VIOLATIONS - 1
                                ? "text-rose-200"
                                : "text-amber-100"
                            )}
                          >
                            {VIOLATION_MESSAGES[security.lastViolation]?.title}
                          </p>

                          <p className="text-xs text-foreground/55 mt-1 leading-relaxed">
                            {VIOLATION_MESSAGES[security.lastViolation]?.body}
                          </p>

                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-[11px] text-foreground/35 font-semibold">
                              Warning {security.violations}/{MAX_VIOLATIONS}
                            </span>

                            <span
                              className={cn(
                                "text-[11px] font-black",
                                security.violations >= MAX_VIOLATIONS - 1
                                  ? "text-rose-300"
                                  : "text-amber-300"
                              )}
                            >
                              {MAX_VIOLATIONS - security.violations} remaining
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>

            {/* PROGRESS BAR */}
            {!isLoading && quizPayload && (
              <div className="shrink-0 h-0.5 bg-white/[0.04]">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-600 to-violet-400"
                  animate={{
                    width: `${((currentIndex + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
            )}

            {/* MAIN */}
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <Loader2 size={34} className="animate-spin text-violet-500" />

                <p className="text-sm text-foreground/40 font-semibold">
                  Generating quiz questions...
                </p>
              </div>
            ) : showRulesScreen ? (
              <div className="flex-1 flex items-center justify-center px-6 py-6 overflow-hidden">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="w-full max-w-2xl mx-auto max-h-full"
                >
                  <div
                    className="relative overflow-hidden rounded-3xl border p-8 md:p-10"
                    style={{
                      maxHeight: "calc(100vh - 140px)",
                      overflow: "hidden",
                      background:
                        "linear-gradient(135deg, rgba(16,12,30,0.96), rgba(10,8,22,0.96))",
                      borderColor: "rgba(139,92,246,0.14)",
                      boxShadow:
                        "0 20px 80px rgba(0,0,0,0.45), 0 0 40px rgba(139,92,246,0.08)",
                    }}
                  >
                    {/* glow */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[1px]"
                      style={{
                        background:
                          "linear-gradient(to right, transparent, rgba(167,139,250,0.7), transparent)",
                      }}
                    />

                    {/* heading */}
                    <div className="mb-8">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-300/60 mb-3">
                        Assessment Guidelines
                      </p>

                      <h2 className="text-3xl font-black tracking-tight text-white">
                        Before You Begin
                      </h2>

                      <p className="text-sm text-foreground/45 mt-3 leading-relaxed max-w-lg">
                        Please review the assessment rules carefully before starting
                        the quiz.
                      </p>
                    </div>

                    {/* rules */}
                    <div className="space-y-3">
                      {[
                        "Fullscreen mode is mandatory throughout the assessment.",
                        "Switching tabs or minimizing the window is not allowed.",
                        "Copy, paste, right-click, and developer tools are restricted.",
                        "The assessment will auto-submit when the timer ends.",
                        "Each violation will reduce your remaining warning count.",
                        "Exceeding 3 security violations will terminate the quiz.",
                      ].map((rule, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5"
                        >
                          <div className="w-7 h-7 rounded-xl bg-violet-500/14 border border-violet-500/18 flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-black text-violet-300">
                              {idx + 1}
                            </span>
                          </div>

                          <p className="text-sm text-foreground/65 leading-relaxed">
                            {rule}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* footer */}
                    <div className="mt-8 flex items-center justify-between gap-4">
                      <div className="text-xs text-foreground/35 leading-relaxed">
                        Duration:{" "}
                        <span className="text-violet-300 font-bold">
                          10 Minutes
                        </span>
                      </div>

                      <Button
                        onClick={async () => {
                          await security.requestFullscreen();

                          setTimeout(() => {
                            setShowRulesScreen(false);
                            setTimerActive(true);
                          }, 250);
                        }}
                        className="h-11 px-6 text-sm font-bold"
                      >
                        Start Assessment
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : quizPayload ? (
              <div className="flex-1 overflow-hidden flex">
                {/* SIDEBAR */}
                <div className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/[0.05] p-5 overflow-y-auto">
                  <QuizPalette
                    totalQuestions={questions.length}
                    currentIndex={currentIndex}
                    answeredQuestions={answeredSet}
                    questionIds={questions.map((q) => q.id)}
                    onJumpTo={jumpTo}
                  />
                </div>

                {/* QUESTION AREA */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto px-8 py-8">
                    <div className="max-w-2xl mx-auto">
                      {currentQuestion && (
                        <QuizQuestion
                          question={currentQuestion}
                          questionNumber={currentIndex + 1}
                          totalQuestions={questions.length}
                          selectedOption={answers[currentQuestion.id]}
                          onSelect={handleAnswerSelect}
                          direction={navDirection}
                        />
                      )}
                    </div>
                  </div>

                  {/* BOTTOM NAV */}
                  <div className="shrink-0 px-8 py-4 border-t border-white/[0.05] bg-[#080612]/60 backdrop-blur-xl">
                    <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={goPrev}
                        disabled={currentIndex === 0}
                        className="h-9 text-xs gap-1.5"
                      >
                        <ChevronLeft size={14} />
                        Previous
                      </Button>

                      <div className="hidden lg:flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
                          <span className="text-[11px] font-semibold text-foreground/40">
                            Question
                          </span>

                          <span className="ml-1 text-[11px] font-black text-violet-300">
                            {currentIndex + 1}
                          </span>

                          <span className="text-[11px] text-foreground/25">
                            /{questions.length}
                          </span>
                        </div>
                      </div>

                      {currentIndex < questions.length - 1 ? (
                        <Button
                          size="sm"
                          onClick={goNext}
                          className="h-9 text-xs gap-1.5"
                        >
                          Next
                          <ChevronRight size={14} />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="h-9 text-xs gap-1.5 bg-emerald-500/90 hover:bg-emerald-500 border-emerald-400/30"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit Quiz"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}

        {/* SUBMIT CONFIRM MODAL */}
        <AnimatePresence>
          {showSubmitConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10020] flex items-center justify-center"
              style={{
                background: "rgba(5,4,12,0.72)",
                backdropFilter: "blur(18px)",
              }}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md mx-4 rounded-3xl border overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(16,12,30,0.98), rgba(10,8,22,0.98))",
                  borderColor: "rgba(139,92,246,0.14)",
                  boxShadow:
                    "0 20px 80px rgba(0,0,0,0.45), 0 0 40px rgba(139,92,246,0.08)",
                }}
              >
                {/* top glow */}
                <div
                  className="h-[1px] w-full"
                  style={{
                    background:
                      "linear-gradient(to right, transparent, rgba(167,139,250,0.7), transparent)",
                  }}
                />

                <div className="p-7">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <FileQuestion
                        size={20}
                        className="text-emerald-300"
                      />
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-white tracking-tight">
                        Submit Quiz?
                      </h3>

                      <p className="text-sm text-foreground/50 mt-2 leading-relaxed">
                        Your answers will be finalized and cannot be edited after submission.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground/45">
                        Answered Questions
                      </span>

                      <span className="font-black text-emerald-300">
                        {answeredCount}/{questions.length}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-foreground/45">
                        Remaining
                      </span>

                      <span className="font-black text-amber-300">
                        {unansweredCount}
                      </span>
                    </div>
                  </div>

                  <div className="mt-7 flex items-center justify-end gap-3">
                    <Button
                      variant="glass"
                      onClick={() => setShowSubmitConfirm(false)}
                      className="h-10 px-5 text-sm"
                    >
                      Cancel
                    </Button>

                    <Button
                      onClick={handleConfirmSubmit}
                      disabled={isSubmitting}
                      className="h-10 px-5 text-sm bg-emerald-500 hover:bg-emerald-400 text-black font-black"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2
                            size={14}
                            className="animate-spin mr-2"
                          />
                          Submitting...
                        </>
                      ) : (
                        "Confirm Submit"
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TERMINATED OVERLAY */}
        <AnimatePresence>
          {isTerminated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[10010] flex items-center justify-center"
              style={{
                background: "rgba(6,4,14,0.98)",
                backdropFilter: "blur(28px)",
              }}
            >
              <motion.div
                initial={{
                  scale: 0.9,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  duration: 0.35,
                }}
                className="text-center px-6 max-w-md"
              >
                <div
                  className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6"
                  style={{
                    background: "rgba(244,63,94,0.12)",
                    border: "1px solid rgba(244,63,94,0.3)",
                  }}
                >
                  <ShieldOff size={32} className="text-rose-400" />
                </div>

                <h2 className="text-3xl font-black text-rose-300 mb-3 tracking-tight">
                  Quiz Session Ended
                </h2>

                <p className="text-sm text-foreground/50 leading-relaxed mb-8 max-w-xs mx-auto">
                  Multiple security violations were detected during the assessment.
                  This attempt has been closed automatically.
                </p>

                <div className="flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-full border border-white/[0.08] bg-white/[0.03]">
                  <Loader2 size={13} className="text-rose-400/70 animate-spin" />

                  <span className="text-xs text-foreground/30 font-semibold">
                    Returning to masterclasses...
                  </span>
                </div>

                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{
                    duration: 2.4,
                    ease: "linear",
                  }}
                  className="h-[2px] rounded-full bg-rose-400/70 mt-6"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

export default QuizFullScreen;