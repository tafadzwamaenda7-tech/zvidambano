-- ============================================================
-- ZVIDAMBANO — Database Triggers
-- Run this in Supabase SQL Editor AFTER supabase-schema.sql
-- ============================================================

-- ============================================================
-- 1. AUTO-CREATE DELIVERY WHEN CONTRACT STATUS → LOADING
-- ============================================================
CREATE OR REPLACE FUNCTION auto_create_delivery()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'LOADING' AND (OLD.status IS NULL OR OLD.status != 'LOADING') THEN
    -- Check if delivery already exists
    IF NOT EXISTS (SELECT 1 FROM deliveries WHERE contract_id = NEW.id) THEN
      INSERT INTO deliveries (contract_id, status)
      VALUES (NEW.id, 'PENDING');
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_create_delivery ON public.contracts;
CREATE TRIGGER trigger_auto_create_delivery
  AFTER UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_delivery();

-- ============================================================
-- 2. AUTO-NOTIFY ON CONTRACT STATUS CHANGE
-- ============================================================
CREATE OR REPLACE FUNCTION notify_contract_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    -- Notify farmer
    IF NEW.farmer_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, body, type, action_url)
      VALUES (
        NEW.farmer_id,
        'Contract Status Updated',
        'Contract ' || NEW.contract_number || ' is now ' || NEW.status,
        'contract',
        '/farmer-dashboard.html?tab=contracts&id=' || NEW.id
      );
    END IF;

    -- Notify offtaker
    IF NEW.offtaker_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, body, type, action_url)
      VALUES (
        NEW.offtaker_id,
        'Contract Status Updated',
        'Contract ' || NEW.contract_number || ' is now ' || NEW.status,
        'contract',
        '/offtaker-dashboard.html?tab=contracts&id=' || NEW.id
      );
    END IF;

    -- Notify broker
    IF NEW.broker_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, body, type, action_url)
      VALUES (
        NEW.broker_id,
        'Contract Status Updated',
        'Contract ' || NEW.contract_number || ' is now ' || NEW.status,
        'contract',
        '/zvida-dashboard.html?tab=contracts&id=' || NEW.id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_contract_status ON public.contracts;
CREATE TRIGGER trigger_notify_contract_status
  AFTER UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION notify_contract_status_change();

-- ============================================================
-- 3. AUTO-NOTIFY ON DELIVERY STATUS CHANGE
-- ============================================================
CREATE OR REPLACE FUNCTION notify_delivery_status_change()
RETURNS TRIGGER AS $$
DECLARE
  contract_record RECORD;
BEGIN
  IF NEW.status != OLD.status THEN
    -- Get contract details
    SELECT contract_number, farmer_id, offtaker_id, broker_id
    INTO contract_record
    FROM contracts WHERE id = NEW.contract_id;

    -- Notify driver
    IF NEW.driver_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, body, type)
      VALUES (
        NEW.driver_id,
        'Delivery Status Updated',
        'Delivery for contract ' || contract_record.contract_number || ' is now ' || NEW.status,
        'delivery'
      );
    END IF;

    -- Notify farmer
    IF contract_record.farmer_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, body, type)
      VALUES (
        contract_record.farmer_id,
        'Delivery Update',
        'Delivery for contract ' || contract_record.contract_number || ' is now ' || NEW.status,
        'delivery'
      );
    END IF;

    -- Notify offtaker
    IF contract_record.offtaker_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, body, type)
      VALUES (
        contract_record.offtaker_id,
        'Delivery Update',
        'Delivery for contract ' || contract_record.contract_number || ' is now ' || NEW.status,
        'delivery'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_delivery_status ON public.deliveries;
CREATE TRIGGER trigger_notify_delivery_status
  AFTER UPDATE ON public.deliveries
  FOR EACH ROW
  EXECUTE FUNCTION notify_delivery_status_change();

-- ============================================================
-- 4. AUTO-UPDATE CONTRACT STATUS WHEN DELIVERY IS DELIVERED
-- ============================================================
CREATE OR REPLACE FUNCTION update_contract_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'DELIVERED' AND (OLD.status IS NULL OR OLD.status != 'DELIVERED') THEN
    UPDATE contracts
    SET status = 'PENDING_SETTLEMENT'
    WHERE id = NEW.contract_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_contract_on_delivery ON public.deliveries;
CREATE TRIGGER trigger_update_contract_on_delivery
  AFTER UPDATE ON public.deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_contract_on_delivery();

-- ============================================================
-- 5. AUTO-NOTIFY ON PAYMENT STATUS CHANGE
-- ============================================================
CREATE OR REPLACE FUNCTION notify_payment_status_change()
RETURNS TRIGGER AS $$
DECLARE
  contract_record RECORD;
BEGIN
  IF NEW.status != OLD.status THEN
    SELECT contract_number INTO contract_record FROM contracts WHERE id = NEW.contract_id;

    -- Notify payer
    IF NEW.payer_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, body, type)
      VALUES (
        NEW.payer_id,
        'Payment ' || NEW.status,
        'Payment of $' || NEW.amount || ' for contract ' || contract_record.contract_number || ' is ' || NEW.status,
        'payment'
      );
    END IF;

    -- Notify payee
    IF NEW.payee_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, title, body, type)
      VALUES (
        NEW.payee_id,
        'Payment ' || NEW.status,
        'Payment of $' || NEW.amount || ' for contract ' || contract_record.contract_number || ' is ' || NEW.status,
        'payment'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_payment_status ON public.payments;
CREATE TRIGGER trigger_notify_payment_status
  AFTER UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION notify_payment_status_change();

-- ============================================================
-- 6. AUTO-EXPIRE OLD LISTINGS (via pg_cron)
-- ============================================================
CREATE OR REPLACE FUNCTION expire_old_listings()
RETURNS VOID AS $$
BEGIN
  UPDATE listings
  SET status = 'expired'
  WHERE status = 'active'
    AND created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule daily at 2 AM
SELECT cron.schedule(
  'expire-old-listings',
  '0 2 * * *',
  'SELECT expire_old_listings()'
);

-- ============================================================
-- 7. AUTO-GENERATE CONTRACT NUMBER (improved)
-- ============================================================
CREATE OR REPLACE FUNCTION auto_generate_contract_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.contract_number IS NULL OR NEW.contract_number = '' THEN
    NEW.contract_number := 'ZV-' || to_char(now(), 'YYMM') || '-' || lpad(
      (SELECT COUNT(*) + 1 FROM contracts WHERE created_at >= date_trunc('month', now()))::TEXT,
      4, '0'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_contract_number ON public.contracts;
CREATE TRIGGER trigger_auto_contract_number
  BEFORE INSERT ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_contract_number();

-- ============================================================
-- 8. AUTO-CALCULATE SPREAD ON CONTRACT
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_contract_spread()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.farmer_price IS NOT NULL AND NEW.offtaker_price IS NOT NULL THEN
    NEW.broker_commission := COALESCE(NEW.broker_commission, NEW.offtaker_price - NEW.farmer_price);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_spread ON public.contracts;
CREATE TRIGGER trigger_calculate_spread
  BEFORE INSERT OR UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION calculate_contract_spread();

-- ============================================================
-- 9. AUTO-NOTIFY ON NEW LISTING
-- ============================================================
CREATE OR REPLACE FUNCTION notify_new_listing()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify all offtakers about new listing
  INSERT INTO notifications (user_id, title, body, type)
  SELECT
    u.id,
    'New Listing: ' || NEW.title,
    NEW.quantity || ' ' || NEW.unit || ' at $' || NEW.asking_price || '/' || NEW.unit,
    'listing'
  FROM users u
  WHERE u.role = 'offtaker'
  LIMIT 20;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_new_listing ON public.listings;
CREATE TRIGGER trigger_notify_new_listing
  AFTER INSERT ON public.listings
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION notify_new_listing();

-- ============================================================
-- 10. AUTO-NOTIFY ON DISPUTE
-- ============================================================
CREATE OR REPLACE FUNCTION notify_dispute_created()
RETURNS TRIGGER AS $$
DECLARE
  contract_record RECORD;
BEGIN
  SELECT farmer_id, offtaker_id, broker_id, contract_number
  INTO contract_record
  FROM contracts WHERE id = NEW.contract_id;

  -- Notify admin
  INSERT INTO notifications (user_id, title, body, type)
  SELECT id, 'New Dispute: ' || NEW.reason, 'Dispute on contract ' || contract_record.contract_number, 'dispute'
  FROM users WHERE role = 'admin';

  -- Notify other parties
  IF contract_record.farmer_id IS NOT NULL AND contract_record.farmer_id != NEW.raised_by THEN
    INSERT INTO notifications (user_id, title, body, type)
    VALUES (contract_record.farmer_id, 'Dispute Raised', NEW.reason, 'dispute');
  END IF;

  IF contract_record.offtaker_id IS NOT NULL AND contract_record.offtaker_id != NEW.raised_by THEN
    INSERT INTO notifications (user_id, title, body, type)
    VALUES (contract_record.offtaker_id, 'Dispute Raised', NEW.reason, 'dispute');
  END IF;

  IF contract_record.broker_id IS NOT NULL AND contract_record.broker_id != NEW.raised_by THEN
    INSERT INTO notifications (user_id, title, body, type)
    VALUES (contract_record.broker_id, 'Dispute Raised', NEW.reason, 'dispute');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_dispute ON public.disputes;
CREATE TRIGGER trigger_notify_dispute
  AFTER INSERT ON public.disputes
  FOR EACH ROW
  EXECUTE FUNCTION notify_dispute_created();

-- ============================================================
-- 11. AUTO-NOTIFY ON QUALITY SCAN
-- ============================================================
CREATE OR REPLACE FUNCTION notify_quality_scan()
RETURNS TRIGGER AS $$
DECLARE
  contract_record RECORD;
BEGIN
  SELECT contract_number, farmer_id, offtaker_id, broker_id
  INTO contract_record
  FROM contracts WHERE id = NEW.contract_id;

  -- Notify all parties
  IF contract_record.farmer_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, body, type)
    VALUES (contract_record.farmer_id, 'Quality Scan Result',
      'Grade: ' || COALESCE(NEW.grade, 'N/A') || ' - Result: ' || COALESCE(NEW.result, 'pending'),
      'quality');
  END IF;

  IF contract_record.offtaker_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, body, type)
    VALUES (contract_record.offtaker_id, 'Quality Scan Result',
      'Grade: ' || COALESCE(NEW.grade, 'N/A') || ' - Result: ' || COALESCE(NEW.result, 'pending'),
      'quality');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_quality_scan ON public.quality_scans;
