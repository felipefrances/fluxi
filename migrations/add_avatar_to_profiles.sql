-- Migration: Add avatar_url column to profiles table
-- Date: 2025-11-02
-- Description: Adds avatar_url column to store user profile photos from Supabase Storage

-- Add avatar_url column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to user avatar image stored in Supabase Storage avatars bucket';

-- Note: You need to create the 'avatars' bucket in Supabase Storage manually:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New Bucket"
-- 3. Name: avatars
-- 4. Public: true (allows public read access to avatar images)
-- 5. Click "Create Bucket"

-- Optional: Add storage policy to allow users to upload their own avatars
-- This will be created in the Supabase dashboard under Storage → Policies
