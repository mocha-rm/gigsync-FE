import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import { useAuthStore } from '../stores/authStore';

// 로그를 localStorage에 저장하는 기능
const debugLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    message,
    data: data || null,
  };

  // 기존 로그 가져오기
  const existingLogs = JSON.parse(localStorage.getItem('debug-logs') || '[]');
  // 최대 100개 로그만 유지 (메모리 부담 방지)
  if (existingLogs.length > 100) existingLogs.shift();
  // 새 로그 추가
  existingLogs.push(logEntry);
  // 로그 저장
  localStorage.setItem('debug-logs', JSON.stringify(existingLogs));

  // 콘솔에도 출력
  if (data) {
    console.log(`${timestamp}: ${message}`, data);
  } else {
    console.log(`${timestamp}: ${message}`);
  }
};

// 로그 보기 기능 (콘솔에서 호출 가능)
window.viewDebugLogs = () => {
  const logs = JSON.parse(localStorage.getItem('debug-logs') || '[]');
  console.table(logs);
  return logs;
};

// 로그 초기화 기능
window.clearDebugLogs = () => {
  localStorage.removeItem('debug-logs');
  console.log('Debug logs cleared');
};

// 토큰 리프레시 중인지 추적하는 플래그
let isRefreshing = false;
// 토큰 갱신을 기다리는 요청들의 큐
let refreshSubscribers: ((token: string) => void)[] = [];

// 토큰이 갱신되면 대기 중인 요청들을 처리
const onRefreshed = (token: string) => {
  debugLog('토큰 갱신 완료 - 대기 요청 처리', {
    subscribers: refreshSubscribers.length,
  });
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// 리프레시 대기열에 콜백 추가
const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
  debugLog('리프레시 대기열에 요청 추가', {
    queueSize: refreshSubscribers.length,
  });
};

const api = axios.create({
  baseURL:
    'http://ec2-15-164-163-181.ap-northeast-2.compute.amazonaws.com:8080/api',
  //'http://localhost:8080/api',
  withCredentials: true,
});

const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    const now = Date.now();
    const timeLeft = exp - now;

    debugLog('토큰 만료 확인', {
      tokenExp: new Date(exp).toISOString(),
      now: new Date(now).toISOString(),
      timeLeft: `${timeLeft}ms (${Math.round(timeLeft / 1000)}초)`,
    });

    // 만료 30초 전에 갱신하도록 여유 시간 추가 (10초보다 넉넉하게)
    return timeLeft < 30000;
  } catch (error) {
    debugLog('토큰 검증 오류', error);
    return true;
  }
};

// 토큰 갱신을 위한 별도의 axios 인스턴스
const refreshApi = axios.create({
  baseURL:
    'http://ec2-15-164-163-181.ap-northeast-2.compute.amazonaws.com:8080/api',
  //'http://localhost:8080/api',
  withCredentials: true,
});

const refreshToken = async (): Promise<string | null> => {
  try {
    debugLog('토큰 갱신 요청 시작');

    const response = await refreshApi.post('/auth/refresh');
    debugLog('토큰 갱신 응답 성공', {
      status: response.status,
      hasToken: !!response.data?.accessToken,
    });

    if (response.data && response.data.accessToken) {
      return response.data.accessToken;
    } else {
      debugLog('응답에 accessToken이 없음', response.data);
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      debugLog('토큰 갱신 API 오류', {
        status: error.response?.status,
        data: error.response?.data,
      });

      // 로그아웃 처리에 타임아웃 적용
      if (error.response?.status === 401) {
        toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
        // 타임아웃 증가 (500ms로 충분한 시간 제공)
        setTimeout(() => {
          debugLog('401 오류로 인한 로그아웃 처리');
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }, 500);
      } else {
        toast.error(
          `토큰 갱신 중 오류가 발생했습니다: ${
            error.response?.status || '네트워크 오류'
          }`
        );
      }
    } else {
      debugLog('토큰 갱신 중 알 수 없는 오류', error);
      toast.error('토큰 갱신 중 알 수 없는 오류가 발생했습니다.');
    }
    return null;
  }
};

