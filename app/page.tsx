"use client"
import { Button } from "@/components/ui/button"
import { Upload, Sparkles, Zap, Users, ImageIcon } from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import { Showcase } from "@/components/showcase"
import { Reviews } from "@/components/reviews"
import { FAQ } from "@/components/faq"
import { Features } from "@/components/features"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
        <div className="absolute inset-0 -z-10">
          <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-yellow-300/20 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-yellow-400/10 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-yellow-400/10 px-4 py-2 text-sm font-medium text-yellow-700 dark:text-yellow-300">
              <Sparkles className="h-4 w-4" />
              <span>The AI model that outperforms Flux Kontext</span>
            </div>

            <h1 className="mb-6 text-balance font-sans text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Nano Banana
            </h1>

            <p className="mx-auto mb-8 max-w-3xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Transform any image with simple text prompts. Nano Banana's advanced model delivers consistent character
              editing and scene preservation that surpasses Flux Kontext. Experience the future of AI image editing.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="min-w-[160px] bg-yellow-500 text-black hover:bg-yellow-600">
                <Upload className="mr-2 h-5 w-5" />
                Start Editing
              </Button>
              <Button size="lg" variant="outline" className="min-w-[160px] bg-transparent">
                View Examples
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>One-shot editing</span>
              </div>
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-yellow-500" />
                <span>Multi-image support</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-yellow-500" />
                <span>Natural language</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Editor Section */}
      <section id="generator" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Get Started
            </h2>
            <p className="text-lg text-muted-foreground">
              Experience the power of Nano Banana's natural language image editing
            </p>
          </div>

          <ImageUpload />
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* Showcase Section */}
      <Showcase />

      {/* Reviews Section */}
      <Reviews />

      {/* FAQ Section */}
      <FAQ />

      <Footer />
    </div>
  )
}
