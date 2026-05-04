CREATE TABLE IF NOT EXISTS vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT UNIQUE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('school', 'bootcamp', 'electronics', 'books', 'subscriptions')),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    website TEXT,
    country TEXT,
    city TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendors_type ON vendors(type);
CREATE INDEX IF NOT EXISTS idx_vendors_wallet ON vendors(wallet_address);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view vendors"
    ON vendors FOR SELECT
    USING (true);

CREATE POLICY "Service role full access on vendors"
    ON vendors FOR ALL
    USING (auth.role() = 'service_role');
