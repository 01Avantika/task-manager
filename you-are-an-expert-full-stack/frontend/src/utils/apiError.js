export function apiErrorMessage(error, fallback) {
  if (error.response?.data?.detail) return error.response.data.detail;
  if (error.request) return 'Cannot reach the backend API. Make sure FastAPI is running on http://localhost:8000.';
  return fallback;
}
