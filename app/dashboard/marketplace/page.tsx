"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const skillOffers = [
  {
    id: 1,
    skill: "Machine Learning",
    level: "Advanced",
    instructor: "Alex Chen",
    rate: "1:1 Exchange",
    students: 12,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
  },
  {
    id: 2,
    skill: "Web Development",
    level: "Intermediate",
    instructor: "Emma Rodriguez",
    rate: "1:1 Exchange",
    students: 8,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
  },
  {
    id: 3,
    skill: "Data Science",
    level: "Advanced",
    instructor: "Michael Park",
    rate: "1:1 Exchange",
    students: 15,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
  },
  {
    id: 4,
    skill: "Cloud Architecture",
    level: "Expert",
    instructor: "Jessica Lee",
    rate: "1:1 Exchange",
    students: 20,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jessica",
  },
  {
    id: 5,
    skill: "Python",
    level: "Beginner",
    instructor: "David Kumar",
    rate: "1:1 Exchange",
    students: 5,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david",
  },
]

const skillLevels = ["All Levels", "Beginner", "Intermediate", "Advanced", "Expert"]

export default function MarketplacePage() {
  const [selectedLevel, setSelectedLevel] = useState("All Levels")

  return (
    <div className="flex-1 overflow-auto">
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-semibold text-foreground">Skill Marketplace</h1>
          <p className="text-sm text-muted-foreground mt-1">Exchange skills 1:1 with peers in your areas of interest</p>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-8 flex flex-wrap gap-2">
          {skillLevels.map((level) => (
            <Button
              key={level}
              variant={selectedLevel === level ? "default" : "outline"}
              onClick={() => setSelectedLevel(level)}
              size="sm"
              className="text-xs h-8"
            >
              {level}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillOffers.map((offer) => (
            <Card key={offer.id} className="hover:border-primary/50 hover:shadow-sm transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <img
                    src={offer.avatar || "/placeholder.svg"}
                    alt={offer.instructor}
                    className="w-10 h-10 rounded-lg"
                  />
                  <Badge variant="secondary" className="text-xs">
                    {offer.level}
                  </Badge>
                </div>
                <h3 className="text-sm font-semibold text-foreground">{offer.skill}</h3>
                <p className="text-xs text-muted-foreground mt-1">{offer.instructor}</p>
                <div className="flex items-center justify-between mt-4 mb-4 text-xs text-muted-foreground">
                  <span>{offer.students} learners</span>
                  <Badge variant="outline" className="text-xs">
                    {offer.rate}
                  </Badge>
                </div>
                <Button size="sm" className="w-full h-8 text-xs">
                  Request Exchange
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
