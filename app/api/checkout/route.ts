import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface CheckoutRequest {
  courseId: string;
  courseName: string;
  amount: number; // in CAD dollars
  userId: string;
  userEmail: string;
  userRole?: string;
  paymentType?: "session" | "enrollment"; // "session" for single class, "enrollment" for full course
  sessionDate?: string; // Required for session bookings
  sessionType?: "individual" | "group"; // Session type for bookings
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();

    const { courseId, courseName, amount, userId, userEmail, userRole, paymentType = "enrollment", sessionDate, sessionType = "individual" } = body;

    // Validate required fields
    if (!courseId || !courseName || !amount || !userId || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields: courseId, courseName, amount, userId, userEmail" },
        { status: 400 }
      );
    }

    // Validate session date for session bookings
    if (paymentType === "session" && !sessionDate) {
      return NextResponse.json(
        { error: "Session date is required for session bookings" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please create an account first." },
        { status: 404 }
      );
    }

    // Check if user is a learner
    if (user.role !== "learner") {
      return NextResponse.json(
        { error: "Only learners can enroll in courses. Please sign up as a learner." },
        { status: 403 }
      );
    }

    // Check if the course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        tutor: {
          include: {
            user: true,
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

    // Only check for enrollment if this is a full course enrollment payment
    // Session bookings don't require enrollment check
    if (paymentType === "enrollment") {
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: userId,
            courseId: courseId,
          },
        },
      });

      if (existingEnrollment) {
        return NextResponse.json(
          { error: "You are already enrolled in this course" },
          { status: 400 }
        );
      }
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    // Convert CAD dollars to cents for Stripe
    const amountInCents = Math.round(amount * 100);
    
    // Create appropriate description based on payment type
    const description = paymentType === "session" 
      ? `Book a session for ${courseName} with ${course.tutor.user.name}`
      : `Enroll in ${courseName} by ${course.tutor.user.name}`;
    
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: userEmail,
      client_reference_id: userId,
      line_items: [
        {
          price_data: {
            currency: "cad", // CAD only
            unit_amount: amountInCents,
            product_data: { 
              name: courseName,
              description: description,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        courseId: courseId,
        userId: userId,
        tutorId: course.tutorId,
        amount: amount.toString(),
        paymentType: paymentType,
        sessionDate: sessionDate || "",
        sessionType: sessionType,
      },
      success_url: `${
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
      }/success?sessionId={CHECKOUT_SESSION_ID}&courseId=${courseId}`,
      cancel_url: `${
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
      }/course/${courseId}`,
    });

    // Return the hosted Checkout URL for a simple client-side redirect
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
