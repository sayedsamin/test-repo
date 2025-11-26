"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useTutors } from "@/hooks/use-tutors"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Star, Loader2 } from "lucide-react"
import Image from "next/image"

export default function TutorsPage() {
  const { data: tutors, isLoading } = useTutors()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"all" | "rating" | "popular" | "new">("all")

  const filteredTutors =
    tutors
      ?.filter((tutor) => {
        const matchesSearch =
          tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tutor.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))
        return matchesSearch
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating
        if (sortBy === "popular") return b.studentsCount - a.studentsCount
        return 0
      }) || []

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-12">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">Find Your Perfect Tutor</h1>
              <p className="text-xl text-muted-foreground">
                Connect with experienced instructors for one-on-one learning
              </p>
            </div>

            <div className="flex gap-3">
              <Input
                placeholder="Search by skill, name, or specialty..."
                className="flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Search</Button>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button
                variant={sortBy === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("all")}
                className={sortBy === "all" ? "bg-primary text-primary-foreground" : ""}
              >
                All Tutors
              </Button>
              <Button
                variant={sortBy === "rating" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("rating")}
                className={sortBy === "rating" ? "bg-primary text-primary-foreground" : ""}
              >
                Top Rated
              </Button>
              <Button
                variant={sortBy === "popular" ? "default" : "outline"}
                size="sm"
                onClick={() => setSortBy("popular")}
                className={sortBy === "popular" ? "bg-primary text-primary-foreground" : ""}
              >
                Most Popular
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTutors.map((tutor) => (
                  <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Image
                          src={tutor.avatar || "/placeholder.svg"}
                          alt={tutor.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <CardTitle 
                            className="text-lg text-foreground hover:text-primary cursor-pointer"
                            onClick={() => {
                              if (tutor.id) {
                                console.log('Navigating to tutor:', tutor.id);
                                router.push(`/tutor/${tutor.id}`);
                              }
                            }}
                          >
                            {tutor.name}
                          </CardTitle>
                          <CardDescription className="text-sm">{tutor.specialties[0]}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">{tutor.bio}</p>
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{tutor.rating}</span>
                          <span className="text-muted-foreground">({tutor.totalReviews})</span>
                        </div>
                        <span className="text-muted-foreground">{tutor.studentsCount} students</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tutor.specialties.slice(0, 3).map((specialty, index) => (
                          <Badge key={`${tutor.id}-${specialty}-${index}`} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-2 gap-3">
                        <span className="text-lg font-bold text-primary">${tutor.hourlyRate}/hr</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              console.log('Tutor object:', tutor);
                              if (tutor.id) {
                                // Keep the original mock data ID format (e.g., "tutor-1")
                                const tutorId = tutor.id;
                                console.log('Navigating to tutor:', tutorId);
                                router.push(`/tutor/${tutorId}`);
                              } else {
                                console.log('No tutor ID found');
                              }
                            }}
                            className="inline-flex items-center justify-center"
                          >
                            View Profile
                          </Button>
                          
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && filteredTutors.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No tutors found matching your criteria.</p>
              </div>
            )}

            <div className="text-center pt-8">
              <Link href="/">
                <Button
                  className="inline-flex h-9 items-center justify-center rounded-md bg-gradient-to-br from-blue-300 to-cyan-300 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-300/40 transition-all hover:shadow-lg hover:shadow-blue-300/70 hover:scale-105"
                >
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
