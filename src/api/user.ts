import api from './axios';
import { UserProfileDto } from '../types/user';

export const userApi = {
  // 사용자 프로필 조회
  getUserProfile: (userId: number) =>
    api.get<UserProfileDto>(`/users/${userId}`),

  // 사용자 프로필 수정
  updateUserProfile: (userId: number, data: FormData) =>
    api.patch(`/users/${userId}/profile`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
}; 
