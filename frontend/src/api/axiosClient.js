import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || 'Request failed';

      // Only redirect on 401 if it's an expired session on a protected route, NOT a failed login attempt
      const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      if (status === 401 && !isAuthRequest && window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (status === 403) {
        console.error('Access denied:', message);
      }

      const customError = new Error(message);
      customError.status = status;
      customError.message = message;
      customError.response = error.response;
      return Promise.reject(customError);
    } else if (error.request) {
      const netError = new Error('Network error. Check connection.');
      netError.status = 0;
      return Promise.reject(netError);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;