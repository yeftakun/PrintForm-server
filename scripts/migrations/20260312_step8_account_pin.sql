-- Step 8 account PIN support migration (idempotent)
-- Usage example (PowerShell):
-- psql "$env:DATABASE_URL" -f scripts/migrations/20260312_step8_account_pin.sql

BEGIN;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS pin_hash text;

COMMIT;
