import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/chat/sessions
 * Create (or return existing) chat session for an accepted exchange request.
 *
 * Body: { exchangeRequestId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { exchangeRequestId } = await req.json();

    if (!exchangeRequestId) {
      return NextResponse.json(
        { error: "exchangeRequestId is required" },
        { status: 400 }
      );
    }

    // Verify the exchange request exists & is accepted
    const exchangeRequest = await prisma.exchangeRequest.findUnique({
      where: { id: exchangeRequestId },
      include: {
        sender: { select: { id: true, name: true, email: true, image: true } },
        receiver: {
          select: { id: true, name: true, email: true, image: true },
        },
        senderSkill: true,
        receiverSkill: true,
      },
    });

    if (!exchangeRequest) {
      return NextResponse.json(
        { error: "Exchange request not found" },
        { status: 404 }
      );
    }

    if (exchangeRequest.status !== "ACCEPTED") {
      return NextResponse.json(
        { error: "Exchange request must be accepted before chatting" },
        { status: 400 }
      );
    }

    // Ensure current user is a participant
    const userId = session.user.id;
    if (
      exchangeRequest.senderId !== userId &&
      exchangeRequest.receiverId !== userId
    ) {
      return NextResponse.json(
        { error: "Not a participant in this exchange" },
        { status: 403 }
      );
    }

    // Atomically find-or-create chat session (upsert avoids race-condition P2002)
    const chatSession = await prisma.chatSession.upsert({
      where: { exchangeRequestId },
      create: {
        exchangeRequestId,
        participant1Id: exchangeRequest.senderId,
        participant2Id: exchangeRequest.receiverId,
      },
      update: {},
      include: {
        participant1: {
          select: { id: true, name: true, email: true, image: true },
        },
        participant2: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });

    return NextResponse.json({
      session: chatSession,
      exchange: {
        senderSkill: exchangeRequest.senderSkill,
        receiverSkill: exchangeRequest.receiverSkill,
      },
    });
  } catch (error) {
    console.error("Error creating chat session:", error);
    return NextResponse.json(
      { error: "Failed to create chat session" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/chat/sessions
 * List all chat sessions for the current user.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const chatSessions = await prisma.chatSession.findMany({
      where: {
        OR: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      include: {
        participant1: {
          select: { id: true, name: true, email: true, image: true },
        },
        participant2: {
          select: { id: true, name: true, email: true, image: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            sender: {
              select: { id: true, name: true },
            },
          },
        },
        exchangeRequest: {
          include: {
            senderSkill: true,
            receiverSkill: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ sessions: chatSessions });
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat sessions" },
      { status: 500 }
    );
  }
}
