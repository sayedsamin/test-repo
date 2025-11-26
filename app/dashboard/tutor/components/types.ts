// Types for Course management based on Prisma schema

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface CourseSchedule {
  days: DayOfWeek[];
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  timezone: string; // Format: "America/New_York", "UTC", etc.
}

export interface CourseCategory {
  id: string;
  name: string;
  _count?: {
    courses: number;
  };
}

export interface Course {
  id: string;
  tutorId: string;
  title: string;
  shortDescription: string;
  overview: string;
  difficulty: DifficultyLevel;
  prerequisites: string[];
  skillsLearned: string[];
  totalHours: number;
  schedule: CourseSchedule[];
  zoomLink?: string;
  categoryId?: string;
  createdAt: string;
  imageUrl?: string;
  trialRate: number;
  fullCourseRate: number;
  startDate?: string;
  endDate?: string;
  tutor?: {
    id: string;
    bio: string;
    user: {
      id: string;
      name: string;
      email: string;
      profileImageUrl?: string;
    };
  };
  category?: CourseCategory;
  _count?: {
    bookings: number;
    enrollments: number;
    reviews: number;
  };
}

export interface CreateCourseData {
  title: string;
  shortDescription: string;
  overview: string;
  difficulty: DifficultyLevel;
  prerequisites: string[];
  skillsLearned: string[];
  totalHours: number;
  schedule: CourseSchedule[];
  zoomLink?: string;
  categoryId?: string;
  imageUrl?: string;
  trialRate: number;
  fullCourseRate: number;
  startDate?: string;
  endDate?: string;
}

export type UpdateCourseData = Partial<CreateCourseData>;

export interface CoursesResponse {
  success: boolean;
  data: {
    courses: Course[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface Toast {
  id: string;
  type: "success" | "error" | "warning";
  message: string;
}
