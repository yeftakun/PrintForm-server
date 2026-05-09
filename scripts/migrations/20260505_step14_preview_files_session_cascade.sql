-- Make preview_files follow session deletion so preview rows do not linger after a session is closed.

DO $$
DECLARE
  fk_action text;
BEGIN
  SELECT c.confdeltype
    INTO fk_action
  FROM pg_constraint c
  WHERE c.conname = 'preview_files_session_id_fkey';

  IF fk_action IS NULL THEN
    ALTER TABLE public.preview_files
      ADD CONSTRAINT preview_files_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;
  ELSIF fk_action <> 'c' THEN
    ALTER TABLE public.preview_files
      DROP CONSTRAINT preview_files_session_id_fkey;
    ALTER TABLE public.preview_files
      ADD CONSTRAINT preview_files_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;
  END IF;
END$$;
