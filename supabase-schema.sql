-- ============================================================
-- ZVIDAMBANO Supabase Database Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ============================================================
-- 1. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 2. UTILITY FUNCTIONS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate contract number
CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ZV-' || UPPER(SUBSTRING(encode(gen_random_bytes(4), 'hex') FROM 1 FOR 6));
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 3. TABLES
-- ============================================================

-- ---------- USERS (profiles) ----------
-- Note: Supabase Auth handles authentication. This table stores
-- profile data linked to auth.users via the user's UUID.
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- Only used if not using Supabase Auth
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'farmer' CHECK (
    role IN ('farmer', 'broker', 'offtaker', 'driver', 'supplier', 'admin', 'compliance')
  ),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- ---------- FARMS ----------
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  size_hectares DOUBLE PRECISION,
  size_unit TEXT DEFAULT 'hectares',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_farms_owner_id ON public.farms(owner_id);

-- ---------- COMMODITIES ----------
CREATE TABLE IF NOT EXISTS public.commodities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('GRAIN', 'BRAN_FEED', 'LIVESTOCK', 'INPUTS', 'EQUIPMENT')
  ),
  unit TEXT DEFAULT 'kg',
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commodities_category ON public.commodities(category);

-- ---------- LISTINGS ----------
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  commodity_id UUID REFERENCES public.commodities(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'kg',
  asking_price NUMERIC,
  category TEXT,
  grade TEXT,
  origin TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (
    status IN ('active', 'sold', 'expired', 'draft')
  ),
  supplier_reserve_price NUMERIC,
  broker_listed_price NUMERIC,
  is_distressed BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_commodity_id ON public.listings(commodity_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON public.listings(category);

-- ---------- CONTRACTS ----------
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_number TEXT UNIQUE DEFAULT generate_contract_number(),
  farmer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  offtaker_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  broker_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  commodity_id UUID REFERENCES public.commodities(id) ON DELETE SET NULL,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'kg',
  farmer_price NUMERIC,
  offtaker_price NUMERIC,
  broker_commission NUMERIC,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    status IN (
      'PENDING', 'LOADING', 'FIRST_WEIGHT', 'IN_TRANSIT',
      'SECOND_WEIGHT', 'PENDING_SETTLEMENT', 'SUCCESSFUL',
      'PAID', 'CANCELLED'
    )
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_farmer_id ON public.contracts(farmer_id);
CREATE INDEX IF NOT EXISTS idx_contracts_offtaker_id ON public.contracts(offtaker_id);
CREATE INDEX IF NOT EXISTS idx_contracts_broker_id ON public.contracts(broker_id);

-- ---------- DELIVERIES ----------
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  vehicle_reg TEXT,
  origin TEXT,
  destination TEXT,
  first_weight NUMERIC,
  first_weighbridge_ticket TEXT,
  second_weight NUMERIC,
  second_weighbridge_ticket TEXT,
  bucket_count INTEGER,
  bucket_capacity_kg NUMERIC,
  bucket_photo_url TEXT,
  bucket_approved BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    status IN (
      'PENDING', 'LOADING', 'FIRST_WEIGHT', 'IN_TRANSIT',
      'SECOND_WEIGHT', 'DELIVERED'
    )
  ),
  gps_lat DOUBLE PRECISION,
  gps_lng DOUBLE PRECISION,
  estimated_arrival TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_contract_id ON public.deliveries(contract_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver_id ON public.deliveries(driver_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON public.deliveries(status);

-- ---------- PAYMENTS ----------
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  payer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  payee_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  method TEXT,
  reference TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_contract_id ON public.payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

-- ---------- FARMER SETTLEMENTS ----------
CREATE TABLE IF NOT EXISTS public.farmer_settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  net_payout NUMERIC,
  gross_amount NUMERIC,
  amount NUMERIC,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    status IN ('PENDING', 'PAID')
  ),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_farmer_settlements_contract_id ON public.farmer_settlements(contract_id);
CREATE INDEX IF NOT EXISTS idx_farmer_settlements_farmer_id ON public.farmer_settlements(farmer_id);

-- ---------- OFFTAKER INVOICES ----------
CREATE TABLE IF NOT EXISTS public.offtaker_invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  offtaker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_amount NUMERIC,
  amount NUMERIC,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    status IN ('PENDING', 'PAID')
  ),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offtaker_invoices_contract_id ON public.offtaker_invoices(contract_id);
CREATE INDEX IF NOT EXISTS idx_offtaker_invoices_offtaker_id ON public.offtaker_invoices(offtaker_id);

-- ---------- BROKER COMMISSION LEDGER ----------
CREATE TABLE IF NOT EXISTS public.broker_commission_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  broker_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  commission_amount NUMERIC,
  farmer_buy_price NUMERIC,
  offtaker_sell_price NUMERIC,
  spread NUMERIC,
  amount NUMERIC,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    status IN ('PENDING', 'SETTLED')
  ),
  settled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_broker_commission_contract_id ON public.broker_commission_ledger(contract_id);
