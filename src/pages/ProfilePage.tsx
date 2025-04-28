import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, Avatar, Grid, Divider, Container } from '@mui/material';
import { useAuthStore } from '../stores/authStore';
import { useNavigate, useParams } from 'react-router-dom';
import { authApi } from '../api/auth';
import { toast } from 'react-toastify';
import { userApi } from '../api/user';
import { UserProfileDto } from '../types/user';

export const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // userId가 유효한 숫자인지 확인
        const numericUserId = Number(userId);
        if (isNaN(numericUserId)) {
          toast.error('유효하지 않은 사용자 ID입니다.');
          navigate('/');
          return;
        }

        const response = await userApi.getUserProfile(numericUserId);
        setProfile(response.data);
      } catch (error) {
        console.error('프로필 로딩 실패:', error);
        toast.error('프로필을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, navigate]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      toast.success('로그아웃되었습니다');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return <Box sx={{ p: 3 }}><Typography>로딩 중...</Typography></Box>;
  }

  if (!profile) {
    return <Box sx={{ p: 3 }}><Typography>프로필을 찾을 수 없습니다.</Typography></Box>;
  }

  // 현재 로그인한 사용자의 프로필인지 확인
  const isOwnProfile = user?.id === profile.id;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={profile.profileImageUrl}
            sx={{ width: 100, height: 100, mr: 3 }}
          />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {profile.nickName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {profile.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              자기소개
            </Typography>
            <Typography variant="body1">
              {profile.bio || '자기소개가 없습니다.'}
            </Typography>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              관심 장르
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {profile.interestedGenres?.map((genre, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  {genre}
                </Typography>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              악기
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {profile.instruments?.map((instrument, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    bgcolor: 'secondary.main',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  {instrument}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>

        {isOwnProfile && (
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/profile/edit')}
            >
              프로필 수정
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleLogout}
            >
              로그아웃
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}; 
