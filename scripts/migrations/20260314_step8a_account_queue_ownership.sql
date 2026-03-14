-- Step 8a account-centric queue ownership migration (idempotent)
-- Usage example (PowerShell):
-- psql "$env:DATABASE_URL" -f scripts/migrations/20260314_step8a_account_queue_ownership.sql

BEGIN;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS owner_user_id text;

ALTER TABLE public.jobs
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'jobs_owner_user_id_fkey'
  ) THEN
    ALTER TABLE public.jobs
      ADD CONSTRAINT jobs_owner_user_id_fkey
      FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sessions_owner_user
  ON public.sessions (owner_user_id);

CREATE INDEX IF NOT EXISTS idx_jobs_owner_user
  ON public.jobs (owner_user_id);

-- Backfill ownership for existing sessions from client ownership.
UPDATE public.sessions AS s
SET owner_user_id = c.owner_user_id
FROM public.clients AS c
WHERE s.client_id = c.id
  AND s.owner_user_id IS NULL
  AND c.owner_user_id IS NOT NULL;

-- Prefer session ownership when backfilling jobs.
UPDATE public.jobs AS j
SET owner_user_id = s.owner_user_id
FROM public.sessions AS s
WHERE j.session_id = s.id
  AND j.owner_user_id IS NULL
  AND s.owner_user_id IS NOT NULL;

-- Fallback for jobs without a session owner (legacy rows).
UPDATE public.jobs AS j
SET owner_user_id = c.owner_user_id
FROM public.clients AS c
WHERE j.target_client_id = c.id
  AND j.owner_user_id IS NULL
  AND c.owner_user_id IS NOT NULL;

COMMIT;
