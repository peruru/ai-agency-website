-- Create ENUM type if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
        CREATE TYPE report_status AS ENUM ('INITIATED', 'SAMPLE_GENERATED', 'FULL_REP_GENERATED', 'PURCHASED');
    END IF;
END $$;

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS ai_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    domain VARCHAR(255) NOT NULL,
    ip_address INET,
    email VARCHAR(255),
    phone_number VARCHAR(20),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sample_rep_path TEXT,
    full_rep_path TEXT,
    status report_status DEFAULT 'INITIATED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_ai_reports_domain ON ai_reports(domain);
CREATE INDEX IF NOT EXISTS idx_ai_reports_status ON ai_reports(status);

-- Create or replace the timestamp trigger function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS set_updated_at ON ai_reports;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON ai_reports
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();