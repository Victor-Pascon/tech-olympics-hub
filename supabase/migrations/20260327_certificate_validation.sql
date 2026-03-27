-- Migration: Add validation_code to attendance table for certificate verification

ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS validation_code TEXT UNIQUE;

-- Function to generate a random alphanumeric code
CREATE OR REPLACE FUNCTION generate_validation_code() RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Excluded 0, O, 1, I for clarity
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Populate existing null codes
UPDATE public.attendance 
SET validation_code = generate_validation_code()
WHERE validation_code IS NULL;

-- Trigger to auto-generate code on insert
CREATE OR REPLACE FUNCTION trg_attendance_val_code() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.validation_code IS NULL THEN
    NEW.validation_code := generate_validation_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_attendance_val_code ON public.attendance;
CREATE TRIGGER tr_attendance_val_code 
BEFORE INSERT ON public.attendance 
FOR EACH ROW EXECUTE FUNCTION trg_attendance_val_code();
