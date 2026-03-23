-- Step 8j draft: make sessions fully account-centric (drop legacy sessions.client_id)
-- Usage example (PowerShell):
-- psql "$env:DATABASE_URL" -f scripts/migrations/20260323_step8j_drop_sessions_client_id.sql
--
-- Preconditions:
-- 1) Runtime no longer depends on sessions.client_id for auth/queue flow.
-- 2) Session ownership is represented by sessions.owner_user_id.

BEGIN;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS owner_user_id text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sessions_owner_user_id_fkey'
  ) THEN
    ALTER TABLE public.sessions
      ADD CONSTRAINT sessions_owner_user_id_fkey
      FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sessions_owner_user
  ON public.sessions (owner_user_id);

-- Backfill owner for legacy rows while client_id still exists.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sessions'
      AND column_name = 'client_id'
  ) THEN
    UPDATE public.sessions AS s
    SET owner_user_id = c.owner_user_id
    FROM public.clients AS c
    WHERE s.client_id = c.id
      AND s.owner_user_id IS NULL
      AND c.owner_user_id IS NOT NULL;
  END IF;
END $$;

-- Drop foreign-key constraints on sessions.client_id (if any).
DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY (c.conkey)
    WHERE n.nspname = 'public'
      AND t.relname = 'sessions'
      AND c.contype = 'f'
      AND a.attname = 'client_id'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.sessions DROP CONSTRAINT IF EXISTS %I',
      constraint_name
    );
  END LOOP;
END $$;

-- Drop non-primary indexes that still reference sessions.client_id.
DO $$
DECLARE
  index_name text;
BEGIN
  FOR index_name IN
    SELECT DISTINCT i.relname
    FROM pg_index x
    JOIN pg_class t ON t.oid = x.indrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_class i ON i.oid = x.indexrelid
    JOIN pg_attribute a ON a.attrelid = t.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'sessions'
      AND a.attname = 'client_id'
      AND a.attnum = ANY (x.indkey)
      AND x.indisprimary = false
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS public.%I', index_name);
  END LOOP;
END $$;

ALTER TABLE public.sessions
  DROP COLUMN IF EXISTS client_id;

COMMIT;
