import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { toast } from 'react-toastify';

export const ProfilePage = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

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

  if (!user) {
    return null;
  }

  return (
    <Box
      component={Paper}
      sx={{
        p: 4,
        maxWidth: 600,
        mx: 'auto',
        mt: 4,
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom>
        프로필
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1">
          이메일: {user.email}
        </Typography>
        <Typography variant="body1">
          닉네임: {user.nickName}
        </Typography>
        <Typography variant="body1">
          역할: {user.role === 'ADMIN' ? '관리자' : '일반 사용자'}
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogout}
        sx={{ mt: 3 }}
      >
        로그아웃
      </Button>
    </Box>
  );
}; 
