"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Verify the session and update user credits/subscription
    const verifySession = async () => {
      if (!sessionId) {
        setLoading(false)
        return
      }

      try {
        // You can optionally verify the session with your backend
        // const response = await fetch(`/api/checkout/verify?session_id=${sessionId}`)
        // const data = await response.json()

        // For now, just mark as loaded
        setTimeout(() => setLoading(false), 1000)
      } catch (error) {
        console.error('Error verifying session:', error)
        setLoading(false)
      }
    }

    verifySession()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
      </div>
    )
  }

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Card className="border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl mb-2">Payment Successful!</CardTitle>
            <CardDescription className="text-base">
              Thank you for your purchase
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Your payment has been processed successfully. Your credits or subscription has been activated.
              </p>
              {sessionId && (
                <p className="text-xs text-muted-foreground font-mono">
                  Session ID: {sessionId}
                </p>
              )}
            </div>

            <div className="space-y-3 pt-4">
              <Button asChild className="w-full bg-yellow-500 text-black hover:bg-yellow-600">
                <Link href="/#generator">Start Creating</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Go Home</Link>
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              <p>A confirmation email has been sent to your email address.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
        </div>
      }>
        <SuccessContent />
      </Suspense>
      <Footer />
    </div>
  )
}
