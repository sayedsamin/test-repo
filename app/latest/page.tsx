"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useCourses } from "@/hooks/use-courses"
import { useTutors } from "@/hooks/use-tutors"
import { useRouter } from "next/navigation"
import { Loader2, Star } from "lucide-react"
import Image from "next/image"
import { useMemo } from "react"
import { Footer } from "@/components/footer"

export default function LatestPage() {
  // Calculate date one month ago
  const oneMonthAgo = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString();
  }, []);

  // Fetch courses created in the last month
  const { data: courses, isLoading: coursesLoading } = useCourses({
    createdAfter: oneMonthAgo,
    limit: 50
  });

  const { data: tutors, isLoading: tutorsLoading } = useTutors()
  const router = useRouter()

  const newTutors = tutors?.slice(0, 3) || []

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-12">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">Latest Sessions & Updates</h1>
              <p className="text-xl text-muted-foreground">
                Discover newly added courses from the past month and join the newest instructors
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Latest Courses</h2>

              {coursesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : courses && courses.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <Card key={course.id} className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
                      <div className="relative w-full aspect-4/3 overflow-hidden bg-muted">
                        <Image
                          src={course.imageUrl || "/placeholder.svg"}
                          alt={course.title}
                          fill
                          className="object-cover object-center"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={false}
                        />
                        <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">New</Badge>
                      </div>
                      <CardHeader>
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-foreground">{course.title}</CardTitle>
                            <CardDescription className="text-sm">{course.category?.name || "Uncategorized"}</CardDescription>
                          </div>
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded capitalize">{course.difficulty}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">{course.shortDescription}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">4.5</span>
                            <span className="text-muted-foreground">({course._count?.reviews || 0})</span>
                          </div>
                          <span className="font-bold text-primary">${course.fullCourseRate}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Image
                            src={course.tutor?.user.profileImageUrl || "/placeholder.svg"}
                            alt={course.tutor?.user.name || "Tutor"}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                          <Link href={`/tutor/${course.tutorId}`} className="hover:text-primary">
                            {course.tutor?.user.name || "Unknown Tutor"}
                          </Link>
                        </div>
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                          <Link href={`/course/${course.id}`} className="w-full">
                            View Course
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No new courses added in the past month.</p>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">New Tutors</h2>
              {tutorsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {newTutors.map((tutor) => (
                    <Card key={tutor.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <Image
                            src={tutor.avatar || "/placeholder.svg"}
                            alt={tutor.name}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <CardTitle className="text-lg text-foreground">{tutor.name}</CardTitle>
                            <CardDescription className="text-sm">{tutor.specialties[0]}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">{tutor.bio}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold">{tutor.rating}</span>
                          <span className="text-muted-foreground">({tutor.totalReviews} reviews)</span>
                        </div>
                        <Link
                          href={`/tutor/${tutor.id}`}
                          onClick={(e) => {
                            e.preventDefault()
                            router.push(`/tutor/${tutor.id}`)
                          }}
                          className="inline-flex items-center justify-center rounded-md font-medium transition-colors px-3 py-1.5 text-sm border border-border bg-transparent text-foreground w-full text-center"
                        >
                          View Profile
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

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
       <Footer />
    </div>
  )
}
