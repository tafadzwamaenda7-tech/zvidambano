# ZVIDA PWA Backend Setup - Supabase

![ZVIDAMBANO logo](public/logo.jpeg)

This guide will help you set up Supabase as the backend for the ZVIDA Progressive Web App.

## Overview

ZVIDA now uses **Supabase** for backend services:
- **Authentication** - User login/signup with email and password
- **Real-time Database** - PostgreSQL with real-time sync capabilities
- **Row-Level Security** - Built-in authorization policies
- **Service Workers** - Offline-first PWA capabilities with IndexedDB
- **File Storage** - Cloud storage for photos and documents

## Prerequisites

- Supabase account (free tier available at https://app.supabase.com)
- Git installed locally
- Node.js 18+ and npm

## Step 1: Create Supabase Project

1. Go to [Supabase](https://app.supabase.com)
2. Click **New Project**
3. Select your organization (or create one)
4. Enter project details:
   - Name: `zvida` (or your preference)
   - Database Password: Create a strong password and save it
   - Region: Choose closest to your users (e.g., `Frankfurt` for Africa/Europe)
5. Click **Create new project** (takes 1-2 minutes)

## Step 2: Get API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
3. Save in your `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
```

## Step 3: Create Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy the contents of `server/schema.sql`
4. Paste into the SQL editor
5. Click **Run** (execute all queries)

This creates all necessary tables with Row-Level Security policies.

## Step 4: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled (default)
3. Go to **Email Templates** and customize welcome email if desired
4. Go to **Settings**:
   - Enable **Confirm email**
   - Set **Redirect URLs** to include:
     - `http://localhost:5173/` (development)
     - `http://localhost:5173/login.html`
     - Your production domain

## Step 5: Set Up Storage (Optional)

1. Go to **Storage**
2. Create two new buckets:
   - `listings` (for product photos)
   - `documents` (for contracts/receipts)
3. For each bucket:
   - Make it **Public**
   - Add RLS policy to allow users to upload/read their own files

## Step 6: Install Dependencies

```bash
npm install
```

## Step 7: Test the Setup

```bash
npm run dev
```

Visit `http://localhost:5173/login.html` and:
1. Sign up with test credentials
2. Check email confirmation
3. Log in
4. You should see the dashboard

## Project Structure

```
src/lib/
├── supabase.ts       # Supabase client & types
├── auth.ts           # Authentication utilities
├── api.ts            # Database CRUD operations
├── pwa.ts            # PWA/Service Worker management
public/
├── sw.ts             # Service Worker (offline support)
├── manifest.json     # PWA manifest
```

## Key Features

### Offline Support
- Service Worker caches all assets and API responses
- App works offline with cached data
- Automatic sync when connection restored

### Real-time Updates
- Subscribe to database changes in real-time
- Example:
```typescript
supabase
  .from('listings')
  .on('*', (payload) => {
    console.log('Listing updated:', payload);
  })
  .subscribe();
```

### Row-Level Security
- Users can only access their own data
- Policies are enforced at the database level
- No client-side security needed

## Common Tasks

### Add New Table

1. Create in SQL Editor:
```sql
CREATE TABLE public.my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id),
  data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.my_table ENABLE ROW LEVEL SECURITY;
```

2. Add policy:
```sql
CREATE POLICY "Users access their data" ON public.my_table
  FOR ALL USING (auth.uid() = user_id);
```

3. Update `src/lib/api.ts` with CRUD functions

### Upload Files

```typescript
import { supabase } from './supabase';

const { data, error } = await supabase.storage
  .from('listings')
  .upload(`${userId}/photo.jpg`, file);
```

### Listen to Changes

```typescript
supabase
  .from('contracts')
  .on('INSERT', (payload) => {
    console.log('New contract:', payload.new);
  })
  .subscribe();
```

## Debugging

### Check Auth State
```typescript
import { getAuthState } from './lib/auth';
console.log(getAuthState());
```

### Check Service Worker
Open DevTools → Application → Service Workers

### View Database Logs
In Supabase dashboard → Logs → Query Performance

## Troubleshooting

### "Supabase environment variables not set"
- Copy `.env.example` to `.env`
- Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server

### "User doesn't have permission"
- Check Row-Level Security policies in Supabase dashboard
- Ensure you're authenticated
- Verify policy uses `auth.uid()`

### "Service Worker not registering"
- Ensure HTTPS or localhost
- Check browser DevTools → Application → Service Workers
- Clear cache and hard refresh (Ctrl+Shift+R)

### "Offline features not working"
- Service Worker must be registered first
- Check `npm run dev` output for registration messages
- Open DevTools → Application → Caches

## Next Steps

1. **Customize Dashboard** - Update `src/dashboards/*.ts` to use Supabase APIs
2. **Add Real-time Sync** - Use subscriptions for live updates
3. **Extend Schema** - Add more tables as needed
4. **Production** - Deploy to Vercel, Netlify, or any static host

## Support

- [Supabase Docs](https://supabase.com/docs)
- [PWA Docs](https://web.dev/progressive-web-apps/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

## Resources

- Example queries: `src/lib/api.ts`
- Example auth flow: `src/lib/auth.ts`
- Database schema: `server/schema.sql`
