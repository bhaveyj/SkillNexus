import type * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl",
    "text-sm font-semibold tracking-wide",
    "transition-all duration-200 ease-out",
    "disabled:pointer-events-none disabled:opacity-40",
    "outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080612]",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0",
    "cursor-pointer select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-gradient-to-r from-violet-600 to-violet-700 text-white",
          "shadow-lg shadow-violet-700/30",
          "hover:from-violet-500 hover:to-violet-600 hover:shadow-violet-500/40 hover:shadow-xl",
          "hover:-translate-y-0.5 active:translate-y-0",
          "border border-violet-500/20",
        ].join(" "),
        secondary: [
          "bg-gradient-to-r from-rose-500 to-rose-600 text-white",
          "shadow-lg shadow-rose-600/25",
          "hover:from-rose-400 hover:to-rose-500 hover:shadow-rose-500/35 hover:shadow-xl",
          "hover:-translate-y-0.5 active:translate-y-0",
          "border border-rose-500/20",
        ].join(" "),
        outline: [
          "bg-white/5 border border-white/12 text-foreground",
          "hover:bg-white/10 hover:border-violet-500/40",
          "hover:-translate-y-0.5 active:translate-y-0",
        ].join(" "),
        ghost: [
          "bg-transparent text-foreground/70",
          "hover:bg-white/6 hover:text-foreground",
        ].join(" "),
        glass: [
          "bg-white/5 backdrop-blur-md border border-white/10 text-foreground",
          "hover:bg-white/10 hover:border-violet-500/30",
          "hover:-translate-y-0.5 active:translate-y-0 shadow-sm",
        ].join(" "),
        destructive: [
          "bg-rose-600 text-white border border-rose-500/30",
          "hover:bg-rose-500 hover:shadow-lg hover:shadow-rose-500/25",
          "hover:-translate-y-0.5 active:translate-y-0",
        ].join(" "),
        link: "text-violet-400 underline-offset-4 hover:underline h-auto p-0",
      },
      size: {
        sm:       "h-8  px-3.5 text-xs",
        default:  "h-10 px-5",
        lg:       "h-12 px-7 text-base",
        xl:       "h-14 px-9 text-base tracking-wider",
        icon:     "size-9",
        "icon-sm":"size-8",
        "icon-lg":"size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };