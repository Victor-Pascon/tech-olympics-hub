-- Migration: add activity_id to olympiad_enrollments

-- Add the column
ALTER TABLE public.olympiad_enrollments ADD COLUMN activity_id UUID REFERENCES public.olympiad_activities(id) ON DELETE CASCADE;

-- Drop the old unique constraint (since previously it was just user_id + olympiad_id)
ALTER TABLE public.olympiad_enrollments DROP CONSTRAINT IF EXISTS olympiad_enrollments_user_id_olympiad_id_key;

-- Add a new unique constraint that includes the activity_id, 
-- allowing the user to register for multiple modalities in the same Olympiad.
ALTER TABLE public.olympiad_enrollments ADD CONSTRAINT olympiad_enrollments_user_id_olympiad_id_activity_id_key UNIQUE (user_id, olympiad_id, activity_id);
