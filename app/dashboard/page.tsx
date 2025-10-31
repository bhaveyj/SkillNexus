"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoaderTwo } from "@/components/ui/loader"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <LoaderTwo />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <Button variant="outline" className="border-slate-700 text-white hover:bg-slate-800" onClick={() => signOut({ callbackUrl: "/" })}>
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-slate-800 bg-slate-950">
            <CardHeader>
              <CardTitle className="text-white">Welcome Back!</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-white"><strong>Name:</strong> {session.user?.name}</p>
                <p className="text-white"><strong>Email:</strong> {session.user?.email}</p>
                <p className="text-white"><strong>Role:</strong> {session.user?.role || "USER"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-800 bg-slate-950">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full border-slate-700 text-white hover:bg-slate-800" variant="outline">
                  View Profile
                </Button>
                <Button className="w-full border-slate-700 text-white hover:bg-slate-800" variant="outline">
                  Browse Courses
                </Button>
                <Button className="w-full border-slate-700 text-white hover:bg-slate-800" variant="outline">
                  My Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}