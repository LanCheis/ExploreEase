import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';

export function useUserInterests() {
  const userId = useAuthStore((s) => s.session?.user.id);

  return useQuery({
    queryKey: ['user_interests', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_interests')
        .select('interest')
        .eq('user_id', userId!);
      if (error) throw error;
      return (data ?? []).map((r) => r.interest as string);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
