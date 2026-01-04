"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Wand2, Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"

export function ImageUpload() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState<string | null>(null)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
        setGeneratedResult(null)
        setGeneratedImage(null)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!selectedImage || !prompt) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: selectedImage,
          prompt: prompt,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate")
      }

      setGeneratedResult(data.result)
      setGeneratedImage(data.imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image")
      console.error("Generation error:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Input Section */}
      <Card className="p-6">
        <h3 className="mb-6 text-xl font-semibold">Prompt Engine</h3>

        <div className="space-y-6">
          <div>
            <Label htmlFor="image-upload" className="mb-2 block text-sm font-medium">
              Upload Image
            </Label>
            <div className="relative">
              <input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              <label
                htmlFor="image-upload"
                className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:bg-muted"
              >
                {selectedImage ? (
                  <img
                    src={selectedImage || "/placeholder.svg"}
                    alt="Uploaded"
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-8 w-8" />
                    <span className="text-sm font-medium">Click to upload image</span>
                    <span className="text-xs">Max 10MB</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="prompt" className="mb-2 block text-sm font-medium">
              Main Prompt
            </Label>
            <Textarea
              id="prompt"
              placeholder="Describe how you want to edit the image..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          <Button
            className="w-full bg-yellow-500 text-black hover:bg-yellow-600"
            onClick={handleGenerate}
            disabled={!selectedImage || !prompt || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Now
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Output Section */}
      <Card className="flex flex-col items-center justify-center p-6">
        <h3 className="mb-6 text-xl font-semibold">Output Gallery</h3>

        {isGenerating ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
            <p className="text-sm text-muted-foreground">Creating your masterpiece...</p>
          </div>
        ) : error ? (
          <div className="flex w-full flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-red-500/10 p-4">
              <Wand2 className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <p className="font-medium text-red-500">Error</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : generatedImage ? (
          <div className="w-full space-y-4">
            <div className="relative overflow-hidden rounded-lg">
              <img src={generatedImage} alt="Generated" className="w-full rounded-lg" />
            </div>
            {generatedResult && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">AI Description:</p>
                <p className="text-sm">{generatedResult}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-yellow-500/10 p-4">
              <Wand2 className="h-8 w-8 text-yellow-500" />
            </div>
            <div>
              <p className="font-medium">Ready for instant generation</p>
              <p className="text-sm text-muted-foreground">Upload an image and enter your prompt</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
