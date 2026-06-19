CREATE TABLE IF NOT EXISTS installers (
  id varchar(64) PRIMARY KEY,
  version varchar(64) NOT NULL UNIQUE,
  download_url text NOT NULL,
  label varchar(160),
  file_size_label varchar(32),
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_installers_primary_unique
  ON installers (is_primary)
  WHERE is_primary;

CREATE INDEX IF NOT EXISTS idx_installers_active
  ON installers (is_active);

INSERT INTO installers (
  id,
  version,
  download_url,
  label,
  file_size_label,
  notes,
  is_active,
  is_primary
) VALUES (
  'installer_1_3_1',
  '1.3.1',
  'https://github.com/yeftakun/PrintForm/releases/download/1.3.1/PrintOrder-Setup-1.3.1.exe',
  'PrintOrder Installer v1.3.1',
  '56MB',
  'Windows installer',
  true,
  true
)
ON CONFLICT (id) DO NOTHING;
