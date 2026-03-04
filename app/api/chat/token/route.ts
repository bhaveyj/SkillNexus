import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { signChatToken } from "@/server/authSocketMiddleware";

/**
 * POST /api/chat/token
 * Generate a short-lived JWT for WebSocket authentication.
 * Requires an authenticated NextAuth session.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = await signChatToken({
      userId: session.user.id,
      name: session.user.name || "",
      email: session.user.email || "",
      image: session.user.image || undefined,
    });

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating chat token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
