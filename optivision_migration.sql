-- Migration to add 'OptiVision' software type support

-- 1. Drop the existing constraint (if it exists)
-- Note: The constraint name might vary. Default for 'licenses' table column 'software_type' is usually 'licenses_software_type_check'.
-- If this fails, check your actual constraint name in Supabase > Table Editor > licenses > All Constraints
ALTER TABLE licenses DROP CONSTRAINT IF EXISTS licenses_software_type_check;

-- 2. Add the updated constraint including 'OptiVision'
ALTER TABLE licenses ADD CONSTRAINT licenses_software_type_check 
  CHECK (software_type IN ('UrbanBill', 'MediBill', 'KiranaBill', 'StationMaster', 'MandiBill', 'OptiVision'));

-- 3. (Optional) Insert a test license for OptiVision
-- INSERT INTO licenses (license_key, client_name, software_type, plan_type, status, expires_at)
-- VALUES ('TEST-OPTI-VISI-ON01', 'Test Optical Store', 'OptiVision', 'Premium', 'active', NOW() + INTERVAL '365 days');
