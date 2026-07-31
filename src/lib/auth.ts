import { supabase, getCurrentUser, signUp, signIn, signOut, onAuthChange as onSupabaseAuthChange } from './supabase';

export { onAuthChange } from './supabase';  // Re-export for convenience

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

    return true;
  } catch (error) {
    authState = {
      isAuthenticated: false,
      user: null,
      role: null,
      loading: false,
      error: error instanceof Error ? error.message : 'Login failed',
    };
    return false;
  }
}

export async function register(
  email: string,
  password: string,
  fullName: string,
  role: string
): Promise<boolean> {
  authState.loading = true;
  authState.error = null;

  try {
    const { user } = await signUp(email, password, { full_name: fullName, role });

    if (!user) {
      throw new Error('Signup failed: No user returned');
    }

    // Create user profile in users table
    const { error: profileError } = await supabase.from('users').insert([
      {
        id: user.id,
        email,
        full_name: fullName,
        role,
      },
    ]);

    if (profileError) {
      throw profileError;
    }

    authState = {
      isAuthenticated: true,
      user,
      role,
      loading: false,
      error: null,
    };

    return true;
  } catch (error) {
    authState = {
      isAuthenticated: false,
      user: null,
      role: null,
      loading: false,
      error: error instanceof Error ? error.message : 'Signup failed',
    };
    return false;
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
