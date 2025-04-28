export interface User {
  id: number;
  email: string;
  nickName: string;
  role: 'ADMIN' | 'NORMAL';
  profileImageUrl?: string;
  accessToken?: string;
  exp?: string;
}

export interface UserProfileDto {
  id: number;
  email: string;
  nickName: string;
  profileImageUrl?: string;
  bio?: string;
  interestedGenres?: string[];
  instruments?: string[];
  createdAt: string;
  modifiedAt: string;
} 
