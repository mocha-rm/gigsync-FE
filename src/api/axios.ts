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
    const response = await api.post('/auth/refresh');
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

// 인증이 필요한 API 경로 목록
const protectedPaths = [
  '/admin',
  '/boards/create',
  '/chat',
  '/chat/rooms',    // 채팅방 목록 조회
  '/chat/room',     // 채팅방 생성/조회
  '/users/profile',  // 사용자 프로필 수정
  '/users/admin',    // 관리자 관련 API
  '/users/[0-9]' // 사용자 프로필 조회 (숫자 ID)
];

// 인증이 필요하지만 토큰 갱신이 실패해도 리다이렉트하지 않는 경로
const softProtectedPaths = [
  '/users'          // 사용자 목록 조회
];

api.interceptors.request.use(async (config) => {
  // 인증이 필요한 API인지 확인
  const isProtectedPath = protectedPaths.some(path => {
    const regex = new RegExp('^' + path.replace('[0-9]+', '\\d+') + '$');
    return config.url?.match(regex);
  });
  const isSoftProtectedPath = softProtectedPaths.some(path => config.url?.includes(path));
  
  if (isProtectedPath || isSoftProtectedPath) {
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
          } else if (isProtectedPath) {
            // 보호된 경로인 경우에만 리다이렉트
            return Promise.reject('Token refresh failed');
          }
        } else {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } else {
        // 토큰이 없는 경우
        if (isProtectedPath) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject('No token available');
        }
      }
    } else {
      // auth-storage가 없는 경우
      if (isProtectedPath) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject('No auth storage available');
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
      const currentPath = window.location.pathname;
      
      if (protectedPaths.some(path => {
        const regex = new RegExp('^' + path.replace('[0-9]+', '\\d+') + '$');
        return currentPath.match(regex);
      })) {
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
