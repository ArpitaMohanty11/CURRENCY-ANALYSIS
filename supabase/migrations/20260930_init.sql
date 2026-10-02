-- ====================================================================
-- Currency Analysis Database Schema (Supabase PostgreSQL Compatible)
-- Migration: 20260930_init.sql
-- ====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'trader', 'analyst', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. USER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    base_currency VARCHAR(10) DEFAULT 'USD',
    theme VARCHAR(20) DEFAULT 'dark',
    refresh_interval_seconds INT DEFAULT 15,
    notification_email BOOLEAN DEFAULT TRUE,
    notification_in_app BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. CURRENCIES TABLE
CREATE TABLE IF NOT EXISTS currencies (
    code VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    country VARCHAR(100) NOT NULL,
    flag_url VARCHAR(255),
    category VARCHAR(50) DEFAULT 'Major', -- 'Major', 'Minor', 'Exotic', 'Crypto'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. EXCHANGE RATES TABLE
CREATE TABLE IF NOT EXISTS exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_currency VARCHAR(10) REFERENCES currencies(code) ON DELETE RESTRICT NOT NULL,
    target_currency VARCHAR(10) REFERENCES currencies(code) ON DELETE RESTRICT NOT NULL,
    rate NUMERIC(18, 6) NOT NULL,
    bid NUMERIC(18, 6) NOT NULL,
    ask NUMERIC(18, 6) NOT NULL,
    high_24h NUMERIC(18, 6) NOT NULL,
    low_24h NUMERIC(18, 6) NOT NULL,
    change_24h NUMERIC(18, 6) NOT NULL,
    change_pct_24h NUMERIC(8, 4) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_pair_time ON exchange_rates(base_currency, target_currency, timestamp DESC);

-- 5. WATCHLISTS TABLE
CREATE TABLE IF NOT EXISTS watchlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. WATCHLIST ITEMS TABLE
CREATE TABLE IF NOT EXISTS watchlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    watchlist_id UUID REFERENCES watchlists(id) ON DELETE CASCADE NOT NULL,
    base_currency VARCHAR(10) REFERENCES currencies(code) ON DELETE RESTRICT NOT NULL,
    target_currency VARCHAR(10) REFERENCES currencies(code) ON DELETE RESTRICT NOT NULL,
    added_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(watchlist_id, base_currency, target_currency)
);

-- 7. ALERTS TABLE
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    base_currency VARCHAR(10) REFERENCES currencies(code) ON DELETE RESTRICT NOT NULL,
    target_currency VARCHAR(10) REFERENCES currencies(code) ON DELETE RESTRICT NOT NULL,
    trigger_type VARCHAR(20) NOT NULL CHECK (trigger_type IN ('ABOVE', 'BELOW', 'PCT_CHANGE_UP', 'PCT_CHANGE_DOWN')),
    target_rate NUMERIC(18, 6) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    triggered_count INT DEFAULT 0,
    last_triggered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. ALERT HISTORY TABLE
CREATE TABLE IF NOT EXISTS alert_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_id UUID REFERENCES alerts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    base_currency VARCHAR(10) NOT NULL,
    target_currency VARCHAR(10) NOT NULL,
    triggered_rate NUMERIC(18, 6) NOT NULL,
    target_rate NUMERIC(18, 6) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN ('DAILY_WRAP', 'WEEKLY_VOLATILITY', 'CORRELATION_MATRIX', 'CURRENCY_PERFORMANCE', 'CUSTOM')),
    format VARCHAR(20) NOT NULL CHECK (format IN ('PDF', 'CSV', 'JSON')),
    file_url TEXT,
    parameters JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. CURRENCY ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS currency_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    base_currency VARCHAR(10) REFERENCES currencies(code) ON DELETE RESTRICT NOT NULL,
    target_currency VARCHAR(10) REFERENCES currencies(code) ON DELETE RESTRICT NOT NULL,
    period VARCHAR(20) DEFAULT '30D',
    rsi_14 NUMERIC(6, 2),
    sma_20 NUMERIC(18, 6),
    sma_50 NUMERIC(18, 6),
    sma_200 NUMERIC(18, 6),
    volatility_30d NUMERIC(8, 4),
    sharpe_ratio NUMERIC(6, 2),
    max_drawdown NUMERIC(8, 4),
    calculated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    ip_address VARCHAR(50),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. NOTIFICATION LOGS TABLE
CREATE TABLE IF NOT EXISTS notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Currencies & Exchange rates are public for read
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public currencies are viewable by everyone" ON currencies FOR SELECT USING (true);

ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public exchange rates are viewable by everyone" ON exchange_rates FOR SELECT USING (true);

ALTER TABLE currency_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public analytics are viewable by everyone" ON currency_analytics FOR SELECT USING (true);

-- User-scoped policies
CREATE POLICY "Users can manage their own preferences" ON user_preferences 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own watchlists" ON watchlists 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own alerts" ON alerts 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their alert history" ON alert_history 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their reports" ON reports 
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their notifications" ON notification_logs 
    FOR ALL USING (auth.uid() = user_id);

-- ====================================================================
-- SEED DATA: Currencies
-- ====================================================================
INSERT INTO currencies (code, name, symbol, country, category) VALUES
('USD', 'United States Dollar', '$', 'United States', 'Major'),
('EUR', 'Euro', '€', 'European Union', 'Major'),
('GBP', 'British Pound Sterling', '£', 'United Kingdom', 'Major'),
('JPY', 'Japanese Yen', '¥', 'Japan', 'Major'),
('CHF', 'Swiss Franc', 'CHF', 'Switzerland', 'Major'),
('AUD', 'Australian Dollar', 'A$', 'Australia', 'Major'),
('CAD', 'Canadian Dollar', 'C$', 'Canada', 'Major'),
('NZD', 'New Zealand Dollar', 'NZ$', 'New Zealand', 'Major'),
('INR', 'Indian Rupee', '₹', 'India', 'Minor'),
('SGD', 'Singapore Dollar', 'S$', 'Singapore', 'Minor'),
('HKD', 'Hong Kong Dollar', 'HK$', 'Hong Kong', 'Minor'),
('CNY', 'Chinese Yuan', '¥', 'China', 'Minor'),
('AED', 'UAE Dirham', 'د.إ', 'United Arab Emirates', 'Minor'),
('KRW', 'South Korean Won', '₩', 'South Korea', 'Minor'),
('BRL', 'Brazilian Real', 'R$', 'Brazil', 'Exotic'),
('MXN', 'Mexican Peso', 'Mex$', 'Mexico', 'Exotic'),
('ZAR', 'South African Rand', 'R', 'South Africa', 'Exotic'),
('SEK', 'Swedish Krona', 'kr', 'Sweden', 'Minor'),
('NOK', 'Norwegian Krone', 'kr', 'Norway', 'Minor'),
('BTC', 'Bitcoin (FX Synthetic)', '₿', 'Global', 'Crypto')
ON CONFLICT (code) DO NOTHING;
