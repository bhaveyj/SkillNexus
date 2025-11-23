import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendMasterclassRegistrationEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in to register for a masterclass' },
        { status: 401 }
      );
    }

    const { masterclassId } = await req.json();

    if (!masterclassId) {
      return NextResponse.json(
        { error: 'Masterclass ID is required' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get masterclass
    const masterclass = await prisma.masterclass.findUnique({
      where: { id: masterclassId },
      include: {
        registrations: true,
      },
    });

    if (!masterclass) {
      return NextResponse.json(
        { error: 'Masterclass not found' },
        { status: 404 }
      );
    }

    // Check if already registered
    const existingRegistration = await prisma.masterclassRegistration.findUnique({
      where: {
        userId_masterclassId: {
          userId: user.id,
          masterclassId: masterclass.id,
        },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You are already registered for this masterclass' },
        { status: 400 }
      );
    }

    // Check if masterclass is full
    if (masterclass.maxStudents && masterclass.registrations.length >= masterclass.maxStudents) {
      return NextResponse.json(
        { error: 'This masterclass is already full' },
        { status: 400 }
      );
    }

    // Create registration
    const registration = await prisma.masterclassRegistration.create({
      data: {
        userId: user.id,
        masterclassId: masterclass.id,
      },
    });

    // Send email with Google Meet link
    try {
      await sendMasterclassRegistrationEmail({
        to: user.email,
        userName: user.name || 'Student',
        masterclassTitle: masterclass.title,
        instructorName: masterclass.instructorName,
        date: masterclass.date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        time: masterclass.time,
        duration: masterclass.duration,
        meetLink: masterclass.meetLink,
      });

      // Update registration to mark email as sent
      await prisma.masterclassRegistration.update({
        where: { id: registration.id },
        data: { emailSent: true },
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Don't fail the registration if email fails
      // The user is still registered, just the email didn't send
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully registered! Check your email for the Google Meet link.',
      registration,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register for masterclass' },
      { status: 500 }
    );
  }
}

// Get user's registrations
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        registrations: {
          include: {
            masterclass: true,
          },
          orderBy: {
            registeredAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      registrations: user.registrations,
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}
