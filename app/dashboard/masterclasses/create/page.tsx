"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { ArrowLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const inputCls = cn(
  "w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground",
  "placeholder:text-foreground/20 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 transition-all"
);

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-[0.14em] text-foreground/40">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-foreground/25">{hint}</p>}
    </div>
  );
}

export default function CreateMasterclassPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" | "info" } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const datetimeStr = fd.get("datetime") as string;
    const datetime = new Date(datetimeStr);
    const timeStr = datetime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

    try {
      const res = await fetch("/api/masterclass/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fd.get("title"), description: fd.get("description"),
          category: fd.get("category"), level: fd.get("level"),
          date: datetime.toISOString(), time: timeStr,
          duration: fd.get("duration"), maxStudents: fd.get("maxStudents"),
          meetLink: fd.get("meetLink"),
          creditCost: fd.get("creditCost"),
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to create");
      setToast({ message: "Masterclass created successfully!", type: "success" });
      setTimeout(() => router.push("/dashboard/masterclasses"), 1500);
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Failed to create", type: "error" });
    } finally { setLoading(false); }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="sticky top-0 z-10 border-b border-white/[0.05] bg-[#080612]/80 backdrop-blur-xl">
        <div className="px-6 lg:px-8 h-16 flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.04] border border-white/[0.07] text-foreground/50 hover:text-foreground transition-all">
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Create Masterclass</h1>
            <p className="text-xs text-foreground/40">Host a live learning session</p>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8 max-w-2xl">
        <div className="relative rounded-2xl overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/[0.07]">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

          <div className="p-6 border-b border-white/[0.05] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Session Details</h2>
              <p className="text-xs text-foreground/35">Fill in all required fields to create your masterclass</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <Field label="Title" required>
              <input name="title" required placeholder="e.g., Advanced Machine Learning with Python" className={inputCls} />
            </Field>

            <Field label="Description">
              <textarea name="description" rows={3}
                placeholder="Describe what attendees will learn and what to expect…"
                className={cn(inputCls, "resize-none")} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Category" required>
                <select name="category" required className={cn(inputCls, "cursor-pointer")}>
                  <option value="" className="bg-[#0d0a1e]">Select category</option>
                  {["AI/ML", "Cloud", "Web Development", "Data Science"].map(c => (
                    <option key={c} value={c} className="bg-[#0d0a1e]">{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Level" required>
                <select name="level" required className={cn(inputCls, "cursor-pointer")}>
                  <option value="" className="bg-[#0d0a1e]">Select level</option>
                  {[["BEGINNER", "Beginner"], ["INTERMEDIATE", "Intermediate"], ["ADVANCED", "Advanced"]].map(([v, l]) => (
                    <option key={v} value={v} className="bg-[#0d0a1e]">{l}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Date & Time" required>
                <input type="datetime-local" name="datetime" required className={cn(inputCls, "cursor-pointer")} />
              </Field>
              <Field label="Duration" required>
                <select name="duration" required className={cn(inputCls, "cursor-pointer")}>
                  <option value="" className="bg-[#0d0a1e]">Select duration</option>
                  {["30 minutes", "45 minutes", "1 hour", "1.5 hours", "2 hours", "2.5 hours", "3 hours", "4 hours"].map(d => (
                    <option key={d} value={d} className="bg-[#0d0a1e]">{d}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Max Students">
              <input type="number" name="maxStudents" min="1"
                placeholder="Leave blank for unlimited"
                className={inputCls} />
            </Field>

            <Field label="Credits Required" hint="Set to 0 for free sessions">
              <input
                type="number"
                name="creditCost"
                min="0"
                max="15"
                defaultValue="0"
                className={inputCls}
              />
            </Field>

            <Field label="Google Meet Link" required hint="Create a Google Meet and paste the link here">
              <input type="url" name="meetLink" required
                placeholder="https://meet.google.com/abc-defg-hij"
                className={inputCls} />
            </Field>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1 h-11 font-bold">
                {loading ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Creating…</>
                ) : (
                  <><Sparkles size={14} />Create Masterclass</>
                )}
              </Button>
              <Button type="button" variant="glass" onClick={() => router.back()} disabled={loading} className="h-11">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}