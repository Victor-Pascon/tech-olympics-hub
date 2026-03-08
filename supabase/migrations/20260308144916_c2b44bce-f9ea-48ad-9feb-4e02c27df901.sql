
-- Create a trigger function to auto-assign admin role to the specified email
CREATE OR REPLACE FUNCTION public.assign_admin_on_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'joaovpascon@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Attach trigger to profiles table (created on signup)
DROP TRIGGER IF EXISTS trg_assign_admin ON public.profiles;
CREATE TRIGGER trg_assign_admin
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_admin_on_signup();

-- Also insert admin role if the user already exists
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'admin'
FROM public.profiles p
WHERE p.email = 'joaovpascon@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
