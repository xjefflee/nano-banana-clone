# Supabase Authentication Setup

This project uses Supabase for Google OAuth authentication. Follow these steps to configure it.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. A Google Cloud Platform account for OAuth configuration

## Step 1: Create a Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in your project details and create the project
4. Wait for the project to be fully provisioned

## Step 2: Get Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

3. Add these to your `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Configure Google OAuth

### In Google Cloud Console

1. Go to https://console.cloud.google.com
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth client ID**
6. Choose **Web application**
7. Add authorized JavaScript origins:
   - `http://localhost:3000` (for local development)
   - Your production domain (e.g., `https://yourdomain.com`)
8. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://yourdomain.com/auth/callback` (for production)
   - **IMPORTANT**: Also add your Supabase callback URL:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
9. Save and copy your **Client ID** and **Client Secret**

### In Supabase Dashboard

1. Go to **Authentication** → **Providers**
2. Find **Google** in the list and click to configure
3. Enable the Google provider
4. Paste your Google **Client ID** and **Client Secret**
5. Under **Authorized Client IDs**, add your Google Client ID
6. Save the configuration

## Step 4: Configure Callback URL

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add your site URL to the allowed redirect URLs:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://yourdomain.com/auth/callback` (for production)

## Step 5: Test the Authentication Flow

1. Start your development server:
```bash
pnpm dev
```

2. Navigate to http://localhost:3000
3. Click the "Sign In" button in the header
4. You should be redirected to the login page at `/login`
5. Click "Continue with Google"
6. Complete the Google authentication
7. You should be redirected back to your app and see your user avatar in the header

## Troubleshooting

### "Invalid redirect URL" error
- Make sure you've added the correct callback URLs in both Google Cloud Console and Supabase dashboard
- The callback URL format is: `http://localhost:3000/auth/callback`

### "Authentication code expired"
- This can happen if you take too long during the OAuth flow
- Try the authentication process again

### User not showing up after login
- Check the browser console for any JavaScript errors
- Make sure your environment variables are loaded correctly
- Restart your development server after changing `.env.local`

## Architecture

The authentication implementation uses:
- **Server-side authentication** via `@supabase/ssr`
- **Middleware** for automatic token refresh
- **PKCE flow** for secure OAuth
- **Client Components** for UI interactivity
- **Server Components** for secure session validation

## File Structure

```
app/
  auth/
    callback/
      route.ts              # OAuth callback handler
    auth-code-error/
      page.tsx             # Error page for failed auth
  login/
    page.tsx               # Login page with Google button
lib/
  supabase/
    client.ts              # Browser client for Client Components
    server.ts              # Server client for Server Components
middleware.ts              # Token refresh middleware
components/
  header.tsx               # Updated with auth state
```

## Security Notes

- Never commit your `.env.local` file to version control
- The `anon` key is safe to use in the browser (it's rate-limited)
- Always validate sessions server-side using `supabase.auth.getUser()`
- The middleware handles automatic token refresh
