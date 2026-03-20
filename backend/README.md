# Golf Charity Backend API

Express.js + Supabase backend for the Golf Charity Subscription Platform.

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account with a project created

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Fill in your Supabase credentials:
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Your service role key
   - `FRONTEND_URL`: Frontend URL (e.g., http://localhost:5173)

4. Run Supabase migrations in your Supabase dashboard:
   - Navigate to SQL Editor
   - Copy and run each migration file from `supabase/migrations/`
   - Start with `001_base_schema.sql`, then `002_rls_policies.sql`, then `003_seed.sql`

### Development

```bash
npm run dev
```

Server will start on http://localhost:4000

### Build

```bash
npm run build
```

Compiled files go to `dist/`

### Production

```bash
npm run start
```

## Project Structure

```
src/
  app.ts                 # Express app setup
  server.ts              # Entry point
  lib/
    env.ts              # Environment validation
    supabase.ts         # Supabase client
    constants.ts        # App constants
    stripe/             # Stripe integration stubs
  middleware/           # Express middleware
  routes/               # API routes
  controllers/          # Request handlers
  services/             # Business logic
  validators/           # Zod schemas
  types/                # TypeScript types
  draw-engine/          # Draw logic
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Create user account
- `GET /api/auth/me` - Get current user

### Subscriptions
- `GET /api/subscriptions/status` - Get subscription status
- `POST /api/subscriptions/mock-checkout` - Demo checkout
- `POST /api/subscriptions/mock-cancel` - Cancel subscription

### Scores
- `GET /api/scores` - Get user's scores
- `POST /api/scores` - Add score
- `PUT /api/scores/:id` - Update score
- `DELETE /api/scores/:id` - Delete score

### Draws
- `GET /api/draws` - List draws
- `GET /api/draws/upcoming` - Next draw
- `GET /api/draws/:id` - Draw details
- `POST /api/draws/simulate` - Simulate draw (admin)
- `POST /api/draws/:id/publish` - Publish results (admin)

### Charities
- `GET /api/charities` - List charities
- `GET /api/charities/featured` - Featured charities
- `GET /api/charities/:id` - Charity details

### Winners / Payouts
- `GET /api/winners/me` - User's winnings
- `POST /api/winners/:id/upload-proof` - Upload verification
- `GET /api/winners` - All winners (admin)
- `POST /api/winners/:id/verify` - Verify proof (admin)
- `POST /api/winners/:id/mark-paid` - Mark as paid (admin)

### Admin
- `GET /api/admin/users` - All users
- `GET /api/admin/reports` - Dashboard reports

## Authentication

All protected endpoints require `Authorization: Bearer <jwt_token>` header.

JWT tokens come from Supabase Auth. The backend validates and decodes them.

## Response Format

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Demo Mode

Payment is mocked. Stripe is NOT integrated yet.

To transition to live Stripe later:
1. Fill in `PLANS.*.stripePriceId` in `src/lib/stripe/plans.ts`
2. Implement Stripe checkout logic
3. Set `PAYMENT_MODE=live` in `.env`

## License

Digital Heroes © 2026
