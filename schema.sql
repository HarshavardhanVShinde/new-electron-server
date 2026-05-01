-- Re-create the licenses table with new fields
-- Drop the old table if it exists (Be careful in production!)
DROP TABLE IF EXISTS licenses;

CREATE TABLE licenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key TEXT UNIQUE NOT NULL,
  machine_id TEXT DEFAULT NULL,
  client_name TEXT NOT NULL,
  software_type TEXT CHECK (software_type IN ('UrbanBill', 'MediBill', 'KiranaBill', 'StationMaster', 'MandiBill', 'OptiVision', 'Mangal Seva')) NOT NULL DEFAULT 'UrbanBill',
  plan_type TEXT CHECK (plan_type IN ('Standard', 'Premium')) NOT NULL,
  status TEXT CHECK (status IN ('active', 'banned', 'expired')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Index for faster lookups
CREATE INDEX idx_license_key ON licenses(license_key);
