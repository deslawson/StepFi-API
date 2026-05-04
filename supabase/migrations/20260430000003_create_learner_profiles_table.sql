CREATE TABLE IF NOT EXISTS learner_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL UNIQUE,
    school TEXT,
    program TEXT,
    program_type TEXT CHECK (program_type IN ('bootcamp', 'university', 'self_taught', 'online_course', 'apprenticeship')),
    income_type TEXT CHECK (income_type IN ('employed', 'intern', 'freelance', 'student', 'unemployed')),
    monthly_income NUMERIC(10, 2),
    country TEXT,
    city TEXT,
    device_owned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_learner_profiles_wallet ON learner_profiles(wallet_address);

ALTER TABLE learner_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own learner profile"
    ON learner_profiles FOR SELECT
    USING (wallet_address = current_setting('app.current_wallet', true));

CREATE POLICY "Users can update own learner profile"
    ON learner_profiles FOR UPDATE
    USING (wallet_address = current_setting('app.current_wallet', true));

CREATE POLICY "Service role full access on learner_profiles"
    ON learner_profiles FOR ALL
    USING (auth.role() = 'service_role');