CREATE INDEX IF NOT EXISTS idx_broker_commission_broker_id ON public.broker_commission_ledger(broker_id);

-- ---------- QUALITY SCANS ----------
CREATE TABLE IF NOT EXISTS public.quality_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  scanned_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  moisture NUMERIC,
  protein NUMERIC,
  foreign_matter NUMERIC,
  damaged_grains NUMERIC,
  grade TEXT,
  result TEXT CHECK (result IN ('pass', 'fail')),
  notes TEXT,
  image_url TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quality_scans_contract_id ON public.quality_scans(contract_id);

-- ---------- DOCUMENTS ----------
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  type TEXT,
  name TEXT NOT NULL,
  title TEXT,
  file_url TEXT,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  generated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_contract_id ON public.documents(contract_id);

-- ---------- DISPUTES ----------
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  raised_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (
    status IN ('OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED')
  ),
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_disputes_contract_id ON public.disputes(contract_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);

-- ---------- PRICE BOARD ----------
CREATE TABLE IF NOT EXISTS public.price_board (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commodity_id UUID REFERENCES public.commodities(id) ON DELETE CASCADE,
  region TEXT,
  buying_price NUMERIC,
  selling_price NUMERIC,
  price NUMERIC,
  unit TEXT DEFAULT 'kg',
  currency TEXT DEFAULT 'USD',
  source TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_price_board_commodity_id ON public.price_board(commodity_id);
CREATE INDEX IF NOT EXISTS idx_price_board_region ON public.price_board(region);

-- ---------- NOTIFICATIONS ----------
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- ---------- MESSAGES ----------
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

-- ---------- INPUT ORDERS ----------
CREATE TABLE IF NOT EXISTS public.input_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  farmer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_name TEXT,
  item TEXT,
  quantity NUMERIC,
  unit TEXT DEFAULT 'kg',
  amount NUMERIC,
  total_cost NUMERIC,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    status IN ('PENDING', 'CONFIRMED', 'DELIVERED', 'PAID')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_input_orders_farmer_id ON public.input_orders(farmer_id);
CREATE INDEX IF NOT EXISTS idx_input_orders_supplier_id ON public.input_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_input_orders_status ON public.input_orders(status);

-- ---------- FINANCING APPLICATIONS ----------
CREATE TABLE IF NOT EXISTS public.financing_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 0,
  purpose TEXT,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    status IN ('PENDING', 'REVIEW', 'APPROVED', 'DISBURSED', 'REPAID')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_financing_farmer_id ON public.financing_applications(farmer_id);
CREATE INDEX IF NOT EXISTS idx_financing_status ON public.financing_applications(status);

-- ---------- EQUIPMENT LISTINGS ----------
CREATE TABLE IF NOT EXISTS public.equipment_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  name TEXT,
  description TEXT,
  category TEXT,
  condition TEXT,
  price_per_day NUMERIC,
  daily_rate NUMERIC,
  available BOOLEAN DEFAULT TRUE,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_equipment_owner_id ON public.equipment_listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_equipment_category ON public.equipment_listings(category);

-- ============================================================
-- 4. TRIGGERS (auto-update updated_at)
-- ============================================================

CREATE OR REPLACE FUNCTION create_update_trigger(table_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format($f$
    CREATE TRIGGER update_%s_updated_at
    BEFORE UPDATE ON public.%I
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  $f$, table_name, table_name);
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'users', 'farms', 'commodities', 'listings', 'contracts',
      'deliveries', 'payments', 'farmer_settlements', 'offtaker_invoices',
      'broker_commission_ledger', 'quality_scans', 'documents', 'disputes',
      'price_board', 'notifications', 'messages', 'input_orders',
      'financing_applications', 'equipment_listings'
    ])
  LOOP
    EXECUTE format($f$
      DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%I;
      CREATE TRIGGER update_%s_updated_at
      BEFORE UPDATE ON public.%I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    $f$, tbl, tbl, tbl, tbl);
  END LOOP;
