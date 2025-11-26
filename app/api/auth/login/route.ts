import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { generateToken } from "@/lib/auth";

// POST /api/auth/login - Login user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tutor: true, // Include tutor data if user is a tutor
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // TODO: In production, compare hashed password with bcrypt
    // const bcrypt = require('bcrypt');
    // const isPasswordValid = await bcrypt.compare(password, user.password);

    // For now, direct comparison (NOT FOR PRODUCTION)
    if (user.password !== password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user data and token (exclude password)
    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            bio: user.tutor?.bio || null,
            profileImageUrl: user.profileImageUrl,
            createdAt: user.createdAt,
            tutorId: user.tutor?.id || null, // Include tutor ID for easy access
          },
          token,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error logging in user:", error);
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}
