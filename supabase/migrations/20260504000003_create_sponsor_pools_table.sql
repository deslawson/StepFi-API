CREATE TABLE IF NOT EXISTS sponsor_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL UNIQUE,
    org_name TEXT NOT NULL,
    sponsor_type TEXT NOT NULL CHECK (sponsor_type IN ('company', 'individual', 'dao')),
    website TEXT,
    description TEXT,
    total_deposited NUMERIC(20, 7) NOT NULL DEFAULT 0,
    available NUMERIC(20, 7) NOT NULL DEFAULT 0,
    locked NUMERIC(20, 7) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsor_pools_wallet ON sponsor_pools(wallet_address);
CREATE INDEX IF NOT EXISTS idx_sponsor_pools_type ON sponsor_pools(sponsor_type);

ALTER TABLE sponsor_pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sponsors can view own pool"
    ON sponsor_pools FOR SELECT
    USING (wallet_address = current_setting('app.current_wallet', true));

CREATE POLICY "Service role full access on sponsor_pools"
    ON sponsor_pools FOR ALL
    USING (auth.role() = 'service_role');
