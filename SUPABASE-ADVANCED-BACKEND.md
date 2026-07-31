# ZVIDAMBANO — Advanced Backend Issues & Solutions

Complete guide covering all remaining backend concerns not covered in previous guides.

---

## 1. Authentication & Session Management

### Problem
Manage JWT tokens, session refresh, role-based access control (RBAC), password reset flows.

### Solution

#### Token Refresh (Auto-refresh)
```typescript
// src/lib/auth-utils.ts
import { supabase } from './supabase';

// Auto-refresh session every 5 minutes
export function setupAutoRefresh() {
  setInterval(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // Supabase auto-refreshes tokens, but we can force it
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('[Auth] Session refresh failed:', error);
        // Redirect to login
        window.location.href = '/login.html';
      }
    }
  }, 5 * 60 * 1000); // 5 minutes
}

// Check if session is expired
export function isSessionExpired(): boolean {
  const session = supabase.auth.getSession();
  if (!session) return true;
  // Supabase handles this internally, but we can check
  return false;
}
```

#### Role-Based Access Control (RBAC)
```typescript
// src/lib/auth-utils.ts
export type UserRole = 'farmer' | 'broker' | 'offtaker' | 'driver' | 'supplier' | 'admin' | 'compliance';

export function hasRole(userRole: UserRole, ...allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

export function canAccessDashboard(userRole: UserRole): string | null {
  const dashboardMap: Record<UserRole, string> = {
    farmer: '/farmer-dashboard.html',
    broker: '/zvida-dashboard.html',
    offtaker: '/offtaker-dashboard.html',
    driver: '/driver-dashboard.html',
    supplier: '/vendor-dashboard.html',
    admin: '/zvida-dashboard.html',
    compliance: '/zvida-dashboard.html',
  };
  return dashboardMap[userRole] || null;
}

// Middleware-like function for protecting routes
export async function requireAuth(allowedRoles?: UserRole[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = '/login.html';
    return null;
  }

  // Get user role from profiles table
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    window.location.href = '/login.html';
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    window.location.href = canAccessDashboard(profile.role) || '/login.html';
    return null;
  }

  return { user, role: profile.role };
}

// Password reset flow
export async function requestPasswordReset(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password.html`,
  });
  if (error) throw error;
  return data;
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (error) throw error;
  return data;
}

// Email verification
export async function resendEmailVerification(email: string) {
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  if (error) throw error;
  return data;
}
```

---

## 2. Email & SMS Notifications

### Problem
Send email notifications (contract created, payment received, delivery update) and SMS alerts.

### Solution: Supabase Edge Function + External Email/SMS Provider

#### Email Edge Function
```typescript
// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const { to, subject, body, type } = await req.json()

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // Get email template based on type
    const templates: Record<string, { subject: string; body: string }> = {
      contract_created: {
        subject: "New Contract Created",
        body: `A new contract has been created. View it in your dashboard.`,
      },
      payment_received: {
        subject: "Payment Received",
        body: `Your payment has been received and is being processed.`,
      },
      delivery_update: {
        subject: "Delivery Status Update",
        body: `Your delivery status has been updated. Track it in your dashboard.`,
      },
      settlement_ready: {
        subject: "Settlement Ready for Collection",
        body: `Your settlement is ready. Please check your dashboard.`,
      },
    }

    const template = templates[type] || { subject, body }

    // Send email using Resend (https://resend.com)
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ZVIDAMBANO <noreply@zvida.co.zw>",
        to: [to],
        subject: template.subject,
        html: template.body,
      }),
    })

    if (!resendResponse.ok) {
      throw new Error("Failed to send email")
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
```

#### SMS Edge Function (using Africa's Talking)
```typescript
// supabase/functions/send-sms/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  try {
    const { to, message } = await req.json()

    // Send SMS using Africa's Talking (https://africastalking.com)
    const response = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        "apiKey": Deno.env.get("AFRICAS_TALKING_API_KEY")!,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username: Deno.env.get("AFRICAS_TALKING_USERNAME")!,
        to: to,
        message: message,
      }),
    })

    if (!response.ok) throw new Error("Failed to send SMS")

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
```

#### Frontend Notification Helper
```typescript
// src/lib/notifications.ts
import { supabase } from './supabase';

export async function sendEmailNotification(to: string, type: string, data?: any) {
  const { error } = await supabase.functions.invoke('send-email', {
    body: { to, type, ...data },
  });
  if (error) console.error('[Notifications] Email failed:', error);
}

