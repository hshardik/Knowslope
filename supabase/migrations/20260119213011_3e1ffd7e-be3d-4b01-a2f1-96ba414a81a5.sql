-- Fix 1: Restrict user_roles SELECT to only own roles (fixes user_roles_public_read and SUPA_rls_policy_always_true)
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid());

-- Fix 2: Add server-side validation for publishing_whitelist entries
CREATE OR REPLACE FUNCTION public.validate_whitelist_entry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.entry_type = 'email' THEN
    -- Validate email format
    IF NEW.entry !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Invalid email format: %', NEW.entry;
    END IF;
  ELSIF NEW.entry_type = 'domain' THEN
    -- Validate domain format (must start with @ and have valid TLD)
    IF NEW.entry !~ '^@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
      RAISE EXCEPTION 'Domain must start with @ and be a valid domain: %', NEW.entry;
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid entry_type: %', NEW.entry_type;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for INSERT validation
DROP TRIGGER IF EXISTS validate_whitelist_before_insert ON public.publishing_whitelist;
CREATE TRIGGER validate_whitelist_before_insert
  BEFORE INSERT ON public.publishing_whitelist
  FOR EACH ROW EXECUTE FUNCTION public.validate_whitelist_entry();

-- Create trigger for UPDATE validation (in case updates are enabled later)
DROP TRIGGER IF EXISTS validate_whitelist_before_update ON public.publishing_whitelist;
CREATE TRIGGER validate_whitelist_before_update
  BEFORE UPDATE ON public.publishing_whitelist
  FOR EACH ROW EXECUTE FUNCTION public.validate_whitelist_entry();