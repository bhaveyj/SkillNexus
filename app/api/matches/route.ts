import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { applyRateLimit, generalLimiter } from '@/middleware/rateLimiter';
import { getCache, setCache } from '@/lib/cache';

interface Match {
  userId: string;
  userName: string;
  userEmail: string;
  userImage: string | null;
  matchedSkill: {
    id: string;
    name: string;
    category: string;
  };
  theyWantFromMe: {
    id: string;
    name: string;
    category: string;
  };
  matchScore: number;
}

// GET /api/matches - Find skill swap matches for the current user
export async function GET(request: NextRequest) {
  const limited = await applyRateLimit(request, generalLimiter);
  if (limited) return limited;

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

    const cacheKey = `matches:${session.user.id}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached });
    }

    // Get current user's offers (skills they can teach)
    const myOffers = await prisma.offer.findMany({
      where: { userId: session.user.id },
      include: { skill: true },
    });

    // Get current user's requests (skills they want to learn)
    const myRequests = await prisma.request.findMany({
      where: { userId: session.user.id },
      include: { skill: true },
    });

    if (myRequests.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Add skills you want to learn to find matches',
      });
    }

    const matches: Match[] = [];
    
    // For each skill I want to learn
    for (const myRequest of myRequests) {
      const skillIWantToLearn = myRequest.skill;
      
      // Find users who offer this skill
      const potentialInstructors = await prisma.offer.findMany({
        where: {
          skillId: skillIWantToLearn.id,
          userId: { not: session.user.id }, // Exclude myself
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          skill: true,
        },
      });

      // For each potential instructor
      for (const instructorOffer of potentialInstructors) {
        const instructor = instructorOffer.user;
        
        // Check what skills they want to learn
        const instructorRequests = await prisma.request.findMany({
          where: { userId: instructor.id },
          include: { skill: true },
        });

        // Check if I offer any skill they want
        for (const instructorRequest of instructorRequests) {
          const skillTheyWant = instructorRequest.skill;
          
          // Do I offer this skill?
          const iOfferThis = myOffers.find(
            (offer) => offer.skillId === skillTheyWant.id
          );

          if (iOfferThis) {
            // MATCH FOUND! 
            // I want to learn skillIWantToLearn from them
            // They want to learn skillTheyWant from me
            
            // Calculate match score (can be enhanced with more factors)
            let matchScore = 100;
            
            // Same category bonus
            if (skillIWantToLearn.category === skillTheyWant.category) {
              matchScore += 20;
            }

            matches.push({
              userId: instructor.id,
              userName: instructor.name || 'Anonymous',
              userEmail: instructor.email,
              userImage: instructor.image,
              matchedSkill: {
                id: skillIWantToLearn.id,
                name: skillIWantToLearn.name,
                category: skillIWantToLearn.category,
              },
              theyWantFromMe: {
                id: skillTheyWant.id,
                name: skillTheyWant.name,
                category: skillTheyWant.category,
              },
              matchScore,
            });
          }
        }
      }
    }

    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Remove duplicates (same user matched multiple times)
    const uniqueMatches = matches.reduce((acc, match) => {
      const existing = acc.find((m) => m.userId === match.userId);
      if (!existing) {
        acc.push(match);
      } else if (match.matchScore > existing.matchScore) {
        // Replace with higher score match
        const index = acc.indexOf(existing);
        acc[index] = match;
      }
      return acc;
    }, [] as Match[]);

    await setCache(cacheKey, uniqueMatches, 120);

    return NextResponse.json({
      success: true,
      data: uniqueMatches,
      count: uniqueMatches.length,
    });
  } catch (error) {
    console.error('Error finding matches:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to find matches',
      },
      { status: 500 }
    );
  }
}

// GET /api/matches/detailed - Get detailed matching information for current user
export async function POST(request: NextRequest) {
  const limited = await applyRateLimit(request, generalLimiter);
  if (limited) return limited;

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
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'User ID is required',
        },
        { status: 400 }
      );
    }

    // Get detailed information about match with specific user
    const myOffers = await prisma.offer.findMany({
      where: { userId: session.user.id },
      include: { skill: true },
    });

    const myRequests = await prisma.request.findMany({
      where: { userId: session.user.id },
      include: { skill: true },
    });

    const theirOffers = await prisma.offer.findMany({
      where: { userId },
      include: { skill: true },
    });

    const theirRequests = await prisma.request.findMany({
      where: { userId },
      include: { skill: true },
    });

    // Find what I can learn from them
    const iCanLearn = myRequests.filter((req) =>
      theirOffers.some((offer) => offer.skillId === req.skillId)
    );

    // Find what they can learn from me
    const theyCanLearn = theirRequests.filter((req) =>
      myOffers.some((offer) => offer.skillId === req.skillId)
    );

    return NextResponse.json({
      success: true,
      data: {
        iCanLearn: iCanLearn.map((r) => r.skill),
        theyCanLearn: theyCanLearn.map((r) => r.skill),
        myOffers: myOffers.map((o) => o.skill),
        myRequests: myRequests.map((r) => r.skill),
        theirOffers: theirOffers.map((o) => o.skill),
        theirRequests: theirRequests.map((r) => r.skill),
      },
    });
  } catch (error) {
    console.error('Error fetching detailed match:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch detailed match information',
      },
      { status: 500 }
    );
  }
}
