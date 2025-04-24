// hooks/useAuth.js
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    // 초기 상태: localStorage에 저장된 토큰 불러오기
    return localStorage.getItem('token');
  });

  const login = (newToken) => {
    localStorage.setItem('token', newToken); // 토큰 저장
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token'); // 토큰 삭제
    setToken(null);
  };

  // 토큰이 변경될 때 동기화(선택 사항)
  useEffect(() => {
    if (!token) {
      localStorage.removeItem('token');
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
