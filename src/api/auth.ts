import api from './axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  nickName: string;
  phoneNumber: string;
  verificationCode: string;
}

export interface EmailVerificationRequest {
  email: string;
}

export interface FindEmailRequest {
  phoneNumber: string;
}

export interface ResetPasswordRequest {
  email: string;
  verificationCode: string;
  password: string;
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

  sendVerificationCode: (data: EmailVerificationRequest) =>
    api.post('/verifyEmail', data),

  findEmail: (data: FindEmailRequest) =>
    api.post('/auth/findEmail', data),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post('/auth/resetPassword', data),
}; 
