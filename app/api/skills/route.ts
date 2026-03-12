import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma, SkillCategory } from '@prisma/client';
import { applyRateLimit, generalLimiter } from '@/middleware/rateLimiter';
import { getCache, setCache, deleteCache } from '@/lib/cache';

// GET /api/skills - Get all skills or filter by category
export async function GET(request: NextRequest) {
  const limited = await applyRateLimit(request, generalLimiter);
  if (limited) return limited;

  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const cacheKey = `skills:${category || 'all'}:${search || 'none'}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached });
    }

    const where: Prisma.SkillWhereInput = {};
    
    if (category) {
      where.category = category as SkillCategory;
    }
    
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const skills = await prisma.skill.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            offers: true,
            requests: true,
          },
        },
      },
    });

    await setCache(cacheKey, skills, 300);

    return NextResponse.json({
      success: true,
      data: skills,
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch skills',
      },
      { status: 500 }
    );
  }
}

// POST /api/skills - Create a new skill (admin/authenticated users can add custom skills)
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
    const { name, category } = body;

    if (!name || !category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name and category are required',
        },
        { status: 400 }
      );
    }

    // Check if skill already exists
    const existingSkill = await prisma.skill.findUnique({
      where: { name },
    });

    if (existingSkill) {
      return NextResponse.json(
        {
          success: false,
          error: 'Skill already exists',
        },
        { status: 400 }
      );
    }

    const skill = await prisma.skill.create({
      data: {
        name,
        category,
      },
    });

    return NextResponse.json({
      success: true,
      data: skill,
    });
  } catch (error) {
    console.error('Error creating skill:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create skill',
      },
      { status: 500 }
    );
  }
}