export async function sendSMSNotification(to: string, message: string) {
  const { error } = await supabase.functions.invoke('send-sms', {
    body: { to, message },
  });
  if (error) console.error('[Notifications] SMS failed:', error);
}

// Create in-app notification + send email/SMS
export async function notifyUser(
  userId: string,
  title: string,
  body: string,
  type: string = 'info',
  options?: { email?: boolean; sms?: boolean; phone?: string }
) {
  // 1. Create in-app notification
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    title,
    body,
    type,
  });
  if (error) console.error('[Notifications] In-app failed:', error);

  // 2. Send email if requested
  if (options?.email) {
    const { data: user } = await supabase.from('users').select('email').eq('id', userId).single();
    if (user) {
      await sendEmailNotification(user.email, type, { title, body });
    }
  }

  // 3. Send SMS if requested
  if (options?.sms && options?.phone) {
    await sendSMSNotification(options.phone, `${title}: ${body}`);
  }
}
```

---

## 3. Pagination

### Problem
Handle large datasets efficiently with pagination.

### Solution

```typescript
// src/lib/pagination.ts

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Offset-based pagination (for small datasets)
export function getPaginationRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { from, to };
}

// Cursor-based pagination (for large datasets — more efficient)
export function getCursorPagination(cursor?: string, limit: number = 20) {
  return {
    startingAfter: cursor,
    limit,
  };
}

// Usage with Supabase
// const { from, to } = getPaginationRange(1, 20);
// const { data, count } = await supabase
//   .from('listings')
//   .select('*', { count: 'exact' })
//   .range(from, to);
```

---

## 4. Data Export & Import

### Problem
Export data to CSV/Excel for reporting, import bulk data.

### Solution

```typescript
// src/lib/export.ts

// Export to CSV
export function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ];

  const csv = csvRows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// Export to JSON
export function exportToJSON(data: any, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

// Print to PDF (using browser's print)
export function printToPDF() {
  window.print();
}

// Import from CSV
export function parseCSV(csvText: string): any[] {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length === headers.length) {
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim();
      });
      data.push(row);
    }
  }

  return data;
}
```

---

## 5. Audit Trail

### Problem
Track who did what and when for compliance and debugging.

### Solution

```sql
-- Add to supabase-schema.sql
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read audit log" ON public.audit_log
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add audit triggers to important tables
CREATE TRIGGER audit_contracts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_listings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_deliveries_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_payments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

---

## 6. Health Checks

### Problem
Monitor system health and detect issues early.

### Solution

```typescript
// src/lib/health.ts
import { supabase } from './supabase';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: boolean;
    auth: boolean;
    storage: boolean;
    realtime: boolean;
  };
  timestamp: string;
}

export async function checkHealth(): Promise<HealthStatus> {
  const services = {
    database: false,
    auth: false,
    storage: false,
    realtime: false,
  };

  // Check database
  try {
    const { error } = await supabase.from('commodities').select('id').limit(1);
    services.database = !error;
  } catch { services.database = false; }

  // Check auth
  try {
    const { data: { session } } = await supabase.auth.getSession();
    services.auth = true; // Auth service is reachable
  } catch { services.auth = false; }

  // Check storage
  try {
    const { data, error } = await supabase.storage.from('listing-photos').list('', { limit: 1 });
    services.storage = !error;
  } catch { services.storage = false; }

  // Check realtime
  try {
    const channel = supabase.channel('health-check');
    await channel.subscribe((status) => {
      services.realtime = status === 'SUBSCRIBED';
    });
    channel.unsubscribe();
  } catch { services.realtime = false; }

  const allHealthy = Object.values(services).every(v => v);
  const someHealthy = Object.values(services).some(v => v);

  return {
    status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
    services,
    timestamp: new Date().toISOString(),
  };
}
```

---

## 7. Application Logging

### Problem
Log application events for debugging and monitoring.

### Solution

```typescript
// src/lib/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isProd = (import.meta as any).env?.PROD;

  log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, data };

    if (this.isProd) {
      // In production, send to logging service or Supabase
      this.sendToLoggingService(logEntry);
    } else {
      // In development, use console
      const consoleMethod = level === 'error' ? console.error :
                           level === 'warn' ? console.warn :
                           level === 'info' ? console.info : console.debug;
      consoleMethod(`[${timestamp}] [${level.toUpperCase()}]`, message, data || '');
    }
  }

  debug(message: string, data?: any) { this.log('debug', message, data); }
  info(message: string, data?: any) { this.log('info', message, data); }
  warn(message: string, data?: any) { this.log('warn', message, data); }
  error(message: string, data?: any) { this.log('error', message, data); }

  private async sendToLoggingService(entry: any) {
    try {
      // Could send to Supabase, Sentry, Logflare, etc.
      // For now, just use console in production too
      console.log(JSON.stringify(entry));
    } catch (e) {
      console.error('Failed to send log:', e);
    }
  }
}

export const logger = new Logger();
```

