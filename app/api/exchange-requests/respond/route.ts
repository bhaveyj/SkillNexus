import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, generalLimiter } from "@/middleware/rateLimiter";

// PATCH - Accept or decline an exchange request
export async function PATCH(req: NextRequest) {
  const limited = await applyRateLimit(req, generalLimiter);
  if (limited) return limited;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, action } = body; // action: 'accept' or 'decline'

    if (!requestId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (action !== "accept" && action !== "decline") {
      return NextResponse.json(
        { error: "Invalid action. Must be 'accept' or 'decline'" },
        { status: 400 }
      );
    }

    // Find the exchange request
    const exchangeRequest = await prisma.exchangeRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: true,
        receiver: true,
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

    // Verify user is the receiver
    if (exchangeRequest.receiverId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only respond to requests sent to you" },
        { status: 403 }
      );
    }

    // Check if request is still pending
    if (exchangeRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "This request has already been responded to" },
        { status: 400 }
      );
    }

    // Update the request status
    const updatedRequest = await prisma.exchangeRequest.update({
      where: { id: requestId },
      data: {
        status: action === "accept" ? "ACCEPTED" : "DECLINED",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
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

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error responding to exchange request:", error);
    return NextResponse.json(
      { error: "Failed to respond to exchange request" },
      { status: 500 }
    );
  }
}
