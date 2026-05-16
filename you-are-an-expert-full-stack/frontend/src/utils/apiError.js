import { API_BASE_URL } from '../api/axios.js';

export function apiErrorMessage(error, fallback) {
  if (error.response?.data?.detail) return error.response.data.detail;
  if (error.request) return `Cannot reach the backend API at ${API_BASE_URL}. Check the frontend VITE_API_URL variable and backend CORS_ORIGINS.`;
  return fallback;
}
