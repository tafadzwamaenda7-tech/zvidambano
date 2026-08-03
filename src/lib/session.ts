/**
 * Session — resolves the signed-in Supabase identity into a dashboard-ready
 * session object (name, role, demo flag) before a dashboard boots.
 *
 * Demo accounts are the seeded @zvida.zw personas. They render the built-in
 * demo data and never touch live tables. Real accounts (any other email) start
 * empty and use their own JWT so RLS scopes every read/write to themselves.
 */

import { supabase, getCurrentUser } from './supabase';
import { canAccessDashboard, type UserRole } from './auth-utils';

export interface DashboardSession {
  id: string;
  email: string;
  name: string;
  company: string;
  initials: string;
  role: UserRole;
  isDemo: boolean;
  isVerified: boolean;
}

function initialsOf(name: string): string {
  const parts = name
    .split(/[\s.]+/)
    .filter(Boolean)
    .map((p) => p[0].toUpperCase());
  return (parts[0] || 'Z') + (parts[parts.length - 1] || '');
}

/**
 * Resolve the current session for a dashboard entry point.
 * Redirects to /login.html (or the correct dashboard) when the user is not
 * signed in or has the wrong role. Returns null in that case.
 */
export async function resolveDashboardSession(
  expectedRoles: UserRole | UserRole[]
): Promise<DashboardSession | null> {
  const allowed = Array.isArray(expectedRoles) ? expectedRoles : [expectedRoles];
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = '/login.html';
    return null;
  }

  const { data: row, error } = await supabase
    .from('users')
    .select('role, full_name, phone, is_demo')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !row) {
    window.location.href = '/login.html';
    return null;
  }

  const role = row.role as UserRole;
  if (!allowed.includes(role)) {
    window.location.href = canAccessDashboard(role) || '/login.html';
    return null;
  }

  const email = user.email || '';
  const name = row.full_name || (user.user_metadata?.full_name as string) || 'ZVIDA User';
  const isDemo = Boolean(row.is_demo) || email.toLowerCase().endsWith('@zvida.zw');
  const meta = (user.user_metadata || {}) as Record<string, unknown>;

  return {
    id: user.id,
    email,
    name,
    company: isDemo ? name : String(meta.company || meta.organisation || meta.full_name || name),
    initials: initialsOf(name),
    role,
    isDemo,
    isVerified: Boolean(user.email_confirmed_at || user.confirmed_at),
  };
}