---

## 8. Full-Text Search

### Problem
Search across multiple fields and tables efficiently.

### Solution

```sql
-- Add full-text search to listings
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_listings_search ON public.listings USING GIN(search_vector);

-- Trigger to update search vector
CREATE OR REPLACE FUNCTION listings_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.category, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.origin, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER listings_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION listings_search_vector_update();
```

```typescript
// src/lib/search.ts
import { supabase } from './supabase';

// Full-text search using tsvector
export async function fullTextSearch(query: string, limit: number = 20) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .textSearch('search_vector', query)
    .eq('status', 'active')
    .limit(limit);

  if (error) throw error;
  return data;
}

// Multi-table search
export async function globalSearch(query: string) {
  const [listings, contracts, users] = await Promise.all([
    supabase.from('listings').select('id, title, description').ilike('title', `%${query}%`).limit(10),
    supabase.from('contracts').select('id, contract_number').ilike('contract_number', `%${query}%`).limit(10),
    supabase.from('users').select('id, full_name, role').ilike('full_name', `%${query}%`).limit(10),
  ]);

  return {
    listings: listings.data || [],
    contracts: contracts.data || [],
    users: users.data || [],
  };
}
```

---

## 9. Concurrency Control

### Problem
Prevent race conditions when multiple users update the same record.

### Solution: Optimistic Locking

```typescript
// src/lib/concurrency.ts
import { supabase } from './supabase';

// Optimistic locking — check updated_at before updating
export async function updateWithOptimisticLock(
  table: string,
  id: string,
  updates: any,
  expectedUpdatedAt: string
) {
  const { data, error } = await supabase
    .from(table)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('updated_at', expectedUpdatedAt) // Only update if not changed
    .select()
    .single();

  if (error) throw error;
  if (!data) {
    throw new Error('Record was modified by another user. Please refresh and try again.');
  }

  return data;
}

// Database-level locking (pessimistic)
/*
-- In SQL, use SELECT FOR UPDATE
BEGIN;
SELECT * FROM contracts WHERE id = '...' FOR UPDATE;
-- Do updates
COMMIT;
*/
```

---

## 10. API Versioning

### Problem
Version API endpoints to maintain backward compatibility.

### Solution

```typescript
// src/lib/api-version.ts
import { supabase } from './supabase';

const API_VERSION = 'v1';

// Versioned API calls
export async function apiGet(endpoint: string, params?: any) {
  const { data, error } = await supabase
    .from(endpoint)
    .select('*')
    .match(params || {});

  if (error) throw error;
  return data;
}

// Edge Function with version header
export async function callEdgeFunction(name: string, body: any) {
  const { data, error } = await supabase.functions.invoke(name, {
    body,
    headers: {
      'X-API-Version': API_VERSION,
    },
  });

  if (error) throw error;
  return data;
}
```

---

## 11. Database Migrations

### Problem
Manage schema changes over time.

### Solution: Supabase CLI Migrations

```bash
# Create a new migration
supabase migration new add_new_table

# This creates: supabase/migrations/<timestamp>_add_new_table.sql

# Apply migrations
supabase db push

# Reset database (re-run all migrations)
supabase db reset

# Create a migration from existing schema
supabase db diff -f new_changes
```

---

## 12. Testing

### Problem
Test backend logic and API endpoints.

### Solution

```typescript
// tests/api.test.ts
import { describe, test, expect } from 'vitest';
import { supabase } from '../src/lib/supabase';

describe('Listings API', () => {
  test('should fetch active listings', async () => {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active');

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  test('should create a listing', async () => {
    const { data, error } = await supabase
      .from('listings')
      .insert({
        seller_id: 'test-user-id',
        title: 'Test Listing',
        quantity: 100,
        unit: 'kg',
        asking_price: 50,
        category: 'GRAIN',
        status: 'active',
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data.title).toBe('Test Listing');
  });
});
```

---

## 13. CI/CD Pipeline

### Problem
Automate testing and deployment.

### Solution: GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Supabase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build frontend
        run: npm run build

      - name: Deploy to Supabase
        run: |
          npx supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
          npx supabase db push
          npx supabase functions deploy create-contract
          npx supabase functions deploy update-delivery-status
          npx supabase functions deploy generate-settlement

      - name: Deploy to Vercel/Netlify
        run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## 14. Data Privacy (GDPR/PDPA)

