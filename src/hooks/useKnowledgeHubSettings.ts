import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type QuickPublishMode = 'draft_only' | 'auto_publish';

interface KnowledgeHubSettings {
  id: string;
  slack_required: boolean;
  slack_connected: boolean;
  slack_workspace_name: string | null;
  quick_publish_enabled: boolean;
  quick_publish_mode: QuickPublishMode;
  export_formats: string[];
  updated_at: string;
  updated_by: string | null;
}

export const useKnowledgeHubSettings = () => {
  return useQuery({
    queryKey: ['knowledgeHubSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_hub_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as KnowledgeHubSettings;
    },
  });
};

export const useUpdateKnowledgeHubSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Omit<KnowledgeHubSettings, 'id' | 'updated_at' | 'updated_by'>>) => {
      const { data: settings } = await supabase
        .from('knowledge_hub_settings')
        .select('id')
        .single();

      if (!settings) throw new Error('Settings not found');

      const { error } = await supabase
        .from('knowledge_hub_settings')
        .update(updates)
        .eq('id', settings.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledgeHubSettings'] });
      toast.success('Settings updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update settings');
    },
  });
};
