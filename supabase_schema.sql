
-- 1. VARIANTS TABLE (Update or Create)
-- Only run CREATE if it doesn't exist, otherwise you might need to ALTER table to add columns.
-- Assuming we can just create if not exists, but user might need to add columns manually if table exists.
-- Here is the full desired schema:

CREATE TABLE IF NOT EXISTS variants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  landing_id text, -- e.g. 'LP_LOBBY'
  variant_name text,
  headline text, 
  subheadline text,
  cta_text text,
  template_type text DEFAULT 'A/B',
  ai_score numeric DEFAULT 0,
  status text DEFAULT 'TEST', -- SCALE, TEST, PAUSE
  weight numeric DEFAULT 0, -- This acts as 'current_weight'
  suggested_weight numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now()
);

-- 2. TRAFFIC LOGS
CREATE TABLE IF NOT EXISTS traffic_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id uuid REFERENCES variants(id),
  visits int DEFAULT 0,
  clicks int DEFAULT 0,
  phone_leads int DEFAULT 0,
  log_date date DEFAULT now()
);

-- 3. SAFE ROLLBACK ALERTS
CREATE TABLE IF NOT EXISTS rollback_alerts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id uuid REFERENCES variants(id),
  ctr_drop numeric,
  lead_drop numeric,
  timestamp timestamptz DEFAULT now(),
  resolved boolean DEFAULT false,
  message text
);
