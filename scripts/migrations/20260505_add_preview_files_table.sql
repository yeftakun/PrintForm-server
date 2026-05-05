-- Add preview_files table to track preview artifacts for cleanup and job linking

CREATE TABLE IF NOT EXISTS public.preview_files (
    id text NOT NULL,
    stored_name text NOT NULL,
    converted_name text,
    original_name character varying(255),
    mime_type character varying(128),
    size_bytes bigint,
    status character varying(16) NOT NULL DEFAULT 'pending',
    conversion_error text,
    session_id text,
    job_id text,
    owner_user_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_seen_at timestamp with time zone,
    expires_at timestamp with time zone,
    deleted boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_preview_files_stored_name ON public.preview_files USING btree (stored_name);
CREATE INDEX IF NOT EXISTS idx_preview_files_expires ON public.preview_files USING btree (expires_at);
CREATE INDEX IF NOT EXISTS idx_preview_files_status ON public.preview_files USING btree (status);
CREATE INDEX IF NOT EXISTS idx_preview_files_session ON public.preview_files USING btree (session_id);
CREATE INDEX IF NOT EXISTS idx_preview_files_created_desc ON public.preview_files USING btree (created_at DESC);

-- Optional foreign keys: add only when they don't already exist (Postgres doesn't support ADD CONSTRAINT IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'preview_files_session_id_fkey'
  ) THEN
    ALTER TABLE public.preview_files
      ADD CONSTRAINT preview_files_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'preview_files_job_id_fkey'
  ) THEN
    ALTER TABLE public.preview_files
      ADD CONSTRAINT preview_files_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'preview_files_owner_user_fkey'
  ) THEN
    ALTER TABLE public.preview_files
      ADD CONSTRAINT preview_files_owner_user_fkey FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE SET NULL;
  END IF;
END$$;
