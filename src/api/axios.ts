import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem('auth-storage');
  if (authStorage) {
    const { state } = JSON.parse(authStorage);
    if (state.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 보호된 경로에 대해서만 로그인 페이지로 리다이렉트
      const protectedPaths = ['/profile', '/admin', '/boards/create', '/chat'];
      const currentPath = window.location.pathname;
      
      if (protectedPaths.some(path => currentPath.startsWith(path))) {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || '오류가 발생했습니다.';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api; 
