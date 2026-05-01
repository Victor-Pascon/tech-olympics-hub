-- Migration: Lectures (Palestras) Module

-- 1. Lectures table
CREATE TABLE public.lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  local TEXT DEFAULT '',
  carga_horaria INTEGER DEFAULT 0,
  data_evento DATE,
  horario TEXT DEFAULT '',
  vagas INTEGER DEFAULT 50,
  certificates_released BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lectures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read lectures" ON public.lectures FOR SELECT USING (true);
CREATE POLICY "Admin manage lectures" ON public.lectures FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 2. Lecture speakers (palestrantes)
CREATE TABLE public.lecture_speakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id UUID REFERENCES public.lectures(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  email TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  topico TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.lecture_speakers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read lecture_speakers" ON public.lecture_speakers FOR SELECT USING (true);
CREATE POLICY "Admin manage lecture_speakers" ON public.lecture_speakers FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3. Lecture enrollments
CREATE TABLE public.lecture_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lecture_id UUID REFERENCES public.lectures(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, lecture_id)
);
ALTER TABLE public.lecture_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own lecture enrollments" ON public.lecture_enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can enroll in lectures" ON public.lecture_enrollments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unenroll from lectures" ON public.lecture_enrollments FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin view all lecture enrollments" ON public.lecture_enrollments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. Add lecture_id to attendance table
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS lecture_id UUID REFERENCES public.lectures(id);

-- 5. Allow admin to read all profiles (needed for Participantes tab)
CREATE POLICY "Admin can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. Allow admin to update all profiles (needed for editing participant data)
CREATE POLICY "Admin can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- DOWN
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
ALTER TABLE public.attendance DROP COLUMN IF EXISTS lecture_id;
DROP POLICY IF EXISTS "Admin view all lecture enrollments" ON public.lecture_enrollments;
DROP POLICY IF EXISTS "Users can unenroll from lectures" ON public.lecture_enrollments;
DROP POLICY IF EXISTS "Users can enroll in lectures" ON public.lecture_enrollments;
DROP POLICY IF EXISTS "Users can view own lecture enrollments" ON public.lecture_enrollments;
DROP TABLE IF EXISTS public.lecture_enrollments;
DROP POLICY IF EXISTS "Admin manage lecture_speakers" ON public.lecture_speakers;
DROP POLICY IF EXISTS "Public read lecture_speakers" ON public.lecture_speakers;
DROP TABLE IF EXISTS public.lecture_speakers;
DROP POLICY IF EXISTS "Admin manage lectures" ON public.lectures;
DROP POLICY IF EXISTS "Public read lectures" ON public.lectures;
DROP TABLE IF EXISTS public.lectures;