END;
$$;

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commodities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offtaker_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_commission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_board ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.input_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financing_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_listings ENABLE ROW LEVEL SECURITY;

-- Users: users can read their own profile, admins can read all
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
  ));
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can insert users" ON public.users
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

-- Farms: owners can CRUD their farms
CREATE POLICY "Users can read farms" ON public.farms
  FOR SELECT USING (
    owner_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'broker')
    )
  );
CREATE POLICY "Users can insert farms" ON public.farms
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Users can update farms" ON public.farms
  FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Users can delete farms" ON public.farms
  FOR DELETE USING (owner_id = auth.uid());

-- Commodities: everyone can read, admins can write
CREATE POLICY "Anyone can read commodities" ON public.commodities
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage commodities" ON public.commodities
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

-- Listings: everyone can read active, sellers can CRUD their own
CREATE POLICY "Anyone can read active listings" ON public.listings
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'broker', 'offtaker')
  ));
CREATE POLICY "Sellers can insert listings" ON public.listings
  FOR INSERT WITH CHECK (seller_id = auth.uid());
CREATE POLICY "Sellers can update listings" ON public.listings
  FOR UPDATE USING (seller_id = auth.uid());
CREATE POLICY "Sellers can delete listings" ON public.listings
  FOR DELETE USING (seller_id = auth.uid());

-- Contracts: parties can read, brokers/admins can write
CREATE POLICY "Parties can read contracts" ON public.contracts
  FOR SELECT USING (
    farmer_id = auth.uid() OR offtaker_id = auth.uid() OR broker_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );
CREATE POLICY "Brokers can insert contracts" ON public.contracts
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'broker')
  ));
CREATE POLICY "Brokers can update contracts" ON public.contracts
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'broker')
  ));

-- Deliveries: parties can read, drivers/brokers can write
CREATE POLICY "Parties can read deliveries" ON public.deliveries
  FOR SELECT USING (
    driver_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.id = deliveries.contract_id
      AND (c.farmer_id = auth.uid() OR c.offtaker_id = auth.uid() OR c.broker_id = auth.uid())
    ) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );
CREATE POLICY "Drivers can insert deliveries" ON public.deliveries
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'broker', 'driver')
  ));
CREATE POLICY "Drivers can update deliveries" ON public.deliveries
  FOR UPDATE USING (
    driver_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'broker')
    )
  );

-- Payments: parties can read, admins can write
CREATE POLICY "Parties can read payments" ON public.payments
  FOR SELECT USING (
    payer_id = auth.uid() OR payee_id = auth.uid() OR EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.id = payments.contract_id
      AND (c.farmer_id = auth.uid() OR c.offtaker_id = auth.uid() OR c.broker_id = auth.uid())
    ) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );
CREATE POLICY "Admins can insert payments" ON public.payments
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'broker')
  ));
CREATE POLICY "Admins can update payments" ON public.payments
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'broker')
  ));

-- Notifications: users can read/update their own
CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true); -- Allow inserts from API/edge functions

-- Messages: users can read/send their own
CREATE POLICY "Users can read own messages" ON public.messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "Users can update own messages" ON public.messages
  FOR UPDATE USING (receiver_id = auth.uid());

-- Price board: everyone can read, admins can write
CREATE POLICY "Anyone can read prices" ON public.price_board
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage prices" ON public.price_board
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

