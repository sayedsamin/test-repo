/**
 * Integration tests for /api/courses route (GET and POST)
 * These tests use a REAL database
 */

import { GET, POST } from "./route";
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

describe("/api/courses - Integration Tests", () => {
  let testTutor: any;
  let testLearner: any;
  let testCategory: any;

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

    testLearner = await prisma.user.findUnique({
      where: { email: "learner@test.com" },
    });

    // Create tutor profile
    const tutorProfile = await prisma.tutor.create({
      data: {
        userId: testTutor.id,
        bio: "Experienced tutor",
      },
    });

    testTutor.tutorId = tutorProfile.id;

    // Create test category
    testCategory = await prisma.courseCategory.create({
      data: {
        name: "Programming",
      },
    });
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe("GET /api/courses", () => {
    beforeEach(async () => {
      // Create test courses
      await prisma.course.createMany({
        data: [
          {
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
          {
            tutorId: testTutor.tutorId,
            title: "Advanced React",
            shortDescription: "Master React development",
            overview: "Advanced React concepts and patterns",
            difficulty: "advanced",
            prerequisites: ["JavaScript", "HTML", "CSS"],
            skillsLearned: ["React", "Redux", "Testing"],
            totalHours: 40,
            schedule: [
              {
                days: ["tuesday", "thursday"],
                startTime: "18:00",
                endTime: "20:00",
                timezone: "UTC",
              },
            ],
            zoomLink: "https://zoom.us/j/987654321",
            categoryId: testCategory.id,
            trialRate: 50.0,
            fullCourseRate: 400.0,
          },
        ],
      });
    });

    describe("Successful Requests", () => {
      it("should return all courses with default pagination", async () => {
        const request = createMockRequest("http://localhost:3000/api/courses");

        const response = await GET(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.courses).toHaveLength(2);
        expect(data.data.pagination).toEqual({
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        });
      });

      it("should include tutor and category information", async () => {
        const request = createMockRequest("http://localhost:3000/api/courses");

        const response = await GET(request);
        const data = await getResponseJson(response);

        const course = data.data.courses[0];
        expect(course.tutor).toBeDefined();
        expect(course.tutor.user).toBeDefined();
        expect(course.tutor.user.name).toBe("Test Tutor");
        expect(course.category).toBeDefined();
        expect(course.category.name).toBe("Programming");
        expect(course._count).toBeDefined();
        expect(course._count.enrollments).toBeDefined();
        expect(course._count.reviews).toBeDefined();
      });

      it("should filter by search term", async () => {
        const request = createMockRequest(
          "http://localhost:3000/api/courses?search=JavaScript"
        );

        const response = await GET(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.data.courses).toHaveLength(1);
        expect(data.data.courses[0].title).toBe("JavaScript Basics");
      });

      it("should filter by difficulty", async () => {
        const request = createMockRequest(
          "http://localhost:3000/api/courses?difficulty=advanced"
        );

        const response = await GET(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.data.courses).toHaveLength(1);
        expect(data.data.courses[0].title).toBe("Advanced React");
        expect(data.data.courses[0].difficulty).toBe("advanced");
      });

      it("should handle pagination", async () => {
        const request = createMockRequest(
          "http://localhost:3000/api/courses?page=1&limit=1"
        );

        const response = await GET(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.data.courses).toHaveLength(1);
        expect(data.data.pagination).toEqual({
          page: 1,
          limit: 1,
          total: 2,
          totalPages: 2,
        });
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 for invalid page parameter", async () => {
        const request = createMockRequest(
          "http://localhost:3000/api/courses?page=0"
        );

        const response = await GET(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data.error).toBe("Invalid query parameters");
      });

      it("should return 400 for invalid difficulty", async () => {
        const request = createMockRequest(
          "http://localhost:3000/api/courses?difficulty=invalid"
        );

        const response = await GET(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data.error).toBe("Invalid query parameters");
      });
    });
  });

  describe("POST /api/courses", () => {
    const validCourseData = {
      title: "New Course",
      shortDescription: "A new course description",
      overview: "Detailed overview of the new course",
      difficulty: "intermediate" as const,
      prerequisites: ["Basic programming"],
      skillsLearned: ["New skill", "Another skill"],
      totalHours: 30,
      schedule: [
        {
          days: ["monday", "friday"],
          startTime: "10:00",
          endTime: "12:00",
          timezone: "UTC",
        },
      ],
      zoomLink: "https://zoom.us/j/newcourse",
      trialRate: 30.0,
      fullCourseRate: 250.0,
    };

    describe("Successful Creation", () => {
      it("should create course successfully for authenticated tutor", async () => {
        const { verifyAuth } = require("@/lib/middleware/auth");
        (verifyAuth as jest.Mock).mockResolvedValue({
          success: true,
          data: { userId: testTutor.id, role: "tutor" },
        });

        const request = createAuthRequest(
          "http://localhost:3000/api/courses",
          testTutor.id,
          {
            method: "POST",
            body: validCourseData,
          }
        );

        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.message).toBe("Course created successfully");
        expect(data.data.title).toBe(validCourseData.title);
        expect(data.data.tutorId).toBe(testTutor.tutorId);
      });
    });

    describe("Authentication Errors", () => {
      it("should return 401 for unauthenticated request", async () => {
        const { verifyAuth } = require("@/lib/middleware/auth");
        (verifyAuth as jest.Mock).mockResolvedValue({
          success: false,
          error: "Invalid token",
        });

        const request = createMockRequest("http://localhost:3000/api/courses", {
          method: "POST",
          body: validCourseData,
        });

        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data.error).toBe("Invalid token");
      });

      it("should return 403 for learner trying to create course", async () => {
        const { verifyAuth } = require("@/lib/middleware/auth");
        (verifyAuth as jest.Mock).mockResolvedValue({
          success: true,
          data: { userId: testLearner.id, role: "learner" },
        });

        const request = createAuthRequest(
          "http://localhost:3000/api/courses",
          testLearner.id,
          {
            method: "POST",
            body: validCourseData,
          }
        );

        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(403);
        expect(data.error).toBe("Only tutors can create courses");
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 for missing required fields", async () => {
        const { verifyAuth } = require("@/lib/middleware/auth");
        (verifyAuth as jest.Mock).mockResolvedValue({
          success: true,
          data: { userId: testTutor.id, role: "tutor" },
        });

        const invalidData = {
          title: "Test Course",
          // Missing required fields
        };

        const request = createAuthRequest(
          "http://localhost:3000/api/courses",
          testTutor.id,
          {
            method: "POST",
            body: invalidData,
          }
        );

        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data.error).toBe("Validation failed");
        expect(data.details).toBeDefined();
      });
    });
  });
});
