import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { Masterclass, MasterclassRegistration, User } from '@prisma/client';
import { applyRateLimit, generalLimiter } from '@/middleware/rateLimiter';

type MasterclassWithRelations = Masterclass & {
  registrations: MasterclassRegistration[];
  instructor: Pick<User, 'id' | 'name' | 'image'> | null;
};

export async function GET(req: NextRequest) {
  const limited = await applyRateLimit(req, generalLimiter);
  if (limited) return limited;

  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where = {
      // Only show masterclasses that haven't expired (date is today or in the future)
      date: {
        gte: today,
      },
      ...(category && category !== 'All' ? { category } : {}),
    };

    const masterclasses = await prisma.masterclass.findMany({
      where,
      include: {
        registrations: true,
        instructor: {
          select: {
            id: true,
            name: true,
            image: true,
            github: true,
            linkedin: true,
            twitter: true,
            gmail: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Get current user if logged in
    let currentUserId: string | null = null;
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      currentUserId = user?.id || null;
    }

    // Add enrollment count and check if user is registered
    const masterclassesWithCount = masterclasses.map((mc: MasterclassWithRelations) => ({
      ...mc,
      enrollmentCount: mc.registrations.length,
      isRegistered: currentUserId ? mc.registrations.some((reg: MasterclassRegistration) => reg.userId === currentUserId) : false,
    }));

    return NextResponse.json({
      masterclasses: masterclassesWithCount,
    });
  } catch (error) {
    console.error('Error fetching masterclasses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch masterclasses' },
      { status: 500 }
    );
  }
}
