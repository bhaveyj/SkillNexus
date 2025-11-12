"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session } = useSession()

  const stats = [
    { label: "Skills Shared", value: "3", icon: "📚" },
    { label: "Active Exchanges", value: "2", icon: "🔄" },
    { label: "Masterclasses", value: "5", icon: "🎓" },
    { label: "Learning Hours", value: "12h", icon: "⏱️" },
  ]

  const recentSessions = [
    {
      id: 1,
      title: "Python Basics",
      instructor: "Alex Chen",
      date: "Today, 2:00 PM",
      type: "exchange",
      status: "upcoming",
    },
    {
      id: 2,
      title: "Advanced ML Techniques",
      instructor: "Sarah Williams",
      date: "Tomorrow, 3:00 PM",
      type: "masterclass",
      status: "registered",
    },
    {
      id: 3,
      title: "React Fundamentals",
      instructor: "You",
      date: "Friday, 4:00 PM",
      type: "teaching",
      status: "scheduled",
    },
  ]

  return (
    <div className="flex-1 overflow-auto">
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-semibold text-foreground">Welcome back, {session?.user?.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your learning progress and upcoming sessions</p>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <Card key={idx} className="bg-card hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="text-2xl mb-3">{stat.icon}</div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-semibold mt-2">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-semibold">Recent Sessions</h2>
                </div>
                <div className="divide-y divide-border">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">{session.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{session.instructor}</p>
                          <p className="text-xs text-muted-foreground mt-2">{session.date}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs h-8 px-3 ml-2">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardContent className="p-0">
                <div className="p-4 border-b border-border">
                  <h2 className="text-lg font-semibold">Quick Access</h2>
                </div>
                <div className="p-4 space-y-3">
                  <Link href="/dashboard/marketplace" className="block">
                    <Button className="w-full h-9 text-xs justify-start bg-primary/10 hover:bg-primary/20 text-primary">
                      Browse Marketplace
                    </Button>
                  </Link>
                  <Link href="/dashboard/masterclasses" className="block">
                    <Button className="w-full h-9 text-xs justify-start bg-primary/10 hover:bg-primary/20 text-primary">
                      View Masterclasses
                    </Button>
                  </Link>
                  <Link href="/dashboard/profile" className="block">
                    <Button variant="outline" className="w-full h-9 text-xs bg-transparent">
                      Edit Profile
                    </Button>
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