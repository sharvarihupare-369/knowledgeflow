import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { User } from '@/types';

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await api.get('/auth/user-details');
      return data.data as User;
    },
    retry: false,
  });
}
