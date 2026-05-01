-- Migration: Advanced Admin Features (Attendance, Hours, Certificates)
ALTER TABLE public.olympiad_activities ADD COLUMN IF NOT EXISTS total_horas INTEGER DEFAULT 0;
-- 1. Attendance Table
ALTER TABLE public.attendance ADD COLUMN activity_id UUID REFERENCES public.olympiad_activities(id);
ALTER TABLE public.attendance ADD COLUMN workshop_id UUID REFERENCES public.workshops(id);

-- 2. Olympiads Table
ALTER TABLE public.olympiads ADD COLUMN certificates_released BOOLEAN DEFAULT false;
ALTER TABLE public.olympiads ADD COLUMN total_horas INTEGER DEFAULT 0;

-- 3. Workshops Table
ALTER TABLE public.workshops ADD COLUMN certificates_released BOOLEAN DEFAULT false;
ALTER TABLE public.workshops ADD COLUMN total_horas INTEGER DEFAULT 0;

-- 4. Support Materials Table
ALTER TABLE public.support_materials ADD COLUMN activity_id UUID REFERENCES public.olympiad_activities(id);
ALTER TABLE public.support_materials ADD COLUMN workshop_id UUID REFERENCES public.workshops(id);

-- 5. Certificate Templates Table
CREATE TABLE public.certificate_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR(50) NOT NULL UNIQUE,
  texto_padrao TEXT DEFAULT 'Certificamos que o aluno [NOME_ALUNO] participou ativamente da [NOME_CURSO] totalizando [HORAS] horas.',
  cor_primaria VARCHAR(20) DEFAULT '#00ffcc',
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Note for Supabase RLS: If certificate_templates needs to be read by public, allow it.
ALTER TABLE public.certificate_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to certificate_templates"
ON public.certificate_templates FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to insert certificate_templates"
ON public.certificate_templates FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update certificate_templates"
ON public.certificate_templates FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to delete certificate_templates"
ON public.certificate_templates FOR DELETE
TO authenticated
USING (true);

-- DOWN
DROP POLICY IF EXISTS "Allow authenticated users to delete certificate_templates" ON public.certificate_templates;
DROP POLICY IF EXISTS "Allow authenticated users to update certificate_templates" ON public.certificate_templates;
DROP POLICY IF EXISTS "Allow authenticated users to insert certificate_templates" ON public.certificate_templates;
DROP POLICY IF EXISTS "Allow public read access to certificate_templates" ON public.certificate_templates;
DROP TABLE IF EXISTS public.certificate_templates;
ALTER TABLE public.support_materials DROP COLUMN IF EXISTS workshop_id;
ALTER TABLE public.support_materials DROP COLUMN IF EXISTS activity_id;
ALTER TABLE public.workshops DROP COLUMN IF EXISTS total_horas;
ALTER TABLE public.workshops DROP COLUMN IF EXISTS certificates_released;
ALTER TABLE public.olympiads DROP COLUMN IF EXISTS total_horas;
ALTER TABLE public.olympiads DROP COLUMN IF EXISTS certificates_released;
ALTER TABLE public.attendance DROP COLUMN IF EXISTS workshop_id;
ALTER TABLE public.attendance DROP COLUMN IF EXISTS activity_id;
ALTER TABLE public.olympiad_activities DROP COLUMN IF EXISTS total_horas;
