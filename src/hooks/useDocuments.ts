import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type DocCategory = 'product' | 'engineering' | 'support' | 'sales' | 'marketing' | 'operations';
export type DocType = 'bug' | 'feature' | 'how_to' | 'troubleshooting' | 'faq' | 'policy';
export type DocStatus = 'draft' | 'published';
export type DocVisibility = 'private' | 'team';

export interface Document {
  id: string;
  title: string;
  summary: string | null;
  content: any;
  category: DocCategory;
  type: DocType;
  status: DocStatus;
  creator_id: string;
  visibility: DocVisibility;
  tags: string[] | null;
  screenshots: string[] | null;
  slack_url: string | null;
  slack_channel_name: string | null;
  slack_channel_id: string | null;
  slack_thread_id: string | null;
  slack_message_ts: string | null;
  created_from_slack: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  published_by: string | null;
  creator?: {
    email: string;
    full_name: string | null;
  };
  publisher?: {
    email: string;
    full_name: string | null;
  };
}

export const useDocuments = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data: docs, error } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Fetch creator and publisher profiles
      const creatorIds = [...new Set(docs.map(d => d.creator_id))];
      const publisherIds = [...new Set(docs.map(d => d.published_by).filter(Boolean))];
      const allUserIds = [...new Set([...creatorIds, ...publisherIds])];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', allUserIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]));

      return docs.map(doc => ({
        ...doc,
        creator: profileMap.get(doc.creator_id),
        publisher: doc.published_by ? profileMap.get(doc.published_by) : undefined,
      })) as Document[];
    },
    enabled: !!user,
  });
};

export const useDocument = (id: string) => {
  return useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const { data: doc, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Fetch creator and publisher profiles
      const userIds = [doc.creator_id, doc.published_by].filter(Boolean);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]));

      return {
        ...doc,
        creator: profileMap.get(doc.creator_id),
        publisher: doc.published_by ? profileMap.get(doc.published_by) : undefined,
      } as Document;
    },
  });
};

export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (document: Omit<Partial<Document>, 'creator_id' | 'id' | 'created_at' | 'updated_at' | 'published_at' | 'published_by' | 'creator' | 'publisher'>) => {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: document.title!,
          summary: document.summary,
          content: document.content,
          category: document.category!,
          type: document.type!,
          status: document.status || 'draft',
          visibility: document.visibility || 'private',
          tags: document.tags,
          screenshots: document.screenshots,
          slack_url: document.slack_url,
          creator_id: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document created');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create document');
    },
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, creator, publisher, creator_id, published_by, created_at, updated_at, published_at, ...updates }: Partial<Document> & { id: string }) => {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', variables.id] });
      toast.success('Document updated');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update document');
    },
  });
};

export const usePublishDocument = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      // Check if user is whitelisted
      const { data: isWhitelisted, error: whitelistError } = await supabase.rpc('is_whitelisted', {
        _user_id: user!.id,
      });

      if (whitelistError) throw whitelistError;

      if (!isWhitelisted) {
        throw new Error('You are not authorized to publish documents');
      }

      const { data, error } = await supabase
        .from('documents')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          published_by: user!.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      toast.success('Document published successfully');
    },
    onError: (error: any) => {
      if (error.message === 'You are not authorized to publish documents') {
        toast.error('You can\'t publish yet. Please ask a KnowSlope publisher to review this document.');
      } else {
        toast.error(error.message || 'Failed to publish document');
      }
    },
  });
};

export const useUnpublishDocument = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      // Check if user is whitelisted
      const { data: isWhitelisted, error: whitelistError } = await supabase.rpc('is_whitelisted', {
        _user_id: user!.id,
      });

      if (whitelistError) throw whitelistError;

      if (!isWhitelisted) {
        throw new Error('You are not authorized to unpublish documents');
      }

      const { data, error } = await supabase
        .from('documents')
        .update({
          status: 'draft',
          published_at: null,
          published_by: null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      toast.success('Document unpublished and returned to draft');
    },
    onError: (error: any) => {
      if (error.message === 'You are not authorized to unpublish documents') {
        toast.error('You are not authorized to unpublish documents');
      } else {
        toast.error(error.message || 'Failed to unpublish document');
      }
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete document');
    },
  });
};
