CREATE TABLE IF NOT EXISTS vouches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_wallet TEXT NOT NULL,
    learner_wallet TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'revoked', 'expired')),
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vouches_learner ON vouches(learner_wallet);
CREATE INDEX IF NOT EXISTS idx_vouches_mentor ON vouches(mentor_wallet);
CREATE INDEX IF NOT EXISTS idx_vouches_status ON vouches(status);

-- Only one APPROVED vouch per (mentor, learner) pair.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_vouches_approved_pair
    ON vouches(mentor_wallet, learner_wallet)
    WHERE status = 'approved';

ALTER TABLE vouches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view vouches they participate in"
    ON vouches FOR SELECT
    USING (
        mentor_wallet = current_setting('app.current_wallet', true)
        OR learner_wallet = current_setting('app.current_wallet', true)
    );

CREATE POLICY "Service role full access on vouches"
    ON vouches FOR ALL
    USING (auth.role() = 'service_role');
