-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view whitelist" ON public.publishing_whitelist;

-- Only admins can view the whitelist
CREATE POLICY "Admins can view whitelist" 
ON public.publishing_whitelist 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));