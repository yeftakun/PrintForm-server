-- Step 8d job claim/lock migration (idempotent)
-- Usage example (PowerShell):
-- psql "$env:DATABASE_URL" -f scripts/migrations/20260314_step8d_job_claim_lock.sql

BEGIN;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS claimed_by_client_id text;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS claimed_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'jobs_claimed_by_client_id_fkey'
  ) THEN
    ALTER TABLE public.jobs
      ADD CONSTRAINT jobs_claimed_by_client_id_fkey
      FOREIGN KEY (claimed_by_client_id) REFERENCES public.clients(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_jobs_claimed_by_client_id
  ON public.jobs (claimed_by_client_id);

CREATE INDEX IF NOT EXISTS idx_jobs_owner_status_created
  ON public.jobs (owner_user_id, status, created_at DESC);

COMMIT;
