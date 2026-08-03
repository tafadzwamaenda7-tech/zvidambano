-- ============================================================
-- RLS hygiene — 2026-08-02
--
-- Fixes two Supabase linter findings:
--   * 0003 auth_rls_initplan : auth.*() in RLS policies is re-evaluated
--     per row; wrap each call in a (select ...) subplan.
--   * 0006 multiple_permissive_policies : more than one permissive policy
--     per (table, role, action); consolidate into a single policy.
--
-- Mirrors the authoritative policy set in supabase-schema.sql.
-- ============================================================

-- ---- A. Consolidate multiple permissive policies ----

-- A1. broker_commission_ledger
DROP POLICY IF EXISTS "Admins can manage commissions" ON public.broker_commission_ledger;
DROP POLICY IF EXISTS "Admins can insert commissions" ON public.broker_commission_ledger;
DROP POLICY IF EXISTS "Admins can update commissions" ON public.broker_commission_ledger;
DROP POLICY IF EXISTS "Admins can delete commissions" ON public.broker_commission_ledger;
CREATE POLICY "Admins can insert commissions" ON public.broker_commission_ledger
  FOR INSERT TO public
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')));
CREATE POLICY "Admins can update commissions" ON public.broker_commission_ledger
  FOR UPDATE TO public
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')));
CREATE POLICY "Admins can delete commissions" ON public.broker_commission_ledger
  FOR DELETE TO public
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')));

DROP POLICY IF EXISTS "Parties can read commissions" ON public.broker_commission_ledger;
CREATE POLICY "Parties can read commissions" ON public.broker_commission_ledger
  FOR SELECT TO public
  USING (broker_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')));

-- A2. commodities
DROP POLICY IF EXISTS "Admins can manage commodities" ON public.commodities;
DROP POLICY IF EXISTS "Admins can insert commodities" ON public.commodities;
DROP POLICY IF EXISTS "Admins can update commodities" ON public.commodities;
DROP POLICY IF EXISTS "Admins can delete commodities" ON public.commodities;
CREATE POLICY "Admins can insert commodities" ON public.commodities
  FOR INSERT TO public
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role = 'admin'));
CREATE POLICY "Admins can update commodities" ON public.commodities
  FOR UPDATE TO public
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role = 'admin'));
CREATE POLICY "Admins can delete commodities" ON public.commodities
  FOR DELETE TO public
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role = 'admin'));

-- A3. contracts
DROP POLICY IF EXISTS "Suppliers can read own haulage contracts" ON public.contracts;
DROP POLICY IF EXISTS "Drivers can read assigned contracts" ON public.contracts;
DROP POLICY IF EXISTS "Parties can read contracts" ON public.contracts;
CREATE POLICY "Parties can read contracts" ON public.contracts
  FOR SELECT TO public
  USING (
    farmer_id = (select auth.uid())
    OR offtaker_id = (select auth.uid())
    OR broker_id = (select auth.uid())
    OR private.is_assigned_driver(id)
    OR COALESCE((meta ->> 'supplier'), '') = (SELECT u2.full_name FROM users u2 WHERE u2.id = (select auth.uid()))
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role = 'admin')
  );

