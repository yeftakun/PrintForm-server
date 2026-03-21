-- Step 8i draft: drop legacy jobs.target_client_id (final stage)
-- Usage example (PowerShell):
-- psql "$env:DATABASE_URL" -f scripts/migrations/20260321_step8i_drop_target_client_id.sql
--
-- Preconditions (IMPORTANT):
-- 1) Runtime fallback using jobs.target_client_id is fully removed.
-- 2) All active desktop clients always send explicit clientId for claim/guarded status updates.
-- 3) Handover/account-queue guards no longer depend on jobs.target_client_id.

BEGIN;

-- Drop all foreign-key constraints on jobs.target_client_id (if any).
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
      AND t.relname = 'jobs'
      AND c.contype = 'f'
      AND a.attname = 'target_client_id'
  LOOP
    EXECUTE format(
      'ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS %I',
      constraint_name
    );
  END LOOP;
END $$;

-- Drop non-primary indexes that still reference jobs.target_client_id.
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
      AND t.relname = 'jobs'
      AND a.attname = 'target_client_id'
      AND a.attnum = ANY (x.indkey)
      AND x.indisprimary = false
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS public.%I', index_name);
  END LOOP;
END $$;

ALTER TABLE public.jobs
  DROP COLUMN IF EXISTS target_client_id;

COMMIT;
