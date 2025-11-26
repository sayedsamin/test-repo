"use client";

import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { decodeToken } from "@/lib/auth";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  bio: string | null;
  profileImageUrl: string | null;
  userId?: string; // For backward compatibility with JWT payload
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const initializeAuth = () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          // Try to use stored user data first
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch {
          // If user data is invalid, try to decode token
          try {
            const decoded = decodeToken(token);
            if (decoded) {
              const user: User = {
                id: decoded.userId,
                name: decoded.name || "",
                email: decoded.email || "",
                role: decoded.role || "",
                bio: decoded.bio || null,
                profileImageUrl: decoded.profileImageUrl || null,
                ...decoded,
              };
              setUser(user);
              localStorage.setItem("user", JSON.stringify(user));
            }
          } catch {
            // Token is invalid, remove it
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token: string) => {
    localStorage.setItem("token", token);
    
    // First check if user data is already in localStorage (set by login modal)
    const existingUserData = localStorage.getItem("user");
    if (existingUserData) {
      try {
        const parsedUser = JSON.parse(existingUserData);
        setUser(parsedUser);
        return;
      } catch {
        // If parsing fails, continue with token decoding
      }
    }
    
    // Fallback to decoding token if no user data in localStorage
    const decoded = decodeToken(token);
    if (decoded) {
      // Convert JWT payload to User format
      const userData: User = {
        id: decoded.userId,
        name: decoded.name || "",
        email: decoded.email || "",
        role: decoded.role || "",
        bio: decoded.bio || null,
        profileImageUrl: decoded.profileImageUrl || null,
        ...decoded,
      };
      setUser(userData);
      // Also store user data for backward compatibility
      localStorage.setItem("user", JSON.stringify(userData));
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
