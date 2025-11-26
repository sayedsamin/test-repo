import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Create a booking after session payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      learnerId,
      tutorId,
      courseId,
      sessionDate,
      durationMin,
      status,
      paymentSessionId,
      amount,
      sessionType = "individual",
    } = body;

    console.log("Booking request received:", {
      learnerId,
      tutorId,
      courseId,
      sessionDate,
      amount,
      sessionType,
    });

    if (!learnerId || !tutorId || !courseId || !sessionDate) {
      console.error("Missing required fields");
      return NextResponse.json(
        {
          error:
            "Missing required fields: learnerId, tutorId, courseId, sessionDate",
        },
        { status: 400 }
      );
    }

    // Verify learner exists
    const learner = await prisma.user.findUnique({
      where: { id: learnerId },
    });

    console.log("Learner lookup:", learner ? "Found" : "Not found");

    if (!learner) {
      console.error("Learner not found:", learnerId);
      return NextResponse.json({ error: "Learner not found" }, { status: 404 });
    }

    if (learner.role !== "learner") {
      console.error("User is not a learner:", learner.role);
      return NextResponse.json(
        { error: "User must be a learner to book sessions" },
        { status: 403 }
      );
    }

    // Verify tutor exists
    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
    });

    console.log("Tutor lookup:", tutor ? "Found" : "Not found");

    if (!tutor) {
      console.error("Tutor not found:", tutorId);
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    console.log("Course lookup:", course ? "Found" : "Not found");

    if (!course) {
      console.error("Course not found:", courseId);
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Determine payment amount - use provided amount or course trial rate
    const paymentAmount = amount || course.trialRate;

    console.log("Creating booking with sessionType:", sessionType);

    // Create booking with payment in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create booking
      const booking = await tx.booking.create({
        data: {
          learnerId,
          tutorId,
          courseId,
          sessionDate: new Date(sessionDate),
          durationMin: durationMin || 60,
          status: status || "confirmed",
          sessionType: sessionType,
        },
      });

      console.log("Booking created:", booking.id);

      // Create payment record
      const payment = await tx.payment.create({
        data: {
          bookingId: booking.id,
          amount: paymentAmount,
          paymentMethod: "stripe",
          paymentStatus: "completed",
          transactionId: paymentSessionId || `txn_${Date.now()}`,
        },
      });

      // Fetch the complete booking with all relations
      const completeBooking = await tx.booking.findUnique({
        where: { id: booking.id },
        include: {
          learner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          tutor: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          course: {
            select: {
              id: true,
              title: true,
            },
          },
          payment: true,
        },
      });

      return completeBooking;
    });

    console.log("Booking and payment created successfully:", result?.id);

    return NextResponse.json({
      success: true,
      message: "Booking and payment created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    console.error("Full error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      {
        error: "Failed to create booking",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// GET: Fetch bookings for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const learnerId = searchParams.get("learnerId");
    const tutorId = searchParams.get("tutorId");
    const courseId = searchParams.get("courseId");

    const where: any = {};

    if (learnerId) {
      where.learnerId = learnerId;
    }

    if (tutorId) {
      where.tutorId = tutorId;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        learner: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImageUrl: true,
          },
        },
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImageUrl: true,
              },
            },
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            startDate: true,
            endDate: true,
            schedule: true,
            zoomLink: true,
          },
        },
        payment: true,
      },
      orderBy: {
        sessionDate: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
