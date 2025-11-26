import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/tutors - Get all tutors
export async function GET(request: NextRequest) {
  try {
    const tutors = await prisma.tutor.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImageUrl: true,
          },
        },
        courses: {
          select: {
            id: true,
            title: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        },
        reviewsReceived: {
          where: {
            status: "accepted",
          },
          select: {
            rating: true,
          },
        },
        bookings: {
          where: {
            status: "completed",
          },
          select: {
            learnerId: true,
          },
        },
      },
    });

    // Transform the data to match the expected format
    const formattedTutors = tutors.map((tutor) => {
      // Calculate average rating
      const ratings = tutor.reviewsReceived.map((r: any) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
          : 0;

      // Count unique students
      const uniqueStudents = new Set(tutor.bookings.map((b: any) => b.learnerId));

      // Extract specialties from courses or use the tutor's specialties field
      const specialties = tutor.specialties && tutor.specialties.length > 0 
        ? tutor.specialties 
        : tutor.courses.map((c: any) => c.category?.name || c.title).filter(Boolean);

      return {
        id: tutor.id,
        name: tutor.user.name,
        email: tutor.user.email,
        bio: tutor.bio,
        avatar: tutor.user.profileImageUrl || "/placeholder.svg",
        hourlyRate: tutor.hourlyRate || 25,
        rating: parseFloat(avgRating.toFixed(1)),
        totalReviews: tutor.reviewsReceived.length,
        studentsCount: uniqueStudents.size,
        specialties: specialties.slice(0, 5), // Limit to 5 specialties
        availability: tutor.availability || "Flexible - All days",
        sessionDuration: tutor.sessionDuration || "1 hour",
        language: tutor.language || "English",
        timezone: tutor.timezone || "UTC-08:00 Pacific Time",
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedTutors,
    });
  } catch (error) {
    console.error("Error fetching tutors:", error);
    return NextResponse.json(
      { error: "Failed to fetch tutors" },
      { status: 500 }
    );
  }
}
