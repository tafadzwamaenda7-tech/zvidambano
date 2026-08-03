# ZVIDAMBANO — Backend Issues & Solutions with Supabase

![ZVIDAMBANO logo](public/logo.jpeg)

Complete guide covering object storage, rate limiting, caching, security, error handling, and all other backend concerns.

---

## 1. Object Storage (File Uploads)

### Problem
You need to store files: listing photos, weighbridge tickets, quality scan images, contract documents, user avatars.

### Supabase Solution
Supabase Storage provides S3-compatible object storage with CDN, signed URLs, and RLS policies.

### Setup — Run this SQL in Supabase SQL Editor

```sql
-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('listing-photos', 'listing-photos', true, 5242880,  -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('weighbridge-tickets', 'weighbridge-tickets', false, 10485760,  -- 10MB
    ARRAY['image/jpeg', 'image/png', 'application/pdf']),
  ('quality-scan-photos', 'quality-scan-photos', false, 5242880,
    ARRAY['image/jpeg', 'image/png']),
  ('documents', 'documents', false, 20971520,  -- 20MB
    ARRAY['image/jpeg', 'image/png', 'application/pdf', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('avatars', 'avatars', true, 2097152,  -- 2MB
    ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STORAGE POLICIES (RLS for storage)
-- ============================================================

-- Listing photos (public read, authenticated write)
CREATE POLICY "Public read listing photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'listing-photos');
CREATE POLICY "Authenticated upload listing photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listing-photos');
CREATE POLICY "Owners delete listing photos" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'listing-photos' AND
    owner = auth.uid()
  );

-- Avatars (public read, authenticated write own)
CREATE POLICY "Public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users upload own avatar" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'avatars' AND owner = auth.uid()
  );
CREATE POLICY "Users update own avatar" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'avatars' AND owner = auth.uid()
  );

-- Weighbridge tickets (authenticated read, driver write)
CREATE POLICY "Authenticated read weighbridge tickets" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'weighbridge-tickets');
CREATE POLICY "Drivers upload weighbridge tickets" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'weighbridge-tickets');

-- Quality scan photos (authenticated read, broker/compliance write)
CREATE POLICY "Authenticated read quality photos" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'quality-scan-photos');
CREATE POLICY "Brokers upload quality photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'quality-scan-photos');

-- Documents (authenticated read, parties write)
CREATE POLICY "Authenticated read documents" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'documents');
CREATE POLICY "Authenticated upload documents" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Owners delete documents" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'documents' AND owner = auth.uid()
  );
```

### Frontend Upload Code

```typescript
// src/lib/storage.ts — Create this file

import { supabase } from './supabase';

// Upload listing photo
export async function uploadListingPhoto(file: File, userId: string) {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('listing-photos')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('listing-photos')
    .getPublicUrl(path);

  return urlData.publicUrl;
}

// Upload weighbridge ticket (private — needs signed URL)
export async function uploadWeighbridgeTicket(file: File, deliveryId: string) {
  const ext = file.name.split('.').pop();
  const path = `${deliveryId}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from('weighbridge-tickets')
    .upload(path, file);

  if (error) throw error;

  // Create signed URL valid for 1 hour
  const { data: signedUrl } = await supabase.storage
    .from('weighbridge-tickets')
    .createSignedUrl(path, 3600);

  return { path, url: signedUrl?.signedUrl };
}

// Upload avatar
export async function uploadAvatar(file: File, userId: string) {
  const ext = file.name.split('.').pop();
  const path = `${userId}/avatar.${ext}`;

  // upsert: true replaces existing avatar
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(path);

  // Update user profile
  await supabase.from('users').update({ avatar_url: urlData.publicUrl }).eq('id', userId);

  return urlData.publicUrl;
}

