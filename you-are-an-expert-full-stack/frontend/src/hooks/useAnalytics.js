import { useQuery } from '@tanstack/react-query';
import api from '../api/axios.js';

export function useAnalytics() {
  return useQuery({ queryKey: ['analytics'], queryFn: async () => (await api.get('/api/analytics')).data });
}
