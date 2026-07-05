import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

// Jobs
export const jobsApi = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  queueEmail: (data) => api.post('/jobs/email', data),
  queueReport: (data) => api.post('/jobs/report', data),
};

// Logs
export const logsApi = {
  getAll: (params) => api.get('/logs', { params }),
  clear: (params) => api.delete('/logs/clear', { params }),
};

// Cache
export const cacheApi = {
  getStats: () => api.get('/cache/stats'),
  clear: () => api.delete('/cache/clear'),
};

// Health
export const healthApi = {
  check: () => axios.get('http://localhost:5000/health').then((r) => r.data),
};

export default api;
