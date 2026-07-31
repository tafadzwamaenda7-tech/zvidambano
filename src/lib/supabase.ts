import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables not set. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
    storageKey: 'zvida_auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// Database types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'farmer' | 'broker' | 'offtaker' | 'driver' | 'supplier' | 'admin' | 'compliance';
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Farm {
  id: string;
  owner_id: string;
  name: string;
  location?: string;
  gps_lat?: number;
  gps_lng?: number;
  size_hectares?: number;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  commodity_id: string;
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  asking_price?: number;
  category: string;
  grade?: string;
  status: 'active' | 'sold' | 'expired' | 'draft';
  is_distressed: boolean;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: string;
  contract_number: string;
  farmer_id?: string;
  offtaker_id?: string;
  broker_id?: string;
  commodity_id?: string;
  listing_id?: string;
  quantity: number;
  unit: string;
  farmer_price?: number;
  offtaker_price?: number;
  broker_commission?: number;
  status:
    | 'PENDING'
    | 'LOADING'
    | 'FIRST_WEIGHT'
    | 'IN_TRANSIT'
    | 'SECOND_WEIGHT'
    | 'PENDING_SETTLEMENT'
    | 'SUCCESSFUL'
    | 'PAID'
    | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  id: string;
  contract_id: string;
  driver_id?: string;
  vehicle_reg?: string;
  origin?: string;
  destination?: string;
  first_weight?: number;
  second_weight?: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  contract_id: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'DISPUTED';
  payment_date?: string;
  created_at: string;
}

// Auth helpers
export async function signUp(email: string, password: string, metadata: any) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data?.session || null;
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

// Listener for auth changes
export function onAuthChange(callback: (session: Session | null) => void) {
  return supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
    callback(session);
  });
}
