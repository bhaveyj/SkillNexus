"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Share2, RefreshCw, GraduationCap, Clock, ShoppingBag, BookOpen, UserCircle, ChevronRight, Search, Bell } from "lucide-react"

export default function DashboardPage() {
  const { data: session } = useSession()

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

  const recentSessions = [
    {
      id: 1,
      title: "Python Basics",
      instructor: "Alex Chen",
      initials: "AC",
      date: "Today, 2:00 PM",
      type: "exchange",
      status: "upcoming",
    },
    {
      id: 2,
      title: "Advanced ML Techniques",
      instructor: "Sarah Williams",
      initials: "SW",
      date: "Tomorrow, 3:00 PM",
      type: "masterclass",
      status: "registered",
    },
    {
      id: 3,
      title: "React Fundamentals",
      instructor: "You",
      initials: "BJ",
      date: "Friday, 4:00 PM",
      type: "teaching",
      status: "scheduled",
    },
  ]

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
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                BJ
              </div>
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
                  <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-400 text-sm h-auto p-0">
                    View all
                  </Button>
                </div>
                <div className="divide-y divide-border/40">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {session.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base text-foreground mb-0.5">{session.title}</p>
                          <p className="text-sm text-muted-foreground">{session.instructor}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm text-muted-foreground">{session.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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