import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center gap-1 rounded-lg border",
    "px-2.5 py-0.5 text-[11px] font-bold w-fit whitespace-nowrap shrink-0",
    "[&>svg]:size-3 [&>svg]:pointer-events-none",
    "transition-all duration-200 select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-violet-500/12 text-violet-300 border-violet-500/25",

        secondary:
          "bg-white/[0.06] text-foreground/60 border-white/[0.09]",

        destructive:
          "bg-rose-500/12 text-rose-300 border-rose-500/25",

        outline:
          "bg-transparent text-foreground/55 border-white/[0.12]",

        success:
          "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",

        warning:
          "bg-amber-500/10 text-amber-300 border-amber-500/20",

        info:
          "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };