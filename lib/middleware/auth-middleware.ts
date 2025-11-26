import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractBearerToken } from "../auth";

/**
 * Middleware to protect API routes with JWT authentication
 * Usage: wrap your API route handler with this middleware
 */
export function withAuth(
  handler: (
    req: NextRequest,
    context: { userId: string },
    ...args: any[]
  ) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get("Authorization");
      const token = extractBearerToken(authHeader || "");

      if (!token) {
        return NextResponse.json(
          { error: "No token provided" },
          { status: 401 }
        );
      }

      const payload = verifyToken(token);

      // Pass the verified user information and all other args to the handler
      return await handler(req, { userId: payload.userId }, ...args);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }
  };
}
