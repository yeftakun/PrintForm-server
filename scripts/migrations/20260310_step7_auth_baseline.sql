-- Step 7 auth baseline migration (idempotent)
-- Usage example (PowerShell):
-- psql "$env:DATABASE_URL" -f scripts/migrations/20260310_step7_auth_baseline.sql

BEGIN;

-- users: add username for local auth login
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS username character varying(64);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique
  ON public.users (lower(username))
  WHERE username IS NOT NULL;

-- clients: bind client identity to account owner
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS owner_user_id text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'clients_owner_user_id_fkey'
  ) THEN
    ALTER TABLE public.clients
      ADD CONSTRAINT clients_owner_user_id_fkey
      FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_clients_owner_user
  ON public.clients (owner_user_id);

-- audit logs: keep actor/target ids compatible with text id strategy in app
ALTER TABLE public.audit_logs
  ALTER COLUMN actor_id TYPE text USING actor_id::text;

ALTER TABLE public.audit_logs
  ALTER COLUMN target_id TYPE text USING target_id::text;

-- refresh token persistence for rotating session tokens
CREATE TABLE IF NOT EXISTS public.refresh_tokens (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  user_agent text,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  replaced_by_token_id text
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'refresh_tokens_replaced_by_token_id_fkey'
  ) THEN
    ALTER TABLE public.refresh_tokens
      ADD CONSTRAINT refresh_tokens_replaced_by_token_id_fkey
      FOREIGN KEY (replaced_by_token_id) REFERENCES public.refresh_tokens(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user
  ON public.refresh_tokens (user_id);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires
  ON public.refresh_tokens (expires_at);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked
  ON public.refresh_tokens (revoked_at);

COMMIT;
