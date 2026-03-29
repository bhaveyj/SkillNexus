import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { createRating, getUserRatings } from "@/lib/services/ratingService";

const createRatingSchema = z.object({
  revieweeId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  review: z.string().trim().max(1000).optional(),
  sessionId: z.string().min(1).optional(),
});

export async function createRatingController(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const parsed = createRatingSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const reviewerId = session.user.id;
    const { revieweeId, rating, review, sessionId } = parsed.data;

    if (reviewerId === revieweeId) {
      return NextResponse.json(
        { error: "You cannot rate yourself" },
        { status: 400 }
      );
    }

    try {
      const created = await createRating({
        reviewerId,
        revieweeId,
        rating,
        review,
        sessionId: sessionId ?? null,
      });

      return NextResponse.json({ rating: created }, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.message === "DUPLICATE_RATING") {
        return NextResponse.json(
          { error: "You have already rated this interaction" },
          { status: 409 }
        );
      }

      throw error;
    }
  } catch (error) {
    console.error("Error creating rating:", error);
    return NextResponse.json(
      { error: "Failed to create rating" },
      { status: 500 }
    );
  }
}

export async function getUserRatingsController(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || "20");

    const result = await getUserRatings(id, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching user ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch user ratings" },
      { status: 500 }
    );
  }
}
