import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

function normalizeIds(value) {
  if (Array.isArray(value)) return value.map(normalizeIds);
  if (value && typeof value === 'object') {
    const normalized = {};
    for (const [key, child] of Object.entries(value)) {
      normalized[key === '_id' ? 'id' : key] = normalizeIds(child);
    }
    return normalized;
  }
  return value;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (response) => {
    response.data = normalizeIds(response.data);
    return response;
  },
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw error;
      refreshing =
        refreshing ||
        api.post('/api/auth/refresh', { refresh_token: refreshToken }).finally(() => {
          refreshing = null;
        });
      const { data } = await refreshing;
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      original.headers.Authorization = `Bearer ${data.access_token}`;
      return api(original);
    }
    throw error;
  },
);

export default api;
