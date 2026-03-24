"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    container: "bg-emerald-500/10 border-emerald-500/20",
    icon_color: "text-emerald-400",
    title_color: "text-emerald-300",
    text_color: "text-emerald-300/70",
    bar: "bg-emerald-500",
  },
  error: {
    icon: XCircle,
    container: "bg-rose-500/10 border-rose-500/20",
    icon_color: "text-rose-400",
    title_color: "text-rose-300",
    text_color: "text-rose-300/70",
    bar: "bg-rose-500",
  },
  warning: {
    icon: AlertTriangle,
    container: "bg-amber-500/10 border-amber-500/20",
    icon_color: "text-amber-400",
    title_color: "text-amber-300",
    text_color: "text-amber-300/70",
    bar: "bg-amber-500",
  },
  info: {
    icon: Info,
    container: "bg-violet-500/10 border-violet-500/20",
    icon_color: "text-violet-400",
    title_color: "text-violet-300",
    text_color: "text-violet-300/70",
    bar: "bg-violet-500",
  },
} as const;

const DURATION = 4500;

interface ToastProps {
  message: string;
  type?: keyof typeof TOAST_CONFIG;
  onClose: () => void;
}

export function Toast({ message, type = "info", onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const enter = requestAnimationFrame(() => setVisible(true));
    const dismiss = setTimeout(() => {
      setLeaving(true);
      setTimeout(onClose, 300);
    }, DURATION);

    return () => {
      cancelAnimationFrame(enter);
      clearTimeout(dismiss);
    };
  }, [onClose]);

  const cfg = TOAST_CONFIG[type];
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        "fixed bottom-5 right-5 z-[100] flex items-start gap-3",
        "rounded-2xl border px-4 py-3.5 shadow-2xl shadow-black/40",
        "backdrop-blur-xl max-w-sm w-full",
        "transition-all duration-300",
        cfg.container,
        visible && !leaving ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      )}
    >
      <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-2xl overflow-hidden">
        <div
          className={cn("h-full rounded-b-2xl", cfg.bar, "opacity-50")}
          style={{
            animation: `shrink ${DURATION}ms linear forwards`,
          }}
        />
      </div>

      <Icon size={18} className={cn("shrink-0 mt-0.5", cfg.icon_color)} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-bold leading-snug", cfg.title_color)}>{message}</p>
      </div>
      <button
        onClick={() => { setLeaving(true); setTimeout(onClose, 300); }}
        className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-foreground/30 hover:text-foreground/60 transition-colors"
      >
        <X size={12} />
      </button>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback(({ title, description, variant = "default" }: {
    title: string;
    description?: string;
    variant?: "default" | "destructive";
  }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, DURATION + 300);
  }, []);

  return { toast, toasts };
}

export function ToastRenderer({ toasts }: { toasts: ToastItem[] }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 items-end">
      {toasts.map(t => {
        const type = t.variant === "destructive" ? "error" : "success";
        const cfg = TOAST_CONFIG[type];
        const Icon = cfg.icon;

        return (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-3 rounded-2xl border px-4 py-3.5",
              "shadow-2xl shadow-black/40 backdrop-blur-xl",
              "max-w-sm w-full animate-fade-in-up",
              cfg.container,
            )}
          >
            <Icon size={16} className={cn("shrink-0 mt-0.5", cfg.icon_color)} />
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-bold", cfg.title_color)}>{t.title}</p>
              {t.description && (
                <p className={cn("text-xs mt-0.5", cfg.text_color)}>{t.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}