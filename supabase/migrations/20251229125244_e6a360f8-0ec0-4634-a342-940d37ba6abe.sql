-- Create table for neutral incoming Slack items
CREATE TABLE public.slack_incoming_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slack_url TEXT NOT NULL,
  slack_channel_id TEXT,
  slack_channel_name TEXT,
  slack_message_ts TEXT,
  slack_thread_id TEXT,
  message_preview TEXT,
  sent_by_slack_user_id TEXT,
  sent_by_slack_user_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.slack_incoming_items ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users to view incoming items
CREATE POLICY "Authenticated users can view incoming items" 
ON public.slack_incoming_items 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create policy for service role to insert (from Slack webhook)
CREATE POLICY "Service role can insert incoming items" 
ON public.slack_incoming_items 
FOR INSERT 
WITH CHECK (true);

-- Create policy for authenticated users to update items they process
CREATE POLICY "Authenticated users can update incoming items" 
ON public.slack_incoming_items 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Create policy for authenticated users to delete incoming items
CREATE POLICY "Authenticated users can delete incoming items" 
ON public.slack_incoming_items 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_slack_incoming_items_updated_at
BEFORE UPDATE ON public.slack_incoming_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for faster queries
CREATE INDEX idx_slack_incoming_items_status ON public.slack_incoming_items(status);
CREATE INDEX idx_slack_incoming_items_created_at ON public.slack_incoming_items(created_at DESC);