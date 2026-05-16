import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios.js';

export function useAllTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => (await api.get('/api/tasks')).data,
  });
}

export function useTasks(projectId) {
  return useQuery({
    queryKey: ['tasks', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => (await api.get(`/api/projects/${projectId}/tasks`)).data,
  });
}

export function useTask(taskId) {
  return useQuery({
    queryKey: ['task', taskId],
    enabled: Boolean(taskId),
    queryFn: async () => (await api.get(`/api/tasks/${taskId}`)).data,
  });
}

export function useCreateTask(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post(`/api/projects/${projectId}/tasks`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useUpdateTask(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, payload }) => api.put(`/api/tasks/${taskId}`, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useDeleteTask(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId) => api.delete(`/api/tasks/${taskId}`),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.removeQueries({ queryKey: ['task', taskId] });
    },
  });
}
