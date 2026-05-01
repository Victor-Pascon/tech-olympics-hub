-- Migration: create olympiad_enrollments table

CREATE TABLE IF NOT EXISTS public.olympiad_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    olympiad_id UUID NOT NULL REFERENCES public.olympiads(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, olympiad_id)
);

-- Enable RLS
ALTER TABLE public.olympiad_enrollments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own olympiad enrollments"
    ON public.olympiad_enrollments
    FOR SELECT
    USING (auth.uid() = user_id OR public.has_role('admin', auth.uid()));

CREATE POLICY "Users can insert their own olympiad enrollments"
    ON public.olympiad_enrollments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own olympiad enrollments"
    ON public.olympiad_enrollments
    FOR DELETE
    USING (auth.uid() = user_id OR public.has_role('admin', auth.uid()));

-- DOWN
DROP POLICY IF EXISTS "Users can delete their own olympiad enrollments" ON public.olympiad_enrollments;
DROP POLICY IF EXISTS "Users can insert their own olympiad enrollments" ON public.olympiad_enrollments;
DROP POLICY IF EXISTS "Users can view their own olympiad enrollments" ON public.olympiad_enrollments;
DROP TABLE IF EXISTS public.olympiad_enrollments;
