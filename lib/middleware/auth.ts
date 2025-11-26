import { NextRequest } from "next/server";
import { verifyToken, extractBearerToken } from "@/lib/auth";

export interface AuthResult {
  success: boolean;
  data?: {
    userId: string;
    email: string;
    role: string;
  };
  error?: string;
}

/**
 * Verify authentication from NextRequest
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = extractBearerToken(authHeader || "");

    if (!token) {
      return {
        success: false,
        error: "Authorization token required",
      };
    }

    const payload = verifyToken(token);

    return {
      success: true,
      data: {
        userId: payload.userId,
        email: payload.email || "",
        role: payload.role || "",
      },
    };
  } catch (error) {
    return {
      success: false,
      error: "Invalid or expired token",
    };
  }
}
