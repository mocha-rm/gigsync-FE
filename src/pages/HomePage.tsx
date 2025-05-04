import React, { useEffect, useState } from 'react';
import { 
  Typography, 
  Box, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button,
  Paper,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { boardApi } from '../api/board';
import { BoardResponseDto, BoardType } from '../types/board';
import { format } from 'date-fns';

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

export const HomePage = () => {
  const navigate = useNavigate();
  const [popularPosts, setPopularPosts] = useState<BoardResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        setIsLoading(true);
        const response = await boardApi.getBoards('popular', 0, 5);
        setPopularPosts(response.data.content || []);
      } catch (error) {
        console.error('인기 게시글 조회 실패:', error);
        setPopularPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularPosts();
  }, []);

  return (
    <Box>
      {/* 히어로 섹션 */}
      <Box
        sx={{
          position: 'relative',
          height: '500px',
          backgroundImage: 'url(https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          textAlign: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(60, 60, 60, 0.7)',
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h1" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontSize: { xs: '3rem', md: '4rem' },
              textTransform: 'uppercase',
              letterSpacing: '2px',
              mb: 2
            }}
          >
            GigSync
          </Typography>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
              fontWeight: 600,
              mb: 3
            }}
          >
            인디밴드 커뮤니티의 중심
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4,
              fontSize: '1.2rem',
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            밴드 홍보, 공연 정보, 멤버 모집, 세션 모집까지 모든 것을 한 곳에서
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/boards')}
              sx={{ 
                bgcolor: 'secondary.main',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                }
              }}
            >
              커뮤니티 둘러보기
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              onClick={() => navigate('/signup')}
              sx={{ 
                color: 'white', 
                borderColor: 'white', 
                '&:hover': { 
                  borderColor: 'white', 
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)'
                } 
              }}
            >
              회원가입
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 특징 섹션 */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h2" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ 
            mb: 1,
            color: 'primary.main',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }}
        >
          GigSync의 특징
        </Typography>
        <Typography 
          variant="h5" 
          align="center" 
          color="text.secondary" 
          sx={{ mb: 6 }}
        >
          인디밴드 커뮤니티를 위한 특별한 기능
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 4,
          justifyContent: 'center',
          alignItems: 'stretch'
        }}>
          <Box sx={{ flex: 1, maxWidth: 400 }}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image="https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="밴드 홍보"
              />
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Typography 
                  gutterBottom 
                  variant="h5" 
                  component="h3" 
                  sx={{ 
                    color: 'secondary.main',
                    fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
                    fontWeight: 600
                  }}
                >
                  밴드 홍보
                </Typography>
                <Typography>
                  당신의 밴드를 세상에 알리고 팬들과 소통하세요. 음악, 공연 일정, 밴드 소식을 공유할 수 있습니다.
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: 1, maxWidth: 400 }}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="멤버 모집"
              />
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Typography 
                  gutterBottom 
                  variant="h5" 
                  component="h3" 
                  sx={{ 
                    color: 'success.main',
                    fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
                    fontWeight: 600
                  }}
                >
                  멤버 모집
                </Typography>
                <Typography>
                  새로운 밴드 멤버를 찾거나, 당신의 재능을 밴드에 기여하세요. 다양한 악기와 장르의 뮤지션들이 모여 있습니다.
                </Typography>
              </CardContent>
            </Card>
          </Box>
          
          <Box sx={{ flex: 1, maxWidth: 400 }}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
                alt="공연 정보"
              />
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Typography 
                  gutterBottom 
                  variant="h5" 
                  component="h3" 
                  sx={{ 
                    color: 'primary.main',
                    fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
                    fontWeight: 600
                  }}
                >
                  공연 정보
                </Typography>
                <Typography>
                  다양한 인디밴드 공연 정보를 확인하고 참여하세요. 라이브 공연, 페스티벌, 오디션 등 다양한 이벤트가 기다리고 있습니다.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>

      {/* 인기 게시글 섹션 */}
      <Box sx={{ py: 8, bgcolor: 'grey.100' }}>
        <Container>
          <Typography 
            variant="h4" 
            component="h2" 
            align="center" 
            gutterBottom
            sx={{ 
              mb: 6,
              fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
              fontWeight: 700
            }}
          >
            인기 게시글
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 2,
            justifyContent: 'center'
          }}>
            {isLoading ? (
              <Typography>로딩 중...</Typography>
            ) : popularPosts.length > 0 ? (
              popularPosts.map((post) => (
                <Box 
                  key={post.id} 
                  sx={{ 
                    width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' },
                    minWidth: 280
                  }}
                >
                  <Paper 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/boards/${post.id}`)}
                  >
                    <Box sx={{ p: 2 }}>
                      <Typography 
                        variant="subtitle2" 
                        color="secondary.main" 
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                      >
                        {getBoardTypeLabel(post.boardType)}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        gutterBottom
                        sx={{ 
                          fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
                          fontWeight: 600
                        }}
                      >
                        {post.title}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {post.userName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {post.createdAt ? format(new Date(post.createdAt), 'yyyy.MM.dd') : '날짜 없음'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              ))
            ) : (
              <Typography>인기 게시글이 없습니다.</Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/boards?sort=popular')}
              sx={{ 
                color: 'primary.main',
                borderColor: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  bgcolor: 'rgba(60, 60, 60, 0.04)',
                }
              }}
            >
              더 많은 인기 게시글 보기
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}; 
