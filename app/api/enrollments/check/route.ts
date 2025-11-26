import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Check enrollment status for debugging
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");
    const userId = searchParams.get("userId");

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 }
      );
    }

    // Get the course with enrollments
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
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
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // If userId provided, check if that user is enrolled
    let userEnrollment = null;
    if (userId) {
      userEnrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: userId,
            courseId: courseId,
          },
        },
        include: {
          student: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        course: {
          id: course.id,
          title: course.title,
          tutorId: course.tutorId,
          tutor: course.tutor.user,
        },
        enrollmentsCount: course.enrollments.length,
        enrollments: course.enrollments,
        userEnrollment: userEnrollment,
      },
    });
  } catch (error) {
    console.error("Error checking enrollment:", error);
    return NextResponse.json(
      { 
        error: "Failed to check enrollment",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
