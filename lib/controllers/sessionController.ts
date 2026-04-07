import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { markSessionComplete } from "@/lib/services/sessionService";

const markSessionCompleteSchema = z.object({
  sessionId: z.string().min(1),
});

export async function markSessionCompleteController(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    const parsed = markSessionCompleteSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await markSessionComplete(parsed.data.sessionId, session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "SESSION_NOT_FOUND") {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      if (error.message === "UNAUTHORIZED_SESSION_USER") {
        return NextResponse.json(
          { error: "Not a participant in this session" },
          { status: 403 }
        );
      }

      if (error.message === "SESSION_ALREADY_COMPLETED") {
        return NextResponse.json(
          { error: "Session is already completed" },
          { status: 409 }
        );
      }

      if (error.message === "USER_ALREADY_MARKED_COMPLETED") {
        return NextResponse.json(
          { error: "You have already marked this session as completed" },
          { status: 409 }
        );
      }
    }

    console.error("Error marking session complete:", error);
    return NextResponse.json(
      { error: "Failed to mark session complete" },
      { status: 500 }
    );
  }
}
