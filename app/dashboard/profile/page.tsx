"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { X, Search, Edit2, Check, Github, Linkedin, Twitter, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface Skill { id: string; name: string; category: string; }
interface Offer { id: string; skillId: string; skill: Skill; }

const INTERESTS = ["BACKEND", "FRONTEND", "DEVOPS", "CLOUD", "DATABASE", "AI_ML", "DATA_SCIENCE", "MOBILE", "CYBERSECURITY", "BLOCKCHAIN", "GAME_DEVELOPMENT", "UI_UX", "TESTING", "WEB_DEVELOPMENT", "OTHER"] as const;
const fmt = (s: string) => s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

const SKILL_CATEGORY_COLOR: Record<string, string> = {
  DEVOPS: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  CLOUD: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  WEB_DEVELOPMENT: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  FRONTEND: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  BACKEND: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  MOBILE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  DATABASE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  DATA_SCIENCE: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  AI_ML: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  UI_UX: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  OTHER: "bg-white/5 text-foreground/40 border-white/8",
};

function SectionCard({ title, action, children, className }: {
  title: string; action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("relative rounded-2xl overflow-hidden bg-white/3 backdrop-blur-xl border border-white/[0.07]", className)}>
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-violet-500/20 to-transparent" />
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm font-bold text-foreground/70 uppercase tracking-wider">{title}</h3>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function inputCls(extra = "") {
  return cn(
    "w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground",
    "placeholder:text-foreground/20 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 transition-all",
    extra,
  );
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [bio, setBio] = useState("");
  const [editingBio, setEditingBio] = useState(false);
  const [socials, setSocials] = useState({ github: "", linkedin: "", twitter: "", gmail: "" });
  const [editingSocials, setEditingSocials] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [editingInterests, setEditingInterests] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);

  useEffect(() => {
    if (!session?.user?.email) return;
    fetch("/api/user/profile").then(r => r.ok ? r.json() : null).then(data => {
      if (data) {
        setBio(data.bio || "");
        setSocials({ github: data.github || "", linkedin: data.linkedin || "", twitter: data.twitter || "", gmail: data.gmail || "" });
        setInterests(data.interests || []);
      }
    });
    fetch("/api/offers").then(r => r.ok ? r.json() : null).then(data => { if (data?.success) setOffers(data.data); });
    fetch("/api/skills").then(r => r.ok ? r.json() : null).then(data => { if (data?.success) setAllSkills(data.data); });
  }, [session]);

  const patch = (body: object) =>
    fetch("/api/user/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

  const addSkill = async (skillId: string) => {
    const res = await fetch("/api/offers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ skillId }) });
    const data = await res.json();
    if (data.success) { setOffers(prev => [...prev, data.data]); setSkillSearch(""); setDropdownOpen(false); }
  };

  const removeSkill = async (offerId: string) => {
    const res = await fetch(`/api/offers?offerId=${offerId}`, { method: "DELETE" });
    if (res.ok) setOffers(prev => prev.filter(o => o.id !== offerId));
  };

  const available = allSkills.filter(s =>
    !offers.some(o => o.skillId === s.id) &&
    s.name.toLowerCase().includes(skillSearch.toLowerCase())
  );

  const SOCIAL_DEFS = [
    { key: "github", label: "GitHub", icon: <Github size={16} />, placeholder: "https://github.com/username", prefix: "https://github.com/" },
    { key: "linkedin", label: "LinkedIn", icon: <Linkedin size={16} />, placeholder: "https://linkedin.com/in/username", prefix: "https://linkedin.com/in/" },
    { key: "twitter", label: "Twitter/X", icon: <Twitter size={16} />, placeholder: "https://x.com/username", prefix: "https://x.com/" },
    { key: "gmail", label: "Email", icon: <Mail size={16} />, placeholder: "you@gmail.com", prefix: "mailto:" },
  ] as const;

  const getSocialHref = (key: string, val: string) => {
    if (!val) return null;
    if (key === "gmail") return `mailto:${val}`;
    return val.startsWith("http") ? val : `https://${val}`;
  };

  const userName = session?.user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex-1 overflow-auto">
      <div className="sticky top-0 z-10 border-b border-white/5 bg-[#080612]/80 backdrop-blur-xl">
        <div className="px-6 lg:px-8 h-16 flex items-center">
          <h1 className="text-xl font-bold">My Profile</h1>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <div className="relative rounded-2xl overflow-hidden mb-6 bg-linear-to-br from-violet-500/8 via-purple-500/4 to-rose-500/5 border border-violet-500/15 p-6">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-linear-to-r from-transparent via-violet-500/50 to-transparent" />
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              {session?.user?.image ? (
                <img src={session.user.image} alt={userName}
                  className="w-20 h-20 rounded-2xl ring-2 ring-violet-500/25 object-cover shadow-xl shadow-violet-500/10" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-violet-600 to-violet-800 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-violet-500/20 ring-2 ring-violet-500/25">
                  {userInitial}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#080612]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-black text-foreground tracking-tight">{userName}</h2>
              <p className="text-sm text-foreground/40 mt-0.5">{session?.user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {offers.slice(0, 5).map(o => (
                  <span key={o.id} className={cn("px-2.5 py-1 rounded-full text-[11px] font-bold border", SKILL_CATEGORY_COLOR[o.skill.category] || SKILL_CATEGORY_COLOR.OTHER)}>
                    {o.skill.name}
                  </span>
                ))}
                {offers.length > 5 && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold border bg-white/5 text-foreground/35 border-white/8">
                    +{offers.length - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">

            <SectionCard title="Bio" action={
              !editingBio ? (
                <button onClick={() => setEditingBio(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors">
                  <Edit2 size={12} /> Edit
                </button>
              ) : null
            }>
              {editingBio ? (
                <div className="space-y-3">
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                    className={inputCls("resize-none")}
                    placeholder={"Tell others about yourself, your expertise, and what you're looking to learn…"} />
                  <div className="flex gap-2">
                    <Button size="sm" className="h-8 text-xs" onClick={() => patch({ bio }).then(() => setEditingBio(false))}>
                      <Check size={12} /> Save
                    </Button>
                    <Button size="sm" variant="glass" className="h-8 text-xs" onClick={() => setEditingBio(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div>
                  {bio ? (
                    <p className="text-sm text-foreground/65 leading-relaxed">{bio}</p>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-6 text-foreground/25">
                      <p className="text-sm font-semibold">No bio added yet</p>
                      <button onClick={() => setEditingBio(true)}
                        className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors">
                        + Add your bio
                      </button>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Skills">
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-foreground/30 mb-3">My Skills</p>
                  {offers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {offers.map(o => (
                        <button key={o.id}
                          onClick={() => removeSkill(o.id)}
                          className={cn(
                            "group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200",
                            "hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/20",
                            SKILL_CATEGORY_COLOR[o.skill.category] || SKILL_CATEGORY_COLOR.OTHER,
                          )}
                        >
                          {o.skill.name}
                          <X size={10} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/30">No skills added yet. Search below to add some!</p>
                  )}
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-foreground/30 mb-3">Add More Skills</p>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35" />
                    <input
                      value={skillSearch}
                      onChange={e => { setSkillSearch(e.target.value); setDropdownOpen(true); }}
                      onFocus={() => setDropdownOpen(true)}
                      placeholder="Search skills to add…"
                      className={cn(inputCls(), "pl-9")}
                    />
                    {dropdownOpen && skillSearch && available.length > 0 && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                        <div className="absolute z-50 w-full mt-1.5 bg-[#0d0a1e] border border-white/8 rounded-xl shadow-2xl max-h-52 overflow-auto">
                          {available.slice(0, 10).map(skill => (
                            <button key={skill.id} onClick={() => addSkill(skill.id)}
                              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-violet-500/8 transition-colors group">
                              <span className="text-sm font-semibold text-foreground/80 group-hover:text-foreground">{skill.name}</span>
                              <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", SKILL_CATEGORY_COLOR[skill.category] || SKILL_CATEGORY_COLOR.OTHER)}>
                                {fmt(skill.category)}
                              </span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Interests" action={
              !editingInterests ? (
                <button onClick={() => setEditingInterests(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors">
                  <Edit2 size={12} /> Edit
                </button>
              ) : null
            }>
              {editingInterests ? (
                <div className="space-y-4">
                  <p className="text-xs text-foreground/40">
                    {"Select areas you're interested in"}
                  </p>                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(i => (
                      <button key={i}
                        onClick={() => setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200",
                          interests.includes(i)
                            ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                            : "bg-white/3 border-white/[0.07] text-foreground/45 hover:text-foreground/70",
                        )}>
                        {fmt(i)} {interests.includes(i) && "✓"}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="h-8 text-xs" onClick={() => patch({ interests }).then(() => setEditingInterests(false))}>
                      <Check size={12} /> Save
                    </Button>
                    <Button size="sm" variant="glass" className="h-8 text-xs" onClick={() => setEditingInterests(false)}>Cancel</Button>
                  </div>
                </div>
              ) : interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {interests.map(i => (
                    <span key={i} className="px-3 py-1.5 rounded-xl text-xs font-bold border bg-violet-500/10 text-violet-300 border-violet-500/20">
                      {fmt(i)}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-6 text-foreground/25">
                  <p className="text-sm font-semibold">No interests selected yet</p>
                  <button onClick={() => setEditingInterests(true)}
                    className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors">
                    + Add your interests
                  </button>
                </div>
              )}
            </SectionCard>

            <SectionCard title="Preferences">
              <div className="space-y-3">
                {[
                  { key: "emailNotif" as const, label: "Email Notifications", desc: "Get notified about new exchange opportunities", icon: "🔔", state: emailNotif, set: setEmailNotif },
                  { key: "publicProfile" as const, label: "Public Profile", desc: "Make your profile visible to other users", icon: "👁️", state: publicProfile, set: setPublicProfile },
                ].map(pref => (
                  <div
                    key={pref.key}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/9 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/4 flex items-center justify-center text-sm">
                        {pref.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{pref.label}</p>
                        <p className="text-xs text-foreground/35 mt-0.5">{pref.desc}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={pref.state}
                      onClick={() => pref.set(!pref.state)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent",
                        "transition-colors duration-200 ease-in-out focus:outline-none",
                        pref.state ? "bg-violet-600 shadow-lg shadow-violet-500/25" : "bg-white/10",
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg",
                          "transition-transform duration-200 ease-in-out",
                          pref.state ? "translate-x-5" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="space-y-5">
            <SectionCard title="Social Links" action={
              !editingSocials ? (
                <button onClick={() => setEditingSocials(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors">
                  <Edit2 size={12} /> Edit
                </button>
              ) : null
            }>
              {editingSocials ? (
                <div className="space-y-3">
                  {SOCIAL_DEFS.map(s => (
                    <div key={s.key} className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-foreground/35 flex items-center gap-1.5">
                        {s.icon} {s.label}
                      </label>
                      <input type={s.key === "gmail" ? "email" : "url"}
                        value={socials[s.key]} onChange={e => setSocials(p => ({ ...p, [s.key]: e.target.value }))}
                        placeholder={s.placeholder}
                        className={inputCls()} />
                    </div>
                  ))}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1 h-9 text-xs" onClick={() => patch({ socials }).then(() => setEditingSocials(false))}>
                      <Check size={12} /> Save
                    </Button>
                    <Button size="sm" variant="glass" className="flex-1 h-9 text-xs" onClick={() => setEditingSocials(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {SOCIAL_DEFS.map(s => {
                    const val = socials[s.key];
                    const href = getSocialHref(s.key, val);
                    if (!href) return null;
                    return (
                      <a key={s.key} href={href} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3.5 rounded-xl bg-white/3 border border-white/[0.07] hover:border-violet-500/25 hover:bg-white/5 transition-all group">
                        <span className="text-foreground/50 group-hover:text-violet-400 transition-colors">{s.icon}</span>
                        <span className="text-sm font-semibold text-foreground/70 group-hover:text-foreground transition-colors">{s.label}</span>
                      </a>
                    );
                  })}
                  {!socials.github && !socials.linkedin && !socials.twitter && !socials.gmail && (
                    <div className="flex flex-col items-center gap-2 py-8 text-foreground/20">
                      <p className="text-sm font-semibold">No social links added</p>
                      <button onClick={() => setEditingSocials(true)}
                        className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors">
                        + Add social links
                      </button>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>

            <div className="relative rounded-2xl overflow-hidden bg-linear-to-br from-violet-500/6 to-rose-500/4 border border-violet-500/12 p-5">
              <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-violet-500/30 to-transparent" />
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-foreground/35 mb-4">Profile Summary</p>
              <div className="space-y-3">
                {[
                  { label: "Skills listed", value: offers.length, color: "text-violet-400" },
                  { label: "Interests", value: interests.length, color: "text-rose-400" },
                  { label: "Social links", value: [socials.github, socials.linkedin, socials.twitter, socials.gmail].filter(Boolean).length, color: "text-cyan-400" },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <p className="text-xs text-foreground/45">{stat.label}</p>
                    <p className={cn("text-sm font-black", stat.color)}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}