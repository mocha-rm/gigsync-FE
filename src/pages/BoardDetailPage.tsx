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
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';
import { boardApi } from '../api/board';
import { BoardResponseDto } from '../types/board';
import { format } from 'date-fns';
import { useAuthStore } from '../stores/authStore';
import CommentSystem from '../components/comment/CommentSystem';

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
      if (board.userId) {
        navigate(`/profile/${board.userId}`);
      } else {
        console.error('작성자 ID가 없습니다.');
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

  // 파일 URL이 이미지인지 확인
  const isImageFile = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  // 파일 URL이 비디오인지 확인
  const isVideoFile = (url: string) => {
    return /\.(mp4|webm|ogg)$/i.test(url);
  };

  // HTML 컨텐츠를 안전하게 렌더링
  const renderContent = (content: string | null | undefined) => {
    if (!content) return null;

    return (
      <Box
        dangerouslySetInnerHTML={{ __html: content }}
        sx={{
          width: '100%',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          '& > *': {
            marginBottom: '1rem',
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            margin: '1rem auto',
          },
          '& video': {
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            margin: '1rem auto',
          },
          '& p': {
            margin: '1rem 0',
            lineHeight: 1.5,
            fontSize: '1rem',
          }
        }}
      />
    );
  };

  // 파일 렌더링을 위한 새로운 컴포넌트
  const renderFiles = () => {
    if (!board.files || board.files.length === 0) return null;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          첨부 파일
        </Typography>
        {board.files.map((file) => (
          <Box
            key={file.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1,
            }}
          >
            <AttachFileIcon />
            <Link
              href={file.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textDecoration: 'none' }}
            >
              {file.fileName}
            </Link>
          </Box>
        ))}
      </Box>
    );
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
        
        <Box sx={{ mb: 3 }}>
          {renderContent(board.text)}
          {renderFiles()}
        </Box>

        {isAuthor && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              startIcon={<EditIcon />}
              onClick={() => navigate(`/boards/${boardId}/edit`)}
            >
              수정
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              color="error"
              onClick={handleDelete}
            >
              삭제
            </Button>
          </Box>
        )}
      </Box>

      <CommentSystem boardId={Number(boardId)} />
    </Container>
  );
};

export default BoardDetailPage; 