// 로그인 관련 URL 목록
const AUTH_URLS = ['/auth/login', '/auth/register', '/auth/refresh'];

// Request 인터셉터
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  // 로그인 관련 요청은 토큰 검사 제외
  if (
    config.url &&
    AUTH_URLS.some((authUrl) => config.url?.includes(authUrl))
  ) {
    debugLog(`인증 관련 API 호출 - 토큰 검사 생략`, { url: config.url });
    return config;
  }

  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) {
      debugLog('인증 정보 없음 - 토큰 검사 생략');
      return config;
    }

    const parsed = JSON.parse(authStorage);
    const token = parsed?.state?.token;

    if (!token) {
      debugLog('토큰 없음 - 토큰 검사 생략');
      return config;
    }

    debugLog('토큰 확인', { url: config.url });

    // 토큰이 만료되었거나 곧 만료될 예정인 경우
    if (isTokenExpired(token)) {
      debugLog('토큰 만료(예정) - 갱신 프로세스 시작', { url: config.url });

      // 이미 리프레시가 진행 중이 아닌 경우에만 토큰 갱신 시도
      if (!isRefreshing) {
        debugLog('새로운 토큰 갱신 프로세스 시작');
        isRefreshing = true;

        try {
          const newToken = await refreshToken();

          if (newToken) {
            debugLog('토큰 갱신 성공 - 새 토큰 설정');
            // 토큰 저장
            useAuthStore.getState().setToken(newToken);
            // 헤더 설정
            config.headers.Authorization = `Bearer ${newToken}`;
            // 대기 중인 요청 처리
            onRefreshed(newToken);
          } else {
            debugLog('토큰 갱신 실패 - 빈 응답');
            // 실패했지만 기존 토큰 사용 시도
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (refreshError) {
          debugLog('토큰 갱신 중 예외 발생', refreshError);
          // 오류 발생해도 기존 토큰 사용 시도
          config.headers.Authorization = `Bearer ${token}`;
        } finally {
          isRefreshing = false;
        }
      } else {
        debugLog('이미 토큰 갱신 중 - 요청 대기열에 추가', { url: config.url });
        // 리프레시가 진행 중이면 현재 요청을 대기시킴
        return new Promise<InternalAxiosRequestConfig>((resolve) => {
          addRefreshSubscriber((token) => {
            debugLog('대기열 요청 처리 - 새 토큰으로 요청 진행', {
              url: config.url,
            });
            config.headers.Authorization = `Bearer ${token}`;
            resolve(config);
          });
        });
      }
    } else {
      debugLog('유효한 토큰 - 인증 헤더 설정', { url: config.url });
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    debugLog('인증 정보 처리 오류', e);
  }

  // FormData 내용 중 board 데이터만 로깅
  if (config.data instanceof FormData) {
    for (let [key, value] of config.data.entries()) {
      if (key === 'board') {
        try {
          const boardData = await (value as Blob).text();
          const parsedData = JSON.parse(boardData);
          debugLog('전송할 board 데이터', parsedData);
        } catch (err) {
          debugLog('board 데이터 파싱 실패', err);
        }
      }
    }
  }

  // FormData 요청의 경우 Content-Type 헤더 처리
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

// Response 인터셉터
api.interceptors.response.use(
  (response) => {
    debugLog('API 응답 성공', {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  async (error) => {
    if (!axios.isAxiosError(error)) {
      debugLog('알 수 없는 API 오류', error);
      return Promise.reject(error);
    }

    debugLog('API 오류 발생', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
    });

    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    // 인증 관련 요청에서 오류가 발생하면 재시도하지 않음
    if (
      originalRequest.url &&
      AUTH_URLS.some((authUrl) => originalRequest.url?.includes(authUrl))
    ) {
      debugLog(`인증 관련 API 오류 - 재시도 안함`, {
        url: originalRequest.url,
      });
      return Promise.reject(error);
    }

    // 이미 재시도한 요청은 다시 시도하지 않음
    if (originalRequest._retry) {
      debugLog('이미 재시도한 요청 - 재시도 안함', {
        url: originalRequest.url,
      });
      return Promise.reject(error);
    }

    // 401 오류가 아니면 재시도하지 않음
    if (error.response?.status !== 401) {
      debugLog(`401 아닌 오류 - 재시도 안함`, {
        status: error.response?.status,
        url: originalRequest.url,
      });
      return Promise.reject(error);
    }

    debugLog('401 오류 발생 - 토큰 갱신 시도 결정', {
      url: originalRequest.url,
    });

    // 현재 accessToken이 없으면 refresh 시도도 하지 않음
    const authStorage = localStorage.getItem('auth-storage');
    if (!authStorage) {
      debugLog('인증 정보 없음 - 재시도 안함');
      return Promise.reject(error);
    }

    let parsed;
    try {
      parsed = JSON.parse(authStorage);
    } catch (e) {
      debugLog('인증 정보 파싱 실패', e);
      return Promise.reject(error);
    }

    const token = parsed?.state?.token;
    if (!token) {
      debugLog('토큰 없음 - 재시도 안함');
      return Promise.reject(error);
    }

    debugLog('토큰 갱신 후 재시도 준비', { url: originalRequest.url });
    originalRequest._retry = true;

    if (!isRefreshing) {
      debugLog('토큰 갱신 시작 (응답 인터셉터에서)');
      isRefreshing = true;

      try {
        const newToken = await refreshToken();

        if (newToken) {
          debugLog('토큰 갱신 성공 - 요청 재시도', {
            url: originalRequest.url,
          });
          useAuthStore.getState().setToken(newToken);

          // 대기 중인 요청들에게 새 토큰 전달
          onRefreshed(newToken);

          // 현재 요청 재시도 준비
          if (!originalRequest.headers) {
            originalRequest.headers = {};
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          debugLog('갱신된 토큰으로 요청 재시도', { url: originalRequest.url });
          return api(originalRequest);
        } else {
          debugLog('토큰 갱신 실패 - 재시도 불가', {
            url: originalRequest.url,
          });
        }
      } catch (refreshError) {
        debugLog('토큰 갱신 중 예외 발생', refreshError);
      } finally {
        isRefreshing = false;
      }
    } else {
      debugLog('이미 토큰 갱신 중 - 대기열에 추가', {
        url: originalRequest.url,
      });
      // 이미 토큰 갱신 중이면 대기열에 추가
      return new Promise((resolve, reject) => {
        addRefreshSubscriber((token) => {
          debugLog('대기열 요청 처리 - 새 토큰으로 요청 재시도', {
            url: originalRequest.url,
          });
          if (!originalRequest.headers) {
            originalRequest.headers = {};
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;

          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

// 전역 객체에 디버그 기능 추가 (타입스크립트 인터페이스)
declare global {
  interface Window {
    viewDebugLogs: () => any[];
    clearDebugLogs: () => void;
    debugApi: {
      getAuthState: () => any;
      getToken: () => string | null;
      checkToken: (token?: string) => boolean;
    };
  }
}

// 추가 디버깅 도구
window.debugApi = {
  getAuthState: () => {
    try {
      const storage = localStorage.getItem('auth-storage');
      return storage ? JSON.parse(storage)?.state : null;
    } catch (e) {
      console.error('인증 상태 파싱 오류:', e);
      return null;
    }
  },
  getToken: () => {
    try {
      const storage = localStorage.getItem('auth-storage');
      return storage ? JSON.parse(storage)?.state?.token : null;
    } catch (e) {
      console.error('토큰 가져오기 오류:', e);
      return null;
    }
  },
  checkToken: (token) => {
    const tokenToCheck = token || window.debugApi.getToken();
    if (!tokenToCheck) return false;
    return !isTokenExpired(tokenToCheck);
  },
};

// 초기 로그
debugLog('API 클라이언트 초기화 완료');

export default api;
