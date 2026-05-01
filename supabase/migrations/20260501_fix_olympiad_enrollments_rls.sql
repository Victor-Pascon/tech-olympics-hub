-- Migration: Fix reversed has_role arguments in olympiad_enrollments RLS policies
-- Date: 2026-05-01

-- The original migration passed arguments in wrong order: has_role('admin', auth.uid())
-- The correct order is: has_role(auth.uid(), 'admin') per function signature.

-- Fix SELECT policy
DROP POLICY IF EXISTS "Users can view their own olympiad enrollments" ON public.olympiad_enrollments;

CREATE POLICY "Users can view their own olympiad enrollments"
    ON public.olympiad_enrollments
    FOR SELECT
    USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Fix DELETE policy
DROP POLICY IF EXISTS "Users can delete their own olympiad enrollments" ON public.olympiad_enrollments;

CREATE POLICY "Users can delete their own olympiad enrollments"
    ON public.olympiad_enrollments
    FOR DELETE
    USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- DOWN
DROP POLICY IF EXISTS "Users can view their own olympiad enrollments" ON public.olympiad_enrollments;
DROP POLICY IF EXISTS "Users can delete their own olympiad enrollments" ON public.olympiad_enrollments;

CREATE POLICY "Users can view their own olympiad enrollments"
    ON public.olympiad_enrollments
    FOR SELECT
    USING (auth.uid() = user_id OR public.has_role('admin', auth.uid()));

CREATE POLICY "Users can delete their own olympiad enrollments"
    ON public.olympiad_enrollments
    FOR DELETE
    USING (auth.uid() = user_id OR public.has_role('admin', auth.uid()));
