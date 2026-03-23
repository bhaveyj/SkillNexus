"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import fetcher from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { Search, Plus, X, ArrowLeftRight, Users, BookOpen, Check, User, MessageSquare, ChevronDown } from "lucide-react";
import { ChatDialog } from "@/components/chat/ChatDialog";
import { cn } from "@/lib/utils";

interface Skill { id: string; name: string; category: string; }
interface Offer { id: string; skill: Skill; }
interface Request { id: string; skill: Skill; }
interface UserOffer {
  id: string; userId: string;
  user: { id: string; name: string | null; email: string; image: string | null };
  skill: Skill; userRequests?: Request[];
}
interface ExchangeRequest {
  id: string; senderId: string; receiverId: string;
  senderSkillId: string; receiverSkillId: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";
  createdAt: string;
  sender?: { id: string; name: string | null; email: string; image: string | null };
  receiver?: { id: string; name: string | null; email: string; image: string | null };
  senderSkill: Skill; receiverSkill: Skill;
}

const CATS = ["ALL","DEVOPS","CLOUD","WEB_DEVELOPMENT","BACKEND","FRONTEND","MOBILE","DATABASE","DATA_SCIENCE","AI_ML","UI_UX"];
const fmt = (s: string) => s.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

const SKILL_COLOR: Record<string, string> = {
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

function SkillPill({ skill, canTeach }: { skill: Skill; canTeach?: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border",
      canTeach ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : (SKILL_COLOR[skill.category] || SKILL_COLOR.OTHER)
    )}>
      {skill.name}{canTeach && " ✓"}
    </span>
  );
}

function Avatar({ src, name, size = 10 }: { src?: string | null; name?: string | null; size?: number }) {
  return (
    <img
      src={src || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
      alt={name || "User"}
      className={`w-${size} h-${size} rounded-xl object-cover ring-2 ring-white/[0.06]`}
    />
  );
}

function Tab({ active, onClick, icon, label, badge }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
        active
          ? "bg-violet-500/15 text-foreground border border-violet-500/25"
          : "text-foreground/45 hover:text-foreground/70 hover:bg-white/[0.04] border border-transparent",
      )}
    >
      <span className={active ? "text-violet-400" : ""}>{icon}</span>
      {label}
      {badge != null && badge > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}

