import { useQuery } from "@tanstack/react-query";
import type {
  Course,
  CoursesResponse,
} from "@/app/dashboard/tutor/components/types";

interface UseCoursesParams {
  search?: string;
  difficulty?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
  createdAfter?: string;
  createdBefore?: string;
}

export function useCourses(params: UseCoursesParams = {}) {
  const { search, difficulty, categoryId, page = 1, limit = 50, createdAfter, createdBefore } = params;

  return useQuery({
    queryKey: ["courses", { search, difficulty, categoryId, page, limit, createdAfter, createdBefore }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (search) searchParams.set("search", search);
      if (difficulty) searchParams.set("difficulty", difficulty);
      if (categoryId) searchParams.set("categoryId", categoryId);
      if (createdAfter) searchParams.set("createdAfter", createdAfter);
      if (createdBefore) searchParams.set("createdBefore", createdBefore);
      searchParams.set("page", page.toString());
      searchParams.set("limit", limit.toString());

      const response = await fetch(`/api/courses?${searchParams.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const json: CoursesResponse = await response.json();

      if (!json.success) {
        throw new Error("Failed to fetch courses");
      }

      return json.data.courses as Course[];
    },
  });
}
