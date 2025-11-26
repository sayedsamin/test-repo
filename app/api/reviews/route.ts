import { NextRequest, NextResponse } from "next/server";
import { mockReviews } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";

// GET: Fetch reviews (accepts filters for tutorId, courseId, studentId)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tutorId = searchParams.get("tutorId");
    const courseId = searchParams.get("courseId");
    const studentId = searchParams.get("studentId");

    // Build the where clause
    const where: any = {};

    // If studentId or tutorId is provided, fetch all reviews (not just accepted)
    // This allows students and tutors to see their own reviews with all statuses
    if (studentId) {
      where.reviewerId = studentId;
    } else if (tutorId) {
      const tutor = await prisma.tutor.findUnique({
        where: { userId: tutorId },
      });
      if (tutor) {
        where.tutorId = tutor.id;
      }
    } else {
      // Only fetch accepted reviews for public display
      where.status = "accepted";
    }

    if (courseId) {
      where.courseId = courseId;
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImageUrl: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("First review tutor data:", reviews[0]?.tutor); // Debug log

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    // Fallback to mock data if database fails
    return NextResponse.json({ success: true, data: mockReviews });
  }
}

// POST: Submit a new review (students)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, reviewerId, tutorId, courseId, rating, comment } = body;

    if (!bookingId || !reviewerId || !tutorId || !courseId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get the tutor's internal ID
    const tutor = await prisma.tutor.findUnique({
      where: { userId: tutorId },
    });

    if (!tutor) {
      return NextResponse.json(
        { error: "Tutor not found" },
        { status: 404 }
      );
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        reviewerId,
        tutorId: tutor.id,
        courseId,
        rating,
        comment: comment || null,
        status: "pending", // All reviews start as pending
      },
    });

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully!",
      data: review,
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

// PATCH: Update review status (tutors can accept/reject reviews)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewId, status, tutorId } = body;

    if (!reviewId || !status || !tutorId) {
      return NextResponse.json(
        { error: "Review ID, status, and tutor ID are required" },
        { status: 400 }
      );
    }

    if (!["accepted", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be either 'accepted' or 'rejected'" },
        { status: 400 }
      );
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        tutor: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    // Verify the tutor owns this review
    if (review.tutor.userId !== tutorId) {
      return NextResponse.json(
        { error: "You can only update your own reviews" },
        { status: 403 }
      );
    }

    // Update the review status
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        status,
        approvedAt: status === "accepted" ? new Date() : null,
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImageUrl: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
          },
        },
        tutor: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profileImageUrl: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Review ${status === "accepted" ? "accepted" : "rejected"} successfully`,
      data: updatedReview,
    });
  } catch (error) {
    console.error("Error updating review status:", error);
    return NextResponse.json(
      { error: "Failed to update review status" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a review (tutors can delete any review)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reviewId = searchParams.get("reviewId");
    const tutorId = searchParams.get("tutorId");

    if (!reviewId || !tutorId) {
      return NextResponse.json(
        { error: "Review ID and tutor ID are required" },
        { status: 400 }
      );
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        tutor: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    // Verify the tutor owns this review
    if (review.tutor.userId !== tutorId) {
      return NextResponse.json(
        { error: "You can only delete your own reviews" },
        { status: 403 }
      );
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
