"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Share2, RefreshCw, GraduationCap, Clock, ShoppingBag, BookOpen, UserCircle, ChevronRight, Search, Bell } from "lucide-react"
import { useEffect, useState } from "react"
import { Loader } from "@/components/ui/loader"

interface RegisteredSession {
  id: string
  title: string
  instructorName: string
  date: string
  time: string
  category: string
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [recentSessions, setRecentSessions] = useState<RegisteredSession[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)

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
    } else {
      setLoadingSessions(false)
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
                  <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center flex-shrink-0`}>
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
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {getInitials(sessionItem.instructorName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-base text-foreground mb-0.5">{sessionItem.title}</p>
                            <p className="text-sm text-muted-foreground">{sessionItem.instructorName}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
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