DROP POLICY IF EXISTS "Brokers can update contracts" ON public.contracts;
DROP POLICY IF EXISTS "Parties can update contracts" ON public.contracts;
CREATE POLICY "Parties can update contracts" ON public.contracts
  FOR UPDATE TO public
  USING (farmer_id = (select auth.uid()) OR offtaker_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')))
  WITH CHECK (farmer_id = (select auth.uid()) OR offtaker_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')));

-- A4. documents
DROP POLICY IF EXISTS "Admins can manage documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can update documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON public.documents;
CREATE POLICY "Admins can insert documents" ON public.documents
  FOR INSERT TO public
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')));
CREATE POLICY "Admins can update documents" ON public.documents
  FOR UPDATE TO public
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')));
CREATE POLICY "Admins can delete documents" ON public.documents
  FOR DELETE TO public
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')));

DROP POLICY IF EXISTS "Parties can read documents" ON public.documents;
CREATE POLICY "Parties can read documents" ON public.documents
  FOR SELECT TO public
  USING (
    EXISTS (SELECT 1 FROM contracts c
      WHERE c.id = documents.contract_id
        AND (c.farmer_id = (select auth.uid()) OR c.offtaker_id = (select auth.uid()) OR c.broker_id = (select auth.uid())))
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker'))
  );

-- A5. farmer_settlements
DROP POLICY IF EXISTS "Admins can manage farmer settlements" ON public.farmer_settlements;
DROP POLICY IF EXISTS "Admins can insert farmer settlements" ON public.farmer_settlements;
DROP POLICY IF EXISTS "Admins can update farmer settlements" ON public.farmer_settlements;
DROP POLICY IF EXISTS "Admins can delete farmer settlements" ON public.farmer_settlements;
CREATE POLICY "Admins can insert farmer settlements" ON public.farmer_settlements
  FOR INSERT TO public
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')));
CREATE POLICY "Admins can update farmer settlements" ON public.farmer_settlements
  FOR UPDATE TO public
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')));
CREATE POLICY "Admins can delete farmer settlements" ON public.farmer_settlements
  FOR DELETE TO public
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')));

DROP POLICY IF EXISTS "Parties can read farmer settlements" ON public.farmer_settlements;
CREATE POLICY "Parties can read farmer settlements" ON public.farmer_settlements
  FOR SELECT TO public
  USING (farmer_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')));

-- A6. offtaker_invoices
DROP POLICY IF EXISTS "Admins can manage offtaker invoices" ON public.offtaker_invoices;
DROP POLICY IF EXISTS "Admins can insert offtaker invoices" ON public.offtaker_invoices;
DROP POLICY IF EXISTS "Admins can update offtaker invoices" ON public.offtaker_invoices;
DROP POLICY IF EXISTS "Admins can delete offtaker invoices" ON public.offtaker_invoices;
CREATE POLICY "Admins can insert offtaker invoices" ON public.offtaker_invoices
  FOR INSERT TO public
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')));
CREATE POLICY "Admins can update offtaker invoices" ON public.offtaker_invoices
  FOR UPDATE TO public
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')));
CREATE POLICY "Admins can delete offtaker invoices" ON public.offtaker_invoices
  FOR DELETE TO public
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')));

DROP POLICY IF EXISTS "Parties can read offtaker invoices" ON public.offtaker_invoices;
CREATE POLICY "Parties can read offtaker invoices" ON public.offtaker_invoices
  FOR SELECT TO public
  USING (offtaker_id = (select auth.uid())
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker')));

-- A7. price_board
DROP POLICY IF EXISTS "Admins can manage prices" ON public.price_board;
DROP POLICY IF EXISTS "Admins can insert prices" ON public.price_board;
DROP POLICY IF EXISTS "Admins can update prices" ON public.price_board;
DROP POLICY IF EXISTS "Admins can delete prices" ON public.price_board;
CREATE POLICY "Admins can insert prices" ON public.price_board
  FOR INSERT TO public
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role = 'admin'));
CREATE POLICY "Admins can update prices" ON public.price_board
  FOR UPDATE TO public
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role = 'admin'));
CREATE POLICY "Admins can delete prices" ON public.price_board
  FOR DELETE TO public
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role = 'admin'));

-- A8. quality_scans
DROP POLICY IF EXISTS "Admins can manage quality scans" ON public.quality_scans;
DROP POLICY IF EXISTS "Admins can insert quality scans" ON public.quality_scans;
DROP POLICY IF EXISTS "Admins can update quality scans" ON public.quality_scans;
DROP POLICY IF EXISTS "Admins can delete quality scans" ON public.quality_scans;
CREATE POLICY "Admins can insert quality scans" ON public.quality_scans
  FOR INSERT TO public
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker', 'compliance')));
CREATE POLICY "Admins can update quality scans" ON public.quality_scans
  FOR UPDATE TO public
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker', 'compliance')))
  WITH CHECK (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker', 'compliance')));
CREATE POLICY "Admins can delete quality scans" ON public.quality_scans
  FOR DELETE TO public
  USING (EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker', 'compliance')));

DROP POLICY IF EXISTS "Parties can read quality scans" ON public.quality_scans;
CREATE POLICY "Parties can read quality scans" ON public.quality_scans
  FOR SELECT TO public
  USING (
    EXISTS (SELECT 1 FROM contracts c
      WHERE c.id = quality_scans.contract_id
        AND (c.farmer_id = (select auth.uid()) OR c.offtaker_id = (select auth.uid()) OR c.broker_id = (select auth.uid())))
    OR EXISTS (SELECT 1 FROM users u WHERE u.id = (select auth.uid()) AND u.role IN ('admin', 'broker', 'compliance'))
  );

-- ---- B. auth.* initplan — wrap remaining bare auth.*() calls ----
DO $$
DECLARE
  r record;
  new_qual text;
  new_wc text;
  cmd_txt text;
  roles_txt text;
  ddl text;
BEGIN
  FOR r IN
    SELECT p.policyname, p.tablename, p.cmd, p.roles::text[] AS roles,
           p.qual, p.with_check, p.permissive
    FROM pg_policies p
    WHERE p.schemaname = 'public'
  LOOP
    new_qual := r.qual;
    IF new_qual IS NOT NULL AND new_qual !~ '\(select auth\.' AND new_qual ~ 'auth\.(uid|email|role|jwt)\(\)' THEN
      new_qual := regexp_replace(new_qual, 'auth\.uid\(\)', '(select auth.uid())', 'g');
      new_qual := regexp_replace(new_qual, 'auth\.email\(\)', '(select auth.email())', 'g');
      new_qual := regexp_replace(new_qual, 'auth\.role\(\)', '(select auth.role())', 'g');
      new_qual := regexp_replace(new_qual, 'auth\.jwt\(\)', '(select auth.jwt())', 'g');
    END IF;
    new_wc := r.with_check;
    IF new_wc IS NOT NULL AND new_wc !~ '\(select auth\.' AND new_wc ~ 'auth\.(uid|email|role|jwt)\(\)' THEN
      new_wc := regexp_replace(new_wc, 'auth\.uid\(\)', '(select auth.uid())', 'g');
      new_wc := regexp_replace(new_wc, 'auth\.email\(\)', '(select auth.email())', 'g');
      new_wc := regexp_replace(new_wc, 'auth\.role\(\)', '(select auth.role())', 'g');
      new_wc := regexp_replace(new_wc, 'auth\.jwt\(\)', '(select auth.jwt())', 'g');
    END IF;

    IF new_qual IS DISTINCT FROM r.qual OR new_wc IS DISTINCT FROM r.with_check THEN
      cmd_txt := CASE r.cmd
        WHEN 'SELECT' THEN 'SELECT' WHEN 'INSERT' THEN 'INSERT'
        WHEN 'UPDATE' THEN 'UPDATE' WHEN 'DELETE' THEN 'DELETE'
        ELSE 'ALL' END;
      roles_txt := array_to_string(r.roles, ',');
      ddl := 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename) || '; ';
      ddl := ddl || 'CREATE POLICY ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename);
      ddl := ddl || CASE WHEN r.permissive THEN ' AS PERMISSIVE' ELSE ' AS RESTRICTIVE' END;
      ddl := ddl || ' FOR ' || cmd_txt || ' TO ' || roles_txt;
      IF new_qual IS NOT NULL THEN ddl := ddl || ' USING (' || new_qual || ')'; END IF;
      IF new_wc IS NOT NULL THEN ddl := ddl || ' WITH CHECK (' || new_wc || ')'; END IF;
      EXECUTE ddl;
    END IF;
  END LOOP;
END $$;
