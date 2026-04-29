import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, generalLimiter } from "@/middleware/rateLimiter";

export async function GET(req: NextRequest) {
  const limited = await applyRateLimit(req, generalLimiter);
  if (limited) return limited;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limitParam = req.nextUrl.searchParams.get("limit");
    const cursor = req.nextUrl.searchParams.get("cursor");
    const limit = Math.min(Math.max(Number(limitParam || 10), 1), 50);

    const rows = await prisma.creditTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    let nextCursor: string | null = null;
    if (rows.length > limit) {
      const next = rows.pop();
      nextCursor = next?.id ?? null;
    }

    return NextResponse.json({ transactions: rows, nextCursor });
  } catch (error) {
    console.error("Error fetching credit transactions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
