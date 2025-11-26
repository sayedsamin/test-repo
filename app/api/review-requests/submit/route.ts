import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateNextSessionDate } from "@/lib/utils/session-calculator";

// POST: Submit a review in response to a review request
export async function POST(request: NextRequest) {
  let reviewRequestId: string | undefined;
  
  try {
    const body = await request.json();
    const { reviewRequestId: reqId, rating, comment } = body;
    reviewRequestId = reqId;

    console.log("=== Review Submission Request ===");
    console.log("Full body:", JSON.stringify(body, null, 2));
    console.log("reviewRequestId:", reviewRequestId, "Type:", typeof reviewRequestId);
    console.log("rating:", rating, "Type:", typeof rating);
    console.log("comment:", comment);

    if (!reviewRequestId) {
      console.error("Missing reviewRequestId");
      return NextResponse.json(
        { error: "Review request ID is required", details: "reviewRequestId field is missing" },
        { status: 400 }
      );
    }

    if (!rating) {
      console.error("Missing rating");
      return NextResponse.json(
        { error: "Rating is required", details: "rating field is missing or zero" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      console.error("Invalid rating value:", rating);
      return NextResponse.json(
        { error: "Rating must be between 1 and 5", details: `Received rating: ${rating}` },
        { status: 400 }
      );
    }

    // Get the review request
    const reviewRequest = await prisma.reviewRequest.findUnique({
      where: { id: reviewRequestId },
    });

    console.log("Review request found:", reviewRequest ? "Yes" : "No");
    if (reviewRequest) {
      console.log("Review request details:", {
        id: reviewRequest.id,
        status: reviewRequest.status,
        tutorId: reviewRequest.tutorId,
        courseId: reviewRequest.courseId,
        studentId: reviewRequest.studentId,
      });
    }

    if (!reviewRequest) {
      console.error("Review request not found for ID:", reviewRequestId);
      return NextResponse.json(
        { error: "Review request not found", details: `No review request found with ID: ${reviewRequestId}` },
        { status: 404 }
      );
    }

    // Check if a review currently exists for this combination
    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: reviewRequest.studentId,
        courseId: reviewRequest.courseId,
        tutorId: reviewRequest.tutorId,
      },
    });

    // If review request is already responded AND a review exists, don't allow resubmission
    if (reviewRequest.status !== "pending" && existingReview) {
      console.error("Review request already responded to and review exists. Status:", reviewRequest.status);
      return NextResponse.json(
        { error: "This review request has already been responded to", details: `Current status: ${reviewRequest.status}` },
        { status: 400 }
      );
    }

    // If the review was deleted, allow resubmission by resetting the status
    if (reviewRequest.status !== "pending" && !existingReview) {
      console.log("Review was deleted, allowing resubmission");
      await prisma.reviewRequest.update({
        where: { id: reviewRequestId },
        data: {
          status: "pending",
          respondedAt: null,
        },
      });
    }

    // Check if a review already exists for this student and course
    // Note: Reviews require a bookingId, but since we're creating from a review request,
    // we need to find an enrollment or booking
    
    console.log("=== Checking student eligibility ===");
    console.log("Student ID:", reviewRequest.studentId);
    console.log("Course ID:", reviewRequest.courseId);
    console.log("Tutor ID:", reviewRequest.tutorId);
    
    // First, check if there's a booking for this student and course
    let booking = await prisma.booking.findFirst({
      where: {
        learnerId: reviewRequest.studentId,
        tutorId: reviewRequest.tutorId,
        courseId: reviewRequest.courseId,
      },
      include: {
        course: {
          select: {
            schedule: true,
          },
        },
      },
      orderBy: {
        sessionDate: "desc",
      },
    });

    console.log("Booking found:", booking ? "Yes" : "No");
    if (booking) {
      console.log("Booking details:", {
        id: booking.id,
        sessionDate: booking.sessionDate,
        status: booking.status,
        sessionType: booking.sessionType,
      });
    }

    // Check if the booking exists and validate based on course start date
    if (booking) {
      // Get the course to check start date
      const course = await prisma.course.findUnique({
        where: { id: reviewRequest.courseId },
        select: {
          startDate: true,
          schedule: true,
        },
      });

      console.log("Course found:", course ? "Yes" : "No");
      if (course) {
        console.log("Course start date:", course.startDate);
      }

      // Check if course has started
      const now = new Date();
      
      if (course?.startDate) {
        const courseStartDate = new Date(course.startDate);
        console.log("Course start date:", courseStartDate);
        console.log("Current date:", now);
        console.log("Course started?", courseStartDate <= now);
        
        if (courseStartDate > now) {
          console.error("Course has not started yet - review not allowed");
          return NextResponse.json(
            { error: "You cannot submit a review before the course starts. The course begins on " + courseStartDate.toLocaleDateString() + "." },
            { status: 403 }
          );
        }
      } else {
        // If no start date, check if at least one session from schedule has occurred
        const nextSession = calculateNextSessionDate(course?.schedule);
        const sessionDate = nextSession || new Date(booking.sessionDate);
        
        console.log("No start date, checking next session:", nextSession);
        console.log("Original session date:", booking.sessionDate);
        console.log("Using session date for validation:", sessionDate);
        console.log("Current date:", now);
        console.log("Session in future?", sessionDate > now);
        
        // Allow review if at least some time has passed since booking
        // This allows reviews during the course, not just after all sessions
        const bookingDate = new Date(booking.createdAt);
        console.log("Booking created at:", bookingDate);
        
        if (bookingDate > now) {
          console.error("Booking is in the future - review not allowed");
          return NextResponse.json(
            { error: "You cannot submit a review before your booking date." },
            { status: 403 }
          );
        }
      }
    }

    // Check for enrollment
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: reviewRequest.studentId,
        courseId: reviewRequest.courseId,
      },
    });

    console.log("Enrollment found:", enrollment ? "Yes" : "No");
    if (enrollment) {
      console.log("Enrollment details:", {
        id: enrollment.id,
        enrolledAt: enrollment.enrolledAt,
        progress: enrollment.progress,
      });
    }

    // If no enrollment and no booking, user hasn't purchased the course
    if (!enrollment && !booking) {
      console.error("No enrollment or booking found - review not allowed");
      return NextResponse.json(
        { error: "You must be enrolled in this course or have booked a session to leave a review." },
        { status: 403 }
      );
    }

    console.log("=== Student is eligible to review ===");

    // If no booking exists, create one for the review (for enrolled students)
    if (!booking) {
      console.log("Creating booking for enrolled student to attach review");
      const newBooking = await prisma.booking.create({
        data: {
          learnerId: reviewRequest.studentId,
          tutorId: reviewRequest.tutorId,
          courseId: reviewRequest.courseId,
          sessionDate: new Date(), // Current date as the session date
          durationMin: 60, // Default 1 hour duration
          status: "completed", // Mark as completed since we're reviewing
        },
        include: {
          course: {
            select: {
              schedule: true,
            },
          },
        },
      });
      booking = newBooking;
      console.log("Booking created:", booking.id);
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        reviewerId: reviewRequest.studentId,
        tutorId: reviewRequest.tutorId,
        courseId: reviewRequest.courseId,
        rating,
        comment: comment || null,
        status: "pending", // Reviews start as pending for tutor approval
      },
    });

    // Delete any old "responded" review requests for this combination to avoid unique constraint violation
    await prisma.reviewRequest.deleteMany({
      where: {
        tutorId: reviewRequest.tutorId,
        courseId: reviewRequest.courseId,
        studentId: reviewRequest.studentId,
        status: "responded",
        id: { not: reviewRequestId }, // Don't delete the current one
      },
    });

    // Update the review request status
    await prisma.reviewRequest.update({
      where: { id: reviewRequestId },
      data: {
        status: "responded",
        respondedAt: new Date(),
      },
    });

    console.log("Review submitted successfully:", review.id);

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully!",
      data: review,
    });
  } catch (error: any) {
    console.error("Error submitting review:", error);
    
    // Handle unique constraint violation (if booking already has a review)
    if (error.code === "P2002") {
      // Mark the review request as responded even though it failed
      if (reviewRequestId) {
        try {
          // Delete any old "responded" review requests first
          await prisma.reviewRequest.deleteMany({
            where: {
              id: { not: reviewRequestId },
              tutorId: (await prisma.reviewRequest.findUnique({ where: { id: reviewRequestId } }))?.tutorId,
              courseId: (await prisma.reviewRequest.findUnique({ where: { id: reviewRequestId } }))?.courseId,
              studentId: (await prisma.reviewRequest.findUnique({ where: { id: reviewRequestId } }))?.studentId,
              status: "responded",
            },
          });
          
          await prisma.reviewRequest.update({
            where: { id: reviewRequestId },
            data: {
              status: "responded",
              respondedAt: new Date(),
            },
          });
        } catch (updateError) {
          console.error("Failed to update review request status:", updateError);
        }
      }
      
      return NextResponse.json(
        { error: "You have already submitted a review for this course. Thank you for your feedback!" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: "Failed to submit review",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
