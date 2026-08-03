-- ============================================================
-- ZVIDAMBANO Dashboard Live-Data Additions
-- Adds the structures the dashboards need to read/write live
-- data with the anonymous key, plus demo seed users.
-- NOTE: these policies deliberately relax RLS for the demo.
-- Review before production use.
-- ============================================================

-- ---------- 1. COLUMN EXTENSIONS ----------
ALTER TABLE public.contracts ADD COLUMN IF NOT EXISTS meta JSONB;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS meta JSONB;

-- Relax contracts.status so the dashboard consignment states fit
ALTER TABLE public.contracts DROP CONSTRAINT IF EXISTS contracts_status_check;
ALTER TABLE public.contracts
  ADD CONSTRAINT contracts_status_check CHECK (
    status IN (
      'PENDING', 'LOADING', 'WEIGHED_1', 'IN_TRANSIT', 'OFFLOADING',
      'WEIGHED_2', 'PENDING_PAYMENT', 'PAID', 'CANCELLED',
      'FIRST_WEIGHT', 'SECOND_WEIGHT', 'PENDING_SETTLEMENT', 'SUCCESSFUL'
    )
  );

-- ---------- 2. MARKETPLACE ORDERS TABLE ----------
CREATE TABLE IF NOT EXISTS public.market_orders (
  id TEXT PRIMARY KEY,
  ref TEXT NOT NULL,
  buyer TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery TEXT NOT NULL,
  payment TEXT NOT NULL,
  placed_at TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  history JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'NEW',
  step INTEGER NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'market_orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.market_orders;
  END IF;
END $$;

-- ---------- 3. DEMO SEED USERS ----------
INSERT INTO public.users (email, full_name, role, phone) VALUES
  ('vendorsupplies@zvida.zw', 'Vendor Supplies Ltd', 'supplier', '+263 77 200 0001'),
  ('feedright@zvida.zw', 'FeedRight', 'supplier', '+263 77 200 0002'),
  ('chickcorp@zvida.zw', 'ChickCorp', 'supplier', '+263 77 200 0003'),
  ('harness@zvida.zw', 'Harness Rentals', 'supplier', '+263 77 200 0004'),
  ('millercorp@zvida.zw', 'Miller Corp (Offtaker)', 'offtaker', '+263 77 200 0005'),
  ('zvidabrokerage@zvida.zw', 'ZVIDA Brokerage', 'broker', '+263 77 200 0006'),
  ('jamesfarmer@zvida.zw', 'James (Farmer)', 'farmer', '+263 77 200 0007'),
  ('peterfarmer@zvida.zw', 'Peter (Farmer)', 'farmer', '+263 77 200 0008'),
  ('johndoe@zvida.zw', 'John Doe', 'driver', '+263 77 123 4567'),
  ('sarahmoyo@zvida.zw', 'Sarah Moyo', 'driver', '+263 78 987 6543')
ON CONFLICT (email) DO NOTHING;

-- ---------- 4. ANONYMOUS DEMO RLS ----------
-- These let the unauthenticated dashboard demo read/write its data.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Demo anon read users') THEN
    CREATE POLICY "Demo anon read users" ON public.users FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'listings' AND policyname = 'Demo anon all listings') THEN
    CREATE POLICY "Demo anon all listings" ON public.listings FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contracts' AND policyname = 'Demo anon all contracts') THEN
    CREATE POLICY "Demo anon all contracts" ON public.contracts FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'market_orders' AND policyname = 'Demo anon all market_orders') THEN
    CREATE POLICY "Demo anon all market_orders" ON public.market_orders FOR ALL TO anon USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ---------- 5. FIX RECURSIVE USERS POLICY ----------
-- "Users can read own profile" queried public.users inside its own USING clause,
-- which recursed once RLS applied to that subquery (blowing up EVERY query with
-- 42P17 "infinite recursion detected in policy for relation users"). Replace the
-- inline EXISTS with a SECURITY DEFINER helper so the admin lookup bypasses RLS.
-- The helper lives in the `private` schema (not exposed by PostgREST), so RLS
-- policies can call it without it being reachable as a public RPC endpoint.
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.is_zvida_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin');
$$;

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR private.is_zvida_admin());

-- ---------- 6. TRIGGER FUNCTIONS RUN AS OWNER ----------
-- The audit / notification / delivery triggers insert into audit_log,
-- notifications and deliveries on contracts & listings writes. Anon cannot
-- write those tables, so without this the demo's anon writes would fail with
-- "new row violates row-level security policy". Running them as the owner
-- (SECURITY DEFINER) keeps audit + notify working for the demo.
DO $$
DECLARE fn record;
BEGIN
  FOR fn IN
    SELECT p.oid::regprocedure::text AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'audit_trigger_function', 'notify_contract_status_change',
        'notify_delivery_status_change', 'notify_payment_status_change',
        'notify_new_listing', 'notify_dispute_created', 'notify_quality_scan',
        'auto_create_delivery', 'update_contract_on_delivery', 'expire_old_listings',
        'auto_generate_contract_number', 'calculate_contract_spread',
        'update_listing_on_contract', 'listings_search_vector_update'
      )
  LOOP
    EXECUTE format('ALTER FUNCTION %s SECURITY DEFINER SET search_path = public', fn.sig);
  END LOOP;
END $$;
