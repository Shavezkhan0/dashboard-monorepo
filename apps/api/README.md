# API Server

Backend API server built with Hono and Supabase.

## Setup

1. Copy `.env.example` to `.env`
2. Fill in your Supabase credentials
3. Run database migrations (see database setup)

## Development

```bash
pnpm dev
```

Runs on http://localhost:4000

## Environment Variables

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for admin operations)
- `PORT` - Server port (default: 4000)
