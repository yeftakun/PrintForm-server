-- Preserve job rows while allowing physical document files to be removed.

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS file_deleted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS removed_file_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_jobs_file_deleted
  ON public.jobs (file_deleted);
