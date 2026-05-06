-- Add stripe_customer_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add Stripe tracking fields to subscription table
ALTER TABLE subscription ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE;
ALTER TABLE subscription ADD COLUMN IF NOT EXISTS stripe_status TEXT; -- 'active' | 'past_due' | 'canceled' | 'incomplete'
ALTER TABLE subscription ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
