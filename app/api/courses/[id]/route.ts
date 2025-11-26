import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { updateCourseSchema } from "@/lib/validations/course";
import { verifyAuth } from "@/lib/middleware/auth";

// GET /api/courses/[id] - Get a specific course
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
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
        category: true,
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                profileImageUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[id] - Update a specific course
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  console.log("========== PUT /api/courses/[id] called ==========");
  try {
    const params = await context.params;
    const { id } = params;
    console.log("Course ID to update:", id);
    
    // Verify authentication
    const authResult = await verifyAuth(request);
    console.log("Auth result:", authResult);
    
    if (!authResult.success) {
      console.log("Auth failed, returning 401");
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { userId, role } = authResult.data!;

    // Only tutors can update courses
    if (role !== "tutor") {
      return NextResponse.json(
        { error: "Only tutors can update courses" },
        { status: 403 }
      );
    }

    // Check if course exists and belongs to the tutor
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        tutor: true,
      },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (existingCourse.tutor.userId !== userId) {
      return NextResponse.json(
        { error: "You can only update your own courses" },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log("Received update request body:", body);
    console.log("Body keys:", Object.keys(body));
    console.log("Body imageUrl:", body.imageUrl, "Type:", typeof body.imageUrl);
    console.log("Body startDate:", body.startDate, "Type:", typeof body.startDate);
    console.log("Body endDate:", body.endDate, "Type:", typeof body.endDate);

    // Clean up empty strings to undefined
    const cleanedBody = Object.fromEntries(
      Object.entries(body).map(([key, value]) => [
        key,
        value === '' ? undefined : value
      ])
    );
    console.log("Cleaned body:", cleanedBody);
    console.log("Cleaned imageUrl:", cleanedBody.imageUrl, "Type:", typeof cleanedBody.imageUrl);

    // Validate request body
    const validationResult = updateCourseSchema.safeParse(cleanedBody);

    if (!validationResult.success) {
      console.error("Validation failed for course update:", validationResult.error.issues);
      console.error("Full validation error:", JSON.stringify(validationResult.error, null, 2));
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;
    console.log("Update data after validation:", updateData);

    // Update course
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
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
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update course";
    return NextResponse.json(
      { 
        error: "Failed to update course",
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete a specific course
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { userId, role } = authResult.data!;
    const { id } = params;

    // Only tutors can delete courses
    if (role !== "tutor") {
      return NextResponse.json(
        { error: "Only tutors can delete courses" },
        { status: 403 }
      );
    }

    // Check if course exists and belongs to the tutor
    const existingCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        tutor: true,
        _count: {
          select: {
            enrollments: true,
            bookings: true,
          },
        },
      },
    });

    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (existingCourse.tutor.userId !== userId) {
      return NextResponse.json(
        { error: "You can only delete your own courses" },
        { status: 403 }
      );
    }

    // Check if course has active enrollments or bookings
    if (
      existingCourse._count.enrollments > 0 ||
      existingCourse._count.bookings > 0
    ) {
      return NextResponse.json(
        { error: "Cannot delete course with active enrollments or bookings" },
        { status: 400 }
      );
    }

    // Delete course
    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
