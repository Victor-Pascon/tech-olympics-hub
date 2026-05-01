
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

-- DOWN
DROP POLICY IF EXISTS "Public read workshop_files" ON public.workshop_files;
DROP POLICY IF EXISTS "Admin manage workshop_files" ON public.workshop_files;
DROP TABLE IF EXISTS public.workshop_files;
DROP POLICY IF EXISTS "Public read post_files" ON public.post_files;
DROP POLICY IF EXISTS "Admin manage post_files" ON public.post_files;
DROP TABLE IF EXISTS public.post_files;
DROP POLICY IF EXISTS "Admins can delete uploads" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view uploads" ON storage.objects;
DELETE FROM storage.buckets WHERE id = 'uploads';
ALTER TABLE public.posts DROP COLUMN IF EXISTS localizacao_maps;
ALTER TABLE public.workshops DROP COLUMN IF EXISTS dias_aulas;
ALTER TABLE public.workshops DROP COLUMN IF EXISTS data_fim;
ALTER TABLE public.workshops DROP COLUMN IF EXISTS data_inicio;
ALTER TABLE public.olympiad_activities DROP COLUMN IF EXISTS limite_vagas;
ALTER TABLE public.olympiad_activities DROP COLUMN IF EXISTS local_sala;
ALTER TABLE public.olympiad_activities DROP COLUMN IF EXISTS data_atividade;
ALTER TABLE public.olympiad_activities DROP COLUMN IF EXISTS horario;
ALTER TABLE public.olympiad_activities DROP COLUMN IF EXISTS responsavel;
ALTER TABLE public.olympiads DROP COLUMN IF EXISTS dias_semana;
ALTER TABLE public.olympiads DROP COLUMN IF EXISTS horario;
ALTER TABLE public.olympiads DROP COLUMN IF EXISTS ponto_referencia;
ALTER TABLE public.olympiads DROP COLUMN IF EXISTS complemento;
ALTER TABLE public.olympiads DROP COLUMN IF EXISTS numero_endereco;
ALTER TABLE public.olympiads DROP COLUMN IF EXISTS estado;
ALTER TABLE public.olympiads DROP COLUMN IF EXISTS cidade;
ALTER TABLE public.olympiads DROP COLUMN IF EXISTS bairro;
ALTER TABLE public.olympiads DROP COLUMN IF EXISTS rua;
ALTER TABLE public.olympiads DROP COLUMN IF EXISTS cep;
