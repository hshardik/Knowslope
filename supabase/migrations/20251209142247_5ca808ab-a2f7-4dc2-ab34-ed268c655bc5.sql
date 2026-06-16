-- Phase 1: Database Schema Updates for Slack Integration

-- 1.1 Add Slack-related columns to documents table
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS created_from_slack boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS slack_thread_id text,
ADD COLUMN IF NOT EXISTS slack_channel_id text,
ADD COLUMN IF NOT EXISTS slack_channel_name text,
ADD COLUMN IF NOT EXISTS slack_message_ts text;

-- 1.2 Add quick_publish_mode to knowledge_hub_settings
ALTER TABLE public.knowledge_hub_settings 
ADD COLUMN IF NOT EXISTS quick_publish_mode text NOT NULL DEFAULT 'draft_only';

-- Add check constraint for valid modes
ALTER TABLE public.knowledge_hub_settings 
ADD CONSTRAINT valid_quick_publish_mode CHECK (quick_publish_mode IN ('draft_only', 'auto_publish'));

-- 1.3 Create slack_document_notifications table
CREATE TABLE IF NOT EXISTS public.slack_document_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type text NOT NULL DEFAULT 'new_draft_from_slack',
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_slack_notifications_user_unread 
ON public.slack_document_notifications(user_id, read) 
WHERE read = false;

-- Enable RLS
ALTER TABLE public.slack_document_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for slack_document_notifications
CREATE POLICY "Users can view their own notifications"
ON public.slack_document_notifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
ON public.slack_document_notifications
FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
ON public.slack_document_notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can delete their own notifications"
ON public.slack_document_notifications
FOR DELETE
USING (user_id = auth.uid());