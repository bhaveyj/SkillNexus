"use client";
import { cn } from "@/lib/utils";
import Link, { LinkProps } from "next/link";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { usePathname } from "next/navigation";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider");
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => (
  <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
    {children}
  </SidebarProvider>
);

export const SidebarBody = ({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
}) => (
  <>
    <DesktopSidebar className={className}>{children}</DesktopSidebar>
    <MobileSidebar className={className} {...props}>{children}</MobileSidebar>
  </>
);

export const DesktopSidebar = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  const { open, setOpen, animate } = useSidebar();

  return (
    <motion.div
      className={cn(
        "hidden md:flex md:flex-col h-full flex-shrink-0 relative",
        "bg-[#0a0818]/90 backdrop-blur-2xl",
        "border-r border-white/[0.06]",
        className,
      )}
      animate={{ width: animate ? (open ? "240px" : "58px") : "240px" }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-violet-500/20 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();

  return (
    <div
      className="flex h-14 w-full items-center justify-between md:hidden px-4 bg-[#0a0818]/95 backdrop-blur-xl border-b border-white/[0.06]"
      {...props}
    >
      <a href="/dashboard" className="flex items-center gap-2">
        <img src="/logo.svg" alt="SkillNexus" className="h-6 w-6" />
        <span className="font-bold text-sm gradient-text-violet">SkillNexus</span>
      </a>

      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/8 text-foreground/70 hover:text-foreground transition-colors"
      >
        <IconMenu2 size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              "fixed inset-0 z-[100] flex flex-col justify-between p-6",
              "bg-[#080612]/98 backdrop-blur-2xl",
              className,
            )}
          >
            <button
              className="absolute right-5 top-5 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/8 text-foreground/70"
              onClick={() => setOpen(false)}
            >
              <IconX size={16} />
            </button>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({
  link,
  className,
  onClick,
  ...props
}: {
  link: Links;
  className?: string;
  onClick?: () => void;
  props?: LinkProps;
}) => {
  const { open, animate } = useSidebar();
  const pathname = usePathname();

  const isActive =
    link.href !== "#" &&
    (pathname === link.href ||
      (link.href !== "/dashboard" && pathname.startsWith(link.href)));

  return (
    <Link
      href={link.href}
      onClick={onClick}
      className={cn(
        "group/link relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl",
        "transition-all duration-200",
        isActive
          ? [
            "bg-violet-500/15 text-foreground",
            "shadow-[inset_0_1px_0_rgba(139,92,246,0.2)]",
          ].join(" ")
          : "text-foreground/50 hover:text-foreground/80 hover:bg-white/[0.05]",
        className,
      )}
      {...props}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-violet-400 to-violet-600" />
      )}

      <span className={cn(
        "shrink-0 transition-colors duration-200",
        isActive ? "text-violet-400" : "text-foreground/40 group-hover/link:text-foreground/70",
      )}>
        {link.icon}
      </span>

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={cn(
          "!m-0 !p-0 whitespace-nowrap text-sm font-medium",
          isActive ? "text-foreground" : "text-foreground/55",
        )}
      >
        {link.label}
      </motion.span>

      {isActive && !open && (
        <span className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-violet-400" />
      )}
    </Link>
  );
};