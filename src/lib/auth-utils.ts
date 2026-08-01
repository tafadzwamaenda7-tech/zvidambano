/**
 * Auth Utils — Session management, RBAC, password reset
 */

import { supabase } from './supabase';

export type UserRole = 'farmer' | 'broker' | 'offtaker' | 'driver' | 'supplier' | 'admin' | 'compliance' | 'support';

// Auto-refresh session every 5 minutes
export function setupAutoRefresh() {
  setInterval(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('[Auth] Session refresh failed:', error);
        window.location.href = '/login.html';
      }
    }
  }, 5 * 60 * 1000);
}

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
    support: '/support-dashboard.html',
  };
  return dashboardMap[userRole] || null;
}

export async function requireAuth(allowedRoles?: UserRole[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = '/login.html';
    return null;
  }

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

  return { user, role: profile.role as UserRole };
}

export async function requestPasswordReset(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login.html`,
  });
  if (error) throw error;
  return data;
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}

export async function resendEmailVerification(email: string) {
  const { data, error } = await supabase.auth.resend({ type: 'signup', email });
  if (error) throw error;
  return data;
}