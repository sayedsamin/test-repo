import { NextRequest } from "next/server";

/**
 * Create a mock NextRequest object for testing
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
): NextRequest {
  const { method = "GET", body, headers = {} } = options;

  const request = new NextRequest(url, {
    method,
    headers: new Headers(headers),
    ...(body && { body: JSON.stringify(body) }),
  });

  return request;
}

/**
 * Create a mock authenticated request with JWT token
 */
export function createAuthRequest(
  url: string,
  userId: string = "test-user-id",
  options: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  } = {}
): NextRequest {
  const headers = {
    ...options.headers,
  };

  // If Authorization header not provided, add a default one
  if (!headers.Authorization) {
    headers.Authorization = `Bearer test-token-${userId}`;
  }

  return createMockRequest(url, { ...options, headers });
}

/**
 * Extract JSON response from NextResponse
 */
export async function getResponseJson(response: Response): Promise<any> {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/**
 * Mock user data for testing
 */
export const mockUser = {
  id: "user123",
  name: "Test User",
  email: "test@example.com",
  password: "hashedpassword",
  role: "tutor" as const,
  bio: "Test bio",
  profileImageUrl: "https://example.com/image.jpg",
  createdAt: new Date("2024-01-01"),
};

export const mockUsers = [
  mockUser,
  {
    id: "user456",
    name: "Another User",
    email: "another@example.com",
    password: "hashedpassword",
    role: "learner" as const,
    bio: null,
    profileImageUrl: null,
    createdAt: new Date("2024-01-02"),
  },
];
