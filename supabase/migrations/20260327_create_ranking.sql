-- Migration: Ranking system for olympiad activities

CREATE TABLE public.olympiad_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  olympiad_id UUID REFERENCES public.olympiads(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES public.olympiad_activities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pontuacao NUMERIC(10,2) DEFAULT 0,
  colocacao INTEGER,
  observacoes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(olympiad_id, activity_id, user_id)
);
ALTER TABLE public.olympiad_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read scores" ON public.olympiad_scores FOR SELECT USING (true);
CREATE POLICY "Admin manage scores" ON public.olympiad_scores FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
