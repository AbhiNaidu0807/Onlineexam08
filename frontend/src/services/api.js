import axios from 'axios';

// Dynamically resolve the API link for cross-device synchronization
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://onlineexam08.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Log outgoing request for terminal audit
  console.log(`[NETWORK] Outgoing request to: ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data && response.data.success === true) {
      return response.data.data;
    }
    return response.data;
  },
  (error) => {
    // Advanced error resolution for cross-device accessibility
    if (!error.response) {
      console.error('[NETWORK ERROR] Server unreachable. Current API Base:', API_BASE_URL);
      return Promise.reject({ 
        message: 'Master server unreachable. Please verify institutional network connection.',
        isNetworkError: true 
      });
    }

    if (error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response.data || { message: 'Intelligence Protocol Error' });
  }
);

export default api;
