-- ============================================================
-- ZVIDAMBANO AUTH: real login + signup for the live Supabase project
-- 1. handle_new_user() trigger -> auto-create public.users profile
-- 2. Seed confirmed auth.users + identities for every existing
--    public.users demo account so demo logins work immediately.
--    Common demo password:  DemoPass123!
--
-- Idempotent: safe to re-run.
-- ============================================================

-- ---------- 1. Profile auto-create trigger ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, phone, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, ''), '@', 1)
    ),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'role', ''), 'farmer'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------- 2. Seed confirmed auth users for demo accounts ----------
DO $$
DECLARE
  r RECORD;
  pwd_hash TEXT := crypt('DemoPass123!', gen_salt('bf'));
BEGIN
  FOR r IN
    SELECT id, email, full_name, role FROM public.users
    WHERE email IS NOT NULL AND email <> ''
  LOOP
    -- auth.users (no unique on email -> guard with NOT EXISTS)
    IF NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.email = r.email) THEN
      INSERT INTO auth.users
        (instance_id, id, aud, role, email, encrypted_password,
         email_confirmed_at, confirmed_at, last_sign_in_at,
         confirmation_token, recovery_token, email_change,
         email_change_token_new, email_change_token_current,
         raw_user_meta_data, raw_app_meta_data, created_at, updated_at)
      VALUES
        ('00000000-0000-0000-0000-000000000000', r.id,
         'authenticated', 'authenticated', r.email, pwd_hash,
         now(), now(), now(),
         '', '', '', '', '',
         jsonb_build_object('full_name', r.full_name, 'role', r.role),
         '{"provider":"email","providers":["email"]}',
         now(), now());
    END IF;

    -- auth.identities (unique (provider, provider_id) -> guard)
    IF NOT EXISTS (
      SELECT 1 FROM auth.identities i
      WHERE i.provider = 'email' AND i.provider_id = r.email
    ) THEN
      INSERT INTO auth.identities
        (id, user_id, provider_id, identity_data, provider,
         last_sign_in_at, created_at, updated_at)
      VALUES
        (r.id, r.id, r.email,
         jsonb_build_object(
           'sub', r.id::text, 'email', r.email,
           'email_verified', true, 'phone_verified', false),
         'email', now(), now(), now());
    END IF;
  END LOOP;
END $$;
