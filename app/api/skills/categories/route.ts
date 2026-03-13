import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { applyRateLimit, generalLimiter } from '@/middleware/rateLimiter';
import { getCache, setCache } from '@/lib/cache';

// GET /api/skills/categories - Get all skill categories with counts
export async function GET(req: NextRequest) {
  const limited = await applyRateLimit(req, generalLimiter);
  if (limited) return limited;

  try {
    const cacheKey = 'skills:categories';
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached });
    }

    const categories = await prisma.skill.groupBy({
      by: ['category'],
      _count: true,
      orderBy: {
        category: 'asc',
      },
    });

    const categoriesWithSkills = await Promise.all(
      categories.map(async (cat) => {
        const skills = await prisma.skill.findMany({
          where: { category: cat.category },
          orderBy: { name: 'asc' },
          take: 10, // Preview of skills
        });

        return {
          category: cat.category,
          count: cat._count,
          skills: skills.map((s) => ({ id: s.id, name: s.name })),
        };
      })
    );

    await setCache(cacheKey, categoriesWithSkills, 300);

    return NextResponse.json({
      success: true,
      data: categoriesWithSkills,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}
