
-- Add address fields to olympiads
ALTER TABLE public.olympiads
  ADD COLUMN IF NOT EXISTS cep text DEFAULT '',
  ADD COLUMN IF NOT EXISTS rua text DEFAULT '',
  ADD COLUMN IF NOT EXISTS bairro text DEFAULT '',
  ADD COLUMN IF NOT EXISTS cidade text DEFAULT '',
  ADD COLUMN IF NOT EXISTS estado text DEFAULT '',
  ADD COLUMN IF NOT EXISTS numero_endereco text DEFAULT '',
  ADD COLUMN IF NOT EXISTS complemento text DEFAULT '',
  ADD COLUMN IF NOT EXISTS ponto_referencia text DEFAULT '',
  ADD COLUMN IF NOT EXISTS horario text DEFAULT '',
  ADD COLUMN IF NOT EXISTS dias_semana text DEFAULT '';

-- Expand olympiad_activities
ALTER TABLE public.olympiad_activities
  ADD COLUMN IF NOT EXISTS responsavel text DEFAULT '',
  ADD COLUMN IF NOT EXISTS horario text DEFAULT '',
  ADD COLUMN IF NOT EXISTS data_atividade date,
  ADD COLUMN IF NOT EXISTS local_sala text DEFAULT '',
  ADD COLUMN IF NOT EXISTS limite_vagas integer DEFAULT 0;

-- Add date fields to workshops
ALTER TABLE public.workshops
  ADD COLUMN IF NOT EXISTS data_inicio date,
  ADD COLUMN IF NOT EXISTS data_fim date,
  ADD COLUMN IF NOT EXISTS dias_aulas text DEFAULT '';

-- Add maps field to posts
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS localizacao_maps text DEFAULT '';

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('uploads', 'uploads', true, 52428800)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Anyone can view uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Admins can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete uploads" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'uploads' AND public.has_role(auth.uid(), 'admin'));

-- Post files table
CREATE TABLE IF NOT EXISTS public.post_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL DEFAULT '',
  file_type text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.post_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage post_files" ON public.post_files FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public read post_files" ON public.post_files FOR SELECT USING (true);

-- Workshop files table
CREATE TABLE IF NOT EXISTS public.workshop_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id uuid REFERENCES public.workshops(id) ON DELETE CASCADE NOT NULL,
  file_url text NOT NULL,
  file_name text NOT NULL DEFAULT '',
  file_type text NOT NULL DEFAULT '',
  tipo text NOT NULL DEFAULT 'apoio',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.workshop_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin manage workshop_files" ON public.workshop_files FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Public read workshop_files" ON public.workshop_files FOR SELECT USING (true);