-- Quality scans: parties can read, admins/brokers can write
CREATE POLICY "Parties can read quality scans" ON public.quality_scans
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.contracts c
    WHERE c.id = quality_scans.contract_id
    AND (c.farmer_id = auth.uid() OR c.offtaker_id = auth.uid() OR c.broker_id = auth.uid())
  ) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'));
CREATE POLICY "Admins can manage quality scans" ON public.quality_scans
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'broker', 'compliance')
  ));

-- Documents: parties can read, admins can write
CREATE POLICY "Parties can read documents" ON public.documents
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.contracts c
    WHERE c.id = documents.contract_id
    AND (c.farmer_id = auth.uid() OR c.offtaker_id = auth.uid() OR c.broker_id = auth.uid())
  ) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'));
CREATE POLICY "Admins can manage documents" ON public.documents
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'broker')
  ));

-- Disputes: parties can read, admins can write
CREATE POLICY "Parties can read disputes" ON public.disputes
  FOR SELECT USING (
    raised_by = auth.uid() OR EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.id = disputes.contract_id
      AND (c.farmer_id = auth.uid() OR c.offtaker_id = auth.uid() OR c.broker_id = auth.uid())
    ) OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin')
  );
CREATE POLICY "Users can insert disputes" ON public.disputes
  FOR INSERT WITH CHECK (raised_by = auth.uid());
CREATE POLICY "Admins can update disputes" ON public.disputes
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

-- Settlements, invoices, commissions: parties can read, admins can write
CREATE POLICY "Parties can read farmer settlements" ON public.farmer_settlements
  FOR SELECT USING (farmer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'broker')
  ));
CREATE POLICY "Admins can manage farmer settlements" ON public.farmer_settlements
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'broker')
  ));

CREATE POLICY "Parties can read offtaker invoices" ON public.offtaker_invoices
  FOR SELECT USING (offtaker_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'broker')
  ));
CREATE POLICY "Admins can manage offtaker invoices" ON public.offtaker_invoices
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'broker')
  ));

CREATE POLICY "Parties can read commissions" ON public.broker_commission_ledger
  FOR SELECT USING (broker_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
  ));
CREATE POLICY "Admins can manage commissions" ON public.broker_commission_ledger
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin', 'broker')
  ));

-- Input orders: parties can read/write
CREATE POLICY "Parties can read input orders" ON public.input_orders
  FOR SELECT USING (farmer_id = auth.uid() OR supplier_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
  ));
CREATE POLICY "Users can insert input orders" ON public.input_orders
  FOR INSERT WITH CHECK (farmer_id = auth.uid());
CREATE POLICY "Parties can update input orders" ON public.input_orders
  FOR UPDATE USING (farmer_id = auth.uid() OR supplier_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

-- Financing: farmers can read/insert their own, admins can manage
CREATE POLICY "Farmers can read own financing" ON public.financing_applications
  FOR SELECT USING (farmer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
  ));
CREATE POLICY "Farmers can insert financing" ON public.financing_applications
  FOR INSERT WITH CHECK (farmer_id = auth.uid());
CREATE POLICY "Admins can update financing" ON public.financing_applications
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

-- Equipment: everyone can read, owners can CRUD
CREATE POLICY "Anyone can read equipment" ON public.equipment_listings
  FOR SELECT USING (available = true OR owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
  ));
CREATE POLICY "Owners can insert equipment" ON public.equipment_listings
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update equipment" ON public.equipment_listings
  FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owners can delete equipment" ON public.equipment_listings
  FOR DELETE USING (owner_id = auth.uid());

-- ============================================================
-- 6. SEED DATA
-- ============================================================

