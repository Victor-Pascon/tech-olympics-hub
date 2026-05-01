-- Migration: Audit Log System
-- Registra automaticamente INSERT/UPDATE/DELETE nas tabelas admin

-- UP

-- 1. Audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela TEXT NOT NULL,
  operacao TEXT NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE')),
  registro_id UUID,
  dados_anteriores JSONB DEFAULT '{}',
  dados_novos JSONB DEFAULT '{}',
  usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read audit_log" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Insert audit_log (system)" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_audit_log_tabela ON public.audit_log(tabela);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_usuario ON public.audit_log(usuario_id);

-- 2. Audit function (reusable)
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_data JSONB;
  v_new_data JSONB;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF TG_OP = 'INSERT' THEN
    v_new_data := to_jsonb(NEW);
    INSERT INTO public.audit_log (tabela, operacao, registro_id, dados_novos, usuario_id)
    VALUES (TG_TABLE_NAME, 'INSERT', NEW.id, v_new_data, v_user_id);
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    INSERT INTO public.audit_log (tabela, operacao, registro_id, dados_anteriores, dados_novos, usuario_id)
    VALUES (TG_TABLE_NAME, 'UPDATE', OLD.id, v_old_data, v_new_data, v_user_id);
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    v_old_data := to_jsonb(OLD);
    INSERT INTO public.audit_log (tabela, operacao, registro_id, dados_anteriores, usuario_id)
    VALUES (TG_TABLE_NAME, 'DELETE', OLD.id, v_old_data, v_user_id);
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- 3. Attach audit triggers to main admin tables
CREATE TRIGGER trg_audit_olympiads
  AFTER INSERT OR UPDATE OR DELETE ON public.olympiads
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER trg_audit_workshops
  AFTER INSERT OR UPDATE OR DELETE ON public.workshops
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER trg_audit_lectures
  AFTER INSERT OR UPDATE OR DELETE ON public.lectures
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER trg_audit_posts
  AFTER INSERT OR UPDATE OR DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER trg_audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

CREATE TRIGGER trg_audit_certificate_templates
  AFTER INSERT OR UPDATE OR DELETE ON public.certificate_templates
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- DOWN
DROP TRIGGER IF EXISTS trg_audit_certificate_templates ON public.certificate_templates;
DROP TRIGGER IF EXISTS trg_audit_profiles ON public.profiles;
DROP TRIGGER IF EXISTS trg_audit_posts ON public.posts;
DROP TRIGGER IF EXISTS trg_audit_lectures ON public.lectures;
DROP TRIGGER IF EXISTS trg_audit_workshops ON public.workshops;
DROP TRIGGER IF EXISTS trg_audit_olympiads ON public.olympiads;
DROP FUNCTION IF EXISTS public.audit_trigger_func;
DROP INDEX IF EXISTS idx_audit_log_usuario;
DROP INDEX IF EXISTS idx_audit_log_created;
DROP INDEX IF EXISTS idx_audit_log_tabela;
DROP POLICY IF EXISTS "Insert audit_log (system)" ON public.audit_log;
DROP POLICY IF EXISTS "Admin read audit_log" ON public.audit_log;
DROP TABLE IF EXISTS public.audit_log;
