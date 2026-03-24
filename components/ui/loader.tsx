import React from "react";
import { cn } from "@/lib/utils";

export function Loader({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 min-h-[200px]", className)}>
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500 border-r-violet-500/30 animate-spin" />
        <div
          className="absolute inset-[5px] rounded-full border-2 border-transparent border-b-rose-500/60 border-l-rose-500/20 animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "0.7s" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400/60" />
        </div>
      </div>
      <p className="text-xs font-semibold text-foreground/25 tracking-wider uppercase animate-pulse">
        Loading
      </p>
    </div>
  );
}

export function LoaderTwo({ size = "sm" }: { size?: "xs" | "sm" | "md" }) {
  const dims = { xs: "w-3 h-3", sm: "w-4 h-4", md: "w-5 h-5" }[size];
  return (
    <div
      className={cn(
        dims,
        "rounded-full border-2 border-white/20 border-t-white animate-spin shrink-0",
      )}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-white/[0.04]",
        "after:absolute after:inset-0",
        "after:bg-gradient-to-r after:from-transparent after:via-white/[0.06] after:to-transparent",
        "after:translate-x-[-100%] after:animate-[shimmer_1.5s_infinite]",
        className,
      )}
    />
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080612]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-violet-600/10 blur-[80px]" />
      <Loader />
    </div>
  );
}