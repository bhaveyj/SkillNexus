"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const sessions = [
  {
    id: 1,
    title: "Python Fundamentals",
    type: "Learning",
    partner: "Alex Chen",
    date: "Today",
    time: "2:00 PM",
    status: "Upcoming",
  },
  {
    id: 2,
    title: "React Advanced Patterns",
    type: "Teaching",
    student: "Mike Johnson",
    date: "Tomorrow",
    time: "3:00 PM",
    status: "Upcoming",
  },
  {
    id: 3,
    title: "ML Masterclass",
    type: "Learning",
    instructor: "Dr. Sarah Johnson",
    date: "Nov 15",
    time: "2:00 PM",
    status: "Registered",
  },
  {
    id: 4,
    title: "Data Science Exchange",
    type: "Learning",
    partner: "Emma Rodriguez",
    date: "Nov 10",
    time: "4:00 PM",
    status: "Completed",
  },
]

export default function MySessionsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Sessions</h1>
        <p className="text-muted-foreground">Manage your learning and teaching sessions</p>
      </div>

      <div className="space-y-4">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{session.title}</h3>
                    <Badge variant={session.type === "Learning" ? "default" : "secondary"}>{session.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {session.partner
                      ? `with ${session.partner}`
                      : session.student
                        ? `with ${session.student}`
                        : `with ${session.instructor}`}
                  </p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>📅 {session.date}</span>
                    <span>🕐 {session.time}</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={session.status === "Completed" ? "outline" : "default"} className="mb-3 block">
                    {session.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    {session.status === "Completed" ? "View Details" : "Join Session"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
