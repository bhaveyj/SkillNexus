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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Sessions</h1>
        <p className="text-muted-foreground">Manage your learning and teaching sessions</p>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">You haven't registered for any masterclasses yet.</p>
            <Button onClick={() => window.location.href = "/dashboard/masterclasses"}>
              Browse Masterclasses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((masterclass) => {
            const status = getStatus(masterclass.date)
            return (
              <Card key={masterclass.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{masterclass.title}</h3>
                        <Badge variant="default">Learning</Badge>
                        <Badge variant="outline">{masterclass.category}</Badge>
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
                      {status !== "Completed" && (
                        <Badge 
                          variant={status === "Today" ? "default" : "secondary"} 
                          className="mb-3 block"
                        >
                          {status}
                        </Badge>
                      )}
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                        size="sm"
                        onClick={() => handleJoinSession(masterclass.meetLink)}
                      >
                        Join Session
                      </Button>
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
