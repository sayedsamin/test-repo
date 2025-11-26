// Service functions for Courses API

import {
  Course,
  CourseCategory,
  CreateCourseData,
  UpdateCourseData,
  CoursesResponse,
} from "./types";

const API_BASE = "/api";

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

// Helper function to get current user ID
export const getCurrentUserId = (): string => {
  if (typeof window === "undefined") return "";
  const userData = localStorage.getItem("user");
  if (!userData) return "";
  try {
    const user = JSON.parse(userData);
    return user.id || "";
  } catch {
    return "";
  }
};

// Helper function to get current user's name
export const getCurrentUserName = (): string => {
  if (typeof window === "undefined") return "";
  const userData = localStorage.getItem("user");
  if (!userData) return "";
  try {
    const user = JSON.parse(userData);
    return user.name || "";
  } catch {
    return "";
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken() && !!getCurrentUserId();
};

// Helper function to create authenticated headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  let data;
  const contentType = response.headers.get('content-type');
  
  try {
    const text = await response.text();
    
    if (!text || text.trim() === '') {
      console.error("Response body is empty");
      console.error("Response status:", response.status);
      console.error("Response statusText:", response.statusText);
      console.error("Content-Type:", contentType);
      throw new Error(`API returned empty response with status ${response.status}: ${response.statusText}`);
    }
    
    console.log("Response text:", text);
    data = JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Failed to parse response as JSON:", error);
    } else if (!(error instanceof Error && error.message.includes('empty response'))) {
      console.error("Error processing response:", error);
    }
    console.error("Response status:", response.status);
    console.error("Response statusText:", response.statusText);
    console.error("Content-Type:", contentType);
    
    if (error instanceof Error && error.message.includes('empty response')) {
      throw error;
    }
    throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
  }

  if (!response.ok) {
    console.error("API Error data:", data);
    console.error("API Error data type:", typeof data);
    console.error("API Error data keys:", Object.keys(data));
    console.error("Response status:", response.status);
    console.error("Response statusText:", response.statusText);
    console.error("Error details:", data.error);
    console.error("Details field:", data.details);
    
    if (data.details && Array.isArray(data.details)) {
      // Format validation errors
      console.error("Validation issues:", JSON.stringify(data.details, null, 2));
      const validationErrors = data.details
        .map((issue: any) => `${issue.path.join(".")}: ${issue.message}`)
        .join(", ");
      throw new Error(`Validation failed: ${validationErrors}`);
    }
    
    const errorMessage = data.error || data.message || `Request failed with status ${response.status}`;
    console.error("Final error message:", errorMessage);
    throw new Error(errorMessage);
  }

  return data;
};

// Fetch courses for a specific tutor
export const fetchCourses = async (userId: string): Promise<Course[]> => {
  const url = `${API_BASE}/courses?userId=${userId}`;
  console.log("Fetching courses from:", url);
  console.log("UserId:", userId);
  
  const response = await fetch(url, {
    headers: getAuthHeaders(),
  });

  console.log("Courses response status:", response.status);
  console.log("Courses response ok:", response.ok);
  
  // If response is not ok and empty, return empty array
  if (!response.ok && response.status !== 400) {
    console.error("Non-400 error, status:", response.status);
    console.error("Attempting to read error body...");
    try {
      const errorText = await response.text();
      console.error("Error response body:", errorText);
    } catch (e) {
      console.error("Could not read error body");
    }
    return [];
  }
  
  const data = await handleResponse(response);
  console.log("Courses data:", data);
  return data.data.courses;
};

// Fetch all course categories
export const fetchCourseCategories = async (): Promise<CourseCategory[]> => {
  const response = await fetch(`${API_BASE}/course-categories`, {
    headers: getAuthHeaders(),
  });

  const data = await handleResponse(response);
  return data.data;
};

// Create a new course
export const createCourse = async (
  courseData: CreateCourseData
): Promise<Course> => {
  const response = await fetch(`${API_BASE}/courses`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(courseData),
  });

  const data = await handleResponse(response);
  return data.data;
};

// Update an existing course
export const updateCourse = async (
  courseId: string,
  courseData: UpdateCourseData
): Promise<Course> => {
  console.log("========== updateCourse called ==========");
  console.log("Updating course:", courseId);
  console.log("Course data being sent:", JSON.stringify(courseData, null, 2));
  
  const response = await fetch(`${API_BASE}/courses/${courseId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(courseData),
  });

  console.log("Update response status:", response.status);
  console.log("Update response ok:", response.ok);
  console.log("Update response headers:", Array.from(response.headers.entries()));
  
  const data = await handleResponse(response);
  return data.data;
};

// Delete a course
export const deleteCourse = async (courseId: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/courses/${courseId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  await handleResponse(response);
};

// Search courses with filters
export const searchCourses = async (params: {
  search?: string;
  difficulty?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}): Promise<CoursesResponse> => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value.toString());
    }
  });

  const response = await fetch(
    `${API_BASE}/courses?${searchParams.toString()}`,
    {
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};
