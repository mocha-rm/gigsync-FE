import React from 'react';
import { Box, Container } from '@mui/material';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <Header />
      <Container 
        component="main" 
        maxWidth="lg"
        sx={{ 
          flex: 1,
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {children}
      </Container>
    </Box>
  );
}; 
