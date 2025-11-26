/**
 * Integration tests for /api/auth/login route (POST login)
 * These tests use a REAL database
 */

import { POST } from "@/app/api/auth/login/route";
import prisma from "@/lib/prisma";
import { cleanDatabase } from "../../../setup/test-db";
import {
  createMockRequest,
  getResponseJson,
} from "../../../utils/test-helpers";
import { verifyToken } from "@/lib/auth";

describe("/api/auth/login - Integration Tests", () => {
  // Create test users before each test
  beforeEach(async () => {
    await cleanDatabase();

    // Create test users
    await prisma.user.createMany({
      data: [
        {
          name: "Test Tutor",
          email: "tutor@test.com",
          password: "password123",
          role: "tutor",
          bio: "Experienced tutor",
        },
        {
          name: "Test Learner",
          email: "learner@test.com",
          password: "password123",
          role: "learner",
        },
      ],
    });
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  describe("POST /api/auth/login", () => {
    describe("Successful Login", () => {
      it("should login tutor successfully with valid credentials", async () => {
        const loginData = {
          email: "tutor@test.com",
          password: "password123",
        };

        const request = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: loginData,
          }
        );

        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toBe("Login successful");
        expect(data.data).toHaveProperty("user");
        expect(data.data).toHaveProperty("token");
        expect(data.data.user.email).toBe(loginData.email);
        expect(data.data.user.role).toBe("tutor");
        expect(data.data.user).not.toHaveProperty("password");

        // Verify token is valid
        const decodedToken = verifyToken(data.data.token);
        expect(decodedToken.email).toBe(loginData.email);
        expect(decodedToken.role).toBe("tutor");
      });

      it("should login learner successfully with valid credentials", async () => {
        const loginData = {
          email: "learner@test.com",
          password: "password123",
        };

        const request = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: loginData,
          }
        );

        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.user.email).toBe(loginData.email);
        expect(data.data.user.role).toBe("learner");

        // Verify token contains correct role
        const decodedToken = verifyToken(data.data.token);
        expect(decodedToken.role).toBe("learner");
      });

      it("should return complete user information excluding password", async () => {
        const loginData = {
          email: "tutor@test.com",
          password: "password123",
        };

        const request = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: loginData,
          }
        );

        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(data.data.user).toHaveProperty("id");
        expect(data.data.user).toHaveProperty("name");
        expect(data.data.user).toHaveProperty("email");
        expect(data.data.user).toHaveProperty("role");
        expect(data.data.user).toHaveProperty("bio");
        expect(data.data.user).toHaveProperty("profileImageUrl");
        expect(data.data.user).toHaveProperty("createdAt");
        expect(data.data.user).not.toHaveProperty("password");
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 for missing email", async () => {
        const loginData = {
          password: "password123",
        };

        const request = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: loginData,
          }
        );

        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data.error).toBe("Validation failed");
        expect(data.details).toBeDefined();
        expect(Array.isArray(data.details)).toBe(true);
      });

      it("should return 400 for missing password", async () => {
        const loginData = {
          email: "tutor@test.com",
        };

        const request = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: loginData,
          }
        );

        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data.error).toBe("Validation failed");
      });

      it("should return 400 for invalid email format", async () => {
        const loginData = {
          email: "not-an-email",
          password: "password123",
        };

        const request = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: loginData,
          }
        );

        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data.error).toBe("Validation failed");
        expect(data.details.some((d: any) => d.path.includes("email"))).toBe(
          true
        );
      });

      it("should return 400 for password too short", async () => {
        const loginData = {
          email: "tutor@test.com",
          password: "123",
        };

        const request = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: loginData,
          }
        );

        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data.error).toBe("Validation failed");
        expect(data.details.some((d: any) => d.path.includes("password"))).toBe(
          true
        );
      });
    });

    describe("Authentication Errors", () => {
      it("should return 401 for non-existent email", async () => {
        const loginData = {
          email: "nonexistent@test.com",
          password: "password123",
        };

        const request = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: loginData,
          }
        );

        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data.error).toBe("Invalid email or password");
      });

      it("should return 401 for incorrect password", async () => {
        const loginData = {
          email: "tutor@test.com",
          password: "wrongpassword",
        };

        const request = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: loginData,
          }
        );

        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(401);
        expect(data.error).toBe("Invalid email or password");
      });

      it("should not reveal whether email exists in error message", async () => {
        // Try with non-existent email
        const request1 = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: {
              email: "nonexistent@test.com",
              password: "password123",
            },
          }
        );

        const response1 = await POST(request1);
        const data1 = await getResponseJson(response1);

        // Try with existing email but wrong password
        const request2 = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: {
              email: "tutor@test.com",
              password: "wrongpassword",
            },
          }
        );

        const response2 = await POST(request2);
        const data2 = await getResponseJson(response2);

        // Both should return the same generic error message
        expect(response1.status).toBe(401);
        expect(response2.status).toBe(401);
        expect(data1.error).toBe(data2.error);
        expect(data1.error).toBe("Invalid email or password");
      });
    });

    describe("Role Identification", () => {
      it("should correctly identify tutor role from email", async () => {
        const loginData = {
          email: "tutor@test.com",
          password: "password123",
        };

        const request = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: loginData,
          }
        );

        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.data.user.role).toBe("tutor");

        // Verify token includes role
        const decodedToken = verifyToken(data.data.token);
        expect(decodedToken.role).toBe("tutor");
      });

      it("should correctly identify learner role from email", async () => {
        const loginData = {
          email: "learner@test.com",
          password: "password123",
        };

        const request = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: loginData,
          }
        );

        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.data.user.role).toBe("learner");

        // Verify token includes role
        const decodedToken = verifyToken(data.data.token);
        expect(decodedToken.role).toBe("learner");
      });
    });

    describe("Token Generation", () => {
      it("should generate valid JWT token", async () => {
        const loginData = {
          email: "tutor@test.com",
          password: "password123",
        };

        const request = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: loginData,
          }
        );

        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(data.data.token).toBeDefined();
        expect(typeof data.data.token).toBe("string");

        // Token should be verifiable
        const decodedToken = verifyToken(data.data.token);
        expect(decodedToken).toBeDefined();
        expect(decodedToken.userId).toBeDefined();
        expect(decodedToken.email).toBe(loginData.email);
      });

      it("should include userId, email, and role in token", async () => {
        const loginData = {
          email: "tutor@test.com",
          password: "password123",
        };

        const request = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: loginData,
          }
        );

        const response = await POST(request);
        const data = await getResponseJson(response);

        const decodedToken = verifyToken(data.data.token);
        expect(decodedToken).toHaveProperty("userId");
        expect(decodedToken).toHaveProperty("email");
        expect(decodedToken).toHaveProperty("role");
        expect(decodedToken.email).toBe(loginData.email);
      });
    });

    describe("Edge Cases", () => {
      it("should handle empty request body", async () => {
        const request = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: {},
          }
        );

        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data.error).toBe("Validation failed");
      });

      it("should handle null values", async () => {
        const request = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: {
              email: null,
              password: null,
            },
          }
        );

        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(response.status).toBe(400);
        expect(data.error).toBe("Validation failed");
      });

      it("should handle email with different casing", async () => {
        const loginData = {
          email: "TUTOR@TEST.COM",
          password: "password123",
        };

        const request = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: loginData,
          }
        );

        const response = await POST(request);

        // This depends on database collation
        // MongoDB is case-sensitive by default
        expect([200, 401]).toContain(response.status);
      });

      it("should handle whitespace in credentials", async () => {
        const loginData = {
          email: "  tutor@test.com  ",
          password: "  password123  ",
        };

        const request = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: loginData,
          }
        );

        const response = await POST(request);

        // Behavior depends on validation and database
        // May return 200 (success), 400 (validation), or 401 (auth failure)
        expect([200, 400, 401]).toContain(response.status);
      });
    });

    describe("Security", () => {
      it("should never return password in response", async () => {
        const loginData = {
          email: "tutor@test.com",
          password: "password123",
        };

        const request = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: loginData,
          }
        );

        const response = await POST(request);
        const data = await getResponseJson(response);

        expect(data.data.user).not.toHaveProperty("password");
        const responseString = JSON.stringify(data);
        expect(responseString).not.toContain("password123");
      });

      it("should use same error message for wrong email and wrong password", async () => {
        const request1 = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: {
              email: "wrong@test.com",
              password: "password123",
            },
          }
        );

        const request2 = createMockRequest(
          "http://localhost:3000/api/auth/login",
          {
            method: "POST",
            body: {
              email: "tutor@test.com",
              password: "wrongpassword",
            },
          }
        );

        const response1 = await POST(request1);
        const response2 = await POST(request2);
        const data1 = await getResponseJson(response1);
        const data2 = await getResponseJson(response2);

        expect(data1.error).toBe(data2.error);
      });
    });
  });
});