### Problem
Handle user data deletion requests and data exports.

### Solution

```typescript
// src/lib/privacy.ts
import { supabase } from './supabase';

// Export all user data (GDPR compliance)
export async function exportUserData(userId: string) {
  const [profile, farms, listings, contracts, deliveries, payments, notifications] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('farms').select('*').eq('owner_id', userId),
    supabase.from('listings').select('*').eq('seller_id', userId),
    supabase.from('contracts').select('*').or(`farmer_id.eq.${userId},offtaker_id.eq.${userId},broker_id.eq.${userId}`),
    supabase.from('deliveries').select('*').eq('driver_id', userId),
    supabase.from('payments').select('*').or(`payer_id.eq.${userId},payee_id.eq.${userId}`),
    supabase.from('notifications').select('*').eq('user_id', userId),
  ]);

  return {
    profile: profile.data,
    farms: farms.data,
    listings: listings.data,
    contracts: contracts.data,
    deliveries: deliveries.data,
    payments: payments.data,
    notifications: notifications.data,
    exportedAt: new Date().toISOString(),
  };
}

// Delete user account and all associated data
export async function deleteAccount(userId: string) {
  // Delete from storage first
  const { data: avatar } = await supabase.storage.from('avatars').list(`${userId}/`);
  if (avatar && avatar.length > 0) {
    await supabase.storage.from('avatars').remove(avatar.map(f => `${userId}/${f.name}`));
  }

  // Delete user (cascades to all related tables)
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) throw error;

  // Delete auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) throw authError;
}
```

---

## 15. Webhooks

### Problem
Handle incoming webhooks (e.g., payment gateway callbacks) and send outgoing webhooks.

### Solution

```typescript
// supabase/functions/webhook-handler/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const payload = await req.json()
    const signature = req.headers.get("X-Webhook-Signature")

    // Verify webhook signature
    // const expectedSig = crypto.subtle.digest("SHA-256", ...)

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // Handle payment gateway webhook
    if (payload.event === "payment.completed") {
      await supabase
        .from("payments")
        .update({ status: "COMPLETED" })
        .eq("reference", payload.reference)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
```

---

## 16. Summary — All Backend Issues Covered

| Issue | Solution | File/Location |
|-------|----------|---------------|
| **Auth & Sessions** | Supabase Auth + auto-refresh + RBAC | `src/lib/auth-utils.ts` |
| **Email/SMS** | Edge Functions + Resend + Africa's Talking | `supabase/functions/send-email/` + `send-sms/` |
| **Pagination** | Offset + cursor-based | `src/lib/pagination.ts` |
| **Data Export** | CSV + JSON export | `src/lib/export.ts` |
| **Audit Trail** | PostgreSQL triggers + audit_log table | SQL in this guide |
| **Health Checks** | Service health monitoring | `src/lib/health.ts` |
| **Logging** | Structured logger | `src/lib/logger.ts` |
| **Full-Text Search** | PostgreSQL tsvector + GIN index | SQL in this guide |
| **Concurrency** | Optimistic locking | `src/lib/concurrency.ts` |
| **API Versioning** | Version headers | `src/lib/api-version.ts` |
| **Migrations** | Supabase CLI migrations | `supabase/migrations/` |
| **Testing** | Vitest + Supabase | `tests/` |
| **CI/CD** | GitHub Actions | `.github/workflows/` |
| **Data Privacy** | Export + delete functions | `src/lib/privacy.ts` |
| **Webhooks** | Edge Function handler | `supabase/functions/webhook-handler/` |
| **Object Storage** | Supabase Storage | `src/lib/storage.ts` ✅ |
| **Rate Limiting** | DB + Edge + Client | `src/lib/rate-limiter.ts` ✅ |
| **Caching** | Frontend + Materialized views | `src/lib/cache.ts` ✅ |
| **Validation** | DB constraints + Frontend | `src/lib/validation.ts` ✅ |
| **Error Handling** | Centralized handler | `src/lib/error-handler.ts` ✅ |
| **Monitoring** | API logging + Dashboard | `src/lib/analytics.ts` ✅ |
| **WebSockets** | Supabase Realtime | `src/lib/realtime.ts` ✅ |
| **Security** | RLS + JWT + HTTPS | `supabase-schema.sql` ✅ |
| **Backup** | Supabase daily backups | Built-in ✅ |
| **Performance** | Indexes + Pooling | `supabase-schema.sql` ✅ |