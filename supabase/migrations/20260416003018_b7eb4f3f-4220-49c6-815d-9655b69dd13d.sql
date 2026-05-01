ALTER TABLE public.olympiad_activities ADD COLUMN IF NOT EXISTS total_horas integer DEFAULT 0;

-- DOWN
ALTER TABLE public.olympiad_activities DROP COLUMN IF EXISTS total_horas;