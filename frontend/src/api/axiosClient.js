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

      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (status === 403) {
        console.error('Access denied:', message);
      }

      return Promise.reject({ status, message, timestamp: data?.timestamp });
    } else if (error.request) {
      return Promise.reject({ status: 0, message: 'Network error. Check connection.' });
    }
    return Promise.reject({ status: -1, message: 'Unexpected error' });
  }
);

export default axiosClient;