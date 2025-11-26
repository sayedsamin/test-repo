import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  createCourseSchema,
  courseQuerySchema,
} from "@/lib/validations/course";
import { verifyAuth } from "@/lib/middleware/auth";

// GET /api/courses - Get all courses with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validationResult = courseQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid query parameters",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { page, limit, search, difficulty, categoryId, tutorId, userId, createdAfter, createdBefore } =
      validationResult.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { shortDescription: { contains: search } },
        { overview: { contains: search } },
      ];
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tutorId) {
      where.tutorId = tutorId;
    }

    // If userId is provided, find the corresponding tutor and filter by tutorId
    if (userId) {
      const tutor = await prisma.tutor.findUnique({
        where: { userId: userId },
      });
      if (tutor) {
        where.tutorId = tutor.id;
      } else {
        // If no tutor found for this userId, return empty results
        where.tutorId = "non-existent-id";
      }
    }

    // Filter by creation date
    if (createdAfter || createdBefore) {
      where.createdAt = {};
      if (createdAfter) {
        where.createdAt.gte = new Date(createdAfter);
      }
      if (createdBefore) {
        where.createdAt.lte = new Date(createdBefore);
      }
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
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
          enrollments: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImageUrl: true,
                },
              },
            },
          },
          _count: {
            select: {
              enrollments: true,
              reviews: true,
              bookings: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.course.count({ where }),
    ]);

    console.log("Fetched courses count:", courses.length);
    console.log("Courses with tutorId:", courses.map(c => ({ id: c.id, title: c.title, tutorId: c.tutorId })));

    return NextResponse.json({
      success: true,
      data: {
        courses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    console.error("Error details:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { 
        error: "Failed to fetch courses",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { userId, role } = authResult.data!;

    // Only tutors can create courses
    if (role !== "tutor") {
      return NextResponse.json(
        { error: "Only tutors can create courses" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = createCourseSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    // Get tutor record or create one if it doesn't exist
    let tutor = await prisma.tutor.findUnique({
      where: { userId },
    });

    if (!tutor) {
      // Auto-create tutor profile if it doesn't exist
      console.log("Tutor profile not found for userId:", userId, "- creating one");
      tutor = await prisma.tutor.create({
        data: {
          userId,
          bio: "",
          hourlyRate: 25,
          specialties: [],
          availability: "Flexible - All days",
          sessionDuration: "1 hour",
          language: "English",
          timezone: "UTC-08:00 Pacific Time",
        },
      });
    }

    const courseData = validationResult.data;

    // Create course
    const course = await prisma.course.create({
      data: {
        ...courseData,
        tutorId: tutor.id,
        zoomLink: courseData.zoomLink || null,
        startDate: courseData.startDate || null,
        endDate: courseData.endDate || null,
      },
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

    return NextResponse.json(
      {
        success: true,
        message: "Course created successfully",
        data: course,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
