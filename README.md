# Sprinter Cargo

A two-sided marketplace for last-mile delivery. Drivers pay a flat $99/month subscription and keep 100% of their delivery earnings. Shippers post deliveries, drivers bid on them.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database & Auth:** Supabase (PostgreSQL + Row Level Security + Auth)
- **Payments:** Stripe (driver subscriptions, shipper charges, driver payouts via Connect)
- **Maps:** Google Maps API (distance calculation, route display)
- **Email:** Resend
- **Mobile (future):** React Native (Expo)

## How It Works

1. **Shippers** sign up and post deliveries with pickup/dropoff locations, package details, and a budget.
2. **Drivers** browse available deliveries and place bids.
3. Shippers review bids and accept the best one.
4. The driver picks up and delivers the package.
5. Payment is processed automatically — the shipper is charged and the driver receives the full delivery fee.

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, signup, forgot password
│   ├── (shipper)/       # Shipper dashboard, create delivery, history, settings
│   ├── (driver)/        # Driver dashboard, delivery feed, bid management, settings
│   └── api/             # API routes
├── components/
│   ├── ui/              # Base UI components (Button, Input, Card, Modal)
│   ├── shipper/         # Shipper-specific components
│   └── driver/          # Driver-specific components
├── lib/
│   ├── supabase/        # Supabase client (browser + server)
│   ├── stripe/          # Stripe client setup
│   └── constants.ts     # App constants
└── types/               # TypeScript type definitions

supabase/
└── migrations/          # Database migration files
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account
- A [Google Cloud](https://console.cloud.google.com) project with Maps API enabled
- A [Resend](https://resend.com) account

### Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd sprinter-cargo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment variables and fill in your keys:
   ```bash
   cp .env.local.example .env.local
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key |
| `RESEND_API_KEY` | Resend API key for transactional emails |
| `NEXT_PUBLIC_APP_URL` | App base URL (default: `http://localhost:3000`) |

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm start` — Start production server
- `npm run lint` — Run ESLint
