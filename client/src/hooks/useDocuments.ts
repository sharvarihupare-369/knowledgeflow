import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Document } from '@/types';

export function useDocuments(collectionId?: string) {
  return useQuery({
    queryKey: ['documents', collectionId],
    queryFn: async () => {
      const url = collectionId ? `/documents?collectionId=${collectionId}` : '/documents';
      const { data } = await api.get(url);
      return data.data as Document[];
    },
    // Auto-poll every 5s if any document is still PROCESSING
    refetchInterval: (query) => {
      const docs = query.state.data as Document[] | undefined;
      return docs?.some((d) => d.status === 'PROCESSING') ? 5000 : false;
    },
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      const collectionId = variables.get('collectionId') as string | undefined;
      if (collectionId) {
        queryClient.invalidateQueries({ queryKey: ['documents', collectionId] });
        queryClient.invalidateQueries({ queryKey: ['collection', collectionId] });
      }
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/documents/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useReindexDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/documents/${id}/reindex`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
