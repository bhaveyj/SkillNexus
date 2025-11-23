import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const where = category && category !== 'All' 
      ? { category } 
      : {};

    const masterclasses = await prisma.masterclass.findMany({
      where,
      include: {
        registrations: true,
        instructor: {
          select: {
            id: true,
            name: true,
            image: true,
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
    const masterclassesWithCount = masterclasses.map(mc => ({
      ...mc,
      enrollmentCount: mc.registrations.length,
      isRegistered: currentUserId ? mc.registrations.some(reg => reg.userId === currentUserId) : false,
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
