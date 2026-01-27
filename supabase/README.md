# Database Migrations

This directory contains SQL migration files for setting up the Supabase database schema.

## Running Migrations

### Option 1: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order:
   - `001_create_users_table.sql`
   - `002_create_dashboards_table.sql`
   - `003_create_data_sources_table.sql`

### Option 2: Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Schema Overview

### Tables

1. **users** - Extended user information (extends auth.users)
2. **dashboards** - User-created dashboards with widgets
3. **data_sources** - Data sources for dashboards (CSV, API, database, manual)

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow users to manage their own data
- Allow public read access to public dashboards
- Allow service role full access (for API operations)
