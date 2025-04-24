import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useAuthStore } from '../stores/authStore';

export const AdminPage = () => {
  const { user } = useAuthStore();

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <Box
      component={Paper}
      sx={{
        p: 4,
        maxWidth: 800,
        mx: 'auto',
        mt: 4,
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom>
        관리자 페이지
      </Typography>
      <Typography variant="body1">
        관리자 전용 기능이 들어갈 공간입니다.
      </Typography>
    </Box>
  );
}; 