-- Insert seed users (password: password123)
-- Note: In production, use Supabase Auth for user management.
-- These are for development/testing only.
INSERT INTO public.users (email, password_hash, full_name, role, phone) VALUES
  ('farmer1@zvida.zw', 'dev_hash', 'Tinashe Moyo', 'farmer', '+263771234567'),
  ('farmer2@zvida.zw', 'dev_hash', 'Chiedza Nhamo', 'farmer', '+263772345678'),
  ('farmer3@zvida.zw', 'dev_hash', 'Blessing Chikomo', 'farmer', '+263773456789'),
  ('broker1@zvida.zw', 'dev_hash', 'Tafadzwa Chikombe', 'broker', '+263774567890'),
  ('broker2@zvida.zw', 'dev_hash', 'Rutendo Gwaze', 'broker', '+263775678901'),
  ('offtaker1@zvida.zw', 'dev_hash', 'Simba Mills Ltd', 'offtaker', '+263776789012'),
  ('offtaker2@zvida.zw', 'dev_hash', 'Nyika Foods', 'offtaker', '+263777890123'),
  ('driver1@zvida.zw', 'dev_hash', 'Farai Mupfurutsa', 'driver', '+263778901234'),
  ('driver2@zvida.zw', 'dev_hash', 'Tendai Musakwa', 'driver', '+263779012345'),
  ('supplier1@zvida.zw', 'dev_hash', 'AgroChem Zimbabwe', 'supplier', '+263770123456'),
  ('supplier2@zvida.zw', 'dev_hash', 'SeedCo Zimbabwe', 'supplier', '+263771123456'),
  ('admin@zvida.zw', 'dev_hash', 'System Admin', 'admin', '+263772123456')
ON CONFLICT (email) DO NOTHING;

-- Insert seed commodities
INSERT INTO public.commodities (name, category, unit, description) VALUES
  ('Wheat', 'GRAIN', 'kg', 'Grade A winter wheat'),
  ('Maize', 'GRAIN', 'kg', 'Yellow maize feed grade'),
  ('Soybeans', 'GRAIN', 'kg', 'Non-GMO soybeans'),
  ('Millet', 'GRAIN', 'kg', 'Pearl millet'),
  ('Sorghum', 'GRAIN', 'kg', 'Red sorghum'),
  ('Wheat Bran', 'BRAN_FEED', 'kg', 'Wheat bran animal feed'),
  ('Maize Bran', 'BRAN_FEED', 'kg', 'Maize bran'),
  ('Cattle', 'LIVESTOCK', 'head', 'Beef cattle'),
  ('Goats', 'LIVESTOCK', 'head', 'Boer goats'),
  ('Fertilizer NPK', 'INPUTS', '50kg bag', 'NPK 2:3:2 compound'),
  ('Ammonium Nitrate', 'INPUTS', '50kg bag', 'AN fertilizer'),
  ('Seed Maize', 'INPUTS', 'kg', 'Hybrid maize seed'),
  ('Tractor', 'EQUIPMENT', 'unit', 'John Deere 5075E')
ON CONFLICT DO NOTHING;

-- Insert seed listings
INSERT INTO public.listings (seller_id, commodity_id, title, description, quantity, unit, asking_price, category, grade, origin, status)
SELECT u.id, c.id, v.title, v.description, v.quantity, v.unit, v.asking_price, v.category, v.grade, v.origin, v.status
FROM (VALUES
  ('farmer1@zvida.zw', 'Wheat', 'Premium Winter Wheat', 'High quality winter wheat from Mutare farms', 5000, 'kg', 450, 'GRAIN', 'Grade A', 'Manicaland', 'active'),
  ('farmer1@zvida.zw', 'Maize', 'Yellow Maize Feed', 'Feed grade yellow maize', 10000, 'kg', 320, 'GRAIN', 'Feed', 'Mashonaland East', 'active'),
  ('farmer2@zvida.zw', 'Soybeans', 'Non-GMO Soybeans', 'Certified non-GMO soybeans', 3000, 'kg', 580, 'GRAIN', 'Grade A', 'Masvingo', 'active'),
  ('farmer3@zvida.zw', 'Millet', 'Pearl Millet', 'Traditional pearl millet', 2000, 'kg', 380, 'GRAIN', 'Standard', 'Matabeleland South', 'active'),
  ('farmer2@zvida.zw', 'Sorghum', 'Red Sorghum', 'Brewing grade sorghum', 4000, 'kg', 290, 'GRAIN', 'Brewing', 'Midlands', 'active'),
  ('farmer1@zvida.zw', 'Wheat', 'Distressed Wheat Stock', 'Overbought wheat needs quick sale', 8000, 'kg', 350, 'GRAIN', 'Feed', 'Harare', 'active')
) AS v(email, commodity, title, description, quantity, unit, asking_price, category, grade, origin, status
)
JOIN public.users u ON u.email = v.email
JOIN public.commodities c ON c.name = v.commodity
ON CONFLICT DO NOTHING;

