import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useAuthStore } from '../stores/authStore';
import { userApi } from '../api/user';
import { UserProfileDto } from '../types/user';
import { format, isSameDay, parseISO } from 'date-fns';

interface Message {
  id: string;
  roomId: string;
  senderId: string;
  senderNickName: string;
  receiverId: string;
  content: string;
  type: 'TEXT';
  timestamp: string;
  isRead: boolean;
}

export const ChatPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<UserProfileDto | null>(null);
  const currentUser = useAuthStore((state) => state.user);
  const ws = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const fetchOtherUser = async () => {
      try {
        const response = await userApi.getUserProfile(Number(userId));
        setOtherUser(response.data);
      } catch (error) {
        console.error('사용자 정보 조회 실패:', error);
      }
    };

    if (userId) {
      fetchOtherUser();
    }
  }, [userId]);

  useEffect(() => {
    if (!token || !userId || !currentUser) return;

    // 토큰 만료 체크
    const isExpired = (token: string): boolean => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000;
        return Date.now() >= exp;
      } catch (error) {
        return true;
      }
    };

    if (isExpired(token)) {
      console.error('토큰이 만료되었습니다.');
      useAuthStore.getState().logout();
      window.location.href = '/login';
      return;
    }

    // 웹소켓 연결
    const socket = new WebSocket(
      `wss://api.gigsync.kr/ws/chat?token=${encodeURIComponent(
        token
      )}&receiverId=${userId}`
    );
    ws.current = socket;

    socket.onopen = () => {
      console.log('✅ WebSocket 연결 성공');
    };

    socket.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);
        let content = messageData.content;

        // content가 JSON 문자열인 경우 파싱
        try {
          if (typeof content === 'string' && content.startsWith('{')) {
            const parsedContent = JSON.parse(content);
            content = parsedContent.content || content;
          }
        } catch (e) {
          console.log('Content parsing failed:', e);
        }

        setMessages((prev) => [
          ...prev,
          {
            ...messageData,
            content,
          },
        ]);
      } catch (error) {
        console.error('메시지 파싱 실패:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('❌ WebSocket 오류:', error);
      // WebSocket 오류 발생 시 재연결 시도
      setTimeout(() => {
        if (ws.current?.readyState === WebSocket.CLOSED) {
          ws.current = new WebSocket(
            `wss://api.gigsync.kr/ws/chat?token=${encodeURIComponent(
              token
            )}&receiverId=${userId}`
          );
        }
      }, 5000);
    };

    socket.onclose = (event) => {
      console.log('❎ WebSocket 연결 종료:', event.code, event.reason);
      // 정상적인 종료가 아닌 경우 재연결 시도
      if (event.code !== 1000) {
        setTimeout(() => {
          if (ws.current?.readyState === WebSocket.CLOSED) {
            ws.current = new WebSocket(
              `wss://api.gigsync.kr/ws/chat?token=${encodeURIComponent(
                token
              )}&receiverId=${userId}`
            );
          }
        }, 5000);
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close(1000, 'Component unmounting');
      }
    };
  }, [token, userId, currentUser]);

  useEffect(() => {
    // 메시지가 추가될 때마다 스크롤을 아래로 이동
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !ws.current || !currentUser || !userId) return;

    const message = {
      content: newMessage,
    };

    // 메시지를 즉시 표시
    const tempMessage: Message = {
      id: Date.now().toString(), // 임시 ID
      roomId: '',
      senderId: currentUser.id.toString(),
      senderNickName: '나',
      receiverId: userId,
      content: newMessage,
      type: 'TEXT',
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setMessages((prev) => [...prev, tempMessage]);
    ws.current.send(JSON.stringify(message));
    setNewMessage('');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (!otherUser || !currentUser) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
        {/* 채팅 헤더 */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">{otherUser.nickName}님과의 대화</Typography>
        </Box>

        {/* 메시지 목록 */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column-reverse',
            bgcolor: '#f7f8fa',
          }}
        >
          <List sx={{ p: 0 }}>
            {messages.map((message, index) => {
              const isMine = message.senderId === currentUser.id.toString();
              const prevMsg = messages[index - 1];
              const showDate =
                index === 0 ||
                !isSameDay(
                  parseISO(message.timestamp),
                  parseISO(prevMsg?.timestamp || message.timestamp)
                );
              return (
                <React.Fragment key={message.id || index}>
                  {showDate && (
                    <ListItem sx={{ justifyContent: 'center', py: 1 }}>
                      <Box
                        sx={{
                          bgcolor: '#e0e3e8',
                          color: '#888',
                          borderRadius: 8,
                          px: 2.5,
                          py: 0.5,
                          fontSize: 13,
                          fontWeight: 500,
                          mx: 'auto',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                        }}
                      >
                        {format(
                          parseISO(message.timestamp),
                          'yyyy년 M월 d일 EEEE'
                        )}
                      </Box>
                    </ListItem>
                  )}
                  <ListItem
                    sx={{
                      display: 'flex',
                      flexDirection: isMine ? 'row-reverse' : 'row',
                      alignItems: 'flex-end',
                      border: 'none',
                      background: 'none',
                      px: 1,
                      py: 0.5,
                    }}
                  >
                    {!isMine && (
                      <ListItemAvatar sx={{ minWidth: 44, mr: 1 }}>
                        <Avatar
                          src={otherUser.profileImageUrl}
                          sx={{
                            width: 36,
                            height: 36,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          }}
                        />
                      </ListItemAvatar>
                    )}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMine ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                      }}
                    >
                      {!isMine && (
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: '#222',
                            fontWeight: 700,
                            mb: 0.5,
                            ml: 0.5,
                          }}
                        >
                          {message.senderNickName}
                        </Typography>
                      )}
                      <Box
                        sx={{
                          background: isMine
                            ? 'linear-gradient(135deg, #4f8cff 0%, #2355e6 100%)'
                            : '#f1f3f6',
                          color: isMine ? '#fff' : '#222',
                          borderRadius: 16,
                          px: 2,
                          py: 1.2,
                          fontSize: 16,
                          wordBreak: 'break-word',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                          minWidth: 0,
                          maxWidth: '100%',
                          fontWeight: 500,
                          letterSpacing: 0.01,
                        }}
                      >
                        {message.content}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#b0b6be',
                          mt: 0.5,
                          fontSize: 11,
                          textAlign: isMine ? 'right' : 'left',
                          pr: isMine ? 0.5 : 0,
                          pl: isMine ? 0 : 0.5,
                        }}
                      >
                        {format(parseISO(message.timestamp), 'a h:mm')}
                      </Typography>
                    </Box>
                  </ListItem>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </List>
        </Box>

        {/* 메시지 입력 */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              variant="outlined"
              size="small"
            />
            <IconButton
              color="primary"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
