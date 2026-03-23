"use client";

import type React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";

function FullPageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#080612]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-violet-500/20" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-500"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
        </div>
        <p className="text-sm text-foreground/40 font-medium">Loading...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") return <FullPageLoader />;
  if (!session) return null;

  return (
    <div className="relative z-10 flex min-h-screen bg-[#080612]">
      <div className="sticky top-0 h-screen flex-shrink-0 z-20">
        <Sidebar />
      </div>

      <main className="relative flex-1 overflow-auto min-h-screen">
        <div className="pointer-events-none fixed top-0 left-[60px] w-[600px] h-[400px] bg-violet-600/4 blur-[120px] rounded-full" />
        {children}
      </main>
    </div>
  );
}