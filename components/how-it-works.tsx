import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-background to-muted/20">
      <div className="container py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-muted-foreground">Join 50,000+ active learners</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Learn Any Skill, <span className="text-primary">Anytime</span>,{" "}
              <span className="text-secondary">Anywhere</span>
            </h1>

            <p className="text-lg text-muted-foreground text-pretty max-w-xl">
              Connect with expert instructors worldwide for interactive video sessions, workshops, and personalized
              learning experiences. Start your journey today.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                Explore Skills →
              </Button>
              <Button size="lg" variant="outline" className="gap-2 bg-transparent">
                Become a Teacher
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  👥
                </div>
                <div className="text-sm">
                  <div className="font-semibold">10,000+</div>
                  <div className="text-muted-foreground">Instructors</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                  📹
                </div>
                <div className="text-sm">
                  <div className="font-semibold">50,000+</div>
                  <div className="text-muted-foreground">Sessions</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                  🏆
                </div>
                <div className="text-sm">
                  <div className="font-semibold">4.8/5</div>
                  <div className="text-muted-foreground">Avg Rating</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-8">
              <img
                src="/diverse-group-of-people-learning-together-in-moder.jpg"
                alt="People learning together"
                className="rounded-xl object-cover w-full h-full"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-xl bg-card p-4 shadow-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">📹</div>
                <div>
                  <div className="font-semibold">Live Sessions</div>
                  <div className="text-sm text-muted-foreground">Interactive learning</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
