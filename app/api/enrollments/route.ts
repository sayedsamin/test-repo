import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Create an enrollment after successful payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, courseId, sessionId } = body;

    console.log("Enrollment request received:", { userId, courseId, sessionId });

    if (!userId || !courseId) {
      console.error("Missing required fields:", { userId, courseId });
      return NextResponse.json(
        { error: "Missing required fields: userId, courseId" },
        { status: 400 }
      );
    }

    // Verify user is a learner
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    console.log("User found:", user ? { id: user.id, role: user.role } : "Not found");

    if (!user) {
      console.error("User not found:", userId);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.role !== "learner") {
      console.error("User is not a learner:", user.role);
      return NextResponse.json(
        { error: "Only learners can enroll in courses" },
        { status: 403 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      console.log("Already enrolled:", existingEnrollment.id);
      return NextResponse.json({
        success: true,
        message: "Already enrolled",
        data: existingEnrollment,
      });
    }

    console.log("Creating new enrollment...");

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: userId,
        courseId: courseId,
        hoursCompleted: 0,
        progress: 0,
      },
      include: {
        student: {
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
            totalHours: true,
          },
        },
      },
    });

    console.log("Enrollment created successfully:", enrollment.id);

    return NextResponse.json({
      success: true,
      message: "Enrollment created successfully",
      data: enrollment,
    });
  } catch (error) {
    console.error("Error creating enrollment:", error);
    return NextResponse.json(
      { 
        error: "Failed to create enrollment",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// GET: Get enrollments for a user or course
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");
    const courseId = searchParams.get("courseId");

    const where: any = {};

    if (userId) {
      where.studentId = userId;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        student: {
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
            totalHours: true,
            imageUrl: true,
            tutor: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}
