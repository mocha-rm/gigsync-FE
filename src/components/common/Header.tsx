import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Add as AddIcon, Chat as ChatIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { BoardType } from '../../types/board';
import { chatApi } from '../../api/chat';
import { ChatRoomResponseDto } from '../../types/chat';

export const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [boardMenuAnchorEl, setBoardMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [chatRooms, setChatRooms] = useState<ChatRoomResponseDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchChatRooms();
    }
  }, [user]);

  const fetchChatRooms = async () => {
    try {
      const response = await chatApi.getMyRooms();
      const rooms = response.data.map(room => ({
        ...room,
        lastMessage: parseMessageContent(room.lastMessage)
      }));
      setChatRooms(rooms);
      const totalUnread = rooms.reduce((sum, room) => sum + room.unreadCount, 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('채팅방 목록 조회 실패:', error);
    }
  };

  const parseMessageContent = (content: string | undefined) => {
    if (!content) return '';
    try {
      if (content.startsWith('{')) {
        const parsed = JSON.parse(content);
        return parsed.content || content;
      }
      return content;
    } catch (e) {
      return content;
    }
  };

  const handleChatClick = () => {
    if (!user) {
      toast.info('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }
    setChatDrawerOpen(true);
  };

  const handleChatRoomClick = (roomId: string, otherUserId: number) => {
    navigate(`/chat/${otherUserId}`);
    setChatDrawerOpen(false);
    
    setTimeout(() => {
      fetchChatRooms();
    }, 1000);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBoardMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setBoardMenuAnchorEl(event.currentTarget);
  };

  const handleBoardMenuClose = () => {
    setBoardMenuAnchorEl(null);
  };

  const handleCreatePost = () => {
    if (!user) {
      toast.info('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }
    navigate('/boards/create');
  };

  const handleBoardTypeClick = (boardType: BoardType) => {
    navigate(`/boards?type=${boardType}`);
    handleBoardMenuClose();
  };

  const handleProfileClick = () => {
    if (user) {
      navigate(`/profile/${user.id}`);
    }
    handleMenuClose();
  };

  const handleHomeClick = () => {
    navigate('/');
    
    setTimeout(() => {
      fetchChatRooms();
    }, 1000);
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        borderRadius: 0,
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}
    >
      <Container 
        maxWidth="lg" 
        sx={{ 
          px: { xs: 2, sm: 3, md: 4 },
          py: 1
        }}
      >
        <Toolbar sx={{ px: 0 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            onClick={handleHomeClick}
            sx={{ 
              flexGrow: 0, 
              textDecoration: 'none', 
              color: 'inherit', 
              mr: 4,
              fontFamily: '"Bebas Neue", "Anton", sans-serif',
              letterSpacing: '1px',
              '&:hover': {
                color: 'inherit',
                textDecoration: 'none'
              }
            }}
          >
            GigSync
          </Typography>
          
          <Box sx={{ display: 'flex', flexGrow: 1 }}>
            <Button
              component={RouterLink}
              to="/boards"
              sx={{ 
                mr: 2,
                color: 'inherit',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  backgroundColor: 'transparent',
                  color: 'inherit'
                }
              }}
            >
              전체 게시글
            </Button>
            <Button
              onClick={handleBoardMenuOpen}
              sx={{ 
                mr: 2,
                color: 'inherit',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  backgroundColor: 'transparent',
                  color: 'inherit'
                }
              }}
            >
              카테고리
            </Button>
            <Button
              component={RouterLink}
              to="/boards?sort=popular"
              sx={{ 
                mr: 2,
                color: 'inherit',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  backgroundColor: 'transparent',
                  color: 'inherit'
                }
              }}
            >
              인기글
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="게시글 작성">
              <IconButton
                onClick={handleCreatePost}
                sx={{ 
                  mr: 2,
                  color: 'inherit',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    backgroundColor: 'transparent',
                    color: 'inherit'
                  }
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="채팅">
              <IconButton
                onClick={handleChatClick}
                sx={{ 
                  mr: 2,
                  color: 'inherit',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    backgroundColor: 'transparent',
                    color: 'inherit'
                  }
                }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <ChatIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {user ? (
              <>
                <Button
                  onClick={handleMenuOpen}
                  sx={{ 
                    color: 'inherit',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      backgroundColor: 'transparent',
                      color: 'inherit'
                    }
                  }}
                >
                  {user.nickName}님
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <MenuItem
                    onClick={handleProfileClick}
                    sx={{ 
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        color: 'inherit'
                      }
                    }}
                  >
                    프로필
                  </MenuItem>
                  {user.role === 'ADMIN' && (
                    <MenuItem
                      component={RouterLink}
                      to="/admin"
                      onClick={handleMenuClose}
                      sx={{ 
                        '&:hover': {
                          backgroundColor: 'rgba(0, 0, 0, 0.04)',
                          color: 'inherit'
                        }
                      }}
                    >
                      관리자 페이지
                    </MenuItem>
                  )}
                  <MenuItem 
                    onClick={() => {
                      handleMenuClose();
                      logout();
                    }}
                    sx={{ 
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        color: 'inherit'
                      }
                    }}
                  >
                    로그아웃
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  sx={{ 
                    mr: 1,
                    color: 'inherit',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      backgroundColor: 'transparent',
                      color: 'inherit'
                    }
                  }}
                >
                  로그인
                </Button>
                <Button
                  component={RouterLink}
                  to="/signup"
                  sx={{ 
                    color: 'inherit',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      backgroundColor: 'transparent',
                      color: 'inherit'
                    }
                  }}
                >
                  회원가입
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>

      <Menu
        anchorEl={boardMenuAnchorEl}
        open={Boolean(boardMenuAnchorEl)}
        onClose={handleBoardMenuClose}
      >
        <MenuItem onClick={() => handleBoardTypeClick(BoardType.BAND_PROMOTION)}>
          밴드 홍보
        </MenuItem>
        <MenuItem onClick={() => handleBoardTypeClick(BoardType.PERFORMANCE_INFO)}>
          공연 정보
        </MenuItem>
        <MenuItem onClick={() => handleBoardTypeClick(BoardType.MEMBER_RECRUITMENT)}>
          멤버 모집
        </MenuItem>
        <MenuItem onClick={() => handleBoardTypeClick(BoardType.BAND_MATCHING)}>
          밴드 매칭
        </MenuItem>
        <MenuItem onClick={() => handleBoardTypeClick(BoardType.SESSION_RECRUITMENT)}>
          세션 모집
        </MenuItem>
        <MenuItem onClick={() => handleBoardTypeClick(BoardType.FREE)}>
          자유게시판
        </MenuItem>
      </Menu>

      <Drawer
        anchor="right"
        open={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
      >
        <Box sx={{ width: 300, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            채팅 목록
          </Typography>
          <List>
            {chatRooms.map((room) => (
              <React.Fragment key={room.roomId}>
                <ListItem
                  component="div"
                  onClick={() => handleChatRoomClick(room.roomId, room.otherUserId)}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>{room.otherUserNickName[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={room.otherUserNickName}
                    secondary={
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{
                          display: 'block',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {room.lastMessage || '메시지가 없습니다'}
                      </Typography>
                    }
                  />
                  {room.unreadCount > 0 && (
                    <Badge
                      badgeContent={room.unreadCount}
                      color="error"
                      sx={{ ml: 1 }}
                    />
                  )}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}; 
