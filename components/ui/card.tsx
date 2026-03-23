import type * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-6 rounded-2xl py-6",
        "bg-white/[0.03] backdrop-blur-xl border border-white/[0.07] shadow-sm",
        "transition-all duration-300",
        className,
      )}
      {...props}
    />
  );
}

function CardHover({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-6 rounded-2xl py-6 cursor-pointer",
        "bg-white/[0.03] backdrop-blur-xl border border-white/[0.07]",
        "transition-all duration-300",
        "hover:-translate-y-1 hover:border-violet-500/25 hover:shadow-xl hover:shadow-violet-500/10",
        className,
      )}
      {...props}
    />
  );
}

function CardStat({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-2 rounded-2xl p-5",
        "bg-white/[0.04] backdrop-blur-xl border border-white/[0.08]",
        "transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-500/20",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-title" className={cn("leading-none font-semibold tracking-tight", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-description" className={cn("text-muted-foreground text-sm leading-relaxed", className)} {...props} />;
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-action" className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)} {...props} />;
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center px-6 [.border-t]:pt-6", className)} {...props} />;
}

export { Card, CardHover, CardStat, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };