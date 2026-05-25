-- ============================================================================
-- Migration: subscription_limits_enums
-- Part 1 of 2: Enum changes only
-- Must run before subscription_limits_2_main.sql to ensure the new enum value is
-- committed before any DML that references it (ALTER TYPE ... ADD VALUE is
-- not transactionally visible within the same migration on some PG setups).
-- ============================================================================

-- 1. Add PRO to subscription_type enum
ALTER TYPE public.subscription_type ADD VALUE IF NOT EXISTS 'PRO';

-- 2. Create league_status enum
DO $$ BEGIN
  CREATE TYPE public.league_status AS ENUM ('ACTIVE', 'LOCKED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Create league_locked_reason enum
DO $$ BEGIN
  CREATE TYPE public.league_locked_reason AS ENUM (
    'SUBSCRIPTION_EXPIRED',
    'FREE_LIMIT_EXCEEDED',
    'PRO_REQUIRED'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
