-- Migration: Fix auth signup constraints
-- 1. Remove UNIQUE constraint on email (allows re-signup after deletion)
-- 2. Update provider CHECK constraint to allow 'google', 'email'

-- ============================================================================
-- 1. Drop UNIQUE constraint on email column
-- ============================================================================

-- This constraint was causing "duplicate key value violates unique constraint" errors
-- when users tried to re-signup after their account was deleted
ALTER TABLE public.stores
DROP CONSTRAINT IF EXISTS stores_email_key;

-- ============================================================================
-- 2. Update provider CHECK constraint
-- ============================================================================

-- Drop the old constraint (which still had 'facebook')
ALTER TABLE public.stores
DROP CONSTRAINT IF EXISTS stores_provider_check;

-- Add new constraint allowing google, email
ALTER TABLE public.stores
ADD CONSTRAINT stores_provider_check
CHECK (provider IN ('google', 'email'));