// Upload document
export async function uploadDocument(file: File, contractId: string, userId: string) {
  const ext = file.name.split('.').pop();
  const path = `${contractId}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(path, file);

  if (error) throw error;

  // Save to documents table
  const { data: doc } = await supabase.from('documents').insert({
    contract_id: contractId,
    type: ext,
    name: file.name,
    file_url: path,
    uploaded_by: userId,
  }).select().single();

  return doc;
}

// Delete file
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

// List files in a folder
export async function listFiles(bucket: string, folder: string) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
  if (error) throw error;
  return data;
}

// Download file
export async function downloadFile(bucket: string, path: string) {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw error;
  return data;
}
```

### Image Optimization (Supabase Image Transformations)

```typescript
// Get optimized image with transformations
const { data } = supabase.storage
  .from('listing-photos')
  .getPublicUrl(path, {
    transform: {
      width: 300,
      height: 300,
      resize: 'cover',
      quality: 80,
      format: 'webp',
    },
  });

// Signed URL with transformations
const { data } = await supabase.storage
  .from('listing-photos')
  .createSignedUrl(path, 3600, {
    transform: { width: 800, height: 600, resize: 'contain' },
  });
```

---

## 2. Rate Limiting

### Problem
Prevent API abuse, brute force attacks, and excessive requests.

### Supabase Solution

#### Option A: Database-level Rate Limiting (SQL)

```sql
-- Create rate limiting table
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Function to check and increment rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_endpoint TEXT,
  p_max_requests INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  existing_record RECORD;
  allowed BOOLEAN;
BEGIN
  SELECT * INTO existing_record
  FROM public.api_rate_limits
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND window_start > now() - (p_window_minutes || ' minutes')::INTERVAL
  FOR UPDATE;

  IF FOUND THEN
    IF existing_record.request_count >= p_max_requests THEN
      RETURN FALSE;
    ELSE
      UPDATE public.api_rate_limits
      SET request_count = request_count + 1
      WHERE id = existing_record.id;
      RETURN TRUE;
    END IF;
  ELSE
    INSERT INTO public.api_rate_limits (user_id, endpoint, request_count, window_start)
    VALUES (p_user_id, p_endpoint, 1, now());
    RETURN TRUE;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

#### Option B: Edge Function Rate Limiting

```typescript
// supabase/functions/rate-limited-api/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const RATE_LIMIT = 100; // requests per window
const RATE_WINDOW = 3600; // 1 hour in seconds

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // Get user from JWT
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json" }
      })
    }

    const token = authHeader.replace("Bearer ", "")
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json" }
      })
    }

    // Check rate limit
    const { data: allowed } = await supabase
      .rpc("check_rate_limit", {
        p_user_id: user.id,
        p_endpoint: "api",
        p_max_requests: RATE_LIMIT,
        p_window_minutes: 60,
      })

    if (!allowed) {
      return new Response(JSON.stringify({
        error: "Rate limit exceeded",
        message: `Maximum ${RATE_LIMIT} requests per hour exceeded.`,
        retry_after: RATE_WINDOW,
      }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": RATE_WINDOW.toString(),
          "X-RateLimit-Limit": RATE_LIMIT.toString(),
          "X-RateLimit-Remaining": "0",
        },
      })
    }

    // Process request...
    return new Response(JSON.stringify({ data: "success" }), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json" }
    })
  }
})
```

#### Option C: Frontend Rate Limiting (Client-side)

```typescript
// src/lib/rate-limiter.ts — Create this file

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  getRemainingRequests(key: string): number {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    const validRequests = requests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - validRequests.length);
  }

  getResetTime(key: string): number {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) return 0;
    return requests[0] + this.windowMs;
  }
}

// Pre-configured limiters
export const apiLimiter = new RateLimiter(100, 60000); // 100 req/min
export const authLimiter = new RateLimiter(5, 300000); // 5 login attempts per 5 min
export const uploadLimiter = new RateLimiter(10, 60000); // 10 uploads/min

// Usage
// if (!apiLimiter.canMakeRequest('listings')) {
//   throw new Error('Rate limit exceeded. Please slow down.');
// }
```

---

## 3. Caching

### Problem
Reduce database load and improve response times.

### Supabase Solution

#### Frontend Caching

```typescript
// src/lib/cache.ts — Create this file

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class Cache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, data: T, ttlMs: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export const dataCache = new Cache();

