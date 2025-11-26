import { useQuery } from "@tanstack/react-query"
import axios from "axios"

export interface TutorDetail {
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
  responseTime: string
}

export interface Skill {
  id: string
  tutorId: string
  title: string
  description: string
  category: string
  level: string
  price: number
  rating: number
  reviews: number
  image: string
}

export function useTutorDetail(tutorId: string) {
  return useQuery({
    queryKey: ["tutor", tutorId],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/tutors/${tutorId}`)
        if (response.data.success) {
          return response.data.data as { tutor: TutorDetail; skills: Skill[] }
        }
        throw new Error("Tutor not found")
      } catch (error) {
        console.error("Error fetching tutor detail:", error)
        throw error
      }
    },
    enabled: !!tutorId,
  })
}
