import { supabase, getCurrentUser, signUp, signIn, signOut, onAuthChange as onSupabaseAuthChange } from './supabase';
import { signupError, magicLinkError } from './auth-errors';
import { logAuthEvent } from './auth-audit';

export { onAuthChange } from './supabase';  // Re-export for convenience

/**
 * Metadata captured by the 5-step signup wizard. The handle_new_user trigger
 * persists the whole raw_user_meta_data blob into public.users.profile, so the
 * role-specific keys (farmName, companyCapacity, storeCategories, …) plus the
 * documents/consent objects are stored verbatim.
 */
export interface SignupMetadata {
  title?: string;
  initials?: string;
  middleName?: string;
  dob?: string;
  gender?: string;
  idType?: string;
  idNumber?: string;
  nationality?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  telephone?: string;
  phone?: string;
  documents?: Record<string, { name: string; size: number; type: string } | null>;
  consent?: { trading: boolean; analytics: boolean; terms: boolean };
  [key: string]: unknown;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  role: string | null;
  loading: boolean;
  error: string | null;
}

// Store auth state in memory
let authState: AuthState = {
  isAuthenticated: false,
  user: null,
  role: null,
  loading: true,
  error: null,
};

// Initialize auth state from session storage
export async function initializeAuth(): Promise<void> {
  try {
    const user = await getCurrentUser();
    const session = await supabase.auth.getSession();

    if (user && session.data?.session) {
      // Fetch user profile from database
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      authState = {
        isAuthenticated: true,
        user,
        role: profile?.role || null,
        loading: false,
        error: null,
      };
    } else {
      authState = {
        isAuthenticated: false,
        user: null,
        role: null,
        loading: false,
        error: null,
      };
    }
  } catch (error) {
    authState = {
      isAuthenticated: false,
      user: null,
      role: null,
      loading: false,
      error: error instanceof Error ? error.message : 'Auth initialization failed',
    };
  }
}

export function getAuthState(): AuthState {
  return { ...authState };
}

export async function login(email: string, password: string): Promise<boolean> {
  authState.loading = true;
  authState.error = null;

  try {
    const { user, session } = await signIn(email, password);

    if (!user || !session) {
      throw new Error('Login failed: No user or session returned');
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    authState = {
      isAuthenticated: true,
      user,
      role: profile?.role || null,
      loading: false,
      error: null,
    };

    await logAuthEvent({ event_type: 'login_success', email, user_id: user.id, role: profile?.role || undefined });
    return true;
  } catch (error) {
    authState = {
      isAuthenticated: false,
      user: null,
      role: null,
      loading: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
    await logAuthEvent({ event_type: 'login_failure', email, metadata: { error: authState.error || undefined } });
    return false;
  }
}

export interface SendMagicLinkResult {
  ok: boolean;
  error: string | null;
}

/**
 * Sends a passwordless sign-in link for an existing account. Uses
 * shouldCreateUser:false so unknown emails are never auto-registered.
 */
export async function sendMagicLink(email: string): Promise<SendMagicLinkResult> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${window.location.origin}/login.html`,
    },
  });
  if (error) {
    await logAuthEvent({ event_type: 'magic_link_failure', email, metadata: { error: error.message } });
    return { ok: false, error: magicLinkError(error.message) };
  }
  await logAuthEvent({ event_type: 'magic_link_sent', email });
  return { ok: true, error: null };
}

export interface RegisterResult {
  ok: boolean;
  needsConfirmation: boolean;
  error: string | null;
  action?: 'sign-in';
}

export async function register(
  email: string,
  password: string,
  fullName: string,
  role: string,
  metadata: SignupMetadata = {}
): Promise<RegisterResult> {
  authState.loading = true;
  authState.error = null;

  try {
    const { user, session } = await signUp(email, password, { full_name: fullName, role, ...metadata });

    if (!user) {
      throw new Error('Signup failed: No user returned');
    }

    // The public.users profile is auto-created by the handle_new_user
    // trigger on auth.users — no manual insert needed here.

    if (session) {
      authState = {
        isAuthenticated: true,
        user,
        role,
        loading: false,
        error: null,
      };
      await logAuthEvent({ event_type: 'signup_success', email, user_id: user.id, role });
      return { ok: true, needsConfirmation: false, error: null };
    }

    // Email confirmation is required — no session until the link is clicked.
    authState = {
      isAuthenticated: false,
      user: null,
      role: null,
      loading: false,
      error: null,
    };
    await logAuthEvent({ event_type: 'signup_success', email, user_id: user.id, role });
    return {
      ok: false,
      needsConfirmation: true,
      error: 'Account created — please check your email to confirm your sign-up.',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Signup failed';
    const info = signupError(message);

    authState = {
      isAuthenticated: false,
      user: null,
      role: null,
      loading: false,
      error: info.message,
    };
    await logAuthEvent({ event_type: 'signup_failure', email, role, metadata: { error: message } });
    return { ok: false, needsConfirmation: false, error: info.message, action: info.action === 'sign-in' ? 'sign-in' : undefined };
  }
}

export async function logout(): Promise<void> {
  try {
    await signOut();
    authState = {
      isAuthenticated: false,
      user: null,
      role: null,
      loading: false,
      error: null,
    };
  } catch (error) {
    authState.error = error instanceof Error ? error.message : 'Logout failed';
  }
}
