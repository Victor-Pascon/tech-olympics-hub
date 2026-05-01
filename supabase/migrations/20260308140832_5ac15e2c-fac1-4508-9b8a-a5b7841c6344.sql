
-- 1. Enum de roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  cpf TEXT DEFAULT '',
  telefone TEXT DEFAULT '',
  cep TEXT DEFAULT '',
  estado TEXT DEFAULT '',
  cidade TEXT DEFAULT '',
  rua TEXT DEFAULT '',
  numero TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- 3. User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 4. has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. Olympiads
CREATE TABLE public.olympiads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT DEFAULT '',
  descricao TEXT DEFAULT '',
  data_inicio DATE,
  data_fim DATE,
  local TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.olympiads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read olympiads" ON public.olympiads FOR SELECT USING (true);
CREATE POLICY "Admin manage olympiads" ON public.olympiads FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. Workshops
CREATE TABLE public.workshops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  olympiad_id UUID REFERENCES public.olympiads(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  professor TEXT DEFAULT '',
  horario TEXT DEFAULT '',
  local TEXT DEFAULT '',
  vagas INT DEFAULT 30,
  descricao TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read workshops" ON public.workshops FOR SELECT USING (true);
CREATE POLICY "Admin manage workshops" ON public.workshops FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7. Workshop enrollments
CREATE TABLE public.workshop_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workshop_id UUID REFERENCES public.workshops(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, workshop_id)
);
ALTER TABLE public.workshop_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own enrollments" ON public.workshop_enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can enroll" ON public.workshop_enrollments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unenroll" ON public.workshop_enrollments FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin view all enrollments" ON public.workshop_enrollments FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 8. Posts (blog)
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  conteudo TEXT DEFAULT '',
  imagem_url TEXT DEFAULT '',
  autor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  publicado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published posts" ON public.posts FOR SELECT USING (publicado = true);
CREATE POLICY "Admin manage posts" ON public.posts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- 9. Support materials
CREATE TABLE public.support_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  arquivo_url TEXT DEFAULT '',
  olympiad_id UUID REFERENCES public.olympiads(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.support_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read materials" ON public.support_materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage materials" ON public.support_materials FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 10. Attendance
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  olympiad_id UUID REFERENCES public.olympiads(id) ON DELETE CASCADE NOT NULL,
  presente BOOLEAN DEFAULT false,
  data DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, olympiad_id, data)
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own attendance" ON public.attendance FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin manage attendance" ON public.attendance FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 11. Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, COALESCE(NEW.email, ''));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- DOWN
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP POLICY IF EXISTS "Admin manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users view own attendance" ON public.attendance;
DROP TABLE IF EXISTS public.attendance;
DROP POLICY IF EXISTS "Admin manage materials" ON public.support_materials;
DROP POLICY IF EXISTS "Authenticated read materials" ON public.support_materials;
DROP TABLE IF EXISTS public.support_materials;
DROP POLICY IF EXISTS "Admin manage posts" ON public.posts;
DROP POLICY IF EXISTS "Public read published posts" ON public.posts;
DROP TABLE IF EXISTS public.posts;
DROP POLICY IF EXISTS "Admin view all enrollments" ON public.workshop_enrollments;
DROP POLICY IF EXISTS "Users can unenroll" ON public.workshop_enrollments;
DROP POLICY IF EXISTS "Users can enroll" ON public.workshop_enrollments;
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.workshop_enrollments;
DROP TABLE IF EXISTS public.workshop_enrollments;
DROP POLICY IF EXISTS "Admin manage workshops" ON public.workshops;
DROP POLICY IF EXISTS "Public read workshops" ON public.workshops;
DROP TABLE IF EXISTS public.workshops;
DROP POLICY IF EXISTS "Admin manage olympiads" ON public.olympiads;
DROP POLICY IF EXISTS "Public read olympiads" ON public.olympiads;
DROP TABLE IF EXISTS public.olympiads;
DROP FUNCTION IF EXISTS public.has_role;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP TABLE IF EXISTS public.user_roles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP TABLE IF EXISTS public.profiles;
DROP TYPE IF EXISTS public.app_role;
