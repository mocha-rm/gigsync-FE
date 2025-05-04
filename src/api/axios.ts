// src/lib/axios.ts
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  withCredentials: true,
});

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() >= exp;
  } catch {
    return true;
  }
};

const refreshToken = async (): Promise<string | null> => {
  try {
    const response = await api.post('/auth/refresh');
    return response.data.accessToken;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
    } else {
      toast.error('토큰 갱신 중 오류가 발생했습니다.');
    }
    useAuthStore.getState().logout();
    window.location.href = '/login';
    return null;
  }
};

api.interceptors.request.use(async (config) => {
  const authStorage = localStorage.getItem('auth-storage');
  const { url } = config;

  // refresh 요청 자체는 제외
  if (url?.includes('/auth/refresh')) return config;

  if (authStorage) {
    const { state } = JSON.parse(authStorage);
    const token = state.token;

    if (token) {
      if (isTokenExpired(token)) {
        const newToken = await refreshToken();
        if (!newToken) return Promise.reject('Token refresh failed');
        useAuthStore.getState().setToken(newToken);
        config.headers.Authorization = `Bearer ${newToken}`;
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
      const message = error.response?.data?.message || '오류가 발생했습니다.';
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default api;