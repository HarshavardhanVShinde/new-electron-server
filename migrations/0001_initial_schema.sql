CREATE TABLE IF NOT EXISTS licenses (
  id TEXT PRIMARY KEY NOT NULL,
  license_key TEXT UNIQUE NOT NULL,
  machine_id TEXT,
  client_name TEXT NOT NULL,
  software_type TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  activated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses (license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses (status);
