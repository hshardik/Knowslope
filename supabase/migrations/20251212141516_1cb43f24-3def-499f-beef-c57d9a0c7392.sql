-- Remove the permissive INSERT policy that allows any authenticated user to insert notifications
-- Edge functions use service_role key which bypasses RLS, so they can still insert
DROP POLICY IF EXISTS "System can insert notifications" ON public.slack_document_notifications;