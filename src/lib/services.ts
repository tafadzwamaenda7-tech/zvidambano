/**
 * Business Logic & Dashboard Services
 * Core logic for different user roles
 */

import { supabase, Listing, Contract, Delivery, Payment } from './supabase';
import {
  getListings,
  getContracts,
  getDeliveries,
  getPayments,
  updateContractStatus,
  createPayment,
  updatePaymentStatus,
  createDelivery,
  updateDelivery,
} from './api';
import { eventBus, Events } from './event-bus';
import { stateManager } from './state-manager';
import { getAuthState } from './auth';

/**
 * FARMER DASHBOARD LOGIC
 */
export class FarmerService {
  static async getMyListings() {
    const auth = getAuthState();
    if (!auth.isAuthenticated) throw new Error('Not authenticated');

    const listings = await getListings({ seller_id: auth.user.id });
    stateManager.setListings(listings);
    return listings;
  }

  static async getMyContracts() {
    const auth = getAuthState();
    if (!auth.isAuthenticated) throw new Error('Not authenticated');

    const contracts = await getContracts({ farmer_id: auth.user.id });
    stateManager.setContracts(contracts);
    return contracts;
  }

  static async getMyPayments() {
    const auth = getAuthState();
    if (!auth.isAuthenticated) throw new Error('Not authenticated');

    const contracts = await getContracts({ farmer_id: auth.user.id });
    const contractIds = contracts.map((c) => c.id);

    if (contractIds.length === 0) return [];

    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .in('contract_id', contractIds);

    stateManager.setPayments(payments || []);
    return payments || [];
  }

  static async getDashboardStats() {
    const auth = getAuthState();
    if (!auth.isAuthenticated) throw new Error('Not authenticated');

    const [listings, contracts, payments] = await Promise.all([
      getListings({ seller_id: auth.user.id }),
      getContracts({ farmer_id: auth.user.id }),
      this.getMyPayments(),
    ]);

    const completedContracts = contracts.filter((c) => c.status === 'SUCCESSFUL').length;
    const totalEarned = payments
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      activeListings: listings.filter((l) => l.status === 'active').length,
      totalListings: listings.length,
      activeContracts: contracts.filter((c) =>
        ['PENDING', 'LOADING', 'FIRST_WEIGHT', 'IN_TRANSIT', 'SECOND_WEIGHT'].includes(c.status)
      ).length,
      completedContracts,
      totalContracts: contracts.length,
      totalEarned,
      pendingPayments: payments.filter((p) => p.status === 'PENDING').length,
    };
  }

  static async acceptContract(contractId: string) {
    const contract = await updateContractStatus(contractId, 'LOADING');
    Events.contractStatusChanged({
      id: contractId,
      oldStatus: 'PENDING',
      newStatus: 'LOADING',
      contract,
    });
    return contract;
  }

  static async createListing(data: any) {
    const auth = getAuthState();
    if (!auth.isAuthenticated) throw new Error('Not authenticated');

    const listing = await supabase.from('listings').insert([{
      seller_id: auth.user.id,
      ...data,
      status: 'draft',
    }]).select().single();

    Events.listingCreated(listing.data);
    return listing.data;
  }

  static async publishListing(listingId: string) {
    const listing = await supabase
      .from('listings')
      .update({ status: 'active' })
      .eq('id', listingId)
      .select()
      .single();

    Events.listingUpdated(listing.data);
    return listing.data;
  }
}

/**
 * OFFTAKER DASHBOARD LOGIC
 */
export class OfftakerService {
  static async getAvailableListings() {
    const listings = await getListings({ status: 'active' });
    stateManager.setListings(listings);
    return listings;
  }

  static async getMyContracts() {
    const auth = getAuthState();
    if (!auth.isAuthenticated) throw new Error('Not authenticated');

    const contracts = await getContracts({ offtaker_id: auth.user.id });
    stateManager.setContracts(contracts);
    return contracts;
  }

