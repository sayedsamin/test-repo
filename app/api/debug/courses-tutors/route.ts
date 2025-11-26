import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Debug endpoint to check course-tutor relationships
export async function GET(request: NextRequest) {
  try {
    // Get all courses with their tutor info
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        tutorId: true,
        tutor: {
          select: {
            id: true,
            userId: true,
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

    // Get all tutors
    const tutors = await prisma.tutor.findMany({
      select: {
        id: true,
        userId: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            courses: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        courses: courses.map(c => ({
          id: c.id,
          title: c.title,
          tutorId: c.tutorId,
          tutorName: c.tutor?.user?.name || "NO TUTOR",
          tutorEmail: c.tutor?.user?.email || "NO EMAIL",
        })),
        tutors: tutors.map(t => ({
          id: t.id,
          userId: t.userId,
          name: t.user.name,
          email: t.user.email,
          courseCount: t._count.courses,
        })),
      },
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    return NextResponse.json(
      { error: "Debug query failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
