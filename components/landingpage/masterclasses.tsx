"use client"

import { Button } from "@/components/ui/button"
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card"
import { LoaderTwo } from "@/components/ui/loader"
import Link from "next/link"
import { useState, useEffect } from "react"

type LandingMasterclass = {
  id: string
  title: string
  instructorName: string
  date: string
  avatar?: string | null
  instructor?: {
    name?: string | null
  } | null
}

type MasterclassApiResponse = {
  masterclasses: LandingMasterclass[]
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return "TBA"
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function Masterclasses() {
  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<LandingMasterclass[]>([])
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    const loadMasterclasses = async () => {
      try {
        setHasError(false)
        const response = await fetch("/api/masterclass", {
          method: "GET",
          signal: controller.signal,
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch masterclasses")
        }

        const data: MasterclassApiResponse = await response.json()
        setClasses((data.masterclasses || []).slice(0, 3))
      } catch {
        if (!controller.signal.aborted) {
          setHasError(true)
          setClasses([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadMasterclasses()

    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <section id="masterclasses" className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
          <LoaderTwo />
        </div>
      </section>
    )
  }

  return (
    <section id="masterclasses" className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-4 py-14 md:py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Upcoming masterclasses</h2>
            <p className="text-muted-foreground mt-2">Deep dives led by practitioners. Seats are limited.</p>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/dashboard/masterclasses">
            View all
            </Link>
          </Button>
        </div>

        {!loading && classes.length === 0 && (
          <div className="mt-8 rounded-xl border border-border/70 bg-card/40 p-6 text-sm text-muted-foreground">
            {hasError ? "Unable to load masterclasses right now. Please try again later." : "No upcoming masterclasses yet."}
          </div>
        )}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <CardContainer key={c.id} className="inter-var w-full">
              <CardBody className="bg-card relative group/card dark:hover:shadow-2xl dark:hover:shadow-primary/[0.1] border-border w-full min-h-112.5 h-full rounded-xl p-6 border flex flex-col">
                <CardItem
                  translateZ="50"
                  className="text-xl font-bold text-card-foreground mb-2"
                >
                  {c.title}
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="60"
                  className="text-muted-foreground text-sm mb-4"
                >
                  with {c.instructor?.name || c.instructorName || "Instructor"} • {formatDate(c.date)}
                </CardItem>
                <CardItem translateZ="100" className="w-full flex-1 mb-6">
                  <img
                    src={c.avatar || "/placeholder.svg"}
                    height="1000"
                    width="1000"
                    className="h-64 w-full object-cover rounded-xl group-hover/card:shadow-xl"
                    alt={`${c.title} cover`}
                  />
                </CardItem>
                <CardItem
                  translateZ={20}
                  className="w-full mt-auto"
                >
                  <Button asChild className="w-full h-12 text-base font-medium">
                    <Link href="/dashboard/masterclasses">Register</Link>
                  </Button>
                </CardItem>
              </CardBody>
            </CardContainer>
          ))}
        </div>
      </div>
    </section>
  )
}
