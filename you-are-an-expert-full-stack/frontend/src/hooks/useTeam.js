import { useQuery } from '@tanstack/react-query';
import api from '../api/axios.js';

export function useTeam(projectId) {
  return useQuery({
    queryKey: ['team', projectId || 'default'],
    queryFn: async () => {
      const params = projectId ? { project_id: projectId } : {};
      return (await api.get('/api/team', { params })).data;
    },
  });
}
