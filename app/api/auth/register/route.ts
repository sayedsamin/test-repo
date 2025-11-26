import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createUserSchema } from "@/lib/validations/user";

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = createUserSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, email, password, role, bio, profileImageUrl } =
      validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // TODO: In production, hash the password with bcrypt
    // const bcrypt = require('bcrypt');
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // In production, use hashedPassword
        role,
        profileImageUrl,
        // If role is tutor, create the tutor profile
        ...(role === "tutor" && bio
          ? {
              tutor: {
                create: {
                  bio: bio,
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImageUrl: true,
        createdAt: true,
        tutor: {
          select: {
            id: true,
            bio: true,
          },
        },
        // Exclude password
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...user,
          bio: user.tutor?.bio || null,
          tutorId: user.tutor?.id || null, // Include tutor ID for easy access
        },
        message: "User registered successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}
