/**
 * CRUD Operations — Complete Create, Read, Update, Delete for all tables
 * Centralized CRUD functions with error handling, validation, and caching
 */

import { supabase } from './supabase';
import { handleSupabaseError } from './error-handler';
import { dataCache } from './cache';
import { logger } from './logger';

// ============================================================
// USERS CRUD
// ============================================================
export const usersCRUD = {
  async getAll(filters?: { role?: string; search?: string }) {
    let query = supabase.from('users').select('*');
    if (filters?.role) query = query.eq('role', filters.role);
    if (filters?.search) query = query.ilike('full_name', `%${filters.search}%`);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getByEmail(email: string) {
    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async create(user: { email: string; full_name: string; role: string; phone?: string }) {
    const { data, error } = await supabase.from('users').insert(user).select().single();
    if (error) throw handleSupabaseError(error);
    logger.info('User created:', user.email);
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
    logger.info('User deleted:', id);
  },
};

// ============================================================
// FARMS CRUD
// ============================================================
export const farmsCRUD = {
  async getByOwner(ownerId: string) {
    const cacheKey = `farms:${ownerId}`;
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('farms')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    dataCache.set(cacheKey, data, 30000);
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('farms').select('*').eq('id', id).single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async create(farm: { owner_id: string; name: string; location?: string; size_hectares?: number; description?: string }) {
    const { data, error } = await supabase.from('farms').insert(farm).select().single();
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('farms:');
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('farms').update(updates).eq('id', id).select().single();
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('farms:');
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('farms').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('farms:');
  },
};

// ============================================================
// LISTINGS CRUD (Marketplace)
// ============================================================
export const listingsCRUD = {
  async getAll(filters?: { status?: string; category?: string; seller_id?: string; search?: string }) {
    let query = supabase.from('listings').select(`
      *,
      seller:users!seller_id(full_name, phone, avatar_url),
      commodity:commodities(name, category, unit)
    `);

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.seller_id) query = query.eq('seller_id', filters.seller_id);
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        seller:users!seller_id(full_name, phone, avatar_url),
        commodity:commodities(name, category, unit)
      `)
      .eq('id', id)
      .single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async create(listing: any) {
    const { data, error } = await supabase.from('listings').insert(listing).select().single();
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('listings:');
    logger.info('Listing created:', listing.title);
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('listings').update(updates).eq('id', id).select().single();
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('listings:');
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('listings').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('listings:');
  },

  async markAsSold(id: string) {
    return this.update(id, { status: 'sold' });
  },

  async markAsExpired(id: string) {
    return this.update(id, { status: 'expired' });
  },
};

// ============================================================
// CONTRACTS CRUD
// ============================================================
export const contractsCRUD = {
  async getAll(filters?: { status?: string; farmer_id?: string; offtaker_id?: string; broker_id?: string }) {
    let query = supabase.from('contracts').select(`
      *,
      farmer:users!farmer_id(full_name, phone),
      offtaker:users!offtaker_id(full_name, phone),
      broker:users!broker_id(full_name, phone),
      commodity:commodities(name, category, unit)
    `);

    if (filters?.status) query = query.eq('status', filters.status);
    if (filters?.farmer_id) query = query.eq('farmer_id', filters.farmer_id);
    if (filters?.offtaker_id) query = query.eq('offtaker_id', filters.offtaker_id);
    if (filters?.broker_id) query = query.eq('broker_id', filters.broker_id);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        *,
        farmer:users!farmer_id(full_name, phone, email),
        offtaker:users!offtaker_id(full_name, phone, email),
        broker:users!broker_id(full_name, phone, email),
        commodity:commodities(name, category, unit),
        deliveries:deliveries(*),
        payments:payments(*)
      `)
      .eq('id', id)
      .single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async create(contract: any) {
    const { data, error } = await supabase.from('contracts').insert(contract).select().single();
    if (error) throw handleSupabaseError(error);
    logger.info('Contract created:', data.contract_number);
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('contracts').update(updates).eq('id', id).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async updateStatus(id: string, status: string) {
    return this.update(id, { status });
  },

  async delete(id: string) {
    const { error } = await supabase.from('contracts').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
  },
};

// ============================================================
// DELIVERIES CRUD
// ============================================================
export const deliveriesCRUD = {
  async getAll(filters?: { contract_id?: string; driver_id?: string; status?: string }) {
    let query = supabase.from('deliveries').select(`
      *,
      contract:contracts(contract_number, farmer_id, offtaker_id),
      driver:users!driver_id(full_name, phone)
    `);

    if (filters?.contract_id) query = query.eq('contract_id', filters.contract_id);
    if (filters?.driver_id) query = query.eq('driver_id', filters.driver_id);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('deliveries').select('*').eq('id', id).single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async create(delivery: any) {
    const { data, error } = await supabase.from('deliveries').insert(delivery).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('deliveries').update(updates).eq('id', id).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async updateLocation(id: string, lat: number, lng: number) {
    return this.update(id, { gps_lat: lat, gps_lng: lng });
  },

  async delete(id: string) {
    const { error } = await supabase.from('deliveries').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
  },
};

// ============================================================
// PAYMENTS CRUD
// ============================================================
export const paymentsCRUD = {
  async getAll(filters?: { contract_id?: string; status?: string }) {
    let query = supabase.from('payments').select(`
      *,
      contract:contracts(contract_number),
      payer:users!payer_id(full_name),
      payee:users!payee_id(full_name)
    `);

    if (filters?.contract_id) query = query.eq('contract_id', filters.contract_id);
    if (filters?.status) query = query.eq('status', filters.status);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('payments').select('*').eq('id', id).single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async create(payment: any) {
    const { data, error } = await supabase.from('payments').insert(payment).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('payments').update(updates).eq('id', id).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('payments').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
  },
};

// ============================================================
// COMMODITIES CRUD
// ============================================================
export const commoditiesCRUD = {
  async getAll(category?: string) {
    const cacheKey = `commodities:${category || 'all'}`;
    const cached = dataCache.get(cacheKey);
    if (cached) return cached;

    let query = supabase.from('commodities').select('*');
    if (category) query = query.eq('category', category);
    const { data, error } = await query.order('name', { ascending: true });
    if (error) throw handleSupabaseError(error);
    dataCache.set(cacheKey, data, 300000); // 5 minutes
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('commodities').select('*').eq('id', id).single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async create(commodity: any) {
    const { data, error } = await supabase.from('commodities').insert(commodity).select().single();
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('commodities:');
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('commodities').update(updates).eq('id', id).select().single();
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('commodities:');
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('commodities').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('commodities:');
  },
};

// ============================================================
// PRICE BOARD CRUD
// ============================================================
export const priceBoardCRUD = {
  async getAll(commodityId?: string, region?: string) {
    let query = supabase.from('price_board').select(`
      *,
      commodity:commodities(name, category, unit)
    `);
    if (commodityId) query = query.eq('commodity_id', commodityId);
    if (region) query = query.eq('region', region);
    const { data, error } = await query.order('recorded_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async create(price: any) {
    const { data, error } = await supabase.from('price_board').insert(price).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('price_board').update(updates).eq('id', id).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('price_board').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
  },
};

// ============================================================
// DISPUTES CRUD
// ============================================================
export const disputesCRUD = {
  async getAll(filters?: { contract_id?: string; status?: string }) {
    let query = supabase.from('disputes').select(`
      *,
      contract:contracts(contract_number),
      raised_by_user:users!raised_by(full_name, phone)
    `);
    if (filters?.contract_id) query = query.eq('contract_id', filters.contract_id);
    if (filters?.status) query = query.eq('status', filters.status);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('disputes').select('*').eq('id', id).single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async create(dispute: any) {
    const { data, error } = await supabase.from('disputes').insert(dispute).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('disputes').update(updates).eq('id', id).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async resolve(id: string, resolution: string) {
    return this.update(id, { status: 'RESOLVED', resolution, resolved_at: new Date().toISOString() });
  },
};

// ============================================================
// QUALITY SCANS CRUD
// ============================================================
export const qualityScansCRUD = {
  async getByContract(contractId: string) {
    const { data, error } = await supabase
      .from('quality_scans')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async create(scan: any) {
    const { data, error } = await supabase.from('quality_scans').insert(scan).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('quality_scans').update(updates).eq('id', id).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },
};

// ============================================================
// DOCUMENTS CRUD
// ============================================================
export const documentsCRUD = {
  async getByContract(contractId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('contract_id', contractId)
      .order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async create(doc: any) {
    const { data, error } = await supabase.from('documents').insert(doc).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('documents').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
  },
};

// ============================================================
// MESSAGES CRUD (Chat)
// ============================================================
export const messagesCRUD = {
  async getConversation(userId1: string, userId2: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .order('created_at', { ascending: true });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async send(senderId: string, receiverId: string, body: string) {
    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id: senderId, receiver_id: receiverId, body })
      .select()
      .single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async markAsRead(messageId: string) {
    const { data, error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId)
      .select()
      .single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false);
    if (error) throw handleSupabaseError(error);
    return count || 0;
  },
};

// ============================================================
// EQUIPMENT LISTINGS CRUD
// ============================================================
export const equipmentCRUD = {
  async getAll(category?: string) {
    let query = supabase.from('equipment_listings').select(`
      *,
      owner:users!owner_id(full_name, phone)
    `);
    if (category) query = query.eq('category', category);
    const { data, error } = await query.eq('available', true).order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('equipment_listings').select('*').eq('id', id).single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async create(equipment: any) {
    const { data, error } = await supabase.from('equipment_listings').insert(equipment).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('equipment_listings').update(updates).eq('id', id).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('equipment_listings').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
  },
};

// ============================================================
// INPUT ORDERS CRUD
// ============================================================
export const inputOrdersCRUD = {
  async getByFarmer(farmerId: string) {
    const { data, error } = await supabase
      .from('input_orders')
      .select(`
        *,
        supplier:users!supplier_id(full_name, phone)
      `)
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getBySupplier(supplierId: string) {
    const { data, error } = await supabase
      .from('input_orders')
      .select(`
        *,
        farmer:users!farmer_id(full_name, phone)
      `)
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async create(order: any) {
    const { data, error } = await supabase.from('input_orders').insert(order).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('input_orders').update(updates).eq('id', id).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },
};

// ============================================================
// FINANCING APPLICATIONS CRUD
// ============================================================
export const financingCRUD = {
  async getByFarmer(farmerId: string) {
    const { data, error } = await supabase
      .from('financing_applications')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getAll(status?: string) {
    let query = supabase.from('financing_applications').select(`
      *,
      farmer:users!farmer_id(full_name, phone, email)
    `);
    if (status) query = query.eq('status', status);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async create(application: any) {
    const { data, error } = await supabase.from('financing_applications').insert(application).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('financing_applications').update(updates).eq('id', id).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },
};