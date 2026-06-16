import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'publisher' | 'member';

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      const roles = data.map(r => r.role as UserRole);
      
      // Return highest privilege role
      if (roles.includes('admin')) return 'admin';
      if (roles.includes('publisher')) return 'publisher';
      return 'member';
    },
    enabled: !!user,
  });
};

export const useIsWhitelisted = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['isWhitelisted', user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase.rpc('is_whitelisted', {
        _user_id: user.id,
      });

      if (error) throw error;
      return data as boolean;
    },
    enabled: !!user,
  });
};
