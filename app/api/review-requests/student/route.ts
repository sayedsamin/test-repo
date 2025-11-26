import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch pending review requests for a student
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    console.log("Fetching review requests for student:", studentId);

    // Fetch pending review requests for this student
    const reviewRequests = await prisma.reviewRequest.findMany({
      where: {
        studentId: studentId,
        status: "pending",
      },
      orderBy: {
        sentAt: "desc",
      },
    });

    console.log(`Found ${reviewRequests.length} pending review requests`);

    // Get additional details for each review request
    const enrichedRequests = await Promise.all(
      reviewRequests.map(async (request) => {
        // Get course details
        const course = await prisma.course.findUnique({
          where: { id: request.courseId },
          select: {
            id: true,
            title: true,
            imageUrl: true,
          },
        });

        // Get tutor details
        const tutor = await prisma.tutor.findUnique({
          where: { id: request.tutorId },
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
        });

        // Check if student has already submitted a review for this course
        const existingReview = await prisma.review.findFirst({
          where: {
            reviewerId: request.studentId,
            courseId: request.courseId,
            tutorId: request.tutorId,
          },
        });

        return {
          ...request,
          course,
          tutor: tutor
            ? {
                id: tutor.id,
                userId: tutor.userId,
                name: tutor.user.name,
                email: tutor.user.email,
                profileImageUrl: tutor.user.profileImageUrl,
              }
            : null,
          hasExistingReview: !!existingReview,
        };
      })
    );

    // Filter out requests that already have reviews
    const filteredRequests = enrichedRequests.filter(req => !req.hasExistingReview);

    console.log(`Returning ${filteredRequests.length} review requests (filtered ${enrichedRequests.length - filteredRequests.length} with existing reviews)`);

    return NextResponse.json({
      success: true,
      data: filteredRequests,
    });
  } catch (error) {
    console.error("Error fetching student review requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch review requests" },
      { status: 500 }
    );
  }
}
