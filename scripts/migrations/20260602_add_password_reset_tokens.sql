-- Password reset token persistence (idempotent)
-- Usage example (PowerShell):
-- psql "$env:DATABASE_URL" -f scripts/migrations/20260602_add_password_reset_tokens.sql

BEGIN;

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user
  ON public.password_reset_tokens (user_id);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires
  ON public.password_reset_tokens (expires_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_used
  ON public.password_reset_tokens (used_at);

COMMIT;
