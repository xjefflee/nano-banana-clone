"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Sparkles, Zap, Crown } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

const PLANS = [
  {
    name: "Basic",
    description: "Perfect for casual users",
    monthlyPrice: 12,
    yearlyPrice: 144,
    credits: 2400,
    imagesPerMonth: 100,
    features: [
      "100 images/month",
      "2,400 annual credits",
      "Standard processing speed",
      "Email support",
      "Basic AI models",
      "PNG & JPG export"
    ],
    icon: Sparkles,
    popular: false
  },
  {
    name: "Pro",
    description: "For professional creators",
    monthlyPrice: 19.5,
    yearlyPrice: 234,
    credits: 9600,
    imagesPerMonth: 400,
    features: [
      "400 images/month",
      "9,600 annual credits",
      "Priority queue",
      "Advanced AI models",
      "Batch generation",
      "All export formats",
      "Priority support",
      "Commercial license"
    ],
    icon: Zap,
    popular: true
  },
  {
    name: "Max",
    description: "For teams and power users",
    monthlyPrice: 80,
    yearlyPrice: 960,
    credits: 43200,
    imagesPerMonth: 1800,
    features: [
      "1,800 images/month",
      "43,200 annual credits",
      "Fastest processing",
      "All AI models",
      "Unlimited batch generation",
      "API access",
      "Dedicated account manager",
      "Custom integrations",
      "Team collaboration"
    ],
    icon: Crown,
    popular: false
  }
]

const CREDIT_PACKS = [
  { credits: 1000, price: 10, bonus: 0 },
  { credits: 5000, price: 45, bonus: 10 },
  { credits: 10000, price: 80, bonus: 20 },
  { credits: 50000, price: 350, bonus: 30 }
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly")

  const handleSubscribe = async (planName: string, isYearly: boolean) => {
    try {
      console.log('Creating checkout session for:', planName, isYearly ? 'yearly' : 'monthly')

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subscription',
          planName,
          billingCycle: isYearly ? 'yearly' : 'monthly',
        }),
      })

      const data = await response.json()
      console.log('Checkout API response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (!data.url) {
        throw new Error('No checkout URL returned from API')
      }

      console.log('Redirecting to:', data.url)
      // Redirect to Creem checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Checkout error:', error)
      alert(error instanceof Error ? error.message : 'Failed to start checkout')
    }
  }

  const handleBuyCredits = async (credits: number) => {
    try {
      console.log('Creating checkout session for credits:', credits)

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'credits',
          credits,
        }),
      })

      const data = await response.json()
      console.log('Checkout API response:', data)

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      if (!data.url) {
        throw new Error('No checkout URL returned from API')
      }

      console.log('Redirecting to:', data.url)
      // Redirect to Creem checkout
      window.location.href = data.url
    } catch (error) {
      console.error('Checkout error:', error)
      alert(error instanceof Error ? error.message : 'Failed to start checkout')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-yellow-300/20 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-yellow-400/10 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl text-center">
          <Badge variant="secondary" className="mb-4 bg-yellow-400/10 text-yellow-700 dark:text-yellow-300">
            Save 20% with Annual Billing
          </Badge>

          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Choose Your Plan
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-pretty text-lg text-muted-foreground">
            Transform your images with AI. No commitments, cancel anytime.
          </p>

          <div className="flex items-center justify-center gap-3 mb-8">
            <Label htmlFor="billing-toggle" className={billingCycle === "monthly" ? "font-medium" : "text-muted-foreground"}>
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={billingCycle === "yearly"}
              onCheckedChange={(checked) => setBillingCycle(checked ? "yearly" : "monthly")}
            />
            <Label htmlFor="billing-toggle" className={billingCycle === "yearly" ? "font-medium" : "text-muted-foreground"}>
              Yearly <span className="text-yellow-600 dark:text-yellow-400">(Save 20%)</span>
            </Label>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Tabs defaultValue="subscriptions" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="credits">Credit Packs</TabsTrigger>
            </TabsList>

            <TabsContent value="subscriptions" className="mt-8">
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {PLANS.map((plan) => {
                  const Icon = plan.icon
                  const price = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice
                  const monthlyEquivalent = billingCycle === "yearly" ? (plan.yearlyPrice / 12).toFixed(2) : plan.monthlyPrice

                  return (
                    <Card
                      key={plan.name}
                      className={`relative flex flex-col ${
                        plan.popular ? "border-yellow-500 shadow-lg shadow-yellow-500/20" : ""
                      }`}
                    >
                      {plan.popular && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black">
                          Most Popular
                        </Badge>
                      )}

                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon className={`h-5 w-5 ${plan.popular ? "text-yellow-500" : "text-muted-foreground"}`} />
                          <CardTitle>{plan.name}</CardTitle>
                        </div>
                        <CardDescription>{plan.description}</CardDescription>
                        <div className="mt-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold">${monthlyEquivalent}</span>
                            <span className="text-muted-foreground">/month</span>
                          </div>
                          {billingCycle === "yearly" && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Billed ${price} annually
                            </p>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="flex-1">
                        <ul className="space-y-3">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Check className="h-5 w-5 shrink-0 text-yellow-500 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>

                      <CardFooter>
                        <Button
                          className={`w-full ${
                            plan.popular
                              ? "bg-yellow-500 text-black hover:bg-yellow-600"
                              : ""
                          }`}
                          variant={plan.popular ? "default" : "outline"}
                          onClick={() => handleSubscribe(plan.name, billingCycle === "yearly")}
                        >
                          Get Started
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="credits" className="mt-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
                {CREDIT_PACKS.map((pack) => (
                  <Card key={pack.credits}>
                    <CardHeader>
                      <CardTitle className="text-2xl">{pack.credits.toLocaleString()}</CardTitle>
                      <CardDescription>Credits</CardDescription>
                      {pack.bonus > 0 && (
                        <Badge variant="secondary" className="w-fit bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          +{pack.bonus}% bonus
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="text-3xl font-bold">${pack.price}</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          ${(pack.price / pack.credits * 1000).toFixed(2)} per 1k credits
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Never expires • One-time payment
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleBuyCredits(pack.credits)}
                      >
                        Purchase
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-8 text-sm text-muted-foreground">
                <p>Credits work as currency: 2 credits = 1 high-quality image</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-3xl font-bold">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">How do credits work?</h3>
              <p className="text-muted-foreground">
                Credits are used to generate images. Each high-quality image costs 2 credits. Monthly subscription credits reset each month, while yearly credits are valid for your subscription period. Credit packs never expire.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-muted-foreground">
                Yes! All subscriptions can be cancelled at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Do unused credits roll over?</h3>
              <p className="text-muted-foreground">
                Monthly subscription credits do not roll over. However, yearly subscription credits remain available for the entire subscription year. Credit packs purchased separately never expire.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, debit cards, and various digital payment methods through our secure payment processor.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-muted-foreground">
                Absolutely! You can change your plan at any time. When upgrading, you'll be charged a prorated amount. When downgrading, the change takes effect at the next billing cycle.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
