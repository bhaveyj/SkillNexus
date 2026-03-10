"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Share2, RefreshCw, GraduationCap, Clock, ShoppingBag, BookOpen, UserCircle, ChevronRight, Search, Bell, Sparkles, ArrowRight } from "lucide-react"
import React, { useEffect, useState } from "react"
import { Loader } from "@/components/ui/loader"

interface RegisteredSession {
  id: string
  title: string
  instructorName: string
  date: string
  time: string
  category: string
}

interface RecommendedExchange {
  id: string
  reason: string
  userName: string
  matchedSkill: string
  theyWantFromMe: string
}

interface RecommendedMasterclass {
  id: string
  reason: string
  title: string
  instructorName: string
  category: string
  level: string
  date: string
}

interface Recommendations {
  recommendedExchanges: RecommendedExchange[]
  recommendedMasterclasses: RecommendedMasterclass[]
  reasoning: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [recentSessions, setRecentSessions] = useState<RegisteredSession[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [recommendations, setRecommendations] = useState<Recommendations | null>(() => {
    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem("ai_recommendations")
      if (cached) return JSON.parse(cached) as Recommendations
    }
    return null
  })
  const [loadingRecs, setLoadingRecs] = useState(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("ai_recommendations")
    }
    return true
  })
  const [recsError, setRecsError] = useState<string | null>(null)

  const fetchRecommendations = async () => {
    sessionStorage.removeItem("ai_recommendations")
    setLoadingRecs(true)
    setRecsError(null)
    try {
      const response = await fetch("/api/ai/recommendations")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setRecommendations(data.data)
          sessionStorage.setItem("ai_recommendations", JSON.stringify(data.data))
        } else {
          setRecsError("Failed to get recommendations")
        }
      } else {
        setRecsError("Failed to get recommendations")
      }
    } catch {
      setRecsError("Failed to get recommendations")
    } finally {
      setLoadingRecs(false)
    }
  }

  useEffect(() => {
    const fetchRecentSessions = async () => {
      try {
        const response = await fetch("/api/masterclass/my-sessions")
        if (response.ok) {
          const data = await response.json()
          // Get only the first 3 upcoming sessions
          const upcoming = data
            .filter((s: RegisteredSession) => new Date(s.date) >= new Date())
            .slice(0, 3)
          setRecentSessions(upcoming)
        }
      } catch (error) {
        console.error("Error fetching recent sessions:", error)
      } finally {
        setLoadingSessions(false)
      }
    }

    if (session) {
      fetchRecentSessions()
      if (!sessionStorage.getItem("ai_recommendations")) {
        fetchRecommendations()
      }
    } else {
      setLoadingSessions(false)
      setLoadingRecs(false)
    }
  }, [session])

  const stats = [
    { 
      label: "SKILLS SHARED", 
      value: "3", 
      icon: Share2, 
      change: "+12%",
      changeType: "positive",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500"
    },
    { 
      label: "ACTIVE EXCHANGES", 
      value: "2", 
      icon: RefreshCw, 
      change: "+8%",
      changeType: "positive",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500"
    },
    { 
      label: "MASTERCLASSES", 
      value: "5", 
      icon: GraduationCap, 
      change: "",
      changeType: "neutral",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500"
    },
    { 
      label: "LEARNING HOURS", 
      value: "12h", 
      icon: Clock, 
      change: "+24%",
      changeType: "positive",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500"
    },
  ]

  const formatSessionDate = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const sessionDate = new Date(date)
    sessionDate.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (sessionDate.getTime() === today.getTime()) {
      return `Today, ${timeStr}`
    } else if (sessionDate.getTime() === tomorrow.getTime()) {
      return `Tomorrow, ${timeStr}`
    } else {
      return `${date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}, ${timeStr}`
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="border-b border-border/40 bg-background sticky top-0 z-10">
        <div className="px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-semibold text-foreground mb-1">
                Welcome back, <span className="text-blue-500">{session?.user?.name || "Bhavya Joshi"}</span>
              </h1>
              <p className="text-sm text-muted-foreground">Track your learning progress and upcoming sessions</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {stats.map((stat, idx) => (
            <Card key={idx} className="bg-card border-border/40 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      {stat.label}
                    </p>
                    <p className="text-4xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="mt-auto">
                  {stat.change && (
                    <span className="text-xs font-medium text-green-500">
                      {stat.change} from last week
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Learning Advisor */}
        <Card className="border-border/40 overflow-hidden">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between bg-linear-to-r from-blue-500/5 to-purple-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">AI Learning Advisor</h2>
                  <p className="text-xs text-muted-foreground">Personalized recommendations based on your profile</p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={fetchRecommendations}
                disabled={loadingRecs}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {loadingRecs ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </div>

            {recsError && (
              <div className="px-6 py-4">
                <p className="text-sm text-red-400">{recsError}</p>
              </div>
            )}

            {!recommendations && !loadingRecs && !recsError && (
              <div className="px-6 py-10 text-center">
                <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Click &quot;Get Recommendations&quot; to receive AI-powered learning suggestions</p>
              </div>
            )}

            {loadingRecs && (
              <div className="px-6 py-10 text-center">
                <Loader />
                <p className="text-muted-foreground text-sm mt-3">Analyzing your learning profile...</p>
              </div>
            )}

            {recommendations && !loadingRecs && (
              <div className="p-6 space-y-6">
                {/* Reasoning */}
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                  <p className="text-sm text-muted-foreground">{recommendations.reasoning}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recommended Exchanges */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-blue-500" />
                      Recommended Skill Exchanges
                    </h3>
                    {recommendations.recommendedExchanges.length === 0 && (
                      <p className="text-sm text-muted-foreground">No exchange recommendations at this time.</p>
                    )}
                  </div>

                  {/* Recommended Masterclasses */}
                  <div>
                    <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-blue-500" />
                      Recommended Masterclasses
                    </h3>
                    {recommendations.recommendedMasterclasses.length === 0 && (
                      <p className="text-sm text-muted-foreground">No masterclass recommendations at this time.</p>
                    )}
                  </div>
                </div>

                {/* Cards interleaved in a single 2-col grid so rows auto-equalize height */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {Array.from({ length: Math.max(recommendations.recommendedExchanges.length, recommendations.recommendedMasterclasses.length) }).map((_, i) => (
                    <React.Fragment key={i}>
                      {recommendations.recommendedExchanges[i] ? (
                        <div
                          key={`ex-${recommendations.recommendedExchanges[i].id}`}
                          onClick={() => router.push(`/dashboard/marketplace?search=${encodeURIComponent(recommendations.recommendedExchanges[i].userName)}`)}
                          className="p-4 rounded-xl border border-border/40 hover:border-blue-500/50 transition-all hover:shadow-md cursor-pointer flex flex-col"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <p className="font-medium text-sm text-foreground">{recommendations.recommendedExchanges[i].userName}</p>
                            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full">Learn: {recommendations.recommendedExchanges[i].matchedSkill}</span>
                            <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 rounded-full">Teach: {recommendations.recommendedExchanges[i].theyWantFromMe}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-auto">{recommendations.recommendedExchanges[i].reason}</p>
                        </div>
                      ) : <div key={`ex-empty-${i}`} />}

                      {recommendations.recommendedMasterclasses[i] ? (
                        <div
                          key={`mc-${recommendations.recommendedMasterclasses[i].id}`}
                          onClick={() => router.push(`/dashboard/masterclasses?search=${encodeURIComponent(recommendations.recommendedMasterclasses[i].title)}`)}
                          className="p-4 rounded-xl border border-border/40 hover:border-blue-500/50 transition-all hover:shadow-md cursor-pointer flex flex-col"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-medium text-sm text-foreground">{recommendations.recommendedMasterclasses[i].title}</p>
                            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <span>by {recommendations.recommendedMasterclasses[i].instructorName}</span>
                            <span>•</span>
                            <span>{recommendations.recommendedMasterclasses[i].date}</span>
                            <span>•</span>
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-full">{recommendations.recommendedMasterclasses[i].category}</span>
                            <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 rounded-full">{recommendations.recommendedMasterclasses[i].level}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-auto">{recommendations.recommendedMasterclasses[i].reason}</p>
                        </div>
                      ) : <div key={`mc-empty-${i}`} />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Recent Sessions */}
          <div className="lg:col-span-2 flex">
            <Card className="border-border/40 w-full">
              <CardContent className="p-0 flex flex-col">
                <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Recent Sessions</h2>
                  <Link href="/dashboard/my-sessions">
                    <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-400 text-sm h-auto p-0">
                      View all
                    </Button>
                  </Link>
                </div>
                {loadingSessions ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader />
                  </div>
                ) : recentSessions.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-muted-foreground mb-4">No upcoming sessions</p>
                    <Link href="/dashboard/masterclasses">
                      <Button variant="outline" size="sm">
                        Browse Masterclasses
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border/40">
                    {recentSessions.map((sessionItem) => (
                      <div key={sessionItem.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shrink-0">
                            {getInitials(sessionItem.instructorName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-base text-foreground mb-0.5">{sessionItem.title}</p>
                            <p className="text-sm text-muted-foreground">{sessionItem.instructorName}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm text-muted-foreground">{formatSessionDate(sessionItem.date, sessionItem.time)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Access */}
          <div className="flex">
            <Card className="border-border/40 w-full">
              <CardContent className="p-0 flex flex-col">
                <div className="px-6 py-4 border-b border-border/40">
                  <h2 className="text-lg font-semibold text-foreground">Quick Access</h2>
                </div>
                <div className="p-4 space-y-2">
                  <Link href="/dashboard/marketplace" className="block group">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-sm font-medium text-foreground">Browse Marketplace</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </Link>
                  
                  <Link href="/dashboard/masterclasses" className="block group">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-sm font-medium text-foreground">View Masterclasses</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </Link>
                  
                  <Link href="/dashboard/profile" className="block group">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <UserCircle className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-sm font-medium text-foreground">Edit Profile</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}