import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface UnifiedUser {
  type: 'REQUEST' | 'MEMBER';
  id: string;
  name: string;
  email: string;
  organisation: any;
  status: string;
  createdAt: string;
  collectionIds: string[];
}

export function useUnifiedUsers() {
  return useQuery({
    queryKey: ["unifiedUsers"],
    queryFn: async () => {
      const response = await api.get("/admin/users");
      return response.data.data as UnifiedUser[];
    },
  });
}

export function useApproveJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, collectionIds }: { id: string; collectionIds: string[] }) => {
      const response = await api.post(`/admin/join-requests/${id}/approve`, { collectionIds });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unifiedUsers"] });
    },
  });
}

export function useRejectJoinRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/admin/join-requests/${id}/reject`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unifiedUsers"] });
    },
  });
}

export function useDeactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/admin/users/${id}/deactivate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unifiedUsers"] });
    },
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/admin/users/${id}/reactivate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unifiedUsers"] });
    },
  });
}

export interface Invite {
  id: string;
  email: string;
  organisationId: string;
  inviterId: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  collectionIds?: string[];
  inviter?: {
    id: string;
    name: string;
    email: string;
  };
}

export function useInvites() {
  return useQuery({
    queryKey: ["invites"],
    queryFn: async () => {
      const response = await api.get("/admin/invites");
      return response.data.data as Invite[];
    },
  });
}

export function useCreateInvites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { emails: string[]; collectionIds?: string[] }) => {
      const response = await api.post(`/admin/invites`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
    },
  });
}

export function useRevokeInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/admin/invites/${id}/revoke`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invites"] });
    },
  });
}

export function useResendInvite() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/admin/invites/${id}/resend`);
      return response.data;
    }
  });
}
