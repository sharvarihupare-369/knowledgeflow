import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Conversation {
  id: string;
  title: string;
  collectionId: string;
  createdAt: string;
  updatedAt: string;
  messages?: { role: 'USER' | 'ASSISTANT'; content: string }[];
}

export function useConversations(collectionId?: string) {
  return useQuery({
    queryKey: ['conversations', collectionId],
    queryFn: async () => {
      if (!collectionId) return [];
      const { data } = await api.get(`/chat/conversations?collectionId=${collectionId}`);
      return (data.data ?? []) as Conversation[];
    },
    enabled: !!collectionId,
  });
}

export function useConversationMessages(conversationId?: string) {
  return useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data } = await api.get(`/chat/conversations/${conversationId}/messages`);
      return data as { role: 'USER' | 'ASSISTANT'; content: string }[];
    },
    enabled: !!conversationId,
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/chat/conversations/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
