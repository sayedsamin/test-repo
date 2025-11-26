import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  console.log("Auth header:", authHeader ? "Present" : "Missing");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("Invalid auth header format");
    return null;
  }

  const token = authHeader.split(" ")[1];
  console.log("Token extracted:", token ? "Yes" : "No");
  
  try {
    const decoded = verify(token, JWT_SECRET) as { userId: string };
    console.log("Token decoded successfully. UserId:", decoded.userId);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { tutor: true },
    });
    
    console.log("User found:", user ? "Yes" : "No");
    console.log("User has tutor profile:", user?.tutor ? "Yes" : "No");
    
    return user;
  } catch (error) {
    console.error("Token verification error:", error instanceof Error ? error.message : "Unknown error");
    return null;
  }
}

// GET /api/tutors/profile - Get current tutor's profile
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      console.log("User not authenticated - returning 401");
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }

    console.log("User authenticated:", user.id, user.role);

    if (user.role !== "tutor") {
      console.log("User is not a tutor");
      return NextResponse.json(
        { error: "User is not a tutor" },
        { status: 403 }
      );
    }

    // If tutor profile doesn't exist, create one
    if (!user.tutor) {
      console.log("Tutor profile not found, creating new profile");
      const newTutorProfile = await prisma.tutor.create({
        data: {
          userId: user.id,
          bio: "",
          hourlyRate: 0,
          specialties: [],
          availability: "",
          sessionDuration: "",
          language: "",
          timezone: "",
        },
      });

      console.log("New tutor profile created:", newTutorProfile.id);
      
      return NextResponse.json({
        success: true,
        data: {
          ...user,
          ...newTutorProfile,
        },
      });
    }

    console.log("Returning tutor profile");
    return NextResponse.json({
      success: true,
      data: {
        ...user,
        ...user.tutor,
      },
    });
  } catch (error) {
    console.error("Error fetching tutor profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch tutor profile" },
      { status: 500 }
    );
  }
}

// PATCH /api/tutors/profile - Update current tutor's profile
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "tutor") {
      return NextResponse.json(
        { error: "User is not a tutor" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      bio,
      profileImageUrl,
      hourlyRate,
      specialties,
      availability,
      sessionDuration,
      language,
      timezone,
    } = body;

    // If tutor profile doesn't exist, create it
    let tutorProfile = user.tutor;
    if (!tutorProfile) {
      console.log("Tutor profile not found, creating new profile during update");
      tutorProfile = await prisma.tutor.create({
        data: {
          userId: user.id,
          bio: bio || "",
          hourlyRate: hourlyRate ? parseFloat(hourlyRate) : 0,
          specialties: specialties || [],
          availability: availability || "",
          sessionDuration: sessionDuration || "",
          language: language || "",
          timezone: timezone || "",
        },
      });

      // Update user info if provided
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(name && { name }),
          ...(profileImageUrl !== undefined && { profileImageUrl }),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...updatedUser,
          ...tutorProfile,
        },
        message: "Profile created successfully",
      });
    }

    // Update user info
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(profileImageUrl !== undefined && { profileImageUrl }),
      },
    });

    // Update tutor profile
    const updatedTutor = await prisma.tutor.update({
      where: { id: tutorProfile.id },
      data: {
        ...(bio && { bio }),
        ...(hourlyRate !== undefined && { hourlyRate: parseFloat(hourlyRate) }),
        ...(specialties && { specialties }),
        ...(availability && { availability }),
        ...(sessionDuration && { sessionDuration }),
        ...(language && { language }),
        ...(timezone && { timezone }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...updatedUser,
        ...updatedTutor,
      },
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating tutor profile:", error);
    return NextResponse.json(
      { error: "Failed to update tutor profile" },
      { status: 500 }
    );
  }
}
