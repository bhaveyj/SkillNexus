"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function ProfilePage() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState("")
  const [isEditingSocials, setIsEditingSocials] = useState(false)
  const [socials, setSocials] = useState({
    github: "",
    linkedin: "",
    twitter: "",
    gmail: ""
  })

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserProfile()
    }
  }, [session])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        setBio(data.bio || "")
        setSocials({
          github: data.github || "",
          linkedin: data.linkedin || "",
          twitter: data.twitter || "",
          gmail: data.gmail || ""
        })
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    }
  }

  const saveSocials = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ socials })
      })
      if (response.ok) {
        setIsEditingSocials(false)
      }
    } catch (error) {
      console.error("Failed to update socials:", error)
    }
  }

  const saveBio = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio })
      })
      if (response.ok) {
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Failed to update bio:", error)
    }
  }

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
    <div className="p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
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
                    <Button onClick={saveBio}>Save</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-card border border-border rounded-md">
                  <p className="text-muted-foreground">{bio || "No bio added yet"}</p>
                  <Button
                    size="sm"
                    className="mt-3 cursor-pointer"
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

        {/* Socials Section - Right Side */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditingSocials ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">GitHub</label>
                    <input
                      type="url"
                      value={socials.github}
                      onChange={(e) => setSocials({ ...socials, github: e.target.value })}
                      placeholder="https://github.com/username"
                      className="w-full px-3 py-2 bg-input border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">LinkedIn</label>
                    <input
                      type="url"
                      value={socials.linkedin}
                      onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3 py-2 bg-input border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">X (formerly Twitter)</label>
                    <input
                      type="url"
                      value={socials.twitter}
                      onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                      placeholder="https://x.com/username"
                      className="w-full px-3 py-2 bg-input border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Gmail</label>
                    <input
                      type="email"
                      value={socials.gmail}
                      onChange={(e) => setSocials({ ...socials, gmail: e.target.value })}
                      placeholder="your.email@gmail.com"
                      className="w-full px-3 py-2 bg-input border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button onClick={saveSocials} className="flex-1">Save</Button>
                    <Button variant="outline" onClick={() => setIsEditingSocials(false)} className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {socials.github && (
                    <a href={socials.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 border border-border rounded-md hover:bg-accent transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                      <span className="text-sm">GitHub</span>
                    </a>
                  )}
                  {socials.linkedin && (
                    <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 border border-border rounded-md hover:bg-accent transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      <span className="text-sm">LinkedIn</span>
                    </a>
                  )}
                  {socials.twitter && (
                    <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 border border-border rounded-md hover:bg-accent transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                      <span className="text-sm">X</span>
                    </a>
                  )}
                  {socials.gmail && (
                    <a href={`mailto:${socials.gmail}`} className="flex items-center gap-3 p-3 border border-border rounded-md hover:bg-accent transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                      </svg>
                      <span className="text-sm">Gmail</span>
                    </a>
                  )}
                  {!socials.github && !socials.linkedin && !socials.twitter && !socials.gmail && (
                    <p className="text-muted-foreground text-sm">No social links added yet</p>
                  )}
                  <Button
                    size="sm"
                    className="w-full mt-4 cursor-pointer"
                    onClick={() => setIsEditingSocials(true)}
                  >
                    Edit Social Links
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
