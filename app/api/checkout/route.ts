import { NextRequest, NextResponse } from 'next/server'
import { createPayPalOrder } from '@/lib/paypal/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planName, billingCycle, credits, type } = body

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Map plan names to prices
    const subscriptionPrices: Record<string, { monthly: number; yearly: number }> = {
      Basic: {
        monthly: 12,
        yearly: 144,
      },
      Pro: {
        monthly: 19.5,
        yearly: 234,
      },
      Max: {
        monthly: 80,
        yearly: 960,
      },
    }

    // Map credit packs to prices
    const creditPackPrices: Record<number, number> = {
      1000: 10,
      5000: 45,
      10000: 80,
      50000: 350,
    }

    let amount: number
    let description: string

    if (type === 'subscription') {
      const plan = subscriptionPrices[planName as keyof typeof subscriptionPrices]
      if (!plan) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
      }
      amount = billingCycle === 'yearly' ? plan.yearly : plan.monthly
      description = `Nano Banano ${planName} Plan - ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'} Subscription`
    } else if (type === 'credits') {
      amount = creditPackPrices[credits as keyof typeof creditPackPrices]
      if (!amount) {
        return NextResponse.json({ error: 'Invalid credit pack' }, { status: 400 })
      }
      description = `Nano Banano - ${credits} Credits Pack`
    } else {
      return NextResponse.json({ error: 'Invalid checkout type' }, { status: 400 })
    }

    // Create PayPal order
    const order = await createPayPalOrder({
      amount: amount.toString(),
      currency: 'USD',
      description,
      metadata: {
        userId: user?.id || '',
        planName: planName || '',
        billingCycle: billingCycle || '',
        credits: credits?.toString() || '',
        type,
      },
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/pricing/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/pricing`,
    })

    return NextResponse.json({ url: order.approval_url, orderId: order.id })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create PayPal order' },
      { status: 500 }
    )
  }
}
