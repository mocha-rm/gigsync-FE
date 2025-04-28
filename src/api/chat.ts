import api from './axios';
import { ChatMessageResponseDto, ChatRoomResponseDto } from '../types/chat';

export const chatApi = {
  // 채팅방 메시지 목록 조회
  getRoomMessages: (roomId: string) =>
    api.get<ChatMessageResponseDto[]>(`/chat/rooms/${roomId}/messages`),

  // 내 채팅방 목록 조회
  getMyRooms: () =>
    api.get<ChatRoomResponseDto[]>('/chat/rooms'),

  markMessagesAsRead: (roomId: string) => {
    return api.put(`/chat/rooms/${roomId}/read`);
  },

  incrementUnreadCount: (roomId: string, userId: string) => {
    return api.put(`/chat/rooms/${roomId}/unread`, { userId });
  }
}; 
