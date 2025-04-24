import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-toastify';

const schema = yup.object({
  email: yup
    .string()
    .email('올바른 이메일 형식이 아닙니다')
    .required('이메일을 입력해주세요'),
  password: yup
    .string()
    .required('비밀번호를 입력해주세요')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다'),
});

export const LoginForm = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await authApi.login(data);
      console.log('Login response:', response.data);
      
      // 응답 데이터에 nickName이 없는 경우 처리
      const userData = {
        ...response.data,
        nickName: response.data.nickName || '사용자', // nickName이 없으면 기본값 설정
      };
      
      setAuth(userData, response.data.accessToken);
      toast.success('로그인되었습니다');
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <Box
      component={Paper}
      sx={{
        p: 4,
        maxWidth: 400,
        mx: 'auto',
        mt: 4,
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom>
        로그인
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          fullWidth
          margin="normal"
          label="이메일"
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          fullWidth
          margin="normal"
          type="password"
          label="비밀번호"
          {...register('password')}
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <Button
          fullWidth
          type="submit"
          variant="contained"
          sx={{ mt: 3 }}
        >
          로그인
        </Button>
      </form>
    </Box>
  );
}; 
