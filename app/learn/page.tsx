"use client"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useCourses } from "@/hooks/use-courses"
import { useState, useEffect } from "react"
import { Star, Loader2 } from "lucide-react"
import Image from "next/image"

export default function LearnPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)

  const skillLevels = [
    { level: "All", description: "Explore all available courses" },
    { level: "Beginner", description: "Start your learning journey" },
    { level: "Intermediate", description: "Build on your foundation" },
    { level: "Advanced", description: "Master your craft" },
  ]

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const { data: courses, isLoading } = useCourses({
    search: debouncedSearch,
    difficulty: selectedLevel === "All" ? undefined : selectedLevel?.toLowerCase()
  })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-12">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">Learn a New Skill</h1>
              <p className="text-xl text-muted-foreground">
                Discover thousands of courses and connect with expert instructors
              </p>
            </div>

            <div className="flex gap-3">
              <Input
                placeholder="Search for any skill..."
                className="flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Search</Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {skillLevels.map((item) => (
                <Card
                  key={item.level}
                  className={`hover:shadow-lg transition-all cursor-pointer ${selectedLevel === item.level ? "ring-2 ring-primary" : ""
                    }`}
                  onClick={() => setSelectedLevel(selectedLevel === item.level ? null : item.level)}
                >
                  <CardHeader>
                    <CardTitle className="text-foreground">{item.level}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {isLoading ? (
                        "Loading..."
                      ) : (
                        `${item.level === "All"
                          ? courses?.length || 0
                          : courses?.filter((c) => c.difficulty === item.level.toLowerCase()).length || 0} courses`
                      )}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">
                {selectedLevel ? `${selectedLevel} Courses` : "All Courses"}
              </h2>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses?.map((course) => (
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
                          <span>{course.tutor?.user.name || "Unknown Tutor"}</span>
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
              )}

              {!isLoading && (!courses || courses.length === 0) && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No courses found matching your criteria.</p>
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
    </div>
  )
}