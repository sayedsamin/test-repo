import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export interface Tutor {
  id: string
  name: string
  email: string
  bio: string
  avatar: string
  hourlyRate: number
  rating: number
  totalReviews: number
  studentsCount: number
  specialties: string[]
  availability: string
  sessionDuration: string
  language: string
  timezone: string
}

export function useTutors() {
  return useQuery({
    queryKey: ["tutors"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/tutors")
        if (response.data.success) {
          return response.data.data as Tutor[]
        }
        return []
      } catch (error) {
        console.error("Error fetching tutors:", error)
        return []
      }
    },
  })
}
