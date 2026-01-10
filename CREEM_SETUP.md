# Creem Payment Integration Setup

This guide will help you set up Creem payment integration for Nano Banano.

## Prerequisites

1. A Creem account (sign up at https://creem.io)
2. Access to your Creem dashboard

## Step 1: Get Your Creem API Key

1. Log in to your Creem dashboard
2. Navigate to **Settings** → **API Keys**
3. Create a new API key or copy your existing key
4. Add it to your `.env.local` file:

```bash
CREEM_API_KEY=your_creem_api_key_here
CREEM_API_URL=https://api.creem.io
```

For testing, you can use the test API:
```bash
CREEM_API_URL=https://test-api.creem.io
```

## Step 2: Create Products in Creem Dashboard

You need to create the following products in your Creem dashboard:

### Subscription Products (6 products)

1. **Basic Monthly**
   - Name: Nano Banano Basic (Monthly)
   - Price: $12/month
   - Type: Subscription
   - Billing: Monthly
   - Copy the Product ID → `CREEM_PRODUCT_BASIC_MONTHLY`

2. **Basic Yearly**
   - Name: Nano Banano Basic (Yearly)
   - Price: $144/year
   - Type: Subscription
   - Billing: Yearly
   - Copy the Product ID → `CREEM_PRODUCT_BASIC_YEARLY`

3. **Pro Monthly**
   - Name: Nano Banano Pro (Monthly)
   - Price: $19.50/month
   - Type: Subscription
   - Billing: Monthly
   - Copy the Product ID → `CREEM_PRODUCT_PRO_MONTHLY`

4. **Pro Yearly**
   - Name: Nano Banano Pro (Yearly)
   - Price: $234/year
   - Type: Subscription
   - Billing: Yearly
   - Copy the Product ID → `CREEM_PRODUCT_PRO_YEARLY`

5. **Max Monthly**
   - Name: Nano Banano Max (Monthly)
   - Price: $80/month
   - Type: Subscription
   - Billing: Monthly
   - Copy the Product ID → `CREEM_PRODUCT_MAX_MONTHLY`

6. **Max Yearly**
   - Name: Nano Banano Max (Yearly)
   - Price: $960/year
   - Type: Subscription
   - Billing: Yearly
   - Copy the Product ID → `CREEM_PRODUCT_MAX_YEARLY`

### Credit Pack Products (4 products)

1. **1,000 Credits**
   - Name: 1,000 Credits
   - Price: $10
   - Type: One-time payment
   - Copy the Product ID → `CREEM_PRODUCT_CREDITS_1000`

2. **5,000 Credits**
   - Name: 5,000 Credits
   - Price: $45
   - Type: One-time payment
   - Copy the Product ID → `CREEM_PRODUCT_CREDITS_5000`

3. **10,000 Credits**
   - Name: 10,000 Credits
   - Price: $80
   - Type: One-time payment
   - Copy the Product ID → `CREEM_PRODUCT_CREDITS_10000`

4. **50,000 Credits**
   - Name: 50,000 Credits
   - Price: $350
   - Type: One-time payment
   - Copy the Product ID → `CREEM_PRODUCT_CREDITS_50000`

## Step 3: Configure Environment Variables

Add all product IDs to your `.env.local` file:

```bash
# Subscription Plans
CREEM_PRODUCT_BASIC_MONTHLY=prod_xxxxx
CREEM_PRODUCT_BASIC_YEARLY=prod_xxxxx
CREEM_PRODUCT_PRO_MONTHLY=prod_xxxxx
CREEM_PRODUCT_PRO_YEARLY=prod_xxxxx
CREEM_PRODUCT_MAX_MONTHLY=prod_xxxxx
CREEM_PRODUCT_MAX_YEARLY=prod_xxxxx

# Credit Packs
CREEM_PRODUCT_CREDITS_1000=prod_xxxxx
CREEM_PRODUCT_CREDITS_5000=prod_xxxxx
CREEM_PRODUCT_CREDITS_10000=prod_xxxxx
CREEM_PRODUCT_CREDITS_50000=prod_xxxxx
```

## Step 4: Set Up Webhooks

1. In your Creem dashboard, go to **Settings** → **Webhooks**
2. Click **Add Webhook Endpoint**
3. Enter your webhook URL:
   - Production: `https://yourdomain.com/api/webhooks/creem`
   - Development: Use a service like ngrok to expose localhost
4. Select the following events to listen to:
   - `checkout.completed`
   - `subscription.created`
   - `subscription.updated`
   - `subscription.cancelled`
   - `payment.succeeded`
   - `payment.failed`
5. Save the webhook

## Step 5: Database Setup (Optional)

You may want to create database tables to track:

### User Credits Table
```sql
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  credits INTEGER NOT NULL DEFAULT 0,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### User Subscriptions Table
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  subscription_id TEXT UNIQUE NOT NULL,
  plan_name TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Step 6: Test the Integration

1. Start your development server:
```bash
pnpm dev
```

2. Navigate to http://localhost:3000/pricing

3. Try clicking on a plan's "Get Started" button

4. You should be redirected to Creem's checkout page

5. Complete a test transaction (if using test mode)

6. Verify you're redirected back to the success page

## Troubleshooting

### "Product not configured" error
- Make sure all product IDs are set in `.env.local`
- Restart your development server after adding environment variables

### Checkout session creation fails
- Verify your `CREEM_API_KEY` is correct
- Check that you're using the correct API URL (test vs production)
- Look at the server logs for detailed error messages

### Webhooks not working
- Make sure your webhook URL is accessible from the internet
- Use ngrok for local development: `ngrok http 3000`
- Check webhook signature validation (if implemented)
- Verify the correct events are selected in Creem dashboard

## Production Deployment

Before deploying to production:

1. Switch from test API to production API
2. Update `CREEM_API_KEY` with your production key
3. Update all product IDs to production product IDs
4. Set `NEXT_PUBLIC_APP_URL` to your production domain
5. Configure production webhook URL in Creem dashboard
6. Add `SUPABASE_SERVICE_ROLE_KEY` for database operations

## Security Notes

- Never commit `.env.local` to version control
- Keep your `CREEM_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` secret
- Validate webhook signatures in production (implement in webhook handler)
- Use HTTPS for all production endpoints
