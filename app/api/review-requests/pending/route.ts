import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch pending reviews for a tutor (reviews submitted by students awaiting approval)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tutorId = searchParams.get("tutorId");

    console.log("Pending reviews API called with tutorId:", tutorId);

    if (!tutorId) {
      return NextResponse.json(
        { error: "Tutor ID is required" },
        { status: 400 }
      );
    }

    // Get the tutor to ensure they exist
    const tutor = await prisma.tutor.findUnique({
      where: { userId: tutorId },
    });

    console.log("Tutor found:", tutor ? tutor.id : "Not found");

    if (!tutor) {
      // Return empty array instead of error if tutor not found
      // This handles cases where the tutor profile hasn't been created yet
      return NextResponse.json({
        success: true,
        data: [],
        message: "No tutor profile found. Please create a tutor profile first.",
      });
    }

    // Fetch pending reviews for this tutor
    console.log("Fetching reviews for tutor:", tutor.id);
    
    const pendingReviews = await prisma.review.findMany({
      where: {
        tutorId: tutor.id,
        status: "pending",
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Found pending reviews:", pendingReviews.length);

    return NextResponse.json({
      success: true,
      data: pendingReviews,
    });
  } catch (error) {
    console.error("Error fetching pending reviews:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Return empty array instead of error to prevent UI breaking
    return NextResponse.json({
      success: true,
      data: [],
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
