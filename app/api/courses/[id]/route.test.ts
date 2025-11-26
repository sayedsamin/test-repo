/**
 * Integration tests for /api/courses/[id] route (GET, PUT, DELETE)
 * These tests use a REAL database
 */

import { GET, PUT, DELETE } from "./route";
import prisma from "@/lib/prisma";
import { cleanDatabase } from "@/__tests__/setup/test-db";
import {
  createMockRequest,
  createAuthRequest,
  getResponseJson,
} from "@/__tests__/utils/test-helpers";

// Mock the auth middleware
jest.mock("@/lib/middleware/auth");

// Increase timeout for database operations
jest.setTimeout(60000);

describe("/api/courses/[id] - Integration Tests", () => {
  let testTutor: any;
  let testLearner: any;
  let testCategory: any;
  let testCourse: any;
  let anotherTutor: any;

  beforeEach(async () => {
    await cleanDatabase();

    // Create test users
    const users = await prisma.user.createMany({
      data: [
        {
          name: "Test Tutor",
          email: "tutor@test.com",
          password: "password123",
          role: "tutor",
        },
        {
          name: "Another Tutor",
          email: "tutor2@test.com",
          password: "password123",
          role: "tutor",
        },
        {
          name: "Test Learner",
          email: "learner@test.com",
          password: "password123",
          role: "learner",
        },
      ],
    });

    testTutor = await prisma.user.findUnique({
      where: { email: "tutor@test.com" },
    });

    anotherTutor = await prisma.user.findUnique({
      where: { email: "tutor2@test.com" },
    });

    testLearner = await prisma.user.findUnique({
      where: { email: "learner@test.com" },
    });

    // Create tutor profiles
    const tutorProfile = await prisma.tutor.create({
      data: {
        userId: testTutor.id,
        bio: "Experienced tutor",
      },
    });

    const anotherTutorProfile = await prisma.tutor.create({
      data: {
        userId: anotherTutor.id,
        bio: "Another experienced tutor",
      },
    });

    testTutor.tutorId = tutorProfile.id;
    anotherTutor.tutorId = anotherTutorProfile.id;

    // Create test category
    testCategory = await prisma.courseCategory.create({
      data: {
        name: "Programming",
      },
    });

    // Create test course
    testCourse = await prisma.course.create({
      data: {
        tutorId: testTutor.tutorId,
        title: "JavaScript Basics",
        shortDescription: "Learn JavaScript fundamentals",
        overview: "Complete JavaScript course for beginners",
        difficulty: "beginner",
        prerequisites: [],
        skillsLearned: ["JavaScript", "Programming"],
        totalHours: 20,
        schedule: [
          {
            days: ["monday", "wednesday"],
            startTime: "14:00",
            endTime: "16:00",
            timezone: "UTC",
          },
        ],
        zoomLink: "https://zoom.us/j/123456789",
        categoryId: testCategory.id,
        trialRate: 25.0,
        fullCourseRate: 200.0,
      },
    });
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe("GET /api/courses/[id]", () => {
    describe("Successful Requests", () => {
      it("should return course details for valid ID", async () => {
        const request = createMockRequest(
          `http://localhost:3000/api/courses/${testCourse.id}`
        );

        const response = await GET(request, { params: { id: testCourse.id } });
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.id).toBe(testCourse.id);
        expect(data.data.title).toBe("JavaScript Basics");
      });

      it("should include tutor information", async () => {
        const request = createMockRequest(
          `http://localhost:3000/api/courses/${testCourse.id}`
        );

        const response = await GET(request, { params: { id: testCourse.id } });
        const data = await getResponseJson(response);

        expect(data.data.tutor).toBeDefined();
        expect(data.data.tutor.user).toBeDefined();
        expect(data.data.tutor.user.name).toBe("Test Tutor");
        expect(data.data.tutor.user).not.toHaveProperty("password");
      });

      it("should include category and reviews", async () => {
        const request = createMockRequest(
          `http://localhost:3000/api/courses/${testCourse.id}`
        );

        const response = await GET(request, { params: { id: testCourse.id } });
        const data = await getResponseJson(response);

        expect(data.data.category).toBeDefined();
        expect(data.data.category.name).toBe("Programming");
        expect(data.data.reviews).toBeDefined();
        expect(Array.isArray(data.data.reviews)).toBe(true);
        expect(data.data._count).toBeDefined();
      });
    });

    describe("Error Cases", () => {
      it("should return 404 for non-existent course", async () => {
        const nonExistentId = "507f1f77bcf86cd799439011";
        const request = createMockRequest(
          `http://localhost:3000/api/courses/${nonExistentId}`
        );

        const response = await GET(request, { params: { id: nonExistentId } });
        const data = await getResponseJson(response);

        expect(response.status).toBe(404);
        expect(data.error).toBe("Course not found");
      });
    });
  });

  describe("PUT /api/courses/[id]", () => {
    const updateData = {
      title: "Updated JavaScript Course",
      shortDescription: "Updated description",
      trialRate: 35.0,
    };

    describe("Successful Updates", () => {
      it("should update course successfully for course owner", async () => {
        const { verifyAuth } = require("@/lib/middleware/auth");
        (verifyAuth as jest.Mock).mockResolvedValue({
          success: true,
          data: { userId: testTutor.id, role: "tutor" },
        });

        const request = createAuthRequest(
          `http://localhost:3000/api/courses/${testCourse.id}`,
          testTutor.id,
          {
            method: "PUT",
            body: updateData,
          }
        );

        const response = await PUT(request, { params: { id: testCourse.id } });
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toBe("Course updated successfully");
        expect(data.data.title).toBe(updateData.title);
        expect(data.data.shortDescription).toBe(updateData.shortDescription);
        expect(data.data.trialRate).toBe(updateData.trialRate);
      });

      it("should update only provided fields", async () => {
        const { verifyAuth } = require("@/lib/middleware/auth");
        (verifyAuth as jest.Mock).mockResolvedValue({
          success: true,
          data: { userId: testTutor.id, role: "tutor" },
        });

        const partialUpdate = {
          title: "Partially Updated Course",
        };

        const request = createAuthRequest(
          `http://localhost:3000/api/courses/${testCourse.id}`,
          testTutor.id,
          {
            method: "PUT",
            body: partialUpdate,
          }
        );

        const response = await PUT(request, { params: { id: testCourse.id } });
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.data.title).toBe(partialUpdate.title);
        expect(data.data.shortDescription).toBe(
          "Learn JavaScript fundamentals"
        ); // Original value
      });
    });

    describe("Authentication and Authorization Errors", () => {
      it("should return 401 for unauthenticated request", async () => {
        const { verifyAuth } = require("@/lib/middleware/auth");
        (verifyAuth as jest.Mock).mockResolvedValue({
          success: false,
          error: "Invalid token",
        });

        const request = createMockRequest(
          `http://localhost:3000/api/courses/${testCourse.id}`,
          {
            method: "PUT",
            body: updateData,
          }
        );

        const response = await PUT(request, { params: { id: testCourse.id } });
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data.error).toBe("Invalid token");
      });

      it("should return 403 for different tutor trying to update course", async () => {
        const { verifyAuth } = require("@/lib/middleware/auth");
        (verifyAuth as jest.Mock).mockResolvedValue({
          success: true,
          data: { userId: anotherTutor.id, role: "tutor" },
        });

        const request = createAuthRequest(
          `http://localhost:3000/api/courses/${testCourse.id}`,
          anotherTutor.id,
          {
            method: "PUT",
            body: updateData,
          }
        );

        const response = await PUT(request, { params: { id: testCourse.id } });
        const data = await getResponseJson(response);

        expect(response.status).toBe(403);
        expect(data.error).toBe("You can only update your own courses");
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 for invalid update data", async () => {
        const { verifyAuth } = require("@/lib/middleware/auth");
        (verifyAuth as jest.Mock).mockResolvedValue({
          success: true,
          data: { userId: testTutor.id, role: "tutor" },
        });

        const invalidData = {
          difficulty: "invalid-difficulty",
          trialRate: -10,
        };

        const request = createAuthRequest(
          `http://localhost:3000/api/courses/${testCourse.id}`,
          testTutor.id,
          {
            method: "PUT",
            body: invalidData,
          }
        );

        const response = await PUT(request, { params: { id: testCourse.id } });
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data.error).toBe("Validation failed");
        expect(data.details).toBeDefined();
      });
    });
  });

  describe("DELETE /api/courses/[id]", () => {
    describe("Successful Deletion", () => {
      it("should delete course successfully for course owner", async () => {
        const { verifyAuth } = require("@/lib/middleware/auth");
        (verifyAuth as jest.Mock).mockResolvedValue({
          success: true,
          data: { userId: testTutor.id, role: "tutor" },
        });

        const request = createAuthRequest(
          `http://localhost:3000/api/courses/${testCourse.id}`,
          testTutor.id,
          {
            method: "DELETE",
          }
        );

        const response = await DELETE(request, {
          params: { id: testCourse.id },
        });
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toBe("Course deleted successfully");

        // Verify course is actually deleted
        const deletedCourse = await prisma.course.findUnique({
          where: { id: testCourse.id },
        });
        expect(deletedCourse).toBeNull();
      });
    });

    describe("Authentication and Authorization Errors", () => {
      it("should return 401 for unauthenticated request", async () => {
        const { verifyAuth } = require("@/lib/middleware/auth");
        (verifyAuth as jest.Mock).mockResolvedValue({
          success: false,
          error: "Invalid token",
        });

        const request = createMockRequest(
          `http://localhost:3000/api/courses/${testCourse.id}`,
          {
            method: "DELETE",
          }
        );

        const response = await DELETE(request, {
          params: { id: testCourse.id },
        });
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data.error).toBe("Invalid token");
      });

      it("should return 403 for different tutor trying to delete course", async () => {
        const { verifyAuth } = require("@/lib/middleware/auth");
        (verifyAuth as jest.Mock).mockResolvedValue({
          success: true,
          data: { userId: anotherTutor.id, role: "tutor" },
        });

        const request = createAuthRequest(
          `http://localhost:3000/api/courses/${testCourse.id}`,
          anotherTutor.id,
          {
            method: "DELETE",
          }
        );

        const response = await DELETE(request, {
          params: { id: testCourse.id },
        });
        const data = await getResponseJson(response);

        expect(response.status).toBe(403);
        expect(data.error).toBe("You can only delete your own courses");
      });
    });

    describe("Business Logic Constraints", () => {
      it("should return 400 when trying to delete course with enrollments", async () => {
        const { verifyAuth } = require("@/lib/middleware/auth");
        (verifyAuth as jest.Mock).mockResolvedValue({
          success: true,
          data: { userId: testTutor.id, role: "tutor" },
        });

        // Create an enrollment for the course
        await prisma.enrollment.create({
          data: {
            studentId: testLearner.id,
            courseId: testCourse.id,
          },
        });

        const request = createAuthRequest(
          `http://localhost:3000/api/courses/${testCourse.id}`,
          testTutor.id,
          {
            method: "DELETE",
          }
        );

        const response = await DELETE(request, {
          params: { id: testCourse.id },
        });
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data.error).toBe(
          "Cannot delete course with active enrollments or bookings"
        );
      });
    });
  });
});