  static async getMyPayments() {
    const auth = getAuthState();
    if (!auth.isAuthenticated) throw new Error('Not authenticated');

    const contracts = await getContracts({ offtaker_id: auth.user.id });
    const contractIds = contracts.map((c) => c.id);

    if (contractIds.length === 0) return [];

    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .in('contract_id', contractIds);

    stateManager.setPayments(payments || []);
    return payments || [];
  }

  static async getDashboardStats() {
    const auth = getAuthState();
    if (!auth.isAuthenticated) throw new Error('Not authenticated');

    const [listings, contracts, payments] = await Promise.all([
      this.getAvailableListings(),
      this.getMyContracts(),
      this.getMyPayments(),
    ]);

    return {
      availableListings: listings.length,
      activeContracts: contracts.filter((c) =>
        ['PENDING', 'LOADING', 'IN_TRANSIT'].includes(c.status)
      ).length,
      completedContracts: contracts.filter((c) => c.status === 'SUCCESSFUL').length,
      totalContracts: contracts.length,
      totalSpent: payments
        .filter((p) => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + (p.amount || 0), 0),
      pendingPayments: payments.filter((p) => p.status === 'PENDING').length,
    };
  }

  static async placeOrder(listingId: string, quantity: number, pricePerUnit: number) {
    const auth = getAuthState();
    if (!auth.isAuthenticated) throw new Error('Not authenticated');

    const listing = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single();

    const contract = await supabase.from('contracts').insert([{
      contract_number: `CTR-${Date.now()}`,
      farmer_id: listing.data.seller_id,
      offtaker_id: auth.user.id,
      commodity_id: listing.data.commodity_id,
      listing_id: listingId,
      quantity,
      unit: listing.data.unit,
      farmer_price: listing.data.asking_price,
      offtaker_price: pricePerUnit,
      status: 'PENDING',
    }]).select().single();

    Events.contractCreated(contract.data);
    return contract.data;
  }

  static async acceptDelivery(deliveryId: string) {
    const delivery = await updateDelivery(deliveryId, { status: 'COMPLETED' });
    Events.deliveryStatusChanged({
      id: deliveryId,
      newStatus: 'COMPLETED',
      delivery,
    });
    return delivery;
  }
}

/**
 * DRIVER DASHBOARD LOGIC
 */
export class DriverService {
  static async getMyDeliveries() {
    const auth = getAuthState();
    if (!auth.isAuthenticated) throw new Error('Not authenticated');

    const deliveries = await getDeliveries({ driver_id: auth.user.id });
    stateManager.setDeliveries(deliveries);
    return deliveries;
  }

  static async getDeliveryContract(deliveryId: string) {
    const delivery = stateManager.getDeliveries().find((d) => d.id === deliveryId);
    if (!delivery) return null;

    const contracts = stateManager.getContracts();
    return contracts.find((c) => c.id === delivery.contract_id);
  }

  static async getDashboardStats() {
    const auth = getAuthState();
    if (!auth.isAuthenticated) throw new Error('Not authenticated');

    const deliveries = await this.getMyDeliveries();

    return {
      totalDeliveries: deliveries.length,
      inTransit: deliveries.filter((d) => d.status === 'IN_TRANSIT').length,
      completed: deliveries.filter((d) => d.status === 'COMPLETED').length,
      pending: deliveries.filter((d) => d.status === 'PENDING').length,
    };
  }

  static async startDelivery(deliveryId: string, firstWeight: number) {
    const delivery = await updateDelivery(deliveryId, {
      status: 'IN_TRANSIT',
      first_weight: firstWeight,
    });

    Events.deliveryStatusChanged({
      id: deliveryId,
      newStatus: 'IN_TRANSIT',
      delivery,
    });

    return delivery;
  }

  static async completeDelivery(deliveryId: string, secondWeight: number, bucketCount: number) {
    const delivery = await updateDelivery(deliveryId, {
      status: 'COMPLETED',
      second_weight: secondWeight,
    } as any);

    const contract = stateManager.getContracts().find((c) => c.id === delivery.contract_id);

    if (contract) {
      // Auto-create payment record
      const payment = await createPayment({
        contract_id: contract.id,
        amount: contract.offtaker_price * contract.quantity,
        status: 'PENDING',
      });

      Events.paymentCreated(payment);
    }

    Events.deliveryStatusChanged({
      id: deliveryId,
      newStatus: 'COMPLETED',
      delivery,
    });

    return delivery;
  }
}

