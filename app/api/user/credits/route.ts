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

    const sources = rows
      .map((row) => row.source)
      .filter((source): source is string => typeof source === "string" && source.length > 0);

    let masterclassIds = new Set<string>();
    if (sources.length > 0) {
      const masterclasses = await prisma.masterclass.findMany({
        where: { id: { in: sources } },
        select: { id: true },
      });
      masterclassIds = new Set(masterclasses.map((mc) => mc.id));
    }

    const transactions = rows.map((row) => {
      const hasSpendOrReward = row.type === "LEARN_SPEND" || row.type === "TEACH_REWARD";
      const sourceType = hasSpendOrReward && row.source
        ? (masterclassIds.has(row.source) ? "masterclass" : "exchange")
        : null;

      return { ...row, sourceType };
    });

    return NextResponse.json({ transactions, nextCursor });
  } catch (error) {
    console.error("Error fetching credit transactions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
