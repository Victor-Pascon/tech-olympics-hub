-- Trigger function: auto-enroll user na olimpíada quando se inscreve em workshop/lecture/activity vinculada
CREATE OR REPLACE FUNCTION public.auto_enroll_olympiad()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_olympiad_id uuid;
BEGIN
  IF TG_TABLE_NAME = 'workshop_enrollments' THEN
    SELECT olympiad_id INTO v_olympiad_id FROM public.workshops WHERE id = NEW.workshop_id;
  ELSIF TG_TABLE_NAME = 'lecture_enrollments' THEN
    -- lectures não têm olympiad_id no schema atual, ignore
    RETURN NEW;
  ELSIF TG_TABLE_NAME = 'olympiad_enrollments' THEN
    RETURN NEW; -- já é a tabela alvo
  END IF;

  IF v_olympiad_id IS NOT NULL THEN
    INSERT INTO public.olympiad_enrollments (user_id, olympiad_id)
    SELECT NEW.user_id, v_olympiad_id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.olympiad_enrollments
      WHERE user_id = NEW.user_id AND olympiad_id = v_olympiad_id AND activity_id IS NULL
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger em workshop_enrollments
DROP TRIGGER IF EXISTS trg_auto_enroll_olympiad_workshop ON public.workshop_enrollments;
CREATE TRIGGER trg_auto_enroll_olympiad_workshop
AFTER INSERT ON public.workshop_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.auto_enroll_olympiad();

-- Trigger também em olympiad_enrollments com activity_id (ao inscrever em modalidade, garantir registro "geral")
CREATE OR REPLACE FUNCTION public.ensure_general_olympiad_enrollment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.activity_id IS NOT NULL THEN
    INSERT INTO public.olympiad_enrollments (user_id, olympiad_id)
    SELECT NEW.user_id, NEW.olympiad_id
    WHERE NOT EXISTS (
      SELECT 1 FROM public.olympiad_enrollments
      WHERE user_id = NEW.user_id AND olympiad_id = NEW.olympiad_id AND activity_id IS NULL
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_general_olympiad_enrollment ON public.olympiad_enrollments;
CREATE TRIGGER trg_ensure_general_olympiad_enrollment
AFTER INSERT ON public.olympiad_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.ensure_general_olympiad_enrollment();

-- Backfill: criar inscrição "geral" na olimpíada para todos os alunos já inscritos em oficinas
INSERT INTO public.olympiad_enrollments (user_id, olympiad_id)
SELECT DISTINCT we.user_id, w.olympiad_id
FROM public.workshop_enrollments we
JOIN public.workshops w ON w.id = we.workshop_id
WHERE w.olympiad_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.olympiad_enrollments oe
    WHERE oe.user_id = we.user_id
      AND oe.olympiad_id = w.olympiad_id
      AND oe.activity_id IS NULL
  );