export interface ChatMessageResponseDto {
  id: string;
  roomId: string;
  senderId: string;
  receiverId: string;
  senderNickName: string;
  content: string;
  createdAt: string;
  type: 'TEXT';
  isRead: boolean;
}

export interface ChatRoomResponseDto {
  roomId: string;
  otherUserId: number;
  otherUserNickName: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface ChatMessageRequestDto {
  content: string;
} 
