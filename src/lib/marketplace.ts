/**
 * Marketplace — Listing, searching, filtering, and matching logic
 * Handles commodity listings, distressed sales, price matching, and marketplace features
 */

import { supabase } from './supabase';
import { listingsCRUD, contractsCRUD, commoditiesCRUD, priceBoardCRUD } from './crud';
import { dataCache } from './cache';
import { logger } from './logger';
import { notifyUser } from './notifications';

// ============================================================
// MARKETPLACE SEARCH & FILTERING
// ============================================================

export interface MarketplaceFilters {
  category?: string;
  commodity?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  minQuantity?: number;
  grade?: string;
  distressedOnly?: boolean;
  search?: string;
  sortBy?: 'newest' | 'price_low' | 'price_high' | 'quantity_high';
}

export async function searchMarketplace(filters: MarketplaceFilters) {
  let query = supabase.from('listings').select(`
    *,
    seller:users!seller_id(full_name, phone, avatar_url),
    commodity:commodities(name, category, unit, image_url)
  `);

  query = query.eq('status', 'active');

  if (filters.category) query = query.eq('category', filters.category);
  if (filters.commodity) query = query.eq('commodity_id', filters.commodity);
  if (filters.region) query = query.ilike('origin', `%${filters.region}%`);
  if (filters.grade) query = query.eq('grade', filters.grade);
  if (filters.distressedOnly) query = query.eq('is_distressed', true);
  if (filters.minPrice) query = query.gte('asking_price', filters.minPrice);
  if (filters.maxPrice) query = query.lte('asking_price', filters.maxPrice);
  if (filters.minQuantity) query = query.gte('quantity', filters.minQuantity);
  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  // Sorting
  switch (filters.sortBy) {
    case 'price_low':
      query = query.order('asking_price', { ascending: true });
      break;
    case 'price_high':
      query = query.order('asking_price', { ascending: false });
      break;
    case 'quantity_high':
      query = query.order('quantity', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query.limit(50);
  if (error) throw error;
  return data;
}

// ============================================================
// DISTRESSED LISTINGS — Urgent sales
// ============================================================

export async function getDistressedListings() {
  const cacheKey = 'distressed_listings';
  const cached = dataCache.get(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      seller:users!seller_id(full_name, phone),
      commodity:commodities(name, category, unit)
    `)
    .eq('status', 'active')
    .eq('is_distressed', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  dataCache.set(cacheKey, data, 30000);
  return data;
}

export async function markAsDistressed(listingId: string, reservePrice: number) {
  const listing = await listingsCRUD.update(listingId, {
    is_distressed: true,
    supplier_reserve_price: reservePrice,
  });

  // Notify brokers about distressed listing
  const { data: brokers } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'broker');

  if (brokers) {
    for (const broker of brokers) {
      await notifyUser(
        broker.id,
        'Distressed Listing Alert',
        `A distressed listing "${listing.title}" is available at reserve price $${reservePrice}.`,
        'distressed'
      );
    }
  }

  logger.info('Listing marked as distressed:', listingId);
  return listing;
}

// ============================================================
// PRICE MATCHING — Match buyers with sellers
// ============================================================

export async function findPriceMatches(commodityId: string, quantity: number) {
  // Find active listings matching the commodity and quantity
  const { data: listings, error } = await supabase
    .from('listings')
    .select(`
      *,
      seller:users!seller_id(full_name, phone),
      commodity:commodities(name, category, unit)
    `)
    .eq('status', 'active')
    .eq('commodity_id', commodityId)
    .gte('quantity', quantity)
    .order('asking_price', { ascending: true });

  if (error) throw error;

  // Get current market price for comparison
  const { data: marketPrice } = await supabase
    .from('price_board')
    .select('buying_price, selling_price')
    .eq('commodity_id', commodityId)
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  return {
    listings: listings || [],
    marketPrice: marketPrice || null,
    bestPrice: listings?.[0]?.asking_price || null,
  };
}

// ============================================================
// MARKETPLACE STATISTICS
// ============================================================

export async function getMarketplaceStats() {
  const cacheKey = 'marketplace_stats';
  const cached = dataCache.get(cacheKey);
  if (cached) return cached;

  const [activeListings, totalListings, distressedCount, totalValue] = await Promise.all([
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('listings').select('*', { count: 'exact', head: true }),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('is_distressed', true).eq('status', 'active'),
    supabase.from('listings').select('asking_price, quantity').eq('status', 'active'),
  ]);

  const totalValueAmount = (totalValue.data || []).reduce(
    (sum: number, l: any) => sum + (l.asking_price || 0) * (l.quantity || 0),
    0
  );

  const stats = {
    activeListings: activeListings.count || 0,
    totalListings: totalListings.count || 0,
    distressedCount: distressedCount.count || 0,
    totalValue: totalValueAmount,
  };

  dataCache.set(cacheKey, stats, 60000);
  return stats;
}

// ============================================================
// LISTING LIFECYCLE
// ============================================================

export async function createListing(listing: {
  seller_id: string;
  commodity_id?: string;
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  asking_price: number;
  category: string;
  grade?: string;
  origin?: string;
  photo_url?: string;
  is_distressed?: boolean;
  supplier_reserve_price?: number;
}) {
  const created = await listingsCRUD.create({
    ...listing,
    status: 'active',
  });

  // Notify potential buyers (offtakers) about new listing
  if (listing.category) {
    const { data: offtakers } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'offtaker');

    if (offtakers) {
      for (const offtaker of offtakers.slice(0, 10)) { // Limit to first 10
        await notifyUser(
          offtaker.id,
          'New Listing Available',
          `${listing.title} - ${listing.quantity} ${listing.unit} at $${listing.asking_price}/${listing.unit}`,
          'listing'
        );
      }
    }
  }

  return created;
}

export async function buyListing(
  listingId: string,
  buyerId: string,
  brokerId: string,
  quantity: number,
  agreedPrice: number
) {
  // Get the listing
  const listing = await listingsCRUD.getById(listingId);

  // Create a contract from the listing
  const contract = await contractsCRUD.create({
    farmer_id: listing.seller_id,
    offtaker_id: buyerId,
    broker_id: brokerId,
    commodity_id: listing.commodity_id,
    listing_id: listingId,
    quantity,
    unit: listing.unit,
    farmer_price: listing.asking_price,
    offtaker_price: agreedPrice,
    broker_commission: agreedPrice - listing.asking_price,
    status: 'PENDING',
  });

  // Mark listing as sold
  await listingsCRUD.markAsSold(listingId);

  // Notify seller
  await notifyUser(
    listing.seller_id,
    'Listing Sold!',
    `Your listing "${listing.title}" has been purchased. Contract ${contract.contract_number} created.`,
    'sale'
  );

  // Notify buyer
  await notifyUser(
    buyerId,
    'Purchase Confirmed',
    `Contract ${contract.contract_number} created for "${listing.title}".`,
    'purchase'
  );

  return contract;
}

// ============================================================
// PRICE BOARD — Market prices
// ============================================================

export async function getMarketPrices(commodityId?: string, region?: string) {
  return priceBoardCRUD.getAll(commodityId, region);
}

export async function updateMarketPrice(
  commodityId: string,
  region: string,
  buyingPrice: number,
  sellingPrice: number,
  source: string = 'ZVIDAMBANO'
) {
  const { data, error } = await supabase
    .from('price_board')
    .insert({
      commodity_id: commodityId,
      region,
      buying_price: buyingPrice,
      selling_price: sellingPrice,
      source,
    })
    .select()
    .single();

  if (error) throw error;
  dataCache.invalidatePattern('price_board');
  return data;
}

// ============================================================
// COMMODITY CATEGORIES
// ============================================================

export const CATEGORIES = {
  GRAIN: 'Grain',
  BRAN_FEED: 'Bran & Feed',
  LIVESTOCK: 'Livestock',
  INPUTS: 'Farm Inputs',
  EQUIPMENT: 'Equipment',
};

export async function getCommoditiesByCategory() {
  const commodities = (await commoditiesCRUD.getAll()) as any[];
  const grouped: Record<string, any[]> = {};

  for (const commodity of commodities) {
    if (!grouped[commodity.category]) {
      grouped[commodity.category] = [];
    }
    grouped[commodity.category].push(commodity);
  }

  return grouped;
}

// ============================================================
// MARKETPLACE REALTIME — Live updates
// ============================================================

export function subscribeToMarketplace(callback: (listings: any[]) => void) {
  const channel = supabase
    .channel('marketplace-live')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'listings',
        filter: 'status=eq.active',
      },
      async () => {
        // Refetch active listings on any change
        const listings = await listingsCRUD.getAll({ status: 'active' });
        callback(listings);
      }
    );

  channel.subscribe();
  return channel;
}

export function subscribeToPriceBoard(callback: (prices: any[]) => void) {
  const channel = supabase
    .channel('price-board-live')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'price_board',
      },
      async () => {
        const prices = await priceBoardCRUD.getAll();
        callback(prices);
      }
    );

  channel.subscribe();
  return channel;
}

// ============================================================
// TRENDING & RECOMMENDATIONS
// ============================================================

export async function getTrendingListings(limit: number = 10) {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      seller:users!seller_id(full_name),
      commodity:commodities(name, category)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getRecommendedListings(userId: string, limit: number = 10) {
  // Get user's past contracts to determine preferences
  const { data: contracts } = await supabase
    .from('contracts')
    .select('commodity_id, category')
    .or(`farmer_id.eq.${userId},offtaker_id.eq.${userId}`)
    .limit(5);

  const preferredCommodities = (contracts || []).map((c: any) => c.commodity_id).filter(Boolean);

  if (preferredCommodities.length > 0) {
    // Recommend listings with similar commodities
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        seller:users!seller_id(full_name),
        commodity:commodities(name, category)
      `)
      .eq('status', 'active')
      .in('commodity_id', preferredCommodities)
      .neq('seller_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  // No preferences — return trending
  return getTrendingListings(limit);
}