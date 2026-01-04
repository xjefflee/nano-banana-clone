import OpenAI from "openai"
import { NextResponse } from "next/server"

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://nano-banana.com",
    "X-Title": "Nano Banana",
  },
})

export async function POST(request: Request) {
  try {
    const { image, prompt } = await request.json()

    if (!image || !prompt) {
      return NextResponse.json(
        { error: "Image and prompt are required" },
        { status: 400 }
      )
    }

    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash-image",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
    })

    console.log("Full API response:", JSON.stringify(completion, null, 2))
    console.log("Choices:", completion.choices)
    console.log("Message content:", completion.choices[0]?.message?.content)

    const message = completion.choices[0]?.message
    const textContent = message?.content || ""
    const images = message?.images || []

    // Extract image URL from the response
    const imageUrl = images.length > 0 ? images[0].image_url?.url : null

    return NextResponse.json({
      result: textContent,
      imageUrl: imageUrl
    })
  } catch (error) {
    console.error("Error generating image:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to generate image"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
