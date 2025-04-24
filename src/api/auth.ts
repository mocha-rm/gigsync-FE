import api from './axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  nickName: string;
}

export const authApi = {
  login: (data: LoginRequest) => 
    api.post('/login', data),
  
  signup: (data: SignupRequest) => 
    api.post('/signup', data),
    
  adminSignup: (data: SignupRequest) =>
    api.post('/signup/admin', data),
    
  logout: () => 
    api.post('/logout'),
}; 
