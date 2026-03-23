"use client";

import { cn } from "@/lib/utils";
import React from "react";

export function PageHeader({
  title,
  subtitle,
  right,
  sticky = true,
}: {
  title: React.ReactNode;
  subtitle?: string;
  right?: React.ReactNode;
  sticky?: boolean;
}) {
  return (
    <div
      className={cn(
        "border-b border-white/[0.05] z-10",
        "bg-[#080612]/80 backdrop-blur-xl",
        sticky && "sticky top-0",
      )}
    >
      <div className="px-6 lg:px-8 py-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-foreground/45 mt-0.5">{subtitle}</p>}
        </div>
        {right && <div className="flex items-center gap-2 shrink-0">{right}</div>}
      </div>
    </div>
  );
}

export function GlassCard({
  className,
  children,
  hover = false,
  onClick,
}: {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-2xl overflow-hidden",
        "bg-white/[0.03] backdrop-blur-xl border border-white/[0.07]",
        hover && [
          "cursor-pointer transition-all duration-250",
          "hover:border-violet-500/25 hover:bg-white/[0.05]",
          "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30",
        ],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  accent = "violet",
  loading = false,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: "violet" | "rose" | "cyan" | "amber" | "emerald";
  loading?: boolean;
}) {
  const accentMap = {
    violet: { bg: "bg-violet-500/10", text: "text-violet-400", glow: "group-hover:shadow-violet-500/10" },
    rose:   { bg: "bg-rose-500/10",   text: "text-rose-400",   glow: "group-hover:shadow-rose-500/10" },
    cyan:   { bg: "bg-cyan-500/10",   text: "text-cyan-400",   glow: "group-hover:shadow-cyan-500/10" },
    amber:  { bg: "bg-amber-500/10",  text: "text-amber-400",  glow: "group-hover:shadow-amber-500/10" },
    emerald:{ bg: "bg-emerald-500/10",text: "text-emerald-400",glow: "group-hover:shadow-emerald-500/10" },
  };
  const a = accentMap[accent];

  return (
    <div className={cn(
      "group relative rounded-2xl p-5",
      "bg-white/[0.03] backdrop-blur-xl border border-white/[0.07]",
      "transition-all duration-250",
      "hover:-translate-y-0.5 hover:border-white/[0.12] hover:shadow-xl",
      a.glow,
    )}>
      <div className={cn("absolute top-0 left-6 right-6 h-px", a.bg)} />

      <div className="flex items-start justify-between mb-4">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-foreground/35">{label}</p>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", a.bg)}>
          <span className={a.text}>{icon}</span>
        </div>
      </div>

      {loading ? (
        <div className="h-9 w-16 bg-white/5 rounded-lg animate-pulse" />
      ) : (
        <p className="text-4xl font-extrabold text-foreground tracking-tight">{value}</p>
      )}
    </div>
  );
}

export function SectionHeader({
  title,
  right,
  className,
}: {
  title: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <h2 className="text-sm font-bold uppercase tracking-[0.1em] text-foreground/40">{title}</h2>
      {right}
    </div>
  );
}

export function Pill({
  children,
  color = "violet",
  className,
}: {
  children: React.ReactNode;
  color?: "violet" | "rose" | "cyan" | "amber" | "emerald" | "green" | "orange" | "gray";
  className?: string;
}) {
  const map: Record<string, string> = {
    violet:  "bg-violet-500/12 text-violet-400 border-violet-500/25",
    rose:    "bg-rose-500/12   text-rose-400   border-rose-500/25",
    cyan:    "bg-cyan-500/10   text-cyan-400   border-cyan-500/22",
    amber:   "bg-amber-500/10  text-amber-400  border-amber-500/22",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/22",
    green:   "bg-green-500/10  text-green-400  border-green-500/20",
    orange:  "bg-orange-500/10 text-orange-400 border-orange-500/20",
    gray:    "bg-white/5       text-foreground/50 border-white/8",
  };
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border",
      map[color] ?? map.gray,
      className,
    )}>
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/7 flex items-center justify-center mb-4 text-foreground/25">
        {icon}
      </div>
      <p className="text-sm font-semibold text-foreground/50">{title}</p>
      {description && <p className="text-xs text-foreground/30 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function TabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: string; label: string; icon?: React.ReactNode; badge?: number }[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={cn(
            "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            active === tab.key
              ? "bg-violet-500/15 text-foreground border border-violet-500/25"
              : "text-foreground/45 hover:text-foreground/70 hover:bg-white/4",
          )}
        >
          {tab.icon && <span className="text-[15px]">{tab.icon}</span>}
          {tab.label}
          {tab.badge != null && tab.badge > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              {tab.badge > 9 ? "9+" : tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function Spinner({ size = "sm" }: { size?: "xs" | "sm" | "md" }) {
  const s = { xs: "w-3 h-3", sm: "w-4 h-4", md: "w-5 h-5" }[size];
  return (
    <div className={cn(s, "rounded-full border-2 border-white/20 border-t-white animate-spin")} />
  );
}

export const CATEGORY_COLORS: Record<string, { pill: string }> = {
  DEVOPS:           { pill: "cyan" },
  CLOUD:            { pill: "cyan" },
  WEB_DEVELOPMENT:  { pill: "violet" },
  FRONTEND:         { pill: "rose" },
  BACKEND:          { pill: "violet" },
  MOBILE:           { pill: "emerald" },
  DATABASE:         { pill: "amber" },
  DATA_SCIENCE:     { pill: "orange" },
  AI_ML:            { pill: "rose" },
  UI_UX:            { pill: "cyan" },
  CYBERSECURITY:    { pill: "rose" },
  BLOCKCHAIN:       { pill: "violet" },
  GAME_DEVELOPMENT: { pill: "amber" },
  TESTING:          { pill: "cyan" },
  OTHER:            { pill: "gray" },
};

export const formatCategory = (c: string) =>
  c.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());