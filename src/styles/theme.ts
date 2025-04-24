import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#3C3C3C', // 딥 그레이
      light: '#5C5C5C',
      dark: '#2C2C2C',
    },
    secondary: {
      main: '#E4572E', // 따뜻한 오렌지
      light: '#FF6B3D',
      dark: '#C13D1A',
    },
    success: {
      main: '#A8C256', // 올리브 그린
      light: '#B8D266',
      dark: '#98B246',
    },
    background: {
      default: '#F9F5F0', // 크림색
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Pretendard", "Noto Sans KR", "Roboto", "Open Sans", sans-serif',
    h1: {
      fontFamily: '"Bebas Neue", "Anton", sans-serif',
      fontWeight: 400,
      letterSpacing: '0.5px',
    },
    h2: {
      fontFamily: '"Bebas Neue", "Anton", sans-serif',
      fontWeight: 400,
      letterSpacing: '0.5px',
    },
    h3: {
      fontFamily: '"Bebas Neue", "Anton", sans-serif',
      fontWeight: 400,
      letterSpacing: '0.5px',
    },
    h4: {
      fontFamily: '"Bebas Neue", "Anton", sans-serif',
      fontWeight: 400,
      letterSpacing: '0.5px',
    },
    h5: {
      fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
      fontWeight: 600,
      letterSpacing: '-0.5px',
    },
    h6: {
      fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
      fontWeight: 600,
      letterSpacing: '-0.5px',
    },
    button: {
      fontFamily: '"Pretendard", "Noto Sans KR", sans-serif',
      fontWeight: 600,
      letterSpacing: '0.5px',
    },
    body1: {
      fontFamily: '"Inter", "Pretendard", "Noto Sans KR", sans-serif',
      letterSpacing: '-0.3px',
    },
    body2: {
      fontFamily: '"Inter", "Pretendard", "Noto Sans KR", sans-serif',
      letterSpacing: '-0.3px',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
  },
}); 
