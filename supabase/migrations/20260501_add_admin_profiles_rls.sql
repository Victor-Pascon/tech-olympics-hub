-- Migration: Add admin RLS policies for reading participant data
-- Date: 2026-05-01

-- The profiles table only allowed users to view their own profile.
-- Admins need to read all profiles to display participant lists.

-- Allow admins to view all profiles
DROP POLICY IF EXISTS "Admin view all profiles" ON public.profiles;

CREATE POLICY "Admin view all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Also allow admins to update any profile (useful for admin editing participants)
DROP POLICY IF EXISTS "Admin update any profile" ON public.profiles;

CREATE POLICY "Admin update any profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- DOWN
DROP POLICY IF EXISTS "Admin view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin update any profile" ON public.profiles;
