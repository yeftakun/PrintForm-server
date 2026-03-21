-- Step 8h draft: drop legacy jobs.target_client_name (safe early stage)
-- Usage example (PowerShell):
-- psql "$env:DATABASE_URL" -f scripts/migrations/20260321_step8h_drop_target_client_name.sql
--
-- Preconditions:
-- 1) UI/monitoring no longer depends on target_client_name.
-- 2) Runtime compatibility still allowed through owner_user_id + claimed_by_client_id.

BEGIN;

ALTER TABLE public.jobs
  DROP COLUMN IF EXISTS target_client_name;

COMMIT;
