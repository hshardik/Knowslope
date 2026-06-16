import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SlackIncomingItem {
  id: string;
  slack_url: string;
  slack_channel_id: string | null;
  slack_channel_name: string | null;
  slack_message_ts: string | null;
  slack_thread_id: string | null;
  message_preview: string | null;
  sent_by_slack_user_id: string | null;
  sent_by_slack_user_name: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processed_document_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useIncomingItems() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['slack-incoming-items'],
    queryFn: async () => {
      // Using .from() with explicit any since table was just created
      const { data, error } = await (supabase as any)
        .from('slack_incoming_items')
        .select('*')
        .in('status', ['pending', 'processing'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SlackIncomingItem[];
    },
    enabled: !!user,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

export function useProcessIncomingItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      incomingItemId, 
      action, 
      docType, 
      category,
      existingDocumentId 
    }: { 
      incomingItemId: string; 
      action: 'create_doc' | 'log_bug' | 'create_how_to' | 'log_feature' | 'update_doc';
      docType?: string;
      category?: string;
      existingDocumentId?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('process-incoming-item', {
        body: {
          incomingItemId,
          action,
          docType,
          category,
          userId: user?.id,
          existingDocumentId,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['slack-incoming-items'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success(data.message || 'Document created successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to process item');
    },
  });
}

export function useDismissIncomingItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (incomingItemId: string) => {
      // Using explicit any since table was just created
      const { error } = await (supabase as any)
        .from('slack_incoming_items')
        .delete()
        .eq('id', incomingItemId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slack-incoming-items'] });
      toast.success('Item dismissed');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to dismiss item');
    },
  });
}
