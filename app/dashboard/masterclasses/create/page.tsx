"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Toast } from "@/components/ui/toast"

export default function CreateMasterclassPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: "success" | "error" | "warning" | "info"
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    // Parse datetime-local to extract date and time
    const datetimeStr = formData.get("datetime") as string
    const datetime = new Date(datetimeStr)
    const timeStr = datetime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
    
    const data = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      level: formData.get("level"),
      date: datetime.toISOString(),
      time: timeStr,
      duration: formData.get("duration"),
      maxStudents: formData.get("maxStudents"),
      meetLink: formData.get("meetLink"),
    }

    try {
      const response = await fetch("/api/masterclass/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create masterclass")
      }

      setToast({
        message: "Masterclass created successfully!",
        type: "success",
      })

      // Redirect after 1.5 seconds
      setTimeout(() => {
        router.push("/dashboard/masterclasses")
      }, 1500)
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "Failed to create masterclass",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="px-8 py-6">
          <h1 className="text-2xl font-semibold text-foreground">Create Masterclass</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fill in the details to create a new masterclass session
          </p>
        </div>
      </div>

      <div className="p-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Masterclass Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  placeholder="e.g., Advanced Machine Learning"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  placeholder="Brief description of the masterclass"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select name="category" required className="w-full px-3 py-2 border rounded-md bg-background text-foreground">
                    <option value="">Select category</option>
                    <option value="AI/ML">AI/ML</option>
                    <option value="Cloud">Cloud</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Level *</label>
                  <select name="level" required className="w-full px-3 py-2 border rounded-md bg-background text-foreground">
                    <option value="">Select level</option>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Date & Time *</label>
                  <input
                    type="datetime-local"
                    name="datetime"
                    required
                    className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duration *</label>
                  <select name="duration" required className="w-full px-3 py-2 border rounded-md bg-background text-foreground">
                    <option value="">Select duration</option>
                    <option value="30 minutes">30 minutes</option>
                    <option value="45 minutes">45 minutes</option>
                    <option value="1 hour">1 hour</option>
                    <option value="1.5 hours">1.5 hours</option>
                    <option value="2 hours">2 hours</option>
                    <option value="2.5 hours">2.5 hours</option>
                    <option value="3 hours">3 hours</option>
                    <option value="4 hours">4 hours</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium mb-2">Max Students</label>
                  <input
                    type="number"
                    name="maxStudents"
                    min="1"
                    className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Google Meet Link *</label>
                <input
                  type="url"
                  name="meetLink"
                  required
                  className="w-full px-3 py-2 border rounded-md bg-background text-foreground"
                  placeholder="https://meet.google.com/abc-defg-hij"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Create a Google Meet link and paste it here
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Masterclass"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
