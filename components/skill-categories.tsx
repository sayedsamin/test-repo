import { Card, CardContent } from "@/components/ui/card"

const categories = [
  {
    name: "Art & Design",
    icon: "🎨",
    count: "2,450+ skills",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    name: "Web Development",
    icon: "💻",
    count: "3,200+ skills",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    name: "Hair & Beauty",
    icon: "✂️",
    count: "1,800+ skills",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    name: "Music & Audio",
    icon: "🎵",
    count: "2,100+ skills",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    name: "Photography",
    icon: "📷",
    count: "1,650+ skills",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    name: "Languages",
    icon: "🌍",
    count: "4,500+ skills",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    name: "Cooking & Baking",
    icon: "🍳",
    count: "2,900+ skills",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    name: "Fitness & Wellness",
    icon: "💪",
    count: "1,950+ skills",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    name: "Business & Finance",
    icon: "💼",
    count: "3,400+ skills",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    name: "Crafts & DIY",
    icon: "✨",
    count: "1,700+ skills",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    name: "Health & Lifestyle",
    icon: "❤️",
    count: "2,200+ skills",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    name: "Home Improvement",
    icon: "🔧",
    count: "1,400+ skills",
    color: "text-slate-500",
    bgColor: "bg-slate-500/10",
  },
]

export function SkillCategories() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="flex flex-col gap-4 text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-balance">Explore Popular Categories</h2>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Discover thousands of skills across diverse categories. From creative arts to technical expertise, find the
            perfect learning path for you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((category) => {
            return (
              <Card
                key={category.name}
                className="group cursor-pointer transition-all hover:shadow-lg hover:scale-105 hover:border-primary/50"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`${category.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform text-2xl`}
                    >
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{category.count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
