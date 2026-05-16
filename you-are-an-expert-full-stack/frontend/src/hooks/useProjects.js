import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios.js';

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: async () => (await api.get('/api/projects')).data });
}

export function useProject(projectId) {
  return useQuery({
    queryKey: ['project', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => (await api.get(`/api/projects/${projectId}`)).data,
  });
}

export function useProjectMembers(projectId) {
  return useQuery({
    queryKey: ['project-members', projectId],
    enabled: Boolean(projectId),
    queryFn: async () => (await api.get(`/api/projects/${projectId}/members`)).data,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post('/api/projects', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
}

export function useAddProjectMember(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => api.post(`/api/projects/${projectId}/members`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
}

export function useRemoveProjectMember(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => api.delete(`/api/projects/${projectId}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['team'] });
    },
  });
}
