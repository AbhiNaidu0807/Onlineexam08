import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Inject Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Ultra-Resilient Synchronization
api.interceptors.response.use(
  (response) => {
    // Mission Task: Ensure we return the most relevant data fragment
    // My backend uses { success: true, data: { ... } } or { success: true, ... }
    const payload = response.data;
    
    if (payload && payload.success) {
       // If data is wrapped in 'data' property, return it, else return whole payload
       return payload.data !== undefined ? payload.data : payload;
    }
    
    return payload;
  },
  (error) => {
    // Institutional Error Handling
    const data = error.response?.data;
    
    // Mission Task 5: Handle non-JSON or HTML errors gracefully
    const errorMessage = data?.message || data?.error || error.message || 'System Protocol Violation';
    
    console.error('[API EXCEPTION]:', {
       target: error.config?.url,
       message: errorMessage,
       status: error.response?.status
    });
    
    return Promise.reject({
       message: errorMessage,
       status: error.response?.status,
       data: data
    });
  }
);

export default api;
