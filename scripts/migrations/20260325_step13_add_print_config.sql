-- Add print configuration columns and notes to jobs table

ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS color_mode VARCHAR(20),
ADD COLUMN IF NOT EXISTS orientation VARCHAR(20),
ADD COLUMN IF NOT EXISTS page_range VARCHAR(50),
ADD COLUMN IF NOT EXISTS content_scale INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS notes TEXT;
