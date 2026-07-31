-- ZVIDA Database Schema for Supabase
-- This SQL creates the database schema needed for the ZVIDA PWA
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================================
-- Users Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'supplier' CHECK(role IN ('farmer','broker','offtaker','driver','supplier','admin','compliance')),
  phone TEXT,
  avatar_url TEXT,
  company_name TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  bio TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_auth_user FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- Farms Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  gps_lat FLOAT,
  gps_lng FLOAT,
  size_hectares FLOAT,
  soil_type TEXT,
  climate_zone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view their own farms" ON public.farms
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Farmers can manage their own farms" ON public.farms
  FOR ALL USING (auth.uid() = owner_id);

-- ============================================================
-- Commodities Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.commodities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('GRAIN','BRAN_FEED','LIVESTOCK','INPUTS','EQUIPMENT')),
  unit TEXT NOT NULL DEFAULT 'kg',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.commodities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view commodities" ON public.commodities
  FOR SELECT USING (true);

-- ============================================================
-- Listings Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  commodity_id UUID NOT NULL REFERENCES public.commodities(id),
  title TEXT NOT NULL,
  description TEXT,
  quantity FLOAT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  asking_price FLOAT,
  category TEXT,
  grade TEXT,
  origin TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active','sold','expired','draft')),
  supplier_reserve_price FLOAT,
  broker_listed_price FLOAT,
  is_distressed BOOLEAN DEFAULT FALSE,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active listings" ON public.listings
  FOR SELECT USING (status = 'active' OR auth.uid() = seller_id);

CREATE POLICY "Users can create listings" ON public.listings
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their listings" ON public.listings
  FOR UPDATE USING (auth.uid() = seller_id);

-- ============================================================
-- Contracts Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_number TEXT UNIQUE NOT NULL,
  farmer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  offtaker_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  broker_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  commodity_id UUID REFERENCES public.commodities(id),
  listing_id UUID REFERENCES public.listings(id),
  quantity FLOAT,
  unit TEXT DEFAULT 'kg',
  farmer_price FLOAT,
  offtaker_price FLOAT,
  broker_commission FLOAT,
  status TEXT DEFAULT 'PENDING' CHECK(status IN (
    'PENDING','LOADING','FIRST_WEIGHT','IN_TRANSIT',
    'SECOND_WEIGHT','PENDING_SETTLEMENT','SUCCESSFUL','PAID','CANCELLED'
  )),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parties can view their contracts" ON public.contracts
  FOR SELECT USING (
    auth.uid() = farmer_id OR
    auth.uid() = offtaker_id OR
    auth.uid() = broker_id
  );

-- ============================================================
-- Deliveries Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.users(id),
  vehicle_reg TEXT,
  origin TEXT,
  destination TEXT,
  first_weight FLOAT,
  first_weighbridge_ticket TEXT,
  second_weight FLOAT,
  second_weighbridge_ticket TEXT,
  bucket_count INTEGER,
  bucket_capacity_kg FLOAT,
  bucket_photo_url TEXT,
  bucket_approved BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING','IN_TRANSIT','COMPLETED','CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Payments Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  amount FLOAT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING','COMPLETED','FAILED','DISPUTED')),
  payment_method TEXT,
  payment_date TIMESTAMP WITH TIME ZONE,
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Disputes Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id),
  initiated_by UUID NOT NULL REFERENCES public.users(id),
  subject TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'OPEN' CHECK(status IN ('OPEN','RESOLVED','CLOSED')),
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Notifications Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  related_id UUID,
  related_type TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- Create Indexes
-- ============================================================
CREATE INDEX idx_listings_seller_id ON public.listings(seller_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_created_at ON public.listings(created_at DESC);
CREATE INDEX idx_contracts_farmer_id ON public.contracts(farmer_id);
CREATE INDEX idx_contracts_offtaker_id ON public.contracts(offtaker_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_deliveries_contract_id ON public.deliveries(contract_id);
CREATE INDEX idx_deliveries_driver_id ON public.deliveries(driver_id);
CREATE INDEX idx_payments_contract_id ON public.payments(contract_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- ============================================================
-- Insert Sample Commodities
-- ============================================================
INSERT INTO public.commodities (name, category, unit, description)
VALUES
  ('Maize', 'GRAIN', 'kg', 'Corn/Maize grain'),
  ('Wheat', 'GRAIN', 'kg', 'Wheat grain'),
  ('Soybean', 'GRAIN', 'kg', 'Soybean'),
  ('Rice', 'GRAIN', 'kg', 'Rice grain'),
  ('Chicken Feed', 'BRAN_FEED', 'kg', 'Poultry feed'),
  ('Cattle Feed', 'BRAN_FEED', 'kg', 'Livestock feed'),
  ('Live Cattle', 'LIVESTOCK', 'head', 'Cattle'),
  ('Live Chickens', 'LIVESTOCK', 'head', 'Poultry'),
  ('Fertilizer', 'INPUTS', 'kg', 'Agricultural fertilizer'),
  ('Seeds', 'INPUTS', 'kg', 'Planting seeds'),
  ('Tractor', 'EQUIPMENT', 'unit', 'Agricultural machinery')
ON CONFLICT DO NOTHING;
