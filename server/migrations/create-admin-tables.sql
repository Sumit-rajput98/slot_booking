-- Admin Tables Migration Script
-- Run this in your Supabase SQL Editor

-- 1. Admin Users Table (for admin authentication)
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL, -- In production, use bcrypt hashed passwords
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Admin Sessions Table (for session management)
CREATE TABLE IF NOT EXISTS admin_sessions (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admin_users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default admin user (username: admin, password: admin123)
-- IMPORTANT: Change this password immediately after first login!
INSERT INTO admin_users (username, password, full_name, role)
VALUES ('admin', 'admin123', 'System Administrator', 'ADMIN')
ON CONFLICT (username) DO NOTHING;

-- 3. Slot Configuration Table (for managing daily/weekly/monthly slot availability)
CREATE TABLE IF NOT EXISTS slot_configurations (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'open', -- 'open', 'half_day_pre', 'half_day_post', 'closed'
  max_slots INTEGER NOT NULL DEFAULT 1200,
  reason TEXT,
  created_by INTEGER REFERENCES admin_users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Recurring Slot Rules (for weekly/monthly patterns)
CREATE TABLE IF NOT EXISTS recurring_slot_rules (
  id SERIAL PRIMARY KEY,
  rule_type VARCHAR(50) NOT NULL, -- 'weekly', 'monthly', 'date_range'
  day_of_week INTEGER, -- 0-6 for Sunday-Saturday (for weekly rules)
  day_of_month INTEGER, -- 1-31 (for monthly rules)
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  max_slots INTEGER NOT NULL DEFAULT 1200,
  reason TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INTEGER REFERENCES admin_users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES admin_users(id),
  admin_username VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL, -- 'booking', 'slot_config', 'user', etc.
  entity_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Booking Status Enhancement (add status column to bookings if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'status'
  ) THEN
    ALTER TABLE bookings ADD COLUMN status VARCHAR(50) DEFAULT 'confirmed';
  END IF;
END $$;

-- Add booking status check constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_status_check'
  ) THEN
    ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
    CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show'));
  END IF;
END $$;

-- 5. Add army_number to bookings if not exists (for profile integration)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' AND column_name = 'army_number'
  ) THEN
    ALTER TABLE bookings ADD COLUMN army_number VARCHAR(50);
  END IF;
END $$;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_slot_configurations_date ON slot_configurations(date);
CREATE INDEX IF NOT EXISTS idx_slot_configurations_status ON slot_configurations(status);
CREATE INDEX IF NOT EXISTS idx_recurring_rules_active ON recurring_slot_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);

-- 7. Create function to automatically apply recurring rules
CREATE OR REPLACE FUNCTION apply_recurring_slot_rules()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for updated_at
CREATE TRIGGER update_slot_configurations_updated_at
  BEFORE UPDATE ON slot_configurations
  FOR EACH ROW
  EXECUTE FUNCTION apply_recurring_slot_rules();

CREATE TRIGGER update_recurring_rules_updated_at
  BEFORE UPDATE ON recurring_slot_rules
  FOR EACH ROW
  EXECUTE FUNCTION apply_recurring_slot_rules();

CREATE TRIGGER update_admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION apply_recurring_slot_rules();

-- 9. Add role column to candidates table if not exists (REMOVED - not using Supabase auth)
-- We're using simple admin_users table instead

-- 10. Create view for daily slot availability
CREATE OR REPLACE VIEW daily_slot_availability AS
SELECT 
  d.date,
  COALESCE(sc.status, 'open') as status,
  COALESCE(sc.max_slots, 1200) as max_slots,
  COALESCE(COUNT(b.id), 0) as booked_slots,
  COALESCE(sc.max_slots, 1200) - COALESCE(COUNT(b.id), 0) as available_slots,
  sc.reason
FROM 
  generate_series(
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE + INTERVAL '90 days',
    '1 day'::interval
  ) d(date)
LEFT JOIN slot_configurations sc ON sc.date = d.date
LEFT JOIN bookings b ON b.date = d.date AND b.status != 'cancelled'
GROUP BY d.date, sc.status, sc.max_slots, sc.reason
ORDER BY d.date;

COMMENT ON TABLE admin_users IS 'Stores admin user credentials';
COMMENT ON TABLE admin_sessions IS 'Stores admin session tokens';
COMMENT ON TABLE slot_configurations IS 'Stores daily slot configuration overrides';
COMMENT ON TABLE recurring_slot_rules IS 'Stores recurring patterns for slot availability';
COMMENT ON TABLE audit_logs IS 'Tracks all admin actions for security and compliance';
COMMENT ON VIEW daily_slot_availability IS 'Provides real-time view of slot availability';
