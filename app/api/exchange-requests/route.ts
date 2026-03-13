import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, generalLimiter } from "@/middleware/rateLimiter";

// GET - Fetch exchange requests (sent or received)
export async function GET(req: NextRequest) {
  const limited = await applyRateLimit(req, generalLimiter);
  if (limited) return limited;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'sent' or 'received'

    let exchangeRequests;

    if (type === "sent") {
      exchangeRequests = await prisma.exchangeRequest.findMany({
        where: { senderId: session.user.id },
        include: {
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          senderSkill: true,
          receiverSkill: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (type === "received") {
      exchangeRequests = await prisma.exchangeRequest.findMany({
        where: { receiverId: session.user.id },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          senderSkill: true,
          receiverSkill: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Both sent and received
      const sent = await prisma.exchangeRequest.findMany({
        where: { senderId: session.user.id },
        include: {
          receiver: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          senderSkill: true,
          receiverSkill: true,
        },
      });

      const received = await prisma.exchangeRequest.findMany({
        where: { receiverId: session.user.id },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          senderSkill: true,
          receiverSkill: true,
        },
      });

      return NextResponse.json({ sent, received });
    }

    return NextResponse.json(exchangeRequests);
  } catch (error) {
    console.error("Error fetching exchange requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch exchange requests" },
      { status: 500 }
    );
  }
}

// POST - Create a new exchange request
export async function POST(req: NextRequest) {
  const limited = await applyRateLimit(req, generalLimiter);
  if (limited) return limited;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { receiverId, senderSkillId, receiverSkillId, message } = body;

    // Validate input
    if (!receiverId || !senderSkillId || !receiverSkillId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Can't send request to yourself
    if (receiverId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot send exchange request to yourself" },
        { status: 400 }
      );
    }

    // Check if sender offers the skill
    const senderOffer = await prisma.offer.findUnique({
      where: {
        userId_skillId: {
          userId: session.user.id,
          skillId: senderSkillId,
        },
      },
    });

    if (!senderOffer) {
      return NextResponse.json(
        { error: "You must offer this skill to create an exchange" },
        { status: 400 }
      );
    }

    // Check if receiver offers the skill
    const receiverOffer = await prisma.offer.findUnique({
      where: {
        userId_skillId: {
          userId: receiverId,
          skillId: receiverSkillId,
        },
      },
    });

    if (!receiverOffer) {
      return NextResponse.json(
        { error: "Receiver does not offer this skill" },
        { status: 400 }
      );
    }

    // Check for existing request
    const existingRequest = await prisma.exchangeRequest.findUnique({
      where: {
        senderId_receiverId_senderSkillId_receiverSkillId: {
          senderId: session.user.id,
          receiverId,
          senderSkillId,
          receiverSkillId,
        },
      },
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "Exchange request already exists" },
        { status: 400 }
      );
    }

    // Create exchange request
    const exchangeRequest = await prisma.exchangeRequest.create({
      data: {
        senderId: session.user.id,
        receiverId,
        senderSkillId,
        receiverSkillId,
        message,
        status: "PENDING",
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        senderSkill: true,
        receiverSkill: true,
      },
    });

    return NextResponse.json(exchangeRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating exchange request:", error);
    return NextResponse.json(
      { error: "Failed to create exchange request" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel an exchange request (sender only)
export async function DELETE(req: NextRequest) {
  const limited = await applyRateLimit(req, generalLimiter);
  if (limited) return limited;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const requestId = searchParams.get("id");

    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    // Check if request exists and user is the sender
    const exchangeRequest = await prisma.exchangeRequest.findUnique({
      where: { id: requestId },
    });

    if (!exchangeRequest) {
      return NextResponse.json(
        { error: "Exchange request not found" },
        { status: 404 }
      );
    }

    if (exchangeRequest.senderId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only cancel your own requests" },
        { status: 403 }
      );
    }

    if (exchangeRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "Can only cancel pending requests" },
        { status: 400 }
      );
    }

    // Delete the request
    await prisma.exchangeRequest.delete({
      where: { id: requestId },
    });

    return NextResponse.json({ message: "Request cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling exchange request:", error);
    return NextResponse.json(
      { error: "Failed to cancel exchange request" },
      { status: 500 }
    );
  }
}
