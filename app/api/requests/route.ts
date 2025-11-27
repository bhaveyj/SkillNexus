import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/requests - Get user's requests or all requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    interface WhereClause {
      userId?: string;
    }

    const where: WhereClause = {};
    
    if (userId) {
      where.userId = userId;
    } else if (session) {
      // If authenticated but no userId specified, get current user's requests
      where.userId = session.user.id;
    }

    const requests = await prisma.request.findMany({
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
      data: requests,
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch requests',
      },
      { status: 500 }
    );
  }
}

// POST /api/requests - Create a new request
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

    // Check if request already exists
    const existingRequest = await prisma.request.findUnique({
      where: {
        userId_skillId: {
          userId: session.user.id,
          skillId,
        },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        {
          success: false,
          error: 'You already requested this skill',
        },
        { status: 400 }
      );
    }

    const skillRequest = await prisma.request.create({
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
      data: skillRequest,
    });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create request',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/requests?requestId=xxx - Delete a request
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
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request ID is required',
        },
        { status: 400 }
      );
    }

    // Verify request belongs to user
    const skillRequest = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!skillRequest) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request not found',
        },
        { status: 404 }
      );
    }

    if (skillRequest.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized to delete this request',
        },
        { status: 403 }
      );
    }

    await prisma.request.delete({
      where: { id: requestId },
    });

    return NextResponse.json({
      success: true,
      message: 'Request deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete request',
      },
      { status: 500 }
    );
  }
}
