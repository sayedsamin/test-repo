import { useQuery } from "@tanstack/react-query"
import type { Skill } from "@/lib/mock-data"
import { mockSkills } from "@/lib/mock-data"

export function useSkills() {
  return useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const response = await fetch("/api/skills")
      if (!response.ok) {
        // Fallback to mock data when API is protected or unavailable
        return mockSkills as Skill[]
      }

      const json = await response.json()
      // API returns { success: true, data: [...] }
      return json.data as Skill[]
    },
  })
}
