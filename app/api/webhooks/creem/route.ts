import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Webhook event types from Creem API
type CreemEvent =
  | 'checkout.completed'
  | 'subscription.active'
  | 'subscription.trialing'
  | 'subscription.canceled'
  | 'subscription.expired'
  | 'refund.created'
  | 'dispute.created'

interface CreemWebhookPayload {
  event: CreemEvent
  data: {
    id: string
    customer: {
      id?: string
      email?: string
    }
    product_id: string
    status?: string
    metadata?: Record<string, string>
    amount?: number
    currency?: string
  }
}

// Server-side Supabase client with service role for admin operations
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('Supabase credentials not configured for webhook handler')
    return null
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Verify Creem webhook signature using HMAC-SHA256
 */
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex')

  // Check if signatures have the same length before comparing
  if (signature.length !== expectedSignature.length) {
    return false
  }

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret is configured
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('CREEM_WEBHOOK_SECRET is not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('creem-signature')

    if (!signature) {
      console.error('Missing creem-signature header')
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
    }

    // Verify webhook signature
    if (!verifySignature(rawBody, signature, webhookSecret)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Parse the verified payload
    const payload: CreemWebhookPayload = JSON.parse(rawBody)
    console.log('Creem webhook received:', payload.event)

    // Handle different event types
    switch (payload.event) {
      case 'checkout.completed':
        await handleCheckoutCompleted(payload)
        break

      case 'subscription.active':
      case 'subscription.trialing':
        await handleSubscriptionActive(payload)
        break

      case 'subscription.canceled':
      case 'subscription.expired':
        await handleSubscriptionInactive(payload)
        break

      default:
        console.log('Unhandled webhook event:', payload.event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle one-time payment completion (credit packs)
 */
async function handleCheckoutCompleted(payload: CreemWebhookPayload) {
  const { data } = payload
  const userId = data.metadata?.userId

  if (!userId) {
    console.error('No userId in checkout metadata')
    return
  }

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available')
    return
  }

  console.log(`Checkout completed for user ${userId}`)

  // Check if this is a credit pack purchase
  if (data.metadata?.credits) {
    const credits = parseInt(data.metadata.credits, 10)

    // Get current credits
    const { data: userData, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching user credits:', fetchError)
      throw fetchError
    }

    const currentCredits = userData?.credits || 0
    const newCredits = currentCredits + credits

    // Update user's credit balance
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        credits: newCredits,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error adding credits:', updateError)
      throw updateError
    }

    console.log(`Added ${credits} credits to user ${userId} (new total: ${newCredits})`)
  }
}

/**
 * Handle subscription activation (monthly or yearly plans)
 */
async function handleSubscriptionActive(payload: CreemWebhookPayload) {
  const { data } = payload
  const userId = data.metadata?.userId

  if (!userId) {
    console.error('No userId in subscription metadata')
    return
  }

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available')
    return
  }

  const planName = data.metadata?.planName
  const billingCycle = data.metadata?.billingCycle

  console.log(`Activating subscription for user ${userId}: ${planName} (${billingCycle})`)

  // Calculate period end based on billing cycle
  const periodEndDate = new Date()
  if (billingCycle === 'yearly') {
    periodEndDate.setFullYear(periodEndDate.getFullYear() + 1)
  } else {
    periodEndDate.setMonth(periodEndDate.getMonth() + 1)
  }

  // Upsert subscription record
  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .upsert(
      {
        user_id: userId,
        plan_name: planName,
        billing_cycle: billingCycle,
        product_id: data.product_id,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: periodEndDate.toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    )

  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }

  console.log(`Subscription activated for user ${userId}`)
}

/**
 * Handle subscription cancellation or expiration
 */
async function handleSubscriptionInactive(payload: CreemWebhookPayload) {
  const { data } = payload
  const userId = data.metadata?.userId

  if (!userId) {
    console.error('No userId in subscription metadata')
    return
  }

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available')
    return
  }

  const newStatus = payload.event === 'subscription.canceled' ? 'canceled' : 'expired'
  console.log(`Updating subscription status for user ${userId}: ${newStatus}`)

  // Update subscription status
  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating subscription status:', error)
    throw error
  }

  console.log(`Subscription ${newStatus} for user ${userId}`)
}
