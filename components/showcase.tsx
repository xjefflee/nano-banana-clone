import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const showcaseItems = [
  {
    title: "Ultra-Fast Mountain Generation",
    description: "Created in 0.8 seconds with Nano Banana's optimized neural engine",
    image: "/majestic-mountain-vista.png",
  },
  {
    title: "Instant Garden Creation",
    description: "Complex scene rendered in milliseconds using Nano Banana technology",
    image: "/beautiful-garden.jpg",
  },
  {
    title: "Real-time Beach Synthesis",
    description: "Nano Banana delivers photorealistic results at lightning speed",
    image: "/tropical-beach-sunset.png",
  },
  {
    title: "Rapid Aurora Generation",
    description: "Advanced effects processed instantly with Nano Banana AI",
    image: "/northern-lights-aurora.png",
  },
]

export function Showcase() {
  return (
    <section id="showcase" className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-700 dark:text-yellow-300">
            ⚡ Nano Banana Speed
          </div>
          <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Lightning-Fast AI Creations
          </h2>
          <p className="text-lg text-muted-foreground">See what Nano Banana generates in milliseconds</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {showcaseItems.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <img src={item.image || "/placeholder.svg"} alt={item.title} className="h-64 w-full object-cover" />
              <div className="p-6">
                <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="mb-4 text-lg font-medium">Experience the power of Nano Banana yourself</p>
          <Button size="lg" className="bg-yellow-500 text-black hover:bg-yellow-600">
            Try Nano Banana Generator
          </Button>
        </div>
      </div>
    </section>
  )
}
