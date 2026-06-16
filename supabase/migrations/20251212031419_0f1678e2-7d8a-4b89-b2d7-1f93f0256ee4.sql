-- Add policy to allow whitelisted users to publish drafts
CREATE POLICY "Whitelisted users can publish drafts" 
ON public.documents 
FOR UPDATE 
USING (
  (status = 'draft'::doc_status) 
  AND is_whitelisted(auth.uid())
)
WITH CHECK (
  is_whitelisted(auth.uid())
);