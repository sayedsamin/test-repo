import prisma from "@/lib/prisma";
import { generateToken } from "@/lib/auth";

/**
 * Clean up the test database
 */
export async function cleanDatabase() {
  // Delete in order to respect foreign key constraints
  await prisma.review.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.enrollment.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.courseCategory.deleteMany({});
  await prisma.tutor.deleteMany({});
  await prisma.user.deleteMany({});
}

/**
 * Create a test user and return auth token
 */
export async function createTestUser(data: {
  name: string;
  email: string;
  password: string;
  role: "tutor" | "learner";
  bio?: string;
  profileImageUrl?: string;
}) {
  const user = await prisma.user.create({
    data,
  });

  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return { user, token };
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase() {
  await prisma.$disconnect();
}
