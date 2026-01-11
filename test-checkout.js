#!/usr/bin/env node

/**
 * Test script to diagnose checkout API issues
 */

async function testCheckout() {
  console.log('🧪 Testing Checkout API...\n')

  try {
    const response = await fetch('http://localhost:3000/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': '' // Will work without auth for testing error messages
      },
      body: JSON.stringify({
        type: 'subscription',
        planName: 'Pro',
        billingCycle: 'yearly'
      })
    })

    console.log('📊 Response Status:', response.status)
    console.log('📊 Response Status Text:', response.statusText)
    console.log('')

    const data = await response.json()

    console.log('📦 Response Data:')
    console.log(JSON.stringify(data, null, 2))
    console.log('')

    if (response.ok) {
      console.log('✅ API call successful')
      if (data.url) {
        console.log('✅ Checkout URL received:', data.url)
      } else {
        console.log('❌ No URL in response!')
      }
    } else {
      console.log('❌ API call failed')
      console.log('Error:', data.error || 'Unknown error')
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message)
  }
}

testCheckout()
