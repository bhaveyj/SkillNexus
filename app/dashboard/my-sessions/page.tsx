"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Loader } from "@/components/ui/loader"

interface Session {
  id: string
  title: string
  description: string
  instructorName: string
  category: string
  level: string
  date: string
  time: string
  duration: number
  meetLink: string
  avatar: string | null
  registeredAt: string
}

export default function MySessionsPage() {
  const { data: session } = useSession()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch("/api/masterclass/my-sessions")
        if (response.ok) {
          const data = await response.json()
          setSessions(data)
        }
      } catch (error) {
        console.error("Error fetching sessions:", error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchSessions()
    }
  }, [session])

  const getStatus = (dateStr: string) => {
    const sessionDate = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const sessionDateOnly = new Date(sessionDate)
    sessionDateOnly.setHours(0, 0, 0, 0)

    if (sessionDateOnly < today) {
      return "Completed"
    } else if (sessionDateOnly.getTime() === today.getTime()) {
      return "Today"
    } else {
      return "Upcoming"
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const sessionDate = new Date(date)
    sessionDate.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (sessionDate.getTime() === today.getTime()) {
      return "Today"
    } else if (sessionDate.getTime() === tomorrow.getTime()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  const handleJoinSession = (meetLink: string) => {
    window.open(meetLink, "_blank")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    )
  }

  // Sort sessions: upcoming/today first, completed at the bottom
  const sortedSessions = [...sessions].sort((a, b) => {
    const statusA = getStatus(a.date)
    const statusB = getStatus(b.date)
    
    // Completed sessions go to the bottom
    if (statusA === "Completed" && statusB !== "Completed") return 1
    if (statusA !== "Completed" && statusB === "Completed") return -1
    
    // Among same status, sort by date (earliest first)
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Sessions</h1>
        <p className="text-muted-foreground">Manage your learning and teaching sessions</p>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">You haven&apos;t registered for any masterclasses yet.</p>
            <Button onClick={() => window.location.href = "/dashboard/masterclasses"}>
              Browse Masterclasses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedSessions.map((masterclass) => {
            const status = getStatus(masterclass.date)
            const isCompleted = status === "Completed"
            return (
              <Card key={masterclass.id} className={isCompleted ? "opacity-60" : ""}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{masterclass.title}</h3>
                        <Badge variant="default">Learning</Badge>
                        <Badge variant="outline">{masterclass.category}</Badge>
                        {isCompleted && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            ✓ Completed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        with {masterclass.instructorName}
                      </p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>📅 {formatDate(masterclass.date)}</span>
                        <span>🕐 {masterclass.time}</span>
                        <span>⏱️ {masterclass.duration}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {!isCompleted && (
                        <Badge 
                          variant={status === "Today" ? "default" : "secondary"} 
                          className="mb-3 block"
                        >
                          {status}
                        </Badge>
                      )}
                      {isCompleted ? (
                        <Button 
                          variant="outline"
                          size="sm"
                          disabled
                          className="cursor-not-allowed opacity-50"
                        >
                          Session Ended
                        </Button>
                      ) : (
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                          size="sm"
                          onClick={() => handleJoinSession(masterclass.meetLink)}
                        >
                          Join Session
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
