/**
 * CRUD Operations — Complete Create, Read, Update, Delete for all tables
 * Centralized CRUD functions with error handling, validation, and caching
 */

import { supabase } from './supabase';
import { handleSupabaseError } from './error-handler';
import { dataCache } from './cache';
import { logger } from './logger';
import { getPaginationRange, buildPaginatedResult } from './pagination';

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
  async getAll(filters?: { contract_id?: string; result?: string }) {
    let query = supabase.from('quality_scans').select('*');
    if (filters?.contract_id) query = query.eq('contract_id', filters.contract_id);
    if (filters?.result) query = query.eq('result', filters.result);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('quality_scans').select('*').eq('id', id).single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getByContract(contractId: string) {
    return this.getAll({ contract_id: contractId });
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

  async delete(id: string) {
    const { error } = await supabase.from('quality_scans').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
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

  async getById(id: string) {
    const { data, error } = await supabase.from('messages').select('*').eq('id', id).single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
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

  async delete(id: string) {
    const { error } = await supabase.from('financing_applications').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
  },
};

// ============================================================
// FARMER SETTLEMENTS CRUD
// ============================================================
export const farmerSettlementsCRUD = {
  async getAll(filters?: { farmer_id?: string; contract_id?: string; status?: string }) {
    let query = supabase.from('farmer_settlements').select(`
      *,
      farmer:users!farmer_id(full_name, phone, email),
      contract:contracts(contract_number)
    `);
    if (filters?.farmer_id) query = query.eq('farmer_id', filters.farmer_id);
    if (filters?.contract_id) query = query.eq('contract_id', filters.contract_id);
    if (filters?.status) query = query.eq('status', filters.status);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('farmer_settlements')
      .select(`
        *,
        farmer:users!farmer_id(full_name, phone, email),
        contract:contracts(contract_number)
      `)
      .eq('id', id)
      .single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getByFarmer(farmerId: string) {
    return this.getAll({ farmer_id: farmerId });
  },

  async getByContract(contractId: string) {
    return this.getAll({ contract_id: contractId });
  },

  async create(settlement: any) {
    const { data, error } = await supabase.from('farmer_settlements').insert(settlement).select().single();
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('settlements:');
    logger.info('Farmer settlement created for contract:', settlement.contract_id);
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('farmer_settlements').update(updates).eq('id', id).select().single();
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('settlements:');
    return data;
  },

  async markAsPaid(id: string) {
    return this.update(id, { status: 'PAID', paid_at: new Date().toISOString() });
  },

  async delete(id: string) {
    const { error } = await supabase.from('farmer_settlements').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('settlements:');
  },
};

// ============================================================
// OFFTAKER INVOICES CRUD
// ============================================================
export const offtakerInvoicesCRUD = {
  async getAll(filters?: { offtaker_id?: string; contract_id?: string; status?: string }) {
    let query = supabase.from('offtaker_invoices').select(`
      *,
      offtaker:users!offtaker_id(full_name, phone, email),
      contract:contracts(contract_number)
    `);
    if (filters?.offtaker_id) query = query.eq('offtaker_id', filters.offtaker_id);
    if (filters?.contract_id) query = query.eq('contract_id', filters.contract_id);
    if (filters?.status) query = query.eq('status', filters.status);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('offtaker_invoices')
      .select(`
        *,
        offtaker:users!offtaker_id(full_name, phone, email),
        contract:contracts(contract_number)
      `)
      .eq('id', id)
      .single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getByOfftaker(offtakerId: string) {
    return this.getAll({ offtaker_id: offtakerId });
  },

  async getByContract(contractId: string) {
    return this.getAll({ contract_id: contractId });
  },

  async create(invoice: any) {
    const { data, error } = await supabase.from('offtaker_invoices').insert(invoice).select().single();
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('invoices:');
    logger.info('Offtaker invoice created for contract:', invoice.contract_id);
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('offtaker_invoices').update(updates).eq('id', id).select().single();
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('invoices:');
    return data;
  },

  async markAsPaid(id: string) {
    return this.update(id, { status: 'PAID', paid_at: new Date().toISOString() });
  },

  async delete(id: string) {
    const { error } = await supabase.from('offtaker_invoices').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('invoices:');
  },
};

// ============================================================
// BROKER COMMISSION LEDGER CRUD
// ============================================================
export const commissionsCRUD = {
  async getAll(filters?: { broker_id?: string; contract_id?: string; status?: string }) {
    let query = supabase.from('broker_commission_ledger').select(`
      *,
      broker:users!broker_id(full_name, phone, email),
      contract:contracts(contract_number)
    `);
    if (filters?.broker_id) query = query.eq('broker_id', filters.broker_id);
    if (filters?.contract_id) query = query.eq('contract_id', filters.contract_id);
    if (filters?.status) query = query.eq('status', filters.status);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('broker_commission_ledger')
      .select(`
        *,
        broker:users!broker_id(full_name, phone, email),
        contract:contracts(contract_number)
      `)
      .eq('id', id)
      .single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getByBroker(brokerId: string) {
    return this.getAll({ broker_id: brokerId });
  },

  async getByContract(contractId: string) {
    return this.getAll({ contract_id: contractId });
  },

  async create(commission: any) {
    const { data, error } = await supabase.from('broker_commission_ledger').insert(commission).select().single();
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('commissions:');
    logger.info('Commission created for contract:', commission.contract_id);
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('broker_commission_ledger').update(updates).eq('id', id).select().single();
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('commissions:');
    return data;
  },

  async markAsSettled(id: string) {
    return this.update(id, { status: 'SETTLED', settled_at: new Date().toISOString() });
  },

  async delete(id: string) {
    const { error } = await supabase.from('broker_commission_ledger').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('commissions:');
  },
};

// ============================================================
// NOTIFICATIONS CRUD
// ============================================================
export const notificationsCRUD = {
  async getAll(filters?: { user_id?: string; read?: boolean; type?: string }) {
    let query = supabase.from('notifications').select('*');
    if (filters?.user_id) query = query.eq('user_id', filters.user_id);
    if (filters?.read !== undefined) query = query.eq('read', filters.read);
    if (filters?.type) query = query.eq('type', filters.type);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('notifications').select('*').eq('id', id).single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getByUser(userId: string) {
    return this.getAll({ user_id: userId });
  },

  async getUnread(userId: string) {
    return this.getAll({ user_id: userId, read: false });
  },

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    if (error) throw handleSupabaseError(error);
    return count || 0;
  },

  async create(notification: { user_id: string; title: string; body?: string; type?: string; action_url?: string }) {
    const { data, error } = await supabase.from('notifications').insert(notification).select().single();
    if (error) throw handleSupabaseError(error);
    logger.info('Notification created for user:', notification.user_id);
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('notifications').update(updates).eq('id', id).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async markAsRead(id: string) {
    return this.update(id, { read: true });
  },

  async markAllAsRead(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
      .select();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
  },
};

// ============================================================
// MARKET ORDERS CRUD (Dashboard marketplace)
// ============================================================
export const marketOrdersCRUD = {
  async getAll(filters?: { buyer?: string; status?: string }) {
    let query = supabase.from('market_orders').select('*');
    if (filters?.buyer) query = query.eq('buyer', filters.buyer);
    if (filters?.status) query = query.eq('status', filters.status);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('market_orders').select('*').eq('id', id).single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getByBuyer(buyer: string) {
    return this.getAll({ buyer });
  },

  async create(order: any) {
    const { data, error } = await supabase.from('market_orders').insert(order).select().single();
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('market_orders:');
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('market_orders').update(updates).eq('id', id).select().single();
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('market_orders:');
    return data;
  },

  async updateStatus(id: string, status: string, step?: number) {
    const updates: any = { status };
    if (step !== undefined) updates.step = step;
    return this.update(id, updates);
  },

  async upsert(order: any) {
    const { data, error } = await supabase
      .from('market_orders')
      .upsert(order, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('market_orders:');
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('market_orders').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
    dataCache.invalidatePattern('market_orders:');
  },
};

// ============================================================
// AUDIT LOG CRUD
// ============================================================
export const auditLogCRUD = {
  async getAll(filters?: { user_id?: string; table_name?: string; action?: string }) {
    let query = supabase.from('audit_log').select('*');
    if (filters?.user_id) query = query.eq('user_id', filters.user_id);
    if (filters?.table_name) query = query.eq('table_name', filters.table_name);
    if (filters?.action) query = query.eq('action', filters.action);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('audit_log').select('*').eq('id', id).single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getByUser(userId: string) {
    return this.getAll({ user_id: userId });
  },

  async getByTable(tableName: string) {
    return this.getAll({ table_name: tableName });
  },

  async create(entry: { user_id?: string; action: string; table_name: string; record_id?: string; old_values?: any; new_values?: any }) {
    const { data, error } = await supabase.from('audit_log').insert(entry).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('audit_log').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
  },

  async deleteOlderThan(days: number) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase.from('audit_log').delete().lt('created_at', cutoff);
    if (error) throw handleSupabaseError(error);
    logger.info(`Audit log entries older than ${days} days purged`);
  },
};

// ============================================================
// API RATE LIMITS CRUD
// ============================================================
export const rateLimitCRUD = {
  async getAll(filters?: { user_id?: string; endpoint?: string }) {
    let query = supabase.from('api_rate_limits').select('*');
    if (filters?.user_id) query = query.eq('user_id', filters.user_id);
    if (filters?.endpoint) query = query.eq('endpoint', filters.endpoint);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from('api_rate_limits').select('*').eq('id', id).single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async getByUserAndEndpoint(userId: string, endpoint: string) {
    const { data, error } = await supabase
      .from('api_rate_limits')
      .select('*')
      .eq('user_id', userId)
      .eq('endpoint', endpoint)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async create(limit: { user_id: string; endpoint: string; request_count?: number; window_start?: string }) {
    const { data, error } = await supabase.from('api_rate_limits').insert(limit).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async increment(userId: string, endpoint: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_user_id: userId,
      p_endpoint: endpoint,
    });
    if (error) throw handleSupabaseError(error);
    return !!data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase.from('api_rate_limits').update(updates).eq('id', id).select().single();
    if (error) throw handleSupabaseError(error);
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase.from('api_rate_limits').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
  },

  async clearExpired() {
    const { error } = await supabase
      .from('api_rate_limits')
      .delete()
      .lt('window_start', new Date(Date.now() - 60 * 60 * 1000).toISOString());
    if (error) throw handleSupabaseError(error);
  },
};

// ============================================================
// PAGINATED HELPERS
// ============================================================
export async function getPaginatedListings(filters: any = {}, page: number = 1, pageSize: number = 20) {
  const { from, to } = getPaginationRange(page, pageSize);
  let query = supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .range(from, to);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.seller_id) query = query.eq('seller_id', filters.seller_id);
  const { data, count, error } = await query.order('created_at', { ascending: false });
  if (error) throw handleSupabaseError(error);
  return buildPaginatedResult(data || [], count || 0, page, pageSize);
}

export async function getPaginatedContracts(filters: any = {}, page: number = 1, pageSize: number = 20) {
  const { from, to } = getPaginationRange(page, pageSize);
  let query = supabase
    .from('contracts')
    .select('*', { count: 'exact' })
    .range(from, to);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.farmer_id) query = query.eq('farmer_id', filters.farmer_id);
  if (filters.offtaker_id) query = query.eq('offtaker_id', filters.offtaker_id);
  if (filters.broker_id) query = query.eq('broker_id', filters.broker_id);
  const { data, count, error } = await query.order('created_at', { ascending: false });
  if (error) throw handleSupabaseError(error);
  return buildPaginatedResult(data || [], count || 0, page, pageSize);
}

export async function getPaginatedDeliveries(filters: any = {}, page: number = 1, pageSize: number = 20) {
  const { from, to } = getPaginationRange(page, pageSize);
  let query = supabase
    .from('deliveries')
    .select('*', { count: 'exact' })
    .range(from, to);
  if (filters.contract_id) query = query.eq('contract_id', filters.contract_id);
  if (filters.driver_id) query = query.eq('driver_id', filters.driver_id);
  if (filters.status) query = query.eq('status', filters.status);
  const { data, count, error } = await query.order('created_at', { ascending: false });
  if (error) throw handleSupabaseError(error);
  return buildPaginatedResult(data || [], count || 0, page, pageSize);
}

export async function getPaginatedPayments(filters: any = {}, page: number = 1, pageSize: number = 20) {
  const { from, to } = getPaginationRange(page, pageSize);
  let query = supabase
    .from('payments')
    .select('*', { count: 'exact' })
    .range(from, to);
  if (filters.contract_id) query = query.eq('contract_id', filters.contract_id);
  if (filters.status) query = query.eq('status', filters.status);
  const { data, count, error } = await query.order('created_at', { ascending: false });
  if (error) throw handleSupabaseError(error);
  return buildPaginatedResult(data || [], count || 0, page, pageSize);
}

export async function getPaginatedNotifications(userId: string, page: number = 1, pageSize: number = 20) {
  const { from, to } = getPaginationRange(page, pageSize);
  const { data, count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);
  if (error) throw handleSupabaseError(error);
  return buildPaginatedResult(data || [], count || 0, page, pageSize);
}