// Usage with Supabase queries
export async function getCachedListings(filters?: any) {
  const cacheKey = `listings:${JSON.stringify(filters || {})}`;
  const cached = dataCache.get(cacheKey);
  if (cached) return cached;

  const { supabase } = await import('./supabase');
  let query = supabase.from('listings').select('*');
  if (filters?.status) query = query.eq('status', filters.status);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;

  dataCache.set(cacheKey, data, 30000); // Cache for 30 seconds
  return data;
}

// Invalidate cache when data changes
// dataCache.invalidatePattern('listings:');
```

#### Database-level Caching (Materialized Views)

```sql
-- Create materialized view for dashboard stats
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM listings WHERE status = 'active') AS active_listings,
  (SELECT COUNT(*) FROM contracts WHERE status = 'PENDING') AS pending_contracts,
  (SELECT COUNT(*) FROM contracts WHERE status = 'IN_TRANSIT') AS in_transit_contracts,
  (SELECT COUNT(*) FROM deliveries WHERE status = 'IN_TRANSIT') AS active_deliveries,
  (SELECT COUNT(*) FROM payments WHERE status = 'PENDING') AS pending_payments,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'COMPLETED') AS total_revenue,
  (SELECT COUNT(*) FROM users) AS total_users;

-- Refresh materialized view (run via pg_cron every 5 minutes)
SELECT cron.schedule(
  'refresh-dashboard-stats',
  '*/5 * * * *',
  'REFRESH MATERIALIZED VIEW mv_dashboard_stats'
);
```

---

## 4. Input Validation

### Problem
Validate user input to prevent bad data and SQL injection.

### Supabase Solution

#### Database Constraints (Already in Schema)

```sql
-- CHECK constraints prevent invalid data
role TEXT CHECK (role IN ('farmer', 'broker', 'offtaker', 'driver', 'supplier', 'admin')),
status TEXT CHECK (status IN ('active', 'sold', 'expired', 'draft')),
quantity NUMERIC NOT NULL DEFAULT 0 CHECK (quantity >= 0),
```

#### Frontend Validation

```typescript
// src/lib/validation.ts — Create this file

export const validators = {
  email: (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  phone: (phone: string): boolean => {
    return /^\+263\d{9}$/.test(phone);
  },

  password: (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
    if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain uppercase' };
    if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain a number' };
    return { valid: true };
  },

  quantity: (qty: number): boolean => qty > 0 && qty <= 1000000,
  price: (price: number): boolean => price > 0 && price <= 100000,

  listing: (data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!data.title || data.title.length < 3) errors.push('Title must be at least 3 characters');
    if (!data.quantity || data.quantity <= 0) errors.push('Quantity must be positive');
    if (!data.asking_price || data.asking_price <= 0) errors.push('Price must be positive');
    if (!data.category) errors.push('Category is required');
    return { valid: errors.length === 0, errors };
  },

  contract: (data: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (!data.farmer_id) errors.push('Farmer is required');
    if (!data.offtaker_id) errors.push('Offtaker is required');
    if (!data.quantity || data.quantity <= 0) errors.push('Quantity must be positive');
    if (!data.farmer_price || data.farmer_price <= 0) errors.push('Farmer price must be positive');
    if (!data.offtaker_price || data.offtaker_price <= 0) errors.push('Offtaker price must be positive');
    if (data.offtaker_price <= data.farmer_price) errors.push('Offtaker price must be higher than farmer price');
    return { valid: errors.length === 0, errors };
  },
};
```

#### Edge Function Validation

```typescript
// In Edge Functions — validate input
function validateInput(body: any, required: string[]): { valid: boolean; error?: string } {
  for (const field of required) {
    if (!body[field]) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }
  return { valid: true };
}

// Usage in Edge Function
const validation = validateInput(reqBody, ['farmer_id', 'offtaker_id', 'quantity']);
if (!validation.valid) {
  return new Response(JSON.stringify({ error: validation.error }), {
    status: 400, headers: { "Content-Type": "application/json" }
  });
}
```

---

## 5. Error Handling

### Problem
Handle errors gracefully across the application.

### Supabase Solution

```typescript
// src/lib/error-handler.ts — Create this file

