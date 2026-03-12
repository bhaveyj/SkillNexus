import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { applyRateLimit, generalLimiter } from "@/middleware/rateLimiter"

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  socials: z.object({
    github: z.string().optional(),
    linkedin: z.string().optional(),
    twitter: z.string().optional(),
    gmail: z.string().email().optional().or(z.literal("")),
  }).optional(),
})

export async function GET(req: NextRequest) {
  const limited = await applyRateLimit(req, generalLimiter)
  if (limited) return limited

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        skills: true,
        interests: true,
        location: true,
        website: true,
        role: true,
        createdAt: true,
        github: true,
        linkedin: true,
        twitter: true,
        gmail: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  const limited = await applyRateLimit(req, generalLimiter)
  if (limited) return limited

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const data = updateProfileSchema.parse(body)

    // Extract socials if provided and flatten them
    const { socials, ...otherData } = data
    const updateData = {
      ...otherData,
      ...(socials && {
        github: socials.github,
        linkedin: socials.linkedin,
        twitter: socials.twitter,
        gmail: socials.gmail,
      })
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        skills: true,
        interests: true,
        location: true,
        website: true,
        role: true,
        updatedAt: true,
        github: true,
        linkedin: true,
        twitter: true,
        gmail: true,
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      )
    }

    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  return PUT(req)
}