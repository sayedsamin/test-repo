// import { Header } from "@/components/header";
// import { Footer } from "@/components/footer";
// import { Button } from "@/components/button"

// export default function Home() {
//   return (
//     <div className="flex min-h-screen flex-col">
//       <Header />
//       <main className="flex-1 bg-linear-to-b from-gray-50 to-gray-100">
//         <div className="container px-4 py-16 md:px-8">
//           <div className="text-center">
//             <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            

   
//       <div className="container py-16 md:py-24">
//         <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
//           <div className="flex flex-col gap-6">
//             <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm w-fit">
//               <span className="relative flex h-2 w-2">
//                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
//                 <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
//               </span>
//               <span className="text-muted-foreground">Join 50,000+ active learners</span>
//             </div>

//             <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
//               Learn Any Skill, <span className="text-primary">Anytime</span>,{" "}
//               <span className="text-secondary">Anywhere</span>
//             </h1>

//             <p className="text-lg text-muted-foreground text-pretty max-w-xl">
//               Connect with expert instructors worldwide for interactive video sessions, workshops, and personalized
//               learning experiences. Start your journey today.
//             </p>

//             <div className="flex flex-col sm:flex-row gap-3">
//               <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
//                 Explore Skills →
//               </Button>
//               <Button size="lg" variant="outline" className="gap-2 bg-transparent">
//                 Become a Teacher
//               </Button>
//             </div>

//             <div className="flex items-center gap-8 pt-4">
//               <div className="flex items-center gap-2">
//                 <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
//                   👥
//                 </div>
//                 <div className="text-sm">
//                   <div className="font-semibold">10,000+</div>
//                   <div className="text-muted-foreground">Instructors</div>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
//                   📹
//                 </div>
//                 <div className="text-sm">
//                   <div className="font-semibold">50,000+</div>
//                   <div className="text-muted-foreground">Sessions</div>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
//                   🏆
//                 </div>
//                 <div className="text-sm">
//                   <div className="font-semibold">4.8/5</div>
//                   <div className="text-muted-foreground">Avg Rating</div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="relative">
//             <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-8">
//               <img
//                 src="/hero.svg"
//                 alt="People learning together"
//                 className="rounded-xl object-cover w-full h-full"
//               />
//             </div>
//             <div className="absolute -bottom-6 -left-6 rounded-xl bg-card p-4 shadow-lg border border-border">
//               <div className="flex items-center gap-3">
//                 <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">📹</div>
//                 <div>
//                   <div className="font-semibold">Live Sessions</div>
//                   <div className="text-sm text-muted-foreground">Interactive learning</div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
 
  

//             </h1>
//           </div>
//         </div>
//       </main>
//       <Footer />
//     </div>
//   );
// }


import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Users, BookOpen, Star } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 px-4 bg-gradient-to-b from-primary/10 to-background">
          <div className="container max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Learn Any Skill, Anytime, Anywhere
            </h1>
            <p className="text-xl text-muted-foreground mb-8 text-balance">
              Connect with expert tutors worldwide for interactive video sessions and personalized learning experiences.
            </p>
           
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/learn">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Explore Skills <ArrowRight className="ml-2 h-10 w-10" />
                </Button>
              </Link>
 
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-16 px-4 bg-background">
          <div className="container max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                <p className="text-muted-foreground">Expert Tutors</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
                <p className="text-muted-foreground">Active Students</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">4.8/5</div>
                <p className="text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 px-4 bg-card">
          <div className="container max-w-4xl mx-auto">
           <h2 className="text-3xl font-bold text-center mb-12 animate-pulse">Why Choose SkillShare?</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg border border-border bg-background">
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Learn from Experts</h3>
                <p className="text-muted-foreground">Learn from industry professionals with years of experience.</p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-background">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Personalized Learning</h3>
                <p className="text-muted-foreground">Get one-on-one sessions tailored to your learning pace.</p>
              </div>
              <div className="p-6 rounded-lg border border-border bg-background">
                <Star className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Verified Reviews</h3>
                <p className="text-muted-foreground">See real reviews from verified students before booking.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 px-4 bg-primary text-primary-foreground">
          <div className="container max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
            <p className="text-lg mb-8 opacity-90">Join thousands of students learning new skills every day.</p>
            <Button asChild variant="accent" size="lg">
              <Link href="/get-started">Get Started Now</Link>
            </Button>
          </div>
        </section>
      </main>

      
    </div>
  )
}
