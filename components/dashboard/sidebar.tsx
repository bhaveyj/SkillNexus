"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Sidebar as SidebarUI, SidebarBody, SidebarLink } from "../ui/sidebar";
import {
  IconLayoutDashboard,
  IconShoppingBag,
  IconVideo,
  IconCalendarEvent,
  IconUser,
  IconMessageCircle2,
  IconLogout,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: <IconLayoutDashboard size={18} />,
  },
  {
    label: "Marketplace",
    href: "/dashboard/marketplace",
    icon: <IconShoppingBag size={18} />,
  },
  {
    label: "Chats",
    href: "/dashboard/chats",
    icon: <IconMessageCircle2 size={18} />,
  },
  {
    label: "Masterclasses",
    href: "/dashboard/masterclasses",
    icon: <IconVideo size={18} />,
  },
  {
    label: "My Sessions",
    href: "/dashboard/my-sessions",
    icon: <IconCalendarEvent size={18} />,
  },
  {
    label: "Profile",
    href: "/dashboard/profile",
    icon: <IconUser size={18} />,
  },
];

export function Sidebar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const userName = session?.user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();
  const avatarSrc =
    session?.user?.image ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`;

  return (
    <>
      <SidebarUI open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-6 px-3 py-4">

          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <div className="px-1 mb-6">
              {open ? <LogoFull /> : <LogoIcon />}
            </div>

            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => (
                <SidebarLink key={i} link={link} />
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-1">
            <div className="h-px bg-white/[0.06] mx-1 mb-2" />

            <div className={cn(
              "flex items-center gap-3 px-2.5 py-2 rounded-xl",
              "text-foreground/60",
              !open && "justify-center",
            )}>
              <div className="relative shrink-0">
                <img
                  src={avatarSrc}
                  alt={userName}
                  className="h-7 w-7 rounded-full ring-2 ring-violet-500/30 object-cover"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0a0818]" />
              </div>

              <motion.div
                animate={{
                  display: open ? "flex" : "none",
                  opacity: open ? 1 : 0,
                }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0 flex flex-col"
              >
                <span className="text-xs font-semibold text-foreground/80 truncate">{userName}</span>
                <span className="text-[10px] text-foreground/35 truncate">{session?.user?.email}</span>
              </motion.div>
            </div>

            <button
              onClick={() => setShowLogout(true)}
              className={cn(
                "group/link flex items-center gap-3 px-2.5 py-2.5 rounded-xl w-full",
                "text-foreground/40 hover:text-rose-400 hover:bg-rose-500/8",
                "transition-all duration-200",
                !open && "justify-center",
              )}
            >
              <IconLogout size={18} className="shrink-0 transition-colors duration-200" />
              <motion.span
                animate={{
                  display: open ? "inline-block" : "none",
                  opacity: open ? 1 : 0,
                }}
                transition={{ duration: 0.15 }}
                className="text-sm font-medium whitespace-pre"
              >
                Logout
              </motion.span>
            </button>
          </div>
        </SidebarBody>
      </SidebarUI>

      <Dialog open={showLogout} onOpenChange={setShowLogout}>
        <DialogContent className="bg-[#100c24] border-white/[0.08] shadow-2xl shadow-black/60">
          <DialogHeader>
            <DialogTitle className="text-foreground">Sign out?</DialogTitle>
            <DialogDescription className="text-muted-foreground">
{"You'll need to sign in again to access your dashboard."}     
       </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowLogout(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => { setShowLogout(false); signOut({ callbackUrl: "/" }); }}
            >
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function LogoFull() {
  return (
<Link href="/" className="flex items-center gap-2.5 group">
      <div className="relative">
        <div className="absolute inset-0 rounded-lg bg-violet-500/20 blur group-hover:blur-md transition-all" />
        <img src="/logo.svg" alt="SkillNexus" className="relative h-7 w-7" />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold text-[15px] gradient-text-violet whitespace-nowrap"
      >
        SkillNexus
      </motion.span>
    </Link>
  );
}

export function LogoIcon() {
  return (
<Link href="/" className="flex items-center justify-center group">
      <div className="relative">
        <div className="absolute inset-0 rounded-lg bg-violet-500/20 blur group-hover:blur-md transition-all" />
        <img src="/logo.svg" alt="SkillNexus" className="relative h-7 w-7" />
      </div>
    </Link>
  );
}