"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  // Close on Escape
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}

export function DialogTrigger({ children }: { asChild?: boolean; children: React.ReactNode }) {
  return <>{children}</>;
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  showClose?: boolean;
}

export function DialogContent({
  children,
  className,
  showClose = true,
  ...props
}: DialogContentProps) {
  const ctx = React.useContext(DialogContext);

  return (
    <div
      className={cn(
        "relative w-full max-w-md mx-auto rounded-2xl overflow-hidden",
        "bg-[#0d0a1e]/95 backdrop-blur-2xl",
        "border border-white/[0.08] shadow-2xl shadow-black/50",
        "pointer-events-auto",
        className,
      )}
      onClick={e => e.stopPropagation()}
      {...props}
    >
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

      {showClose && ctx && (
        <button
          onClick={() => ctx.onOpenChange(false)}
          className="absolute top-4 right-4 z-10 w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.05] border border-white/[0.08] text-foreground/40 hover:text-foreground hover:bg-white/[0.09] transition-all duration-200"
          aria-label="Close"
        >
          <X size={13} />
        </button>
      )}

      {children}
    </div>
  );
}

const DialogContext = React.createContext<{ onOpenChange: (open: boolean) => void } | null>(null);

const DialogWithContext: typeof Dialog = ({ open, onOpenChange, children }) => {
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  React.useEffect(() => {
    if (open) { document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <DialogContext.Provider value={{ onOpenChange }}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={() => onOpenChange(false)}
        />
        <div className="relative z-10 w-full flex items-center justify-center">
          {children}
        </div>
      </div>
    </DialogContext.Provider>
  );
};

export { DialogWithContext as default };


export function DialogHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 pt-6 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={cn("text-lg font-bold text-foreground tracking-tight", className)} {...props}>
      {children}
    </h2>
  );
}

export function DialogDescription({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-foreground/45 mt-1.5", className)} {...props}>
      {children}
    </p>
  );
}

export function DialogFooter({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 pb-6 pt-4 flex justify-end gap-3 border-t border-white/[0.05]", className)} {...props}>
      {children}
    </div>
  );
}