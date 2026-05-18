-- Remove soft-delete columns from preview_files.
-- Cleanup now uses hard DELETE so deleted/deleted_at are no longer needed.
-- Any rows previously marked deleted = true are also purged here.

DELETE FROM public.preview_files WHERE deleted = true;

ALTER TABLE public.preview_files
  DROP COLUMN IF EXISTS deleted,
  DROP COLUMN IF EXISTS deleted_at;

-- Drop the index on deleted that may have been created implicitly or explicitly.
DROP INDEX IF EXISTS public.idx_preview_files_deleted;
