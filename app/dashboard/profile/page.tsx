"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState("")

  const allSkills = [
    "Python",
    "Machine Learning",
    "Data Science",
    "React",
    "Node.js",
    "Web Development",
    "Cloud Architecture",
    "DevOps",
  ]

  const userSkills = ["Python", "Machine Learning", "React"]

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <img 
                src={session?.user?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session?.user?.name}`} 
                alt={session?.user?.name || "User"} 
                className="w-24 h-24 rounded-full" 
              />
              <div>
                <h2 className="text-2xl font-bold">{session?.user?.name}</h2>
                <p className="text-muted-foreground">{session?.user?.email}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">Bio</label>
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 bg-input border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => setIsEditing(false)}>Save</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-card border border-border rounded-md">
                  <p className="text-muted-foreground">{bio || "No bio added yet"}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 bg-transparent"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Bio
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-3">My Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {userSkills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Add More Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {allSkills
                    .filter((s) => !userSkills.includes(s))
                    .map((skill) => (
                      <Button key={skill} variant="outline" size="sm">
                        + {skill}
                      </Button>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-md">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Get notified about new opportunities</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between p-4 border border-border rounded-md">
              <div>
                <p className="font-medium">Public Profile</p>
                <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
