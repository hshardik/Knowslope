-- Create knowledge_hub_settings table (singleton pattern)
CREATE TABLE public.knowledge_hub_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slack_required BOOLEAN NOT NULL DEFAULT true,
  slack_connected BOOLEAN NOT NULL DEFAULT false,
  slack_workspace_name TEXT,
  quick_publish_enabled BOOLEAN NOT NULL DEFAULT false,
  export_formats TEXT[] NOT NULL DEFAULT ARRAY['pdf', 'markdown'],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.knowledge_hub_settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view settings
CREATE POLICY "Authenticated users can view settings"
ON public.knowledge_hub_settings
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only admins can update settings
CREATE POLICY "Admins can update settings"
ON public.knowledge_hub_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert settings (for initial creation)
CREATE POLICY "Admins can insert settings"
ON public.knowledge_hub_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings row
INSERT INTO public.knowledge_hub_settings (slack_required, slack_connected, quick_publish_enabled, export_formats)
VALUES (true, false, false, ARRAY['pdf', 'markdown']);

-- Add trigger for updated_at
CREATE TRIGGER update_knowledge_hub_settings_updated_at
BEFORE UPDATE ON public.knowledge_hub_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();