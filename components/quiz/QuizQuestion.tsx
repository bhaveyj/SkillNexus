"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface QuizQuestionProps {
  question: {
    id: string;
    question: string;
    options: string[];
  };
  questionNumber: number;
  totalQuestions: number;
  selectedOption: number | undefined;
  onSelect: (questionId: string, optionIndex: number) => void;
  direction: "next" | "prev";
}

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

const variants = {
  enter: (direction: "next" | "prev") => ({
    x: direction === "next" ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: "next" | "prev") => ({
    x: direction === "next" ? -60 : 60,
    opacity: 0,
  }),
};

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onSelect,
  direction,
}: QuizQuestionProps) {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={question.id}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col gap-6"
      >
        {/* Question header */}
        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
            <span className="text-sm font-black text-violet-300">
              {questionNumber}
            </span>
          </div>
          <div className="flex-1 pt-1">
            <p className="text-[9px] font-black uppercase tracking-[0.18em] text-foreground/30 mb-1">
              Question {questionNumber} of {totalQuestions}
            </p>
            <p className="text-base font-semibold text-foreground leading-relaxed select-none">
              {question.question}
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="grid gap-2.5">
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const label = OPTION_LABELS[idx] || String(idx + 1);

            return (
              <motion.button
                key={idx}
                onClick={() => onSelect(question.id, idx)}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.995 }}
                transition={{ duration: 0.12 }}
                className={cn(
                  "group relative w-full text-left rounded-2xl border p-4 transition-all duration-200",
                  "flex items-center gap-4 select-none",
                  isSelected
                    ? "bg-violet-500/15 border-violet-500/50 shadow-sm shadow-violet-500/10"
                    : "bg-white/[0.02] border-white/[0.07] hover:bg-white/[0.04] hover:border-white/[0.14]"
                )}
              >
                {/* Option label badge */}
                <div
                  className={cn(
                    "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all duration-200",
                    isSelected
                      ? "bg-violet-500/30 text-violet-200 border border-violet-500/50"
                      : "bg-white/[0.05] text-foreground/40 border border-white/[0.08] group-hover:border-white/[0.18] group-hover:text-foreground/60"
                  )}
                >
                  {label}
                </div>

                {/* Option text */}
                <span
                  className={cn(
                    "flex-1 text-sm font-medium leading-relaxed transition-colors",
                    isSelected ? "text-violet-100" : "text-foreground/70"
                  )}
                >
                  {option}
                </span>

                {/* Selected indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="shrink-0 w-5 h-5 rounded-full bg-violet-500/40 border border-violet-400/60 flex items-center justify-center"
                  >
                    <div className="w-2 h-2 rounded-full bg-violet-300" />
                  </motion.div>
                )}

                {/* Hover shimmer line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default QuizQuestion;