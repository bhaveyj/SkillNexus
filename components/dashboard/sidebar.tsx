"use client";
import React, { useState } from "react";
import { Sidebar as SidebarUI, SidebarBody, SidebarLink } from "../ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconShoppingCart,
  IconVideo,
  IconCalendar,
  IconUserBolt,
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

export function Sidebar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const links = [
    {
      label: "Overview",
      href: "/dashboard",
      icon: (
        <IconBrandTabler className="h-5 w-5 shrink-0 text-foreground" />
      ),
    },
    {
      label: "Marketplace",
      href: "/dashboard/marketplace",
      icon: (
        <IconShoppingCart className="h-5 w-5 shrink-0 text-foreground" />
      ),
    },
    {
      label: "Masterclasses",
      href: "/dashboard/masterclasses",
      icon: (
        <IconVideo className="h-5 w-5 shrink-0 text-foreground" />
      ),
    },
    {
      label: "My Sessions",
      href: "/dashboard/my-sessions",
      icon: (
        <IconCalendar className="h-5 w-5 shrink-0 text-foreground" />
      ),
    },
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: (
        <IconUserBolt className="h-5 w-5 shrink-0 text-foreground" />
      ),
    },
  ];

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutDialog(false);
    signOut({ callbackUrl: "/" });
  };

  return (
    <>
      <SidebarUI open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {open ? <Logo /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="border-t border-border pt-4">
            <SidebarLink
              link={{
                label: session?.user?.name || "User",
                href: "#",
                icon: (
                  <img
                    src={
                      session?.user?.image ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name}`
                    }
                    className="h-7 w-7 shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
          <div onClick={handleLogoutClick}>
            <SidebarLink
              link={{
                label: "Logout",
                href: "#",
                icon: (
                  <IconArrowLeft className="h-5 w-5 shrink-0 text-foreground" />
                ),
              }}
            />
          </div>
        </div>
      </SidebarBody>
    </SidebarUI>

    <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogDescription>
            Are you sure you want to logout? You will need to sign in again to access your dashboard.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setShowLogoutDialog(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleLogoutConfirm}>
            Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}

export const Logo = () => {
  return (
    <a
      href="/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal"
    >
      <img src="/logo.svg" alt="SkillNexus" className="h-7 w-7 shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="whitespace-pre font-medium text-foreground"
      >
        SkillNexus
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="/dashboard"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal"
    >
      <img src="/logo.svg" alt="SkillNexus" className="h-7 w-7 shrink-0" />
    </a>
  );
};
