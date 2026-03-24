import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-xl px-4 py-2.5 text-sm text-foreground",
          "bg-white/[0.04] border border-white/[0.08]",
          "placeholder:text-foreground/25",
          "focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15",
          "hover:border-white/[0.14]",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "transition-all duration-200",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };