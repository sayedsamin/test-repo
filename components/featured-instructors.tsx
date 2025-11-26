import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const instructors = [
  {
    name: "Sarah Johnson",
    specialty: "Digital Art & Illustration",
    rating: 4.9,
    students: 3200,
    image: "/professional-woman-artist.jpg",
  },
  {
    name: "Michael Chen",
    specialty: "Full-Stack Development",
    rating: 5.0,
    students: 5400,
    image: "/professional-man-developer.png",
  },
  {
    name: "Emma Rodriguez",
    specialty: "Spanish Language",
    rating: 4.8,
    students: 2800,
    image: "/professional-woman-teacher.png",
  },
  {
    name: "David Kim",
    specialty: "Photography & Editing",
    rating: 4.9,
    students: 4100,
    image: "/professional-man-photographer.jpg",
  },
]

export function FeaturedInstructors() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container">
        <div className="flex flex-col gap-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">Learn from Top Instructors</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Connect with experienced professionals who are passionate about sharing their expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {instructors.map((instructor) => (
            <Card key={instructor.name} className="group cursor-pointer transition-all hover:shadow-lg hover:scale-105">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="relative">
                    <img
                      src={instructor.image || "/placeholder.svg"}
                      alt={instructor.name}
                      className="h-24 w-24 rounded-full object-cover ring-4 ring-background group-hover:ring-primary/50 transition-all"
                    />
                    <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                      Top Rated
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{instructor.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{instructor.specialty}</p>
                    <div className="flex items-center justify-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="font-medium">{instructor.rating}</span>
                      </div>
                      <div className="text-muted-foreground">{instructor.students.toLocaleString()} students</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
