import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { applyRateLimit, generalLimiter } from '@/middleware/rateLimiter';

export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(req, generalLimiter);
  if (limited) return limited;

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to create a masterclass' },
        { status: 401 }
      );
    }

    // Get user and check if they're an instructor
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only instructors can create masterclasses' },
        { status: 403 }
      );
    }

    const {
      title,
      description,
      category,
      level,
      date,
      time,
      duration,
      maxStudents,
      meetLink,
    } = await req.json();

    // Validate required fields
    if (!title || !category || !level || !date || !time || !duration || !meetLink) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create masterclass
    const masterclass = await prisma.masterclass.create({
      data: {
        title,
        description,
        instructorId: user.id,
        instructorName: user.name || user.email,
        category,
        level,
        date: new Date(date),
        time,
        duration,
        meetLink, // Use the provided link
        maxStudents: maxStudents ? parseInt(maxStudents) : null,
        avatar: user.image,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Masterclass created successfully',
      masterclass,
    });
  } catch (error) {
    console.error('Error creating masterclass:', error);
    return NextResponse.json(
      { error: 'Failed to create masterclass' },
      { status: 500 }
    );
  }
}
