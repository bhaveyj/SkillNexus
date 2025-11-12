"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const masterclasses = [
  {
    id: 1,
    title: "Advanced Machine Learning",
    instructor: "Dr. Sarah Johnson",
    date: "Nov 15, 2024",
    time: "2:00 PM",
    duration: "2 hours",
    students: 45,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    level: "Advanced",
  },
  {
    id: 2,
    title: "GenAI Fundamentals",
    instructor: "Prof. James Wilson",
    date: "Nov 18, 2024",
    time: "3:00 PM",
    duration: "1.5 hours",
    students: 120,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
    level: "Intermediate",
  },
  {
    id: 3,
    title: "Production ML Systems",
    instructor: "Elena Martinez",
    date: "Nov 20, 2024",
    time: "4:00 PM",
    duration: "2 hours",
    students: 38,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena",
    level: "Advanced",
  },
  {
    id: 4,
    title: "Cloud Native Development",
    instructor: "Dev Shah",
    date: "Nov 22, 2024",
    time: "2:00 PM",
    duration: "2.5 hours",
    students: 67,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=dev",
    level: "Intermediate",
  },
  {
    id: 5,
    title: "AI Ethics & Responsible AI",
    instructor: "Dr. Amara Okafor",
    date: "Nov 25, 2024",
    time: "1:00 PM",
    duration: "1 hour",
    students: 200,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=amara",
    level: "Beginner",
  },
]

const categories = ["All", "AI/ML", "Cloud", "Web Development", "Data Science"]

export default function MasterclassesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")

  return (
    <div className="flex-1 overflow-auto">
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-semibold text-foreground">Masterclasses</h1>
          <p className="text-sm text-muted-foreground mt-1">Learn from industry experts in live sessions</p>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              size="sm"
              className="text-xs h-8"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="space-y-3">
          {masterclasses.map((mc) => (
            <Card key={mc.id} className="hover:border-primary/50 hover:shadow-sm transition-all">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <img
                    src={mc.avatar || "/placeholder.svg"}
                    alt={mc.instructor}
                    className="w-14 h-14 rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2 gap-4">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-foreground">{mc.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">by {mc.instructor}</p>
                      </div>
                      <Badge variant="secondary" className="flex-shrink-0 text-xs">
                        {mc.level}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
                      <span>{mc.date}</span>
                      <span>{mc.time}</span>
                      <span>{mc.duration}</span>
                      <span>{mc.students} enrolled</span>
                    </div>
                    <Button size="sm" className="text-xs h-8">
                      Register
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
