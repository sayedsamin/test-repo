import { useQuery } from "@tanstack/react-query";
import type { Course } from "@/app/dashboard/tutor/components/types";

export function useCourse(id: string) {
  return useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch course");
      }

      const json = await response.json();

      if (!json.success || !json.data) {
        throw new Error("Course not found");
      }

      return json.data as Course;
    },
  });
}
