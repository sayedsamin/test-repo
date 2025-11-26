import { useQuery } from "@tanstack/react-query"
import type { Review } from "@/lib/mock-data"
import { mockReviews } from "@/lib/mock-data"

export function useReviews(tutorId?: string) {
  return useQuery({
    queryKey: ["reviews", tutorId],
    queryFn: async () => {
      const url = tutorId ? `/api/reviews?tutorId=${tutorId}` : "/api/reviews"
      const response = await fetch(url)
      if (!response.ok) {
        return mockReviews as Review[]
      }
      const json = await response.json()
      
      console.log("Raw review data:", json.data[0]); // Debug log
      
      // Map the database response to match the expected Review interface
      const reviews = json.data.map((review: any) => {
        const tutorId = review.tutor?.id || review.tutorId;
        console.log("Mapping review - tutorId:", tutorId, "full tutor:", review.tutor); // Debug log
        
        return {
          id: review.id,
          studentName: review.reviewer?.name || "Anonymous Student",
          studentAvatar: review.reviewer?.profileImageUrl || "/placeholder.svg",
          tutorName: review.tutor?.user?.name || "Unknown Tutor",
          tutorId: tutorId, // Use the tutor's internal ID, not userId
          courseTitle: review.course?.title || "Unknown Course",
          rating: review.rating,
          comment: review.comment || "",
          createdAt: review.createdAt,
          status: review.status,
        }
      })
      
      return reviews as Review[]
    },
  })
}
