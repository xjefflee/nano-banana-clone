import { NextRequest, NextResponse } from 'next/server'
import { capturePayPalOrder } from '@/lib/paypal/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Capture the PayPal order
    const result = await capturePayPalOrder(orderId)

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Capture error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to capture order' },
      { status: 500 }
    )
  }
}
