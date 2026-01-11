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
   - Development: Use ngrok or similar service (e.g., `https://yessenia-arborescent-apollo.ngrok-free.dev/api/webhooks/creem`)
4. Select the following events to listen to:
   - `checkout.completed` - One-time payment completion
   - `subscription.active` - Subscription activated
   - `subscription.trialing` - Subscription in trial period
   - `subscription.canceled` - Subscription canceled
   - `subscription.expired` - Subscription expired
5. Copy the **Webhook Secret** from Creem dashboard
6. Add it to your `.env.local`:
   ```bash
   CREEM_WEBHOOK_SECRET=your_webhook_secret_here
   ```
7. Save the webhook

**Note**: The webhook handler includes HMAC-SHA256 signature verification for security.

## Step 5: Database Setup (Required)

Database tables are required for the webhook handlers to function properly.

### Run the Migration

A complete migration file has been created at `supabase/migrations/20260111_create_payment_tables.sql`.

To apply the migration:

1. **Using Supabase CLI** (recommended):
   ```bash
   supabase db push
   ```

2. **Using Supabase Dashboard**:
   - Go to your Supabase project
   - Navigate to SQL Editor
   - Copy the contents of `supabase/migrations/20260111_create_payment_tables.sql`
   - Execute the SQL

### What Gets Created

The migration creates:

1. **`user_profiles` table**: Stores user credit balances
2. **`user_subscriptions` table**: Tracks subscription status and billing periods
3. **Indexes**: For optimized queries
4. **Row Level Security (RLS)**: Secure data access policies
5. **Triggers**: Auto-create user profiles on signup
6. **Functions**: Helper functions for credit management

### Manual Creation (Alternative)

If you prefer to create tables manually, see the SQL schemas in the migration file.

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
- Verify `CREEM_WEBHOOK_SECRET` is set in `.env.local`
- Check webhook signature validation in server logs
- Verify the correct events are selected in Creem dashboard
- Check that the webhook endpoint returns 200 OK for test events

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
- Keep your `CREEM_API_KEY`, `CREEM_WEBHOOK_SECRET`, and `SUPABASE_SERVICE_ROLE_KEY` secret
- Webhook signatures are validated using HMAC-SHA256 (already implemented)
- Use HTTPS for all production endpoints
- Row Level Security (RLS) is enabled on all database tables
