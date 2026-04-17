import axios from 'axios';

// ULTIMATE NETWORK RESOLUTION ENGINE
const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // If we have an environment variable and it's not a placeholder, use it
  if (envUrl && envUrl !== 'http://localhost:5000/api' && envUrl.length > 0) {
    return envUrl;
  }
  
  // Hardcoded production fallback for the Eagle Exam Master Server
  return 'https://onlineexam08.onrender.com/api';
};

const API_BASE_URL = getApiBase();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s timeout to allow for Render "cold starts"
});

console.log(`[SYSTEM] Intelligence link established at: ${API_BASE_URL}`);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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
    // Audit logs for student device debugging
    console.error('[INSTITUTIONAL ERROR] Target:', error.config?.url);
    console.error('[INSTITUTIONAL ERROR] Base:', API_BASE_URL);
    
    if (!error.response) {
      // This is a zero-response error (DNS failure, CORS block, or Server Offline)
      return Promise.reject({ 
        message: 'Master server unreachable. Render instances may take 40s to wake up on first access.', 
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
