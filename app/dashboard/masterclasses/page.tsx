"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Toast } from "@/components/ui/toast"
import { Loader } from "@/components/ui/loader"

interface Masterclass {
  id: string
  title: string
  instructorName: string
  date: Date
  time: string
  duration: string
  enrollmentCount: number
  avatar?: string
  level: string
  category: string
  description?: string
  meetLink: string
  maxStudents?: number
  isRegistered?: boolean
}

const categories = ["All", "AI/ML", "Cloud", "Web Development", "Data Science"]

export default function MasterclassesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [masterclasses, setMasterclasses] = useState<Masterclass[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: "success" | "error" | "warning" | "info"
  } | null>(null)

  useEffect(() => {
    fetchMasterclasses()
    fetchUserRole()
  }, [selectedCategory])

  const fetchUserRole = async () => {
    if (session?.user?.email) {
      try {
        const response = await fetch('/api/user/profile')
        const data = await response.json()
        setUserRole(data.role)
      } catch (error) {
        console.error('Failed to fetch user role:', error)
      }
    }
  }

  const fetchMasterclasses = async () => {
    try {
      const params = selectedCategory !== "All" ? `?category=${selectedCategory}` : ""
      const response = await fetch(`/api/masterclass${params}`)
      const data = await response.json()
      setMasterclasses(data.masterclasses || [])
    } catch (error) {
      console.error("Failed to fetch masterclasses:", error)
      setToast({
        message: "Failed to load masterclasses",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (masterclassId: string) => {
    if (!session) {
      setToast({
        message: "Please sign in to register for a masterclass",
        type: "warning",
      })
      return
    }

    setRegistering(masterclassId)

    try {
      const response = await fetch("/api/masterclass/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ masterclassId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to register")
      }

      setToast({
        message: "Successfully registered! Check your email for the Google Meet link.",
        type: "success",
      })

      // Refresh the masterclasses list
      fetchMasterclasses()
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "Failed to register",
        type: "error",
      })
    } finally {
      setRegistering(null)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-center h-full">
          <Loader />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Masterclasses</h1>
            <p className="text-sm text-muted-foreground mt-1">Learn from industry experts in live sessions</p>
          </div>
          {(userRole === 'INSTRUCTOR' || userRole === 'ADMIN') && (
            <Button onClick={() => router.push('/dashboard/masterclasses/create')}>
              Create Masterclass
            </Button>
          )}
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

        {masterclasses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No masterclasses available in this category.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {masterclasses.map((mc) => (
              <Card key={mc.id} className="hover:border-primary/50 hover:shadow-sm transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <img
                      src={mc.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mc.instructorName}`}
                      alt={mc.instructorName}
                      className="w-14 h-14 rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2 gap-4">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-foreground">{mc.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">by {mc.instructorName}</p>
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0 text-xs">
                          {mc.level}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-4">
                        <span>{formatDate(mc.date)}</span>
                        <span>{mc.time}</span>
                        <span>{mc.duration}</span>
                        <span>
                          {mc.enrollmentCount} enrolled
                          {mc.maxStudents && ` / ${mc.maxStudents} max`}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => handleRegister(mc.id)}
                        disabled={mc.isRegistered || registering === mc.id || (mc.maxStudents !== null && mc.maxStudents !== undefined && mc.enrollmentCount >= mc.maxStudents)}
                      >
                        {mc.isRegistered ? "Registered" : registering === mc.id ? "Registering..." : (mc.maxStudents !== null && mc.maxStudents !== undefined && mc.enrollmentCount >= mc.maxStudents) ? "Full" : "Register"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
