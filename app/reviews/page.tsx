"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useReviews } from "@/hooks/use-reviews"
import { useState, useEffect } from "react"
import { Star, Loader2 } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/hooks/use-auth"

export default function ReviewsPage() {
  const { user } = useAuth()
  const [tutorId, setTutorId] = useState<string | undefined>(undefined)
  
  // Set tutorId if user is a tutor
  useEffect(() => {
    if (user?.role === "tutor") {
      setTutorId(user.id)
    } else {
      setTutorId(undefined)
    }
  }, [user])
  
  const { data: reviews, isLoading } = useReviews(tutorId)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)

  const filteredReviews =
    reviews
      ?.filter((review) => {
        if (!selectedRating) return true
        return review.rating === selectedRating
      })
      .sort((a, b) => b.rating - a.rating) || []

  const stats = [
    { label: "Total Reviews", value: `${reviews?.length || 0}+` },
    {
      label: "Average Rating",
      value:
        reviews && reviews.length > 0
          ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) + "/5"
          : "4.8/5",
    },
    { label: "Verified Reviews", value: "98%" },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-12">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">
                {user?.role === "tutor" ? "My Reviews" : "Ratings & Reviews"}
              </h1>
              <p className="text-xl text-muted-foreground">
                {user?.role === "tutor" 
                  ? "See what your students say about their learning experience with you" 
                  : "See what our students say about their learning experience"}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {stats.map((stat) => (
                <Card key={stat.label}>
                  <CardHeader>
                    <CardTitle className="text-3xl text-center text-primary">{stat.value}</CardTitle>
                    <CardDescription className="text-center">{stat.label}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button
                variant={selectedRating === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRating(null)}
                className={selectedRating === null ? "bg-primary text-primary-foreground" : ""}
              >
                All Reviews
              </Button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <Button
                  key={rating}
                  variant={selectedRating === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRating(rating)}
                  className={selectedRating === rating ? "bg-primary text-primary-foreground" : ""}
                >
                  {rating} Star{rating !== 1 ? "s" : ""}
                </Button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                {filteredReviews.map((review) => (
                  <Card key={review.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <Image
                            src={review.studentAvatar || "/placeholder.svg"}
                            alt={review.studentName || "Student profile picture"}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="space-y-1 flex-1">
                            <CardTitle className="text-lg text-foreground">{review.studentName}</CardTitle>
                            <CardDescription>
                              Course:{" "}
                              <span className="text-foreground font-medium">{review.courseTitle}</span>
                              {" • "}
                              Tutor:{" "}
                              <Link 
                                href={`/tutor/${review.tutorId}`} 
                                className="text-primary hover:underline font-medium"
                              >
                                {review.tutorName}
                              </Link>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {review.comment && (
                        <p className="text-muted-foreground">{review.comment}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && filteredReviews.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No reviews found for the selected rating.</p>
              </div>
            )}

            <div className="text-center pt-8">
              <Link href="/">
                <Button className="inline-flex h-9 items-center justify-center rounded-md bg-gradient-to-br from-blue-300 to-cyan-300 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-300/40 transition-all hover:shadow-lg hover:shadow-blue-300/70 hover:scale-105">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
