import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  Grid,
  MenuItem,
  Pagination,
  Select,
  Typography,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Announcement as AnnouncementIcon } from '@mui/icons-material';
import { boardApi } from '../api/board';
import { BoardResponseDto, BoardType } from '../types/board';
import { format } from 'date-fns';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'react-toastify';

const BoardListPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const [boards, setBoards] = useState<BoardResponseDto[]>([]);
  const [notices, setNotices] = useState<BoardResponseDto[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortType, setSortType] = useState('latest');
  const [boardType, setBoardType] = useState<BoardType | ''>('');

  // URL 쿼리 파라미터에서 필터 값 가져오기
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const typeParam = params.get('type');
    const sortParam = params.get('sort');
    
    if (typeParam) {
      setBoardType(typeParam as BoardType);
    }
    
    if (sortParam) {
      setSortType(sortParam);
    }
  }, [location.search]);

  const fetchBoards = async () => {
    try {
      const response = await boardApi.getBoards(sortType, page, 10, boardType);
      setBoards(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('게시글 목록 조회 실패:', error);
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await boardApi.getBoards('latest', 0, 5, BoardType.NOTICE);
      setNotices(response.data.content);
    } catch (error) {
      console.error('공지사항 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchBoards();
    if (boardType !== BoardType.NOTICE) {
      fetchNotices();
    }
  }, [page, sortType, boardType]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
  };

  const handleSortChange = (event: any) => {
    setSortType(event.target.value);
    setPage(0);
  };

  const handleBoardTypeChange = (event: any) => {
    setBoardType(event.target.value);
    setPage(0);
  };

  const handleCreatePost = () => {
    if (!user) {
      toast.info('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }
    navigate('/boards/create');
  };

  const getBoardTypeLabel = (type: BoardType) => {
    const labels: Record<BoardType, string> = {
      [BoardType.NOTICE]: '공지사항',
      [BoardType.BAND_PROMOTION]: '밴드 홍보',
      [BoardType.PERFORMANCE_INFO]: '공연 정보',
      [BoardType.MEMBER_RECRUITMENT]: '멤버 모집',
      [BoardType.BAND_MATCHING]: '밴드 매칭',
      [BoardType.SESSION_RECRUITMENT]: '세션 모집',
      [BoardType.FREE]: '자유게시판',
    };
    return labels[type];
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {boardType === BoardType.NOTICE ? '공지사항' : '커뮤니티'}
        </Typography>
        {boardType !== BoardType.NOTICE && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreatePost}
          >
            글쓰기
          </Button>
        )}
      </Box>

      {/* 공지사항 섹션 */}
      {boardType !== BoardType.NOTICE && notices.length > 0 && (
        <Paper 
          sx={{ 
            mb: 4, 
            p: 2,
            bgcolor: '#f8f9fa',
            borderLeft: '4px solid #1976d2'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AnnouncementIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="h2">
              공지사항
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {notices.map((notice) => (
              <Box 
                key={notice.id}
                sx={{ 
                  cursor: 'pointer',
                  p: 1,
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                    borderRadius: 1
                  }
                }}
                onClick={() => navigate(`/boards/${notice.id}`)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1">
                    {notice.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {notice.createdAt ? format(new Date(notice.createdAt), 'yyyy.MM.dd') : '날짜 없음'}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <Select
            value={boardType}
            onChange={handleBoardTypeChange}
            size="small"
            displayEmpty
          >
            <MenuItem value="">전체 카테고리</MenuItem>
            <MenuItem value={BoardType.BAND_PROMOTION}>밴드 홍보</MenuItem>
            <MenuItem value={BoardType.PERFORMANCE_INFO}>공연 정보</MenuItem>
            <MenuItem value={BoardType.MEMBER_RECRUITMENT}>멤버 모집</MenuItem>
            <MenuItem value={BoardType.BAND_MATCHING}>밴드 매칭</MenuItem>
            <MenuItem value={BoardType.SESSION_RECRUITMENT}>세션 모집</MenuItem>
            <MenuItem value={BoardType.FREE}>자유게시판</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <Select
            value={sortType}
            onChange={handleSortChange}
            size="small"
          >
            <MenuItem value="latest">최신순</MenuItem>
            <MenuItem value="popular">인기순</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {boards
          .filter(board => board.boardType !== BoardType.NOTICE)
          .map((board) => (
            <Box key={board.id}>
              <Card 
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/boards/${board.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {getBoardTypeLabel(board.boardType)}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      {board.createdAt ? format(new Date(board.createdAt), 'yyyy.MM.dd') : '날짜 없음'}
                    </Typography>
                  </Box>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {board.title}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {board.userName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      조회 {board.viewCount}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Container>
  );
};

export default BoardListPage; 
