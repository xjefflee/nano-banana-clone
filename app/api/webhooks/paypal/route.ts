import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { capturePayPalOrder, getPayPalOrder } from '@/lib/paypal/client'

// PayPal webhook event types
type PayPalEvent =
  | 'PAYMENT.CAPTURE.COMPLETED'
  | 'PAYMENT.CAPTURE.DENIED'
  | 'PAYMENT.CAPTURE.REFUNDED'
  | 'CHECKOUT.ORDER.APPROVED'
  | 'CHECKOUT.ORDER.COMPLETED'

interface PayPalWebhookPayload {
  event_type: PayPalEvent
  resource: {
    id: string
    status?: string
    amount?: {
      currency_code: string
      value: string
    }
    custom_id?: string
    supplementary_data?: {
      related_ids?: {
        order_id?: string
      }
    }
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

export async function POST(request: NextRequest) {
  try {
    // Parse the webhook payload
    const payload: PayPalWebhookPayload = await request.json()
    console.log('PayPal webhook received:', payload.event_type)

    // Handle different event types
    switch (payload.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCaptureCompleted(payload)
        break

      case 'CHECKOUT.ORDER.APPROVED':
        // Order approved, we can capture it
        await handleOrderApproved(payload)
        break

      default:
        console.log('Unhandled webhook event:', payload.event_type)
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
 * Handle payment capture completion
 */
async function handlePaymentCaptureCompleted(payload: PayPalWebhookPayload) {
  const { resource } = payload

  // Try to get custom_id directly from resource first
  let customId = resource.custom_id

  // If not found, try to get order ID and fetch order details
  if (!customId) {
    const orderId = resource.supplementary_data?.related_ids?.order_id

    if (!orderId) {
      console.error('No order ID in payment capture')
      return
    }

    // Get order details to extract metadata
    const order = await getPayPalOrder(orderId)
    customId = order.purchase_units?.[0]?.custom_id

    if (!customId) {
      console.error('No custom_id in order or resource')
      return
    }
  }

  // Parse metadata from custom_id
  const metadata = JSON.parse(customId)
  const userId = metadata.userId
  const type = metadata.type

  if (!userId) {
    console.error('No userId in order metadata')
    return
  }

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available')
    return
  }

  console.log(`Payment completed for user ${userId}`)

  // Handle based on purchase type
  if (type === 'credits') {
    // Credit pack purchase
    const credits = parseInt(metadata.credits, 10)

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
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error adding credits:', updateError)
      throw updateError
    }

    console.log(`Added ${credits} credits to user ${userId} (new total: ${newCredits})`)
  } else if (type === 'subscription') {
    // Subscription purchase
    const planName = metadata.planName
    const billingCycle = metadata.billingCycle

    console.log(`Activating subscription for user ${userId}: ${planName} (${billingCycle})`)

    // Calculate period end based on billing cycle
    const periodEndDate = new Date()
    if (billingCycle === 'yearly') {
      periodEndDate.setFullYear(periodEndDate.getFullYear() + 1)
    } else {
      periodEndDate.setMonth(periodEndDate.getMonth() + 1)
    }

    // Upsert subscription record
    const { error } = await supabaseAdmin.from('user_subscriptions').upsert(
      {
        user_id: userId,
        plan_name: planName,
        billing_cycle: billingCycle,
        product_id: resource.supplementary_data?.related_ids?.order_id || '',
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
}

/**
 * Handle order approval (optional - can auto-capture)
 */
async function handleOrderApproved(payload: PayPalWebhookPayload) {
  const orderId = payload.resource.id

  console.log(`Order approved: ${orderId}`)

  // Optionally auto-capture the order
  // await capturePayPalOrder(orderId)
}