CREATE TRIGGER trigger_notify_quality_scan
  AFTER INSERT ON public.quality_scans
  FOR EACH ROW
  EXECUTE FUNCTION notify_quality_scan();

-- ============================================================
-- 12. AUTO-UPDATE LISTING STATUS WHEN CONTRACT CREATED
-- ============================================================
CREATE OR REPLACE FUNCTION update_listing_on_contract()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.listing_id IS NOT NULL THEN
    UPDATE listings
    SET status = 'sold'
    WHERE id = NEW.listing_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_listing_on_contract ON public.contracts;
CREATE TRIGGER trigger_update_listing_on_contract
  AFTER INSERT ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_listing_on_contract();

-- ============================================================
-- 13. AUDIT TRAIL (for important tables)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read audit log" ON public.audit_log
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'admin'
  ));

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_values)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, new_values)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add audit triggers to important tables
DROP TRIGGER IF EXISTS audit_contracts_trigger ON public.contracts;
CREATE TRIGGER audit_contracts_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_listings_trigger ON public.listings;
CREATE TRIGGER audit_listings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_deliveries_trigger ON public.deliveries;
CREATE TRIGGER audit_deliveries_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_payments_trigger ON public.payments;
CREATE TRIGGER audit_payments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================================================
-- 14. FULL-TEXT SEARCH on listings
-- ============================================================
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE INDEX IF NOT EXISTS idx_listings_search ON public.listings USING GIN(search_vector);

