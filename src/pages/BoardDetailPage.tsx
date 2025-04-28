import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Link,
  Typography,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { boardApi } from '../api/board';
import { BoardResponseDto } from '../types/board';
import { format } from 'date-fns';
import { useAuthStore } from '../stores/authStore';

const BoardDetailPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const [board, setBoard] = useState<BoardResponseDto | null>(null);
  const user = useAuthStore((state) => state.user);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const response = await boardApi.getBoard(Number(boardId));
        console.log('게시글 데이터:', response.data);
        setBoard(response.data);
      } catch (error) {
        console.error('게시글 조회 실패:', error);
      }
    };

    if (boardId) {
      fetchBoard();
    }
  }, [boardId]);

  const handleDelete = async () => {
    if (!boardId || !window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await boardApi.deleteBoard(Number(boardId));
      navigate('/boards');
    } catch (error) {
      console.error('게시글 삭제 실패:', error);
    }
  };

  const handleAuthorMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAuthorMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    if (board) {
      console.log('현재 board 객체:', board);
      if (board.userId) {
        navigate(`/profile/${board.userId}`);
      } else {
        console.error('작성자 ID가 없습니다. board:', board);
      }
      handleAuthorMenuClose();
    }
  };

  const handleChatClick = () => {
    if (board) {
      if (board.userId) {
        navigate(`/chat/${board.userId}`);
      } else {
        console.error('작성자 ID가 없습니다.');
      }
      handleAuthorMenuClose();
    }
  };

  if (!board) return null;

  const isAuthor = user?.id === board.userId;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/boards')}
        >
          목록으로
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {board.title}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              cursor: 'pointer',
              '&:hover': {
                color: 'primary.main',
                textDecoration: 'underline'
              }
            }}
            onClick={handleAuthorMenuOpen}
          >
            작성자: {board.userName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {board.createdAt ? format(new Date(board.createdAt), 'yyyy.MM.dd HH:mm') : '날짜 없음'}
          </Typography>
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleAuthorMenuClose}
        >
          <MenuItem onClick={handleProfileClick}>프로필 보기</MenuItem>
          <MenuItem onClick={handleChatClick}>채팅 하기</MenuItem>
        </Menu>
        <Divider sx={{ my: 2 }} />
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
          {board.text}
        </Typography>

        {board.fileUrls.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              첨부파일
            </Typography>
            {board.fileUrls.map((url, index) => (
              <Link
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ display: 'block', mb: 1 }}
              >
                파일 {index + 1}
              </Link>
            ))}
          </Box>
        )}

        {isAuthor && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <IconButton
              onClick={() => navigate(`/boards/${boardId}/edit`)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={handleDelete}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default BoardDetailPage; 
