// src/lib/axios.ts
import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore } from '../stores/authStore';

const api = axios.create({
  baseURL: '/api',
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
  } catch (error) {
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

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const authStorage = localStorage.getItem('auth-storage');
  const { url } = config;

  // refresh 요청 자체는 제외
  if (url?.includes('/auth/refresh')) return config;

  if (authStorage) {
    const { state } = JSON.parse(authStorage);
    const token = state.token;

    if (token) {
      if (isTokenExpired(token)) {
        try {
          const newToken = await refreshToken();
          if (!newToken) throw new Error('Token refresh failed');
          useAuthStore.getState().setToken(newToken);
          config.headers.Authorization = `Bearer ${newToken}`;
        } catch (error) {
          return Promise.reject(error);
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }

  // FormData 내용 중 board 데이터만 로깅
  if (config.data instanceof FormData) {
    for (let [key, value] of config.data.entries()) {
      if (key === 'board') {
        const boardData = await (value as Blob).text();
        console.log('전송할 board 데이터:', JSON.parse(boardData));
      }
    }
  }

  // FormData 요청의 경우 Content-Type 헤더 처리
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        try {
          const newToken = await refreshToken();
          if (newToken && error.config) {
            useAuthStore.getState().setToken(newToken);
            const config = error.config as AxiosRequestConfig;
            if (config.headers) {
              config.headers.Authorization = `Bearer ${newToken}`;
            }
            return api(config);
          }
        } catch (refreshError) {
          console.error('토큰 갱신 실패:', refreshError);
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      }
      // 에러 발생 시에만 로깅
      console.error('API 에러:', {
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    return Promise.reject(error);
  }
);

export default api;
