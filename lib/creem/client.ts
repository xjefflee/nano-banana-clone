/**
 * Creem Payment Client
 * Handles payment checkout session creation
 */

export interface CheckoutSessionParams {
  product_id: string
  success_url: string
  customer?: {
    email: string
  }
  metadata?: Record<string, string>
}

export interface CheckoutSessionResponse {
  id: string
  checkout_url: string
  status: string
}

/**
 * Create a checkout session with Creem
 */
export async function createCheckoutSession(
  params: CheckoutSessionParams
): Promise<CheckoutSessionResponse> {
  const apiKey = process.env.CREEM_API_KEY
  const apiUrl = process.env.CREEM_API_URL || 'https://api.creem.io'

  if (!apiKey) {
    throw new Error('CREEM_API_KEY is not configured')
  }

  const response = await fetch(`${apiUrl}/v1/checkouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }))
    console.error('Creem API Error Response:', error)
    throw new Error(`Creem API Error: ${error.message || response.statusText}`)
  }

  const data = await response.json()
  console.log('Creem API Success Response:', data)
  return data
}

/**
 * Get checkout session details
 */
export async function getCheckoutSession(sessionId: string): Promise<any> {
  const apiKey = process.env.CREEM_API_KEY
  const apiUrl = process.env.CREEM_API_URL || 'https://api.creem.io'

  if (!apiKey) {
    throw new Error('CREEM_API_KEY is not configured')
  }

  const response = await fetch(`${apiUrl}/v1/checkouts/${sessionId}`, {
    headers: {
      'x-api-key': apiKey,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get checkout session: ${response.statusText}`)
  }

  return response.json()
}
