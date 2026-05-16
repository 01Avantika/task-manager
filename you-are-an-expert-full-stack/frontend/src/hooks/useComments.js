import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios.js';

export function useComments(taskId) {
  return useQuery({
    queryKey: ['comments', taskId],
    enabled: Boolean(taskId),
    queryFn: async () => (await api.get(`/api/tasks/${taskId}/comments`)).data,
  });
}

export function useCreateComment(taskId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post(`/api/tasks/${taskId}/comments`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', taskId] }),
  });
}

export function useDeleteComment(taskId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId) => api.delete(`/api/comments/${commentId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', taskId] }),
  });
}
