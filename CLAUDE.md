# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 landing page for "Nano Banana", an AI image editing tool. The project is a marketing/demo site built with React 19, TypeScript, and Tailwind CSS 4, featuring a prominent yellow banana theme throughout the design.

## Commands

### Development
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router) with React Server Components enabled
- **Styling**: Tailwind CSS 4 with custom theme using OKLCH color space
- **UI Components**: shadcn/ui (New York style) with Radix UI primitives
- **Forms**: react-hook-form with Zod validation
- **Icons**: lucide-react
- **Package Manager**: pnpm

### Project Structure
```
app/
  layout.tsx       # Root layout with metadata and Analytics
  page.tsx         # Main landing page (client component)
  globals.css      # Tailwind config with custom banana-themed color scheme
components/
  ui/              # 57 shadcn/ui components (Button, Card, etc.)
  image-upload.tsx # Main image editor UI (currently mock functionality)
  header.tsx       # Site header with navigation
  footer.tsx       # Site footer
  features.tsx     # Features showcase section
  showcase.tsx     # Image examples gallery
  reviews.tsx      # User reviews section
  faq.tsx          # FAQ accordion
  theme-provider.tsx # Dark mode support
hooks/
  use-mobile.ts    # Mobile breakpoint detection
  use-toast.ts     # Toast notification system
lib/
  utils.ts         # cn() utility for className merging
```

### Key Configuration Details

**Path Aliases** (via tsconfig.json):
- `@/*` maps to the root directory
- Standard shadcn aliases: `@/components`, `@/lib`, `@/hooks`, `@/lib/utils`, `@/components/ui`

**Next.js Config**:
- TypeScript build errors are ignored (`ignoreBuildErrors: true`)
- Image optimization is disabled (`unoptimized: true`)

**Color Scheme**:
- Custom banana-themed yellow accent colors using OKLCH color space
- Primary yellow: `oklch(0.8 0.15 90)`
- Dark mode support with adjusted yellows for accessibility
- All theme colors defined in `app/globals.css` using CSS custom properties

### Component Patterns

**shadcn/ui Integration**:
- All UI components use the `cn()` utility from `lib/utils.ts` for className merging
- Components follow the New York style variant
- Radix UI primitives provide accessible foundations

**Image Upload Component** (`components/image-upload.tsx`):
- Client-side only component using React hooks
- Currently shows mock/demo functionality (simulated 2-second generation)
- Two-panel layout: input (upload + prompt) and output gallery
- Uses FileReader API for local image preview

**Page Structure** (`app/page.tsx`):
- Single-page marketing site with sections: Hero, Image Editor, Features, Showcase, Reviews, FAQ
- Client component (`"use client"`) for interactivity
- Yellow gradient background effects using absolute positioning

### Styling Approach

- Tailwind CSS 4 with PostCSS plugin (`@tailwindcss/postcss`)
- Custom theme defined inline in `globals.css` using `@theme inline`
- OKLCH color space for perceptually uniform colors
- Responsive design using Tailwind breakpoints (sm, lg)
- Custom variants for dark mode using `@custom-variant dark`

### Important Notes

- The image editing functionality is currently a mock implementation (see `image-upload.tsx:28-34`)
- Vercel Analytics is integrated in the root layout
- No backend/API routes exist yet - this is purely a frontend demo
- TypeScript strict mode is enabled but build errors are ignored in production builds
