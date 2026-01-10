import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Server-side Supabase client with service role for admin operations
// Only initialize if environment variables are available
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
    const body = await request.json()
    const { event, data } = body

    console.log('Creem webhook received:', event)

    switch (event) {
      case 'checkout.completed':
        await handleCheckoutCompleted(data)
        break

      case 'subscription.created':
        await handleSubscriptionCreated(data)
        break

      case 'subscription.updated':
        await handleSubscriptionUpdated(data)
        break

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(data)
        break

      case 'payment.succeeded':
        await handlePaymentSucceeded(data)
        break

      case 'payment.failed':
        await handlePaymentFailed(data)
        break

      default:
        console.log('Unhandled webhook event:', event)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(data: any) {
  const { customer, metadata, amount, session_id } = data
  const userId = metadata?.userId

  if (!userId) {
    console.error('No userId in checkout metadata')
    return
  }

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available')
    return
  }

  // Update user's payment status or credits in your database
  console.log(`Checkout completed for user ${userId}: $${amount / 100}`)

  // Example: Add credits to user account
  if (metadata?.credits) {
    // You would implement your credits table here
    // await supabaseAdmin.from('user_credits').insert({
    //   user_id: userId,
    //   credits: parseInt(metadata.credits),
    //   session_id
    // })
  }
}

async function handleSubscriptionCreated(data: any) {
  const { customer, subscription_id, metadata, plan } = data
  const userId = metadata?.userId

  if (!userId) {
    console.error('No userId in subscription metadata')
    return
  }

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available')
    return
  }

  console.log(`Subscription created for user ${userId}: ${subscription_id}`)

  // Update user's subscription status in your database
  // await supabaseAdmin.from('user_subscriptions').insert({
  //   user_id: userId,
  //   subscription_id,
  //   plan_name: metadata?.planName,
  //   status: 'active',
  //   current_period_start: new Date(),
  //   current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  // })
}

async function handleSubscriptionUpdated(data: any) {
  const { subscription_id, status, metadata } = data
  const userId = metadata?.userId

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available')
    return
  }

  console.log(`Subscription updated: ${subscription_id}, status: ${status}`)

  // Update subscription status
  // await supabaseAdmin
  //   .from('user_subscriptions')
  //   .update({ status })
  //   .eq('subscription_id', subscription_id)
}

async function handleSubscriptionCancelled(data: any) {
  const { subscription_id, metadata } = data
  const userId = metadata?.userId

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available')
    return
  }

  console.log(`Subscription cancelled: ${subscription_id}`)

  // Update subscription status
  // await supabaseAdmin
  //   .from('user_subscriptions')
  //   .update({ status: 'cancelled' })
  //   .eq('subscription_id', subscription_id)
}

async function handlePaymentSucceeded(data: any) {
  const { payment_id, amount, metadata } = data

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) {
    console.error('Supabase admin client not available')
    return
  }

  console.log(`Payment succeeded: ${payment_id}, amount: $${amount / 100}`)

  // Record payment in your database
  // await supabaseAdmin.from('payments').insert({
  //   payment_id,
  //   user_id: metadata?.userId,
  //   amount: amount / 100,
  //   status: 'succeeded',
  //   created_at: new Date()
  // })
}

async function handlePaymentFailed(data: any) {
  const { payment_id, error, metadata } = data

  console.error(`Payment failed: ${payment_id}, error: ${error}`)

  // You might want to notify the user or retry
}
