"use client"

import { Button } from "@/components/ui/button"
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card"
import { LoaderTwo } from "@/components/ui/loader"
import { useState, useEffect } from "react"

const classes = [
  {
    title: "Hands-on Prompt Engineering",
    by: "Senior AI Engineer",
    date: "Nov 22",
    img: "/prompt-engineering-tutorial-screen.jpg",
  },
  {
    title: "Deploying RAG Systems",
    by: "ML Platform Lead",
    date: "Dec 3",
    img: "/rag-architecture-diagram-on-screen.jpg",
  },
  {
    title: "MLOps in Production",
    by: "Data Infra Architect",
    date: "Dec 10",
    img: "/mlops-pipelines-and-dashboards.jpg",
  },
]

export function Masterclasses() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading masterclasses data
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
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
          <Button variant="outline" className="hidden sm:inline-flex">
            View all
          </Button>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <CardContainer key={c.title} className="inter-var w-full">
              <CardBody className="bg-card relative group/card dark:hover:shadow-2xl dark:hover:shadow-primary/[0.1] border-border w-full min-h-[450px] h-full rounded-xl p-6 border flex flex-col">
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
                  with {c.by} • {c.date}
                </CardItem>
                <CardItem translateZ="100" className="w-full flex-1 mb-6">
                  <img
                    src={c.img || "/placeholder.svg"}
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
                  <Button className="w-full h-12 text-base font-medium">
                    Register
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
