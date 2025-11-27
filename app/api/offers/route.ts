import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/offers - Get user's offers or all offers
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const all = searchParams.get('all');

    interface WhereClause {
      userId?: string;
    }

    const where: WhereClause = {};
    
    if (all === 'true') {
      // Return all offers with user requests for marketplace browse
      const offers = await prisma.offer.findMany({
        include: {
          skill: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              requests: {
                include: {
                  skill: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Flatten the structure for easier frontend use
      const formattedOffers = offers.map(offer => ({
        ...offer,
        userRequests: offer.user.requests,
      }));

      return NextResponse.json({
        success: true,
        data: formattedOffers,
      });
    }

    if (userId) {
      where.userId = userId;
    } else if (session) {
      // If authenticated but no userId specified, get current user's offers
      where.userId = session.user.id;
    }

    const offers = await prisma.offer.findMany({
      where,
      include: {
        skill: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: offers,
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch offers',
      },
      { status: 500 }
    );
  }
}

// POST /api/offers - Create a new offer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { skillId } = body;

    if (!skillId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Skill ID is required',
        },
        { status: 400 }
      );
    }

    // Check if skill exists
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      return NextResponse.json(
        {
          success: false,
          error: 'Skill not found',
        },
        { status: 404 }
      );
    }

    // Check if offer already exists
    const existingOffer = await prisma.offer.findUnique({
      where: {
        userId_skillId: {
          userId: session.user.id,
          skillId,
        },
      },
    });

    if (existingOffer) {
      return NextResponse.json(
        {
          success: false,
          error: 'You already offer this skill',
        },
        { status: 400 }
      );
    }

    const offer = await prisma.offer.create({
      data: {
        userId: session.user.id,
        skillId,
      },
      include: {
        skill: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: offer,
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create offer',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/offers?offerId=xxx - Delete an offer
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const offerId = searchParams.get('offerId');

    if (!offerId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Offer ID is required',
        },
        { status: 400 }
      );
    }

    // Verify offer belongs to user
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Offer not found',
        },
        { status: 404 }
      );
    }

    if (offer.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized to delete this offer',
        },
        { status: 403 }
      );
    }

    await prisma.offer.delete({
      where: { id: offerId },
    });

    return NextResponse.json({
      success: true,
      message: 'Offer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting offer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete offer',
      },
      { status: 500 }
    );
  }
}
