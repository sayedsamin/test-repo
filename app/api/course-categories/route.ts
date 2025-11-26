import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/course-categories - Get all course categories
export async function GET(_request: NextRequest) {
  try {
    const categories = await prisma.courseCategory.findMany({
      include: {
        _count: {
          select: {
            courses: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching course categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch course categories" },
      { status: 500 }
    );
  }
}
