import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/creem/client'
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

    // Map plan names to product IDs (you'll need to create these in Creem dashboard)
    const productMap: Record<string, { monthly: string; yearly: string }> = {
      Basic: {
        monthly: process.env.CREEM_PRODUCT_BASIC_MONTHLY || '',
        yearly: process.env.CREEM_PRODUCT_BASIC_YEARLY || '',
      },
      Pro: {
        monthly: process.env.CREEM_PRODUCT_PRO_MONTHLY || '',
        yearly: process.env.CREEM_PRODUCT_PRO_YEARLY || '',
      },
      Max: {
        monthly: process.env.CREEM_PRODUCT_MAX_MONTHLY || '',
        yearly: process.env.CREEM_PRODUCT_MAX_YEARLY || '',
      },
    }

    // Map credit packs to product IDs
    const creditPackMap: Record<number, string> = {
      1000: process.env.CREEM_PRODUCT_CREDITS_1000 || '',
      5000: process.env.CREEM_PRODUCT_CREDITS_5000 || '',
      10000: process.env.CREEM_PRODUCT_CREDITS_10000 || '',
      50000: process.env.CREEM_PRODUCT_CREDITS_50000 || '',
    }

    let productId: string

    if (type === 'subscription') {
      const plan = productMap[planName as keyof typeof productMap]
      if (!plan) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
      }
      productId = billingCycle === 'yearly' ? plan.yearly : plan.monthly
    } else if (type === 'credits') {
      productId = creditPackMap[credits as keyof typeof creditPackMap]
      if (!productId) {
        return NextResponse.json({ error: 'Invalid credit pack' }, { status: 400 })
      }
    } else {
      return NextResponse.json({ error: 'Invalid checkout type' }, { status: 400 })
    }

    if (!productId) {
      return NextResponse.json(
        { error: 'Product not configured. Please set up Creem product IDs in environment variables.' },
        { status: 500 }
      )
    }

    // Create checkout session
    const session = await createCheckoutSession({
      product_id: productId,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      ...(user?.email && {
        customer: {
          email: user.email,
        },
      }),
      metadata: {
        userId: user?.id || '',
        planName: planName || '',
        billingCycle: billingCycle || '',
        credits: credits?.toString() || '',
      },
    })

    return NextResponse.json({ url: session.checkout_url, sessionId: session.id })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
