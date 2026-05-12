ALTER TABLE public.attendance ALTER COLUMN olympiad_id DROP NOT NULL;
ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_user_id_olympiad_id_data_key;
CREATE UNIQUE INDEX IF NOT EXISTS attendance_unique_lecture ON public.attendance (user_id, lecture_id, data) WHERE lecture_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS attendance_unique_workshop ON public.attendance (user_id, workshop_id, data) WHERE workshop_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS attendance_unique_olympiad ON public.attendance (user_id, olympiad_id, data) WHERE olympiad_id IS NOT NULL AND lecture_id IS NULL AND workshop_id IS NULL;