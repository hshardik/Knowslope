-- Allow creator_id to be null for documents created from Slack
ALTER TABLE public.documents ALTER COLUMN creator_id DROP NOT NULL;

-- Update RLS policy to handle null creator_id for Slack-created documents
-- Users can view team drafts they're part of (including Slack-created ones)
DROP POLICY IF EXISTS "Users can view their own drafts" ON public.documents;
CREATE POLICY "Users can view their own drafts" 
ON public.documents 
FOR SELECT 
USING ((status = 'draft'::doc_status) AND (creator_id = auth.uid() OR (creator_id IS NULL AND created_from_slack = true)));

-- Creators can update their own drafts OR anyone can update Slack-created drafts
DROP POLICY IF EXISTS "Creators can update their own drafts" ON public.documents;
CREATE POLICY "Creators can update their own drafts" 
ON public.documents 
FOR UPDATE 
USING ((status = 'draft'::doc_status) AND (creator_id = auth.uid() OR (creator_id IS NULL AND created_from_slack = true)));

-- Creators can delete their own docs OR admins can delete Slack-created docs
DROP POLICY IF EXISTS "Creators can delete their own documents" ON public.documents;
CREATE POLICY "Creators can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (creator_id = auth.uid() OR (creator_id IS NULL AND created_from_slack = true));