/**
 * BROKER/COMPLIANCE DASHBOARD LOGIC
 */
export class BrokerService {
  static async getAllContracts() {
    const { data: contracts } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false });

    stateManager.setContracts(contracts || []);
    return contracts || [];
  }

  static async getAllDeliveries() {
    const deliveries = await getDeliveries({});
    stateManager.setDeliveries(deliveries);
    return deliveries;
  }

  static async getContractDetails(contractId: string) {
    const contracts = stateManager.getContracts();
    const contract = contracts.find((c) => c.id === contractId);

    if (!contract) return null;

    const deliveries = stateManager.getDeliveries().filter((d) => d.contract_id === contractId);
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .eq('contract_id', contractId);

    return {
      contract,
      deliveries,
      payments: payments || [],
    };
  }

  static async getDashboardStats() {
    const [contracts, deliveries] = await Promise.all([
      this.getAllContracts(),
      this.getAllDeliveries(),
    ]);

    const statuses = {
      pending: contracts.filter((c) => c.status === 'PENDING').length,
      loading: contracts.filter((c) => c.status === 'LOADING').length,
      inTransit: contracts.filter((c) => c.status === 'IN_TRANSIT').length,
      completed: contracts.filter((c) => c.status === 'SUCCESSFUL').length,
    };

    const deliveryStatuses = {
      pending: deliveries.filter((d) => d.status === 'PENDING').length,
      inTransit: deliveries.filter((d) => d.status === 'IN_TRANSIT').length,
      completed: deliveries.filter((d) => d.status === 'COMPLETED').length,
    };

    return {
      totalContracts: contracts.length,
      contractStatuses: statuses,
      totalDeliveries: deliveries.length,
      deliveryStatuses,
    };
  }

  static async approveContract(contractId: string) {
    const contract = await updateContractStatus(contractId, 'FIRST_WEIGHT');
    Events.contractStatusChanged({
      id: contractId,
      newStatus: 'FIRST_WEIGHT',
      contract,
    });
    return contract;
  }

  static async settleContract(contractId: string) {
    const contract = await updateContractStatus(contractId, 'PENDING_SETTLEMENT');
    Events.contractStatusChanged({
      id: contractId,
      newStatus: 'PENDING_SETTLEMENT',
      contract,
    });
    return contract;
  }

  static async markContractSuccessful(contractId: string) {
    const contract = await updateContractStatus(contractId, 'SUCCESSFUL');
    Events.contractStatusChanged({
      id: contractId,
      newStatus: 'SUCCESSFUL',
      contract,
    });
    return contract;
  }
}

/**
 * SUPPLIER/VENDOR DASHBOARD LOGIC
 */
export class SupplierService {
  static async getMyListings() {
    const auth = getAuthState();
    if (!auth.isAuthenticated) throw new Error('Not authenticated');

    const listings = await getListings({ seller_id: auth.user.id });
    stateManager.setListings(listings);
    return listings;
  }

  static async getDashboardStats() {
    const auth = getAuthState();
    if (!auth.isAuthenticated) throw new Error('Not authenticated');

    const listings = await this.getMyListings();

    return {
      totalListings: listings.length,
      activeListings: listings.filter((l) => l.status === 'active').length,
      draftListings: listings.filter((l) => l.status === 'draft').length,
      soldListings: listings.filter((l) => l.status === 'sold').length,
    };
  }

  static async bulkCreateListings(items: any[]) {
    const auth = getAuthState();
    if (!auth.isAuthenticated) throw new Error('Not authenticated');

    const listings = items.map((item) => ({
      seller_id: auth.user.id,
      ...item,
      status: 'active',
    }));

    const { data } = await supabase.from('listings').insert(listings).select();

    data?.forEach((listing) => {
      Events.listingCreated(listing);
    });

    return data || [];
  }
}