-- Insert seed contracts
INSERT INTO public.contracts (contract_number, farmer_id, offtaker_id, broker_id, commodity_id, quantity, unit, farmer_price, offtaker_price, broker_commission, status)
SELECT v.cn, f.id, o.id, b.id, c.id, v.quantity, v.unit, v.farmer_price, v.offtaker_price, v.broker_commission, v.status
FROM (VALUES
  ('ZV-001', 'farmer1@zvida.zw', 'offtaker1@zvida.zw', 'broker1@zvida.zw', 'Wheat', 5000, 'kg', 420, 450, 30, 'SUCCESSFUL'),
  ('ZV-002', 'farmer2@zvida.zw', 'offtaker1@zvida.zw', 'broker1@zvida.zw', 'Soybeans', 3000, 'kg', 550, 580, 30, 'IN_TRANSIT'),
  ('ZV-003', 'farmer1@zvida.zw', 'offtaker2@zvida.zw', 'broker2@zvida.zw', 'Maize', 8000, 'kg', 300, 320, 20, 'LOADING'),
  ('ZV-004', 'farmer3@zvida.zw', 'offtaker2@zvida.zw', 'broker1@zvida.zw', 'Millet', 2000, 'kg', 350, 380, 30, 'PENDING'),
  ('ZV-005', 'farmer2@zvida.zw', 'offtaker1@zvida.zw', 'broker2@zvida.zw', 'Sorghum', 4000, 'kg', 260, 290, 30, 'SECOND_WEIGHT')
) AS v(cn, farmer_email, offtaker_email, broker_email, commodity, quantity, unit, farmer_price, offtaker_price, broker_commission, status
)
JOIN public.users f ON f.email = v.farmer_email
JOIN public.users o ON o.email = v.offtaker_email
JOIN public.users b ON b.email = v.broker_email
JOIN public.commodities c ON c.name = v.commodity
ON CONFLICT (contract_number) DO NOTHING;

-- Insert seed price board
INSERT INTO public.price_board (commodity_id, region, buying_price, selling_price, source)
SELECT c.id, v.region, v.buying_price, v.selling_price, v.source
FROM (VALUES
  ('Wheat', 'Harare', 420, 450, 'ZVIDAMBANO'),
  ('Wheat', 'Bulawayo', 415, 445, 'ZVIDAMBANO'),
  ('Maize', 'Harare', 300, 320, 'ZVIDAMBANO'),
  ('Maize', 'Mutare', 295, 318, 'ZVIDAMBANO'),
  ('Soybeans', 'Harare', 550, 580, 'ZVIDAMBANO'),
  ('Soybeans', 'Masvingo', 540, 570, 'ZVIDAMBANO'),
  ('Millet', 'Harare', 350, 380, 'ZVIDAMBANO'),
  ('Sorghum', 'Harare', 260, 290, 'ZVIDAMBANO'),
  ('Wheat Bran', 'Harare', 180, 210, 'ZVIDAMBANO'),
  ('Fertilizer NPK', 'Harare', 850, 920, 'ZVIDAMBANO')
) AS v(commodity, region, buying_price, selling_price, source)
JOIN public.commodities c ON c.name = v.commodity
ON CONFLICT DO NOTHING;

-- ============================================================
-- 7. REALTIME PUBLICATION
-- ============================================================
-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.listings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contracts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deliveries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.price_board;

-- ============================================================
-- DONE! Your ZVIDAMBANO database is ready.
-- ============================================================
-- Next steps:
-- 1. Go to Supabase Dashboard > Settings > API
-- 2. Copy your Project URL and anon public key
-- 3. Paste them into your .env file:
--    VITE_SUPABASE_URL=https://your-project.supabase.co
--    VITE_SUPABASE_ANON_KEY=your-anon-key-here
-- 4. Restart your dev server: npm run dev
-- ============================================================