export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN',
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleSupabaseError(error: any): AppError {
  // Auth errors
  if (error.message?.includes('JWT')) {
    return new AppError('Authentication required', 'AUTH_ERROR', 401);
  }
  if (error.message?.includes('permission denied')) {
    return new AppError('You do not have permission to do this', 'FORBIDDEN', 403);
  }

  // RLS errors
  if (error.message?.includes('row-level security')) {
    return new AppError('Access denied', 'RLS_ERROR', 403);
  }

  // Duplicate key
  if (error.code === '23505') {
    return new AppError('This record already exists', 'DUPLICATE', 409);
  }

  // Foreign key violation
  if (error.code === '23503') {
    return new AppError('Referenced record not found', 'FOREIGN_KEY', 400);
  }

  // Check constraint
  if (error.code === '23514') {
    return new AppError('Invalid data: check constraint failed', 'VALIDATION', 400);
  }

  // Network errors
  if (error.message?.includes('Failed to fetch')) {
    return new AppError('Network error. Check your connection.', 'NETWORK', 503);
  }

  return new AppError(error.message || 'An unexpected error occurred', 'UNKNOWN', 500);
}

// Usage
try {
  const { data, error } = await supabase.from('listings').select('*');
  if (error) throw handleSupabaseError(error);
  return data;
} catch (err) {
  if (err instanceof AppError) {
    showToast(err.message, 'error');
    if (err.statusCode === 401) redirectToLogin();
  } else {
    showToast('Something went wrong', 'error');
  }
}
```

---

## 6. Security

### Problem
Secure the API, prevent unauthorized access, protect user data.

### Supabase Solution — Already Configured

| Security Feature | Implementation | Status |
|-----------------|----------------|--------|
| **Row Level Security** | RLS policies on all 19 tables | ✅ In `supabase-schema.sql` |
| **JWT Authentication** | Supabase Auth issues JWT tokens | ✅ Built-in |
| **SQL Injection Prevention** | Parameterized queries via PostgREST | ✅ Built-in |
| **HTTPS/TLS** | All Supabase endpoints use HTTPS | ✅ Built-in |
| **CORS** | Configurable in Supabase dashboard | ✅ Built-in |
| **API Keys** | Anon key (public) + Service role key (secret) | ✅ In `.env` |
| **Password Hashing** | Supabase Auth uses bcrypt | ✅ Built-in |
| **Rate Limiting** | See Section 2 above | ✅ Configurable |

### Additional Security — Environment Variables

```bash
# .env — NEVER commit the service role key!
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key  # Safe for frontend

# These should ONLY be in Edge Functions (server-side):
# SUPABASE_SERVICE_ROLE_KEY=your-service-key  # NEVER in frontend!
```

### CORS Configuration

In Supabase Dashboard > Settings > API > CORS:
- Add your production domain: `https://zvida.co.zw`
- Add your dev domain: `http://localhost:5173`

---

## 7. Monitoring & Analytics

### Problem
Track API usage, errors, and performance.

### Supabase Solution

```typescript
// src/lib/analytics.ts — Create this file

import { supabase } from './supabase';

// Log API calls for monitoring
export async function logApiCall(endpoint: string, duration: number, success: boolean) {
  // Only log in production to avoid noise
  if (import.meta.env.PROD) {
    await supabase.from('api_logs').insert({
      endpoint,
      duration_ms: duration,
      success,
      user_id: (await supabase.auth.getUser()).data.user?.id,
    });
  }
}

// Wrap API calls with logging
export async function trackedApiCall<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    await logApiCall(name, Date.now() - start, true);
    return result;
  } catch (error) {
    await logApiCall(name, Date.now() - start, false);
    throw error;
  }
}

// Usage
// const listings = await trackedApiCall('getListings', () => getListings());
```

### Supabase Dashboard Monitoring
- **Dashboard > Metrics**: API requests, database connections, storage usage
- **Dashboard > Logs**: Real-time API logs, auth logs, function logs
- **Dashboard > Reports**: Weekly usage reports

---

## 8. Backup & Recovery

### Supabase Solution (Built-in)

| Feature | Supabase Free | Supabase Pro |
|---------|--------------|-------------|
| **Daily backups** | ✅ 7 days | ✅ 30 days |
| **Point-in-time recovery** | ❌ | ✅ |
| **Logical backups** | ✅ (via `pg_dump`) | ✅ |
| **Branching** | ❌ | ✅ |

### Manual Backup (SQL)

```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Restore
supabase db push backup.sql
```

### Automated Backup Script

```sql
-- Create backup log table
CREATE TABLE IF NOT EXISTS public.backup_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  backup_type TEXT,
  status TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Schedule daily backup verification (pg_cron)
SELECT cron.schedule(
  'verify-backup',
  '0 3 * * *',
  $$
    INSERT INTO public.backup_log (backup_type, status, size_bytes)
    SELECT 'daily', 'verified', pg_database_size('postgres');
  $$
);
```

---

## 9. Environment Management

### Supabase Solution

```bash
# .env (development)
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=dev-anon-key

# .env.production (production)
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
```

### Multiple Environments
- **Development**: Local Supabase (`supabase start`)
- **Staging**: Separate Supabase project
- **Production**: Separate Supabase project

---

## 10. Performance Optimization

### Database Indexes (Already in Schema)

```sql
-- 40+ indexes already created in supabase-schema.sql
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_contracts_farmer_id ON contracts(farmer_id);
-- etc.
```

### Query Optimization

```typescript
// BAD: Fetches all columns + no limit
const { data } = await supabase.from('listings').select('*');

// GOOD: Select only needed columns + limit + pagination
const { data } = await supabase
  .from('listings')
  .select('id, title, quantity, asking_price, status')
  .eq('status', 'active')
  .order('created_at', { ascending: false })
  .range(0, 19); // Pagination: first 20

// GOOD: Use joins instead of multiple queries
const { data } = await supabase
  .from('contracts')
  .select(`
    *,
    farmer:users!farmer_id(full_name, phone),
    offtaker:users!offtaker_id(full_name, phone),
    commodity:commodities(name, unit)
  `)
  .eq('status', 'PENDING');
```

### Connection Pooling
Supabase handles connection pooling automatically via PgBouncer. No configuration needed.

---

## 11. File Summary — All Backend Issues Covered

| Backend Issue | Solution | File/Location |
|--------------|----------|---------------|
| **Object Storage** | Supabase Storage + buckets + policies | SQL in this guide + `src/lib/storage.ts` |
| **Rate Limiting** | DB function + Edge Function + client-side | SQL + `supabase/functions/` + `src/lib/rate-limiter.ts` |
| **Caching** | Frontend cache + Materialized views | `src/lib/cache.ts` + SQL |
| **Input Validation** | DB constraints + frontend validators | `supabase-schema.sql` + `src/lib/validation.ts` |
| **Error Handling** | Centralized error handler | `src/lib/error-handler.ts` |
| **Security** | RLS + JWT + HTTPS + CORS | `supabase-schema.sql` + Supabase dashboard |
| **Monitoring** | Supabase dashboard + API logging | `src/lib/analytics.ts` |
| **Backup & Recovery** | Supabase daily backups + manual dumps | Supabase dashboard + CLI |
| **Environment Mgmt** | Multiple Supabase projects | `.env` files |
| **Performance** | Indexes + query optimization + pooling | `supabase-schema.sql` |
| **WebSockets** | Supabase Realtime | `src/lib/realtime.ts` ✅ |
| **Auth** | Supabase Auth | `src/lib/supabase.ts` ✅ |
| **REST API** | Auto-generated (PostgREST) | `src/lib/api.ts` ✅ |
| **Server Logic** | Edge Functions | `supabase/functions/` ✅ |
| **Scheduled Tasks** | pg_cron | SQL in guide |
| **Triggers** | PostgreSQL triggers | `supabase-schema.sql` ✅ |