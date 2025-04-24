import React from 'react';
import { Typography, Box } from '@mui/material';

export const HomePage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        GigSync에 오신 것을 환영합니다
      </Typography>
      <Typography variant="body1">
        이곳에서 다양한 정보를 공유하고 소통하세요.
      </Typography>
    </Box>
  );
}; 
