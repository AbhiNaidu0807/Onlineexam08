import axios from 'axios';

/**
 * MISSION: FIX NETWORK ERROR
 * Priority: 1. VITE_API_URL (Set in Vercel/Render Dashboard)
 *           2. Hardcoded Production URL (Backup)
 *           3. Localhost (Development)
 */
export const API_BASE = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://onlineexam08.onrender.com/api' 
    : 'http://localhost:5000/api');

console.log('[SYSTEM]: API Base Synchronized to:', API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000 // 15 seconds to allow Render cold start
});

// Request Interceptor: Inject Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response Interceptor: Handle Success and Errors
api.interceptors.response.use(
  (response) => {
    // Return the data directly if it exists, otherwise the response
    const data = response.data;
    // Standardize response payload (if backend returns {success: true, data: ...})
    if (data && data.success && data.data !== undefined) {
      return data.data;
    }
    return data;
  },
  async (error) => {
    const { config, message, response } = error;
    
    // STEP 5: HANDLE RENDER SLEEP / COLD START
    // If it's a network error or timeout, retry once after a delay
    if ((message === 'Network Error' || error.code === 'ECONNABORTED') && !config._retry) {
      config._retry = true;
      console.warn('[SYSTEM]: Network Error detected. Initiating auto-retry... (The server may be waking up)');
      
      // Delay retry by 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      return api.request(config);
    }

    // STEP 6: DETAILED ERROR LOGGING
    let errorMessage = 'Protocol Error';
    
    if (message === 'Network Error') {
      errorMessage = 'NETWORK ERROR: Server is unreachable. Please wait 30 seconds for server wakeup and try again.';
    } else if (response) {
      // Server responded with an error
      errorMessage = response.data?.message || response.data?.error || message || `Status: ${response.status}`;
    } else {
      errorMessage = message;
    }

    console.error('--- API EXCEPTION ---');
    console.error('TARGET URL:', config?.url);
    console.error('ERROR MESSAGE:', errorMessage);
    if (response?.data) console.error('ERROR DATA:', response.data);
    console.error('----------------------');

    return Promise.reject({
      message: errorMessage,
      details: response?.data,
      status: response?.status,
      isNetworkError: message === 'Network Error'
    });
  }
);

export default api;
