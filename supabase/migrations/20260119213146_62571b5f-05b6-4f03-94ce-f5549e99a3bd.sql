-- Fix: The "Service role can insert incoming items" policy has WITH CHECK (true) which is too permissive
-- Service role bypasses RLS anyway, so we don't need this policy at all
-- Remove it to fix the linter warning - service role will still work without it
DROP POLICY IF EXISTS "Service role can insert incoming items" ON public.slack_incoming_items;