import api from './axios';
import { UserProfileDto, User } from '../types/user';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const userApi = {
  // 사용자 프로필 조회
  getUserProfile: (userId: number) =>
    api.get<UserProfileDto>(`/users/${userId}`),

  // 사용자 프로필 수정
  updateUserProfile: (userId: number, data: FormData) =>
    api.put(`/users/${userId}`, data),

  getAllUsers: (page: number = 0, size: number = 10) =>
    api.get<PageResponse<User>>('/users', {
      params: {
        page,
        size,
      },
    }),
}; 
