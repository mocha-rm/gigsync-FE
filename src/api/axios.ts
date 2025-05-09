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
  const { url } = config;

  // refresh 요청 자체는 제외
  if (url?.includes('/auth/refresh')) return config;

  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      const token = parsed?.state?.token;

      if (token) {
        if (isTokenExpired(token)) {
          const newToken = await refreshToken();
          if (!newToken) throw new Error('Token refresh failed');
          useAuthStore.getState().setToken(newToken);
          config.headers.Authorization = `Bearer ${newToken}`;
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
  } catch (e) {
    console.warn('auth-storage 파싱 실패 또는 토큰 없음:', e);
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
      const originalRequest = error.config as AxiosRequestConfig;

      // 현재 accessToken이 없으면 refresh 시도도 하지 않음
      const authStorage = localStorage.getItem('auth-storage');
      const token = authStorage ? JSON.parse(authStorage)?.state?.token : null;

      if (error.response?.status === 401 && token) {
        try {
          const newToken = await refreshToken();
          if (newToken && originalRequest) {
            useAuthStore.getState().setToken(newToken);
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${newToken}`,
            };
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('토큰 갱신 실패:', refreshError);
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      }

      console.error('API 에러:', {
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
