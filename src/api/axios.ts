import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true, // 쿠키를 자동으로 전송
});

// 토큰 만료 체크 함수
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // JWT exp는 초 단위이므로 밀리초로 변환
    return Date.now() >= exp;
  } catch (error) {
    return true;
  }
};

// 토큰 갱신 함수
const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await api.post('/api/auth/refresh');
    return response.data.accessToken;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Refresh Token이 유효하지 않은 경우
      toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
      useAuthStore.getState().logout();
      window.location.href = '/login';
    } else {
      toast.error('토큰 갱신 중 오류가 발생했습니다.');
    }
    return null;
  }
};

api.interceptors.request.use(async (config) => {
  const authStorage = localStorage.getItem('auth-storage');
  if (authStorage) {
    const { state } = JSON.parse(authStorage);
    if (state.token) {
      // 토큰 만료 체크
      if (isTokenExpired(state.token)) {
        const newToken = await refreshToken();
        if (newToken) {
          useAuthStore.getState().setToken(newToken);
          config.headers.Authorization = `Bearer ${newToken}`;
        } else {
          return Promise.reject('Token refresh failed');
        }
      } else {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // 보호된 경로에 대해서만 로그인 페이지로 리다이렉트
      const protectedPaths = ['/profile', '/admin', '/boards/create', '/chat'];
      const currentPath = window.location.pathname;
      
      if (protectedPaths.some(path => currentPath.startsWith(path))) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || '오류가 발생했습니다.';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api; 
