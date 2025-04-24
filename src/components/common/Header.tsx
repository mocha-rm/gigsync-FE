import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export const Header = () => {
  const { user, logout } = useAuthStore();

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
          >
            GigSync
          </Typography>
          <Box>
            {user ? (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/profile"
                >
                  {user.nickName}님
                </Button>
                <Button
                  color="inherit"
                  onClick={logout}
                >
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/login"
                >
                  로그인
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/signup"
                >
                  회원가입
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}; 