CREATE OR REPLACE FUNCTION listings_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.category, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.origin, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS listings_search_vector_trigger ON public.listings;
CREATE TRIGGER listings_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION listings_search_vector_update();

-- ============================================================
-- 15. DASHBOARD STATS MATERIALIZED VIEW
-- ============================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM listings WHERE status = 'active') AS active_listings,
  (SELECT COUNT(*) FROM contracts WHERE status = 'PENDING') AS pending_contracts,
  (SELECT COUNT(*) FROM contracts WHERE status = 'IN_TRANSIT') AS in_transit_contracts,
  (SELECT COUNT(*) FROM deliveries WHERE status = 'IN_TRANSIT') AS active_deliveries,
  (SELECT COUNT(*) FROM payments WHERE status = 'PENDING') AS pending_payments,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'COMPLETED') AS total_revenue,
  (SELECT COUNT(*) FROM users) AS total_users,
  (SELECT COUNT(*) FROM users WHERE role = 'farmer') AS total_farmers,
  (SELECT COUNT(*) FROM users WHERE role = 'offtaker') AS total_offtakers,
  (SELECT COUNT(*) FROM users WHERE role = 'driver') AS total_drivers,
  (SELECT COUNT(*) FROM disputes WHERE status = 'OPEN') AS open_disputes;

-- Refresh every 5 minutes
SELECT cron.schedule(
  'refresh-dashboard-stats',
  '*/5 * * * *',
  'REFRESH MATERIALIZED VIEW mv_dashboard_stats'
);

-- ============================================================
-- DONE! All triggers are now active.
-- ============================================================