export default function MarketplacePage() {
  const { data: session } = useSession();
  const { toast, toasts } = useToast();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"browse" | "matches" | "my-skills" | "requests">("browse");
  const [browseSearch, setBrowseSearch] = useState(searchParams.get("search") ?? "");
  const [browseCategory, setBrowseCategory] = useState("ALL");
  const [skillSearch, setSkillSearch] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isProposeOpen, setIsProposeOpen] = useState(false);
  const [proposeTarget, setProposeTarget] = useState<(UserOffer & { skills: Skill[] }) | null>(null);
  const [proposeMySkill, setProposeMySkill] = useState("");
  const [proposeTheirSkill, setProposeTheirSkill] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState<{ id: string; name: string | null; email: string; image: string | null; bio: string | null; github: string | null; linkedin: string | null; twitter: string | null; gmail: string | null } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [chatMatch, setChatMatch] = useState<ExchangeRequest | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const swrOpts = { revalidateOnFocus: false, dedupingInterval: 60000 };
  const { data: skillsData, mutate: mutateSkills } = useSWR("/api/skills", fetcher, swrOpts);
  const { data: offersData, mutate: mutateOffers } = useSWR("/api/offers", fetcher, swrOpts);
  const { data: allOffersData, mutate: mutateAllOffers } = useSWR("/api/offers?all=true", fetcher, swrOpts);
  const { data: exchangeData, mutate: mutateExchanges } = useSWR("/api/exchange-requests", fetcher, swrOpts);

  const skills: Skill[] = skillsData?.data ?? [];
  const myOffers: Offer[] = offersData?.data ?? [];
  const allOffers: UserOffer[] = allOffersData?.data ?? [];
  const sentRequests: ExchangeRequest[] = exchangeData?.sent ?? [];
  const receivedRequests: ExchangeRequest[] = (exchangeData?.received ?? []).filter((r: ExchangeRequest) => r.status === "PENDING");
  const requestedUsers = useMemo(() => new Set<string>(sentRequests.map(r => r.receiverId)), [sentRequests]);
  const acceptedMatches: ExchangeRequest[] = useMemo(() => [
    ...sentRequests.filter(r => r.status === "ACCEPTED"),
    ...(exchangeData?.received ?? []).filter((r: ExchangeRequest) => r.status === "ACCEPTED"),
  ], [sentRequests, exchangeData]);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "browse" || t === "matches" || t === "my-skills" || t === "requests") setActiveTab(t);
  }, [searchParams]);

  const refresh = () => { mutateSkills(); mutateOffers(); mutateAllOffers(); mutateExchanges(); };

  const filteredOffers = useMemo(() => {
    let f = allOffers.filter(o => o.userId !== session?.user?.id);
    if (browseCategory !== "ALL") f = f.filter(o => o.skill.category === browseCategory);
    if (browseSearch) f = f.filter(o =>
      o.skill.name.toLowerCase().includes(browseSearch.toLowerCase()) ||
      o.user.name?.toLowerCase().includes(browseSearch.toLowerCase())
    );
    const grouped = f.reduce((acc, o) => {
      if (!acc[o.userId]) acc[o.userId] = { ...o, skills: [o.skill] };
      else acc[o.userId].skills.push(o.skill);
      return acc;
    }, {} as Record<string, UserOffer & { skills: Skill[] }>);
    return Object.values(grouped) as UserOffer[];
  }, [allOffers, browseSearch, browseCategory, session?.user?.id]);

  const filteredSkills = useMemo(() => skills.filter(s =>
    !myOffers.some(o => o.skill.id === s.id) &&
    s.name.toLowerCase().includes(skillSearch.toLowerCase())
  ), [skills, skillSearch, myOffers]);

  const addSkills = async () => {
    if (!selectedSkills.length) return;
    try {
      await Promise.all(selectedSkills.map(id =>
        fetch("/api/offers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ skillId: id }) })
      ));
      toast({ title: "Skills added", description: `${selectedSkills.length} skill(s) added` });
      setSelectedSkills([]); setIsAddOpen(false); refresh();
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const removeOffer = async (id: string) => {
    const res = await fetch(`/api/offers?offerId=${id}`, { method: "DELETE" });
    if ((await res.json()).success) { toast({ title: "Removed" }); refresh(); }
  };

  const sendRequest = async (receiverId: string, senderSkillId: string, receiverSkillId: string) => {
    const res = await fetch("/api/exchange-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ receiverId, senderSkillId, receiverSkillId }) });
    const data = await res.json();
    if (res.ok) { toast({ title: "Request sent! 🎉" }); mutateExchanges(); }
    else toast({ title: "Error", description: data.error, variant: "destructive" });
  };

  const handlePropose = async () => {
    if (!proposeMySkill || !proposeTheirSkill || !proposeTarget) return;
    const res = await fetch("/api/exchange-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ receiverId: proposeTarget.userId, senderSkillId: proposeMySkill, receiverSkillId: proposeTheirSkill }) });
    const data = await res.json();
    if (res.ok) {
      toast({ title: "Exchange proposed! 🎉" });
      setIsProposeOpen(false); setProposeMySkill(""); setProposeTheirSkill(""); setProposeTarget(null);
      mutateExchanges();
    } else toast({ title: "Error", description: data.error, variant: "destructive" });
  };

  const respond = async (id: string, action: "accept" | "decline") => {
    const res = await fetch("/api/exchange-requests/respond", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: id, action }) });
    if (res.ok) { toast({ title: action === "accept" ? "Accepted ✅" : "Declined" }); refresh(); }
  };

  const fetchProfile = async (userId: string) => {
    setLoadingProfile(true);
    try {
      const res = await fetch(`/api/user/${userId}`);
      const data = await res.json();
      if (res.ok) { setViewingProfile(data); setIsProfileOpen(true); }
    } finally { setLoadingProfile(false); }
  };

  const inputCls = "w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/15 transition-all";

  return (
    <div className="flex-1 overflow-auto">
      <div className="sticky top-0 z-10 border-b border-white/[0.05] bg-[#080612]/80 backdrop-blur-xl">
        <div className="px-6 lg:px-8 py-4 flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-xl font-bold">Skill Marketplace</h1>
            <p className="text-xs text-foreground/40 mt-0.5">Exchange skills 1:1 with peers in your areas of interest</p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] flex-wrap">
            <Tab active={activeTab === "browse"} onClick={() => setActiveTab("browse")} icon={<Search size={13} />} label="Browse Skills" />
            <Tab active={activeTab === "matches"} onClick={() => setActiveTab("matches")} icon={<Users size={13} />} label={`Matches (${acceptedMatches.length})`} />
            <Tab active={activeTab === "requests"} onClick={() => setActiveTab("requests")} icon={<ArrowLeftRight size={13} />} label="Requests" badge={receivedRequests.length} />
            <Tab active={activeTab === "my-skills"} onClick={() => setActiveTab("my-skills")} icon={<BookOpen size={13} />} label="My Skills" />
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8">

        {activeTab === "browse" && (
          <div className="space-y-5">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/35" />
                <input value={browseSearch} onChange={e => setBrowseSearch(e.target.value)}
                  placeholder="Search skills or people…"
                  className={inputCls} />
              </div>
              <div className="flex flex-wrap gap-2">
                {CATS.map(cat => (
                  <button key={cat} onClick={() => setBrowseCategory(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200",
                      browseCategory === cat
                        ? "bg-violet-500/15 border-violet-500/30 text-violet-300"
                        : "bg-white/[0.03] border-white/[0.07] text-foreground/45 hover:text-foreground/70 hover:border-white/[0.12]"
                    )}
                  >{fmt(cat)}</button>
                ))}
              </div>
            </div>

            {filteredOffers.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-foreground/25">
                <Search size={28} className="opacity-40" />
                <p className="text-sm font-semibold">No results found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredOffers.map((offer: UserOffer & { skills?: Skill[] }) => {
                  const isMe = session?.user?.id === offer.userId;
                  const hasRequested = requestedUsers.has(offer.userId);
                  const offerSkills = (offer as UserOffer & { skills?: Skill[] }).skills || [offer.skill];
                  return (
                    <div key={offer.userId}
                      className="group relative rounded-2xl p-5 bg-white/[0.03] backdrop-blur-xl border border-white/[0.07] hover:border-white/[0.12] transition-all duration-250 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 flex flex-col gap-4"
                    >
                      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/20 to-transparent rounded-t-2xl" />

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar src={offer.user.image} name={offer.user.name} size={10} />
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{isMe ? "You" : offer.user.name}</p>
                            <p className="text-xs text-foreground/35 truncate">{offer.user.email}</p>
                          </div>
                        </div>
                        {!isMe && (
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0",
                            hasRequested
                              ? "bg-white/5 text-foreground/40 border-white/8"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          )}>
                            {hasRequested ? "Requested" : "Can Exchange"}
                          </span>
                        )}
                        {isMe && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-white/5 text-foreground/40 border-white/8">You</span>}
                      </div>

                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-foreground/25 mb-2">Can teach</p>
                        <div className="flex flex-wrap gap-1.5">
                          {offerSkills.map((s: Skill) => <SkillPill key={s.id} skill={s} />)}
                        </div>
                      </div>

                      {offer.userRequests && offer.userRequests.length > 0 && (
                        <div className="pt-3 border-t border-white/[0.05]">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-foreground/25 mb-2">Wants to learn</p>
                          <div className="flex flex-wrap gap-1.5">
                            {offer.userRequests.slice(0, 4).map((req: Request) => {
                              const iCanTeach = myOffers.some(o => o.skill.id === req.skill.id);
                              return <SkillPill key={req.id} skill={req.skill} canTeach={iCanTeach} />;
                            })}
                            {offer.userRequests.length > 4 && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/5 text-foreground/35 border border-white/8">
                                +{offer.userRequests.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {!isMe && (
                        <div className="mt-auto pt-1">
                          {!hasRequested ? (
                            <Button size="sm" className="w-full h-9 text-xs font-bold"
                              onClick={e => { e.stopPropagation(); setProposeTarget({ ...offer, skills: offerSkills }); setIsProposeOpen(true); }}>
                              Request Exchange
                            </Button>
                          ) : (
                            <Button size="sm" variant="glass" className="w-full h-9 text-xs" disabled>
                              ✓ Request Sent
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "matches" && (
          acceptedMatches.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-foreground/25">
              <Users size={28} className="opacity-40" />
              <p className="text-sm font-semibold">No matches yet</p>
              <p className="text-xs">Send exchange requests to connect</p>
              <Button size="sm" variant="glass" onClick={() => setActiveTab("browse")} className="mt-1">Browse Skills</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {acceptedMatches.map(match => {
                const isSender = match.senderId === session?.user?.id;
                const other = isSender ? match.receiver : match.sender;
                const mySkill = isSender ? match.senderSkill : match.receiverSkill;
                const theirSkill = isSender ? match.receiverSkill : match.senderSkill;
                return (
                  <div key={match.id}
                    className="relative rounded-2xl p-5 bg-white/[0.03] backdrop-blur-xl border border-emerald-500/15 hover:border-emerald-500/25 transition-all duration-250 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20 flex flex-col gap-4"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent rounded-t-2xl" />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={other?.image} name={other?.name} size={10} />
                        <div className="min-w-0">
                          <p className="text-sm font-bold">{other?.name}</p>
                          <p className="text-xs text-foreground/35 truncate">{other?.email}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shrink-0">✓ Matched</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="px-3.5 py-3 rounded-xl bg-emerald-500/6 border border-emerald-500/12">
                        <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400/60 mb-1">You teach</p>
                        <p className="text-sm font-bold text-emerald-300">{mySkill.name}</p>
                      </div>
                      <div className="px-3.5 py-3 rounded-xl bg-violet-500/6 border border-violet-500/12">
                        <p className="text-[9px] font-black uppercase tracking-wider text-violet-400/60 mb-1">You learn</p>
                        <p className="text-sm font-bold text-violet-300">{theirSkill.name}</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-foreground/30">
                      Matched {new Date(match.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <Button size="sm" variant="glass" className="h-9 text-xs"
                        onClick={() => other && fetchProfile(other.id)} disabled={loadingProfile}>
                        <User size={12} /> Profile
                      </Button>
                      <Button size="sm" className="h-9 text-xs"
                        onClick={() => { setChatMatch(match); setIsChatOpen(true); }}>
                        <MessageSquare size={12} /> Chat
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {activeTab === "my-skills" && (
          <div className="max-w-3xl space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-violet-500/8 via-purple-500/4 to-transparent border border-violet-500/15 p-5">
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
                    <BookOpen size={18} className="text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold">My Teaching Skills</h3>
                    <p className="text-xs text-foreground/40 mt-0.5">
                      {myOffers.length === 0 ? "Add skills to enable exchanges" : `${myOffers.length} skill${myOffers.length !== 1 ? "s" : ""} · Hover any skill to remove`}
                    </p>
                  </div>
                </div>
                <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setIsAddOpen(true)}>
                  <Plus size={13} /> Add Skills
                </Button>
              </div>
            </div>

            {myOffers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.01] flex flex-col items-center gap-4 py-16">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center text-foreground/20">
                  <BookOpen size={22} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground/40">No skills added yet</p>
                  <p className="text-xs text-foreground/25 mt-1">Add skills you can teach to start matching with others</p>
                </div>
                <Button size="sm" onClick={() => setIsAddOpen(true)} className="gap-1.5 mt-1">
                  <Plus size={13} /> Add Your First Skill
                </Button>
              </div>
            ) : (
              (() => {
                const grouped = myOffers.reduce((acc, offer) => {
                  const cat = offer.skill.category;
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(offer);
                  return acc;
                }, {} as Record<string, Offer[]>);

                return (
                  <div className="space-y-3">
                    {Object.entries(grouped).map(([category, catOffers]) => (
                      <div key={category} className="rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.07] overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                            SKILL_COLOR[category] || "bg-white/5 text-foreground/40 border-white/8",
                          )}>
                            {fmt(category)}
                          </span>
                          <span className="text-[10px] font-bold text-foreground/25">{catOffers.length} skill{catOffers.length !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="p-3 flex flex-wrap gap-2">
                          {catOffers.map(offer => (
                            <button
                              key={offer.id}
                              onClick={() => removeOffer(offer.id)}
                              className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer bg-white/[0.03] border-white/[0.08] text-foreground/70 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/25 hover:-translate-y-0.5"
                            >
                              {offer.skill.name}
                              <X size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="space-y-6 max-w-3xl">

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-foreground/30 mb-4 flex items-center gap-2">
                <ArrowLeftRight size={11} /> Pending Requests
              </p>
              {receivedRequests.length === 0 ? (
                <div className="rounded-2xl p-8 bg-white/[0.02] border border-white/[0.05] flex flex-col items-center gap-2 text-foreground/25">
                  <ArrowLeftRight size={20} className="opacity-30" />
                  <p className="text-sm font-semibold">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {receivedRequests.map(req => (
                    <div key={req.id} className="rounded-2xl p-5 bg-white/[0.03] border border-white/[0.07] hover:border-white/[0.11] transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={req.sender?.image} name={req.sender?.name} size={10} />
                          <div>
                            <p className="text-sm font-bold">{req.sender?.name}</p>
                            <p className="text-xs text-foreground/35">{req.sender?.email}</p>
                          </div>
                        </div>
                        <p className="text-xs text-foreground/25">{new Date(req.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="px-4 py-3 rounded-xl bg-emerald-500/6 border border-emerald-500/12">
                          <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400/50 mb-1">They offer</p>
                          <p className="text-sm font-bold text-emerald-300">{req.senderSkill.name}</p>
                        </div>
                        <div className="px-4 py-3 rounded-xl bg-violet-500/6 border border-violet-500/12">
                          <p className="text-[9px] font-black uppercase tracking-wider text-violet-400/50 mb-1">They want</p>
                          <p className="text-sm font-bold text-violet-300">{req.receiverSkill.name}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button size="sm" className="h-9 text-xs" onClick={() => respond(req.id, "accept")}>Accept Exchange</Button>
                        <Button size="sm" variant="glass" className="h-9 text-xs" onClick={() => respond(req.id, "decline")}>Decline</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-foreground/30 mb-4 flex items-center gap-2">
                <ArrowLeftRight size={11} /> Sent Requests
              </p>
              {sentRequests.length === 0 ? (
                <div className="rounded-2xl p-8 bg-white/[0.02] border border-white/[0.05] flex flex-col items-center gap-2 text-foreground/25">
                  <p className="text-sm font-semibold">No sent requests yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sentRequests.map(req => {
                    const isAccepted = req.status === "ACCEPTED";
                    return (
                      <div key={req.id} className={cn(
                        "relative rounded-2xl overflow-hidden transition-all duration-200",
                        isAccepted
                          ? "border border-emerald-500/25 bg-gradient-to-br from-emerald-500/6 via-white/[0.02] to-transparent"
                          : "border border-white/[0.07] bg-white/[0.03]",
                      )}>
                        {isAccepted && (
                          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />
                        )}
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar src={req.receiver?.image} name={req.receiver?.name} size={10} />
                                {isAccepted && (
                                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#080612] flex items-center justify-center text-[8px]">✓</span>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-bold">{req.receiver?.name}</p>
                                <p className="text-xs text-foreground/35">{req.receiver?.email}</p>
                              </div>
                            </div>
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-bold border",
                              req.status === "PENDING"  ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                              req.status === "ACCEPTED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                                                          "bg-rose-500/10 text-rose-400 border-rose-500/20",
                            )}>
                              {req.status === "ACCEPTED" ? "🎉 Accepted" : req.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="px-4 py-3 rounded-xl bg-emerald-500/6 border border-emerald-500/12">
                              <p className="text-[9px] font-black uppercase tracking-wider text-emerald-400/50 mb-1">You offer</p>
                              <p className="text-sm font-bold text-emerald-300">{req.senderSkill.name}</p>
                            </div>
                            <div className="px-4 py-3 rounded-xl bg-violet-500/6 border border-violet-500/12">
                              <p className="text-[9px] font-black uppercase tracking-wider text-violet-400/50 mb-1">You want</p>
                              <p className="text-sm font-bold text-violet-300">{req.receiverSkill.name}</p>
                            </div>
                          </div>

                          {isAccepted && (
                            <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/12">
                              <p className="text-xs text-emerald-400/80 font-semibold">{"✓ You're matched! Start chatting now."}</p>
                              <button
                                onClick={() => setActiveTab("matches")}
                                className="text-[11px] font-black text-emerald-300 hover:text-emerald-200 transition-colors underline underline-offset-2"
                              >
                                View Match →
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className={cn(
            "rounded-xl border px-4 py-3 shadow-2xl text-sm animate-fade-in-up",
            t.variant === "destructive"
              ? "bg-rose-500/10 border-rose-500/20 text-rose-300"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
          )}>
            <p className="font-bold">{t.title}</p>
            {t.description && <p className="text-xs mt-0.5 opacity-70">{t.description}</p>}
          </div>
        ))}
      </div>

      <Dialog open={isAddOpen} onOpenChange={o => { setIsAddOpen(o); if (!o) setSelectedSkills([]); }}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto bg-[#0d0a1e] border-white/[0.08] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Add Skills You Can Teach</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35" />
              <input value={skillSearch} onChange={e => setSkillSearch(e.target.value)} placeholder="Search skills…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm focus:outline-none focus:border-violet-500/50 transition-all text-foreground placeholder:text-foreground/25" />
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {filteredSkills.map(skill => {
                const selected = selectedSkills.includes(skill.id);
                return (
                  <button key={skill.id}
                    onClick={() => setSelectedSkills(prev => prev.includes(skill.id) ? prev.filter(id => id !== skill.id) : [...prev, skill.id])}
                    className={cn(
                      "flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all",
                      selected ? "border-violet-500/40 bg-violet-500/10" : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.14]",
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded flex items-center justify-center shrink-0", selected ? "bg-violet-500" : "bg-white/5 border border-white/10")}>
                      {selected && <Check size={10} className="text-white" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{skill.name}</p>
                      <p className="text-[10px] text-foreground/30">{fmt(skill.category)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {selectedSkills.length > 0 && (
              <Button onClick={addSkills} className="w-full">
                Add {selectedSkills.length} Skill{selectedSkills.length !== 1 ? "s" : ""}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isProposeOpen} onOpenChange={(o) => {
        setIsProposeOpen(o);
        if (!o) { setProposeMySkill(""); setProposeTheirSkill(""); setProposeTarget(null); }
      }}>
        <DialogContent className="max-w-xl bg-[#0d0a1e] border-white/[0.08] shadow-2xl p-0 overflow-hidden flex flex-col" style={{ maxHeight: "min(600px, 90vh)" }}>
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-violet-500/70 to-transparent" />

          <div className="px-6 pt-6 pb-4 border-b border-white/[0.05] shrink-0">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={proposeTarget?.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${proposeTarget?.user?.name}`}
                  alt={proposeTarget?.user?.name || "User"}
                  className="w-11 h-11 rounded-xl ring-2 ring-violet-500/25 object-cover"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0d0a1e]" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold leading-tight">Propose Skill Exchange</h2>
                <p className="text-xs text-foreground/40 mt-0.5">
                  with <span className="text-foreground/65 font-semibold">{proposeTarget?.user?.name}</span>
                  <span className="text-foreground/25 ml-1.5">· {proposeTarget?.user?.email}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 overscroll-contain">
            {myOffers.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-14 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-foreground/20">
                  <BookOpen size={26} />
                </div>
                <div>
                  <p className="text-base font-bold text-foreground/50">No skills added yet</p>
                  <p className="text-sm text-foreground/30 mt-1 max-w-xs">
                    You need to add skills you can teach before you can propose an exchange.
                  </p>
                </div>
                <button
                  onClick={() => { setIsProposeOpen(false); setActiveTab("my-skills"); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500/12 border border-violet-500/25 text-sm font-bold text-violet-300 hover:bg-violet-500/20 hover:border-violet-500/35 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <Plus size={13} /> Add My Skills First
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-5">

                <div className="grid grid-cols-2 gap-4 items-start">

                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-2 h-2 rounded-full bg-violet-400 shadow-sm shadow-violet-400/50" />
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-foreground/40">I can teach</p>
                      <span className="text-rose-400 text-xs">*</span>
                      <span className="ml-auto text-[10px] text-foreground/20">{myOffers.length}</span>
                    </div>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                      {myOffers.map(offer => {
                        const selected = proposeMySkill === offer.skill.id;
                        return (
                          <button
                            key={offer.id}
                            onClick={() => setProposeMySkill(selected ? "" : offer.skill.id)}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 group",
                              selected
                                ? "border-violet-500/50 bg-violet-500/12 shadow-sm shadow-violet-500/15"
                                : "border-white/[0.07] bg-white/[0.02] hover:border-violet-500/25 hover:bg-violet-500/5",
                            )}
                          >
                            <div className={cn(
                              "w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150",
                              selected ? "border-violet-500 bg-violet-500" : "border-white/20 group-hover:border-violet-400/40",
                            )}>
                              {selected && <Check size={8} className="text-white" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={cn("text-xs font-semibold truncate", selected ? "text-foreground" : "text-foreground/60")}>{offer.skill.name}</p>
                              <p className="text-[9px] text-foreground/25">{fmt(offer.skill.category)}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-2 h-2 rounded-full bg-rose-400 shadow-sm shadow-rose-400/50" />
                      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-foreground/40">I want to learn</p>
                      <span className="text-rose-400 text-xs">*</span>
                      <span className="ml-auto text-[10px] text-foreground/20">{(proposeTarget?.skills || []).length}</span>
                    </div>
                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                      {(proposeTarget?.skills || []).map((skill: Skill) => {
                        const selected = proposeTheirSkill === skill.id;
                        return (
                          <button
                            key={skill.id}
                            onClick={() => setProposeTheirSkill(selected ? "" : skill.id)}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 group",
                              selected
                                ? "border-rose-500/50 bg-rose-500/12 shadow-sm shadow-rose-500/15"
                                : "border-white/[0.07] bg-white/[0.02] hover:border-rose-500/25 hover:bg-rose-500/5",
                            )}
                          >
                            <div className={cn(
                              "w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150",
                              selected ? "border-rose-500 bg-rose-500" : "border-white/20 group-hover:border-rose-400/40",
                            )}>
                              {selected && <Check size={8} className="text-white" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={cn("text-xs font-semibold truncate", selected ? "text-foreground" : "text-foreground/60")}>{skill.name}</p>
                              <p className="text-[9px] text-foreground/25">{fmt(skill.category)}</p>
                            </div>
                          </button>
                        );
                      })}
                      {(proposeTarget?.skills || []).length < 3 && (
                        <div className="px-3 py-4 rounded-xl border border-dashed border-white/[0.05] flex items-center justify-center">
                          <p className="text-[10px] text-foreground/20">All available skills shown</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={cn(
                  "rounded-xl border transition-all duration-300 overflow-hidden",
                  proposeMySkill && proposeTheirSkill
                    ? "border-violet-500/20 bg-gradient-to-r from-violet-500/6 to-rose-500/5 opacity-100 max-h-24"
                    : "border-white/[0.05] bg-white/[0.02] opacity-60 max-h-24",
                )}>
                  <div className="px-4 py-3 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-foreground/25 mb-1.5">Exchange summary</p>
                      {proposeMySkill && proposeTheirSkill ? (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-lg bg-violet-500/12 border border-violet-500/20 text-xs font-bold text-violet-300">
                            {myOffers.find(o => o.skill.id === proposeMySkill)?.skill.name}
                          </span>
                          <span className="text-foreground/25 text-sm font-black">⇄</span>
                          <span className="px-2.5 py-1 rounded-lg bg-rose-500/12 border border-rose-500/20 text-xs font-bold text-rose-300">
                            {(proposeTarget?.skills || []).find((s: Skill) => s.id === proposeTheirSkill)?.name}
                          </span>
                        </div>
                      ) : (
                        <p className="text-xs text-foreground/25 italic">Select one skill from each column above</p>
                      )}
                    </div>
                    {proposeMySkill && proposeTheirSkill && (
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Check size={14} className="text-emerald-400" />
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t border-white/[0.05] bg-[#0d0a1e]/80 backdrop-blur-sm shrink-0">
            <div className="flex gap-3">
              <Button
                onClick={handlePropose}
                disabled={!proposeMySkill || !proposeTheirSkill || myOffers.length === 0}
                className="flex-1 h-10 font-bold"
              >
                {proposeMySkill && proposeTheirSkill ? "Send Proposal →" : "Select Skills to Continue"}
              </Button>
              <Button
                variant="glass"
                onClick={() => { setIsProposeOpen(false); setProposeMySkill(""); setProposeTheirSkill(""); setProposeTarget(null); }}
                className="h-10 px-5"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-sm bg-[#0d0a1e] border-white/[0.08]">
          <DialogHeader><DialogTitle>User Profile</DialogTitle></DialogHeader>
          {viewingProfile && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar src={viewingProfile.image} name={viewingProfile.name} size={14} />
                <div>
                  <p className="font-bold">{viewingProfile.name}</p>
                  {viewingProfile.bio && <p className="text-xs text-foreground/40 mt-0.5">{viewingProfile.bio}</p>}
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: "GitHub", href: viewingProfile.github ? (viewingProfile.github.startsWith("http") ? viewingProfile.github : `https://github.com/${viewingProfile.github}`) : null },
                  { label: "LinkedIn", href: viewingProfile.linkedin ? (viewingProfile.linkedin.startsWith("http") ? viewingProfile.linkedin : `https://linkedin.com/in/${viewingProfile.linkedin}`) : null },
                  { label: "Twitter", href: viewingProfile.twitter ? (viewingProfile.twitter.startsWith("http") ? viewingProfile.twitter : `https://twitter.com/${viewingProfile.twitter}`) : null },
                  { label: "Email", href: viewingProfile.gmail ? `mailto:${viewingProfile.gmail}` : null },
                ].filter(l => l.href).map(l => (
                  <a key={l.label} href={l.href!} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-violet-500/25 transition-all text-sm font-semibold">
                    {l.label}
                  </a>
                ))}
                {!viewingProfile.github && !viewingProfile.linkedin && !viewingProfile.twitter && !viewingProfile.gmail && (
                  <p className="text-sm text-foreground/35 text-center py-4">No social links added</p>
                )}
              </div>
              <Button variant="glass" onClick={() => setIsProfileOpen(false)} className="w-full">Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {chatMatch && (
        <ChatDialog open={isChatOpen} onOpenChange={o => { setIsChatOpen(o); if (!o) setChatMatch(null); }} match={chatMatch} />
      )}
    </div>
  );
}