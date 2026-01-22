/**
 * PayPal Payment Client
 * Handles payment order creation and capture using PayPal SDK
 */

import { Client, Environment, LogLevel, OrdersController, CheckoutPaymentIntent } from '@paypal/paypal-server-sdk'

export interface PayPalOrderParams {
  amount: string
  currency?: string
  description: string
  metadata?: Record<string, string>
  return_url: string
  cancel_url: string
}

export interface PayPalOrderResponse {
  id: string
  approval_url: string
  status: string
}

/**
 * Get PayPal client instance
 */
function getPayPalClient(): Client {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  const environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox'

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials are not configured')
  }

  return new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: clientId,
      oAuthClientSecret: clientSecret,
    },
    timeout: 0,
    environment: environment === 'production' ? Environment.Production : Environment.Sandbox,
    logging: {
      logLevel: LogLevel.Info,
      logRequest: { logBody: true },
      logResponse: { logHeaders: true },
    },
  })
}

/**
 * Create a PayPal order
 */
export async function createPayPalOrder(
  params: PayPalOrderParams
): Promise<PayPalOrderResponse> {
  const client = getPayPalClient()
  const ordersController = new OrdersController(client)

  const collect = {
    body: {
      intent: CheckoutPaymentIntent.Capture,
      purchaseUnits: [
        {
          amount: {
            currencyCode: params.currency || 'USD',
            value: params.amount,
          },
          description: params.description,
          customId: params.metadata ? JSON.stringify(params.metadata) : undefined,
        },
      ],
      applicationContext: {
        returnUrl: params.return_url,
        cancelUrl: params.cancel_url,
        brandName: 'Nano Banano',
        landingPage: 'BILLING',
        userAction: 'PAY_NOW',
      },
    },
    prefer: 'return=representation',
  }

  try {
    const { result, ...httpResponse } = await ordersController.createOrder(collect)

    // Find approval URL from links
    const approvalLink = result.links?.find((link) => link.rel === 'approve')

    if (!approvalLink?.href) {
      throw new Error('No approval URL found in PayPal response')
    }

    return {
      id: result.id || '',
      approval_url: approvalLink.href,
      status: result.status || 'CREATED',
    }
  } catch (error) {
    console.error('PayPal API Error:', error)
    throw new Error(`PayPal API Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Capture a PayPal order after approval
 */
export async function capturePayPalOrder(orderId: string): Promise<any> {
  const client = getPayPalClient()
  const ordersController = new OrdersController(client)

  try {
    const { result, ...httpResponse } = await ordersController.captureOrder({
      id: orderId,
      prefer: 'return=representation',
    })

    return result
  } catch (error) {
    console.error('PayPal Capture Error:', error)
    throw new Error(`PayPal Capture Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get order details
 */
export async function getPayPalOrder(orderId: string): Promise<any> {
  const client = getPayPalClient()
  const ordersController = new OrdersController(client)

  try {
    const { result, ...httpResponse } = await ordersController.getOrder({
      id: orderId,
    })

    return result
  } catch (error) {
    console.error('PayPal Get Order Error:', error)
    throw new Error(`PayPal Get Order Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
