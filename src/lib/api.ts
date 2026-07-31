import { supabase, Listing, Contract, Delivery, Farm, Payment } from './supabase';

// LISTINGS API
export async function getListings(filters?: any) {
  let query = supabase.from('listings').select('*');

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.seller_id) query = query.eq('seller_id', filters.seller_id);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data as Listing[];
}

export async function getListingById(id: string) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Listing;
}

export async function createListing(listing: Omit<Listing, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('listings').insert([listing]).select().single();
  if (error) throw error;
  return data as Listing;
}

export async function updateListing(id: string, updates: Partial<Listing>) {
  const { data, error } = await supabase
    .from('listings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Listing;
}

// CONTRACTS API
export async function getContracts(filters?: any) {
  let query = supabase.from('contracts').select('*');

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.farmer_id) query = query.eq('farmer_id', filters.farmer_id);
  if (filters?.offtaker_id) query = query.eq('offtaker_id', filters.offtaker_id);
  if (filters?.broker_id) query = query.eq('broker_id', filters.broker_id);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data as Contract[];
}

export async function getContractById(id: string) {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Contract;
}

export async function createContract(contract: Omit<Contract, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('contracts')
    .insert([contract])
    .select()
    .single();
  if (error) throw error;
  return data as Contract;
}

export async function updateContractStatus(id: string, status: Contract['status']) {
  const { data, error } = await supabase
    .from('contracts')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Contract;
}

// DELIVERIES API
export async function getDeliveries(filters?: any) {
  let query = supabase.from('deliveries').select('*');

  if (filters?.contract_id) query = query.eq('contract_id', filters.contract_id);
  if (filters?.driver_id) query = query.eq('driver_id', filters.driver_id);
  if (filters?.status) query = query.eq('status', filters.status);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data as Delivery[];
}

export async function getDeliveryById(id: string) {
  const { data, error } = await supabase
    .from('deliveries')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Delivery;
}

export async function createDelivery(delivery: Omit<Delivery, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('deliveries')
    .insert([delivery])
    .select()
    .single();
  if (error) throw error;
  return data as Delivery;
}

export async function updateDelivery(id: string, updates: Partial<Delivery>) {
  const { data, error } = await supabase
    .from('deliveries')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Delivery;
}

// FARMS API
export async function getFarms(userId: string) {
  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Farm[];
}

export async function getFarmById(id: string) {
  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Farm;
}

export async function createFarm(farm: Omit<Farm, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('farms').insert([farm]).select().single();
  if (error) throw error;
  return data as Farm;
}

export async function updateFarm(id: string, updates: Partial<Farm>) {
  const { data, error } = await supabase
    .from('farms')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Farm;
}

// PAYMENTS API
export async function getPayments(filters?: any) {
  let query = supabase.from('payments').select('*');

  if (filters?.contract_id) query = query.eq('contract_id', filters.contract_id);
  if (filters?.status) query = query.eq('status', filters.status);

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data as Payment[];
}

export async function createPayment(payment: Omit<Payment, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('payments')
    .insert([payment])
    .select()
    .single();
  if (error) throw error;
  return data as Payment;
}

export async function updatePaymentStatus(id: string, status: Payment['status']) {
  const { data, error } = await supabase
    .from('payments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Payment;
}

// SEARCH
export async function searchListings(query: string) {
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data as Listing[];
}
