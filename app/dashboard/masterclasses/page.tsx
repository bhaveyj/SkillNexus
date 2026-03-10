"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Toast } from "@/components/ui/toast"
import { Loader } from "@/components/ui/loader"
import { Input } from "@/components/ui/input"

interface InstructorSocials {
  github: string | null
  linkedin: string | null
  twitter: string | null
  gmail: string | null
}

interface Instructor {
  id: string
  name: string | null
  image: string | null
  github: string | null
  linkedin: string | null
  twitter: string | null
  gmail: string | null
}

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
  instructor?: Instructor
}

const categories = ["All", "AI/ML", "Cloud", "Web Development", "Data Science"]

export default function MasterclassesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") ?? "")
  const [masterclasses, setMasterclasses] = useState<Masterclass[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [selectedMasterclass, setSelectedMasterclass] = useState<Masterclass | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
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

  const filteredMasterclasses = masterclasses.filter((mc) =>
    mc.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openModal = (masterclass: Masterclass) => {
    setSelectedMasterclass(masterclass)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedMasterclass(null)
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
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-wrap gap-2">
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
          <div className="relative w-80">
            <Input
              type="text"
              placeholder="Search masterclasses by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {masterclasses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No masterclasses available in this category.</p>
          </div>
        ) : filteredMasterclasses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No masterclasses found matching &quot;{searchQuery}&quot;.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMasterclasses.map((mc) => (
              <Card key={mc.id} className="hover:border-primary/50 hover:shadow-sm transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <img
                      src={mc.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mc.instructorName}`}
                      alt={mc.instructorName}
                      className="w-14 h-14 rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2 gap-4">
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-foreground">{mc.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">by {mc.instructorName}</p>
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-xs">
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
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-8 cursor-pointer"
                          onClick={() => openModal(mc)}
                        >
                          More Details
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs h-8 cursor-pointer"
                          onClick={() => handleRegister(mc.id)}
                          disabled={mc.isRegistered || registering === mc.id || (mc.maxStudents !== null && mc.maxStudents !== undefined && mc.enrollmentCount >= mc.maxStudents)}
                        >
                          {mc.isRegistered ? "Registered" : registering === mc.id ? "Registering..." : (mc.maxStudents !== null && mc.maxStudents !== undefined && mc.enrollmentCount >= mc.maxStudents) ? "Full" : "Register"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Masterclass Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {selectedMasterclass && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Side - 2/3 width */}
              <div className="md:col-span-2 space-y-6">
                {/* Topic Section */}
                <div className="border border-border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Topic</h3>
                  <h2 className="text-2xl font-bold">{selectedMasterclass.title}</h2>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="outline">{selectedMasterclass.category}</Badge>
                    <Badge variant="secondary">{selectedMasterclass.level}</Badge>
                  </div>
                </div>

                {/* Description Section */}
                <div className="border border-border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Description</h3>
                  <p className="text-foreground leading-relaxed">{selectedMasterclass.description || "Introduction to Generative AI and its applications"}</p>
                </div>

                {/* Session Details Section */}
                <div className="border border-border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">Session Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📅</span>
                      <div>
                        <p className="text-sm font-medium">Date:</p>
                        <p className="text-foreground">{formatDate(selectedMasterclass.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🕐</span>
                      <div>
                        <p className="text-sm font-medium">Time:</p>
                        <p className="text-foreground">{selectedMasterclass.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⏱️</span>
                      <div>
                        <p className="text-sm font-medium">Duration:</p>
                        <p className="text-foreground">{selectedMasterclass.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">👥</span>
                      <div>
                        <p className="text-sm font-medium">Enrolled:</p>
                        <p className="text-foreground">
                          {selectedMasterclass.enrollmentCount}
                          {selectedMasterclass.maxStudents && ` / ${selectedMasterclass.maxStudents} max`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    className="flex-1 cursor-pointer"
                    onClick={() => {
                      handleRegister(selectedMasterclass.id)
                      closeModal()
                    }}
                    disabled={selectedMasterclass.isRegistered || registering === selectedMasterclass.id || (selectedMasterclass.maxStudents !== null && selectedMasterclass.maxStudents !== undefined && selectedMasterclass.enrollmentCount >= selectedMasterclass.maxStudents)}
                  >
                    {selectedMasterclass.isRegistered ? "Already Registered" : registering === selectedMasterclass.id ? "Registering..." : (selectedMasterclass.maxStudents !== null && selectedMasterclass.maxStudents !== undefined && selectedMasterclass.enrollmentCount >= selectedMasterclass.maxStudents) ? "Full" : "Register Now"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={closeModal}
                    className="cursor-pointer"
                  >
                    Close
                  </Button>
                </div>
              </div>

              {/* Right Side - 1/3 width */}
              <div className="md:col-span-1">
                <div className="border border-border rounded-lg p-4 space-y-6">
                  {/* Instructor Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Instructor</h3>
                    
                    {/* Profile Picture */}
                    <div className="flex justify-center mb-4">
                      <img
                        src={selectedMasterclass.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedMasterclass.instructorName}`}
                        alt={selectedMasterclass.instructorName}
                        className="w-24 h-24 rounded-full border-2 border-border"
                      />
                    </div>

                    {/* Instructor Name */}
                    <h4 className="text-center text-lg font-semibold mb-2">{selectedMasterclass.instructorName}</h4>
                    
                    {/* Designation */}
                    <div className="border border-border rounded-lg p-2 mb-4">
                      <p className="text-center text-sm text-muted-foreground">Designation</p>
                    </div>

                    {/* Connect with Instructor */}
                    <div>
                      <p className="text-sm font-medium mb-3">Connect with instructor</p>
                      
                      {selectedMasterclass.instructor && (selectedMasterclass.instructor.github || 
                        selectedMasterclass.instructor.linkedin || 
                        selectedMasterclass.instructor.twitter || 
                        selectedMasterclass.instructor.gmail) ? (
                        <div className="space-y-2">
                          {selectedMasterclass.instructor.github && (
                            <a 
                              href={selectedMasterclass.instructor.github} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 p-2 border border-border rounded-md hover:bg-accent transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                              </svg>
                              <span className="text-sm">GitHub</span>
                            </a>
                          )}
                          {selectedMasterclass.instructor.gmail && (
                            <a 
                              href={`mailto:${selectedMasterclass.instructor.gmail}`}
                              className="flex items-center justify-center gap-2 p-2 border border-border rounded-md hover:bg-accent transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                              </svg>
                              <span className="text-sm">Gmail</span>
                            </a>
                          )}
                          {selectedMasterclass.instructor.linkedin && (
                            <a 
                              href={selectedMasterclass.instructor.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 p-2 border border-border rounded-md hover:bg-accent transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                              </svg>
                              <span className="text-sm">LinkedIn</span>
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center">No social links available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
