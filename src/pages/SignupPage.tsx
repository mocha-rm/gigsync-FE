import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { toast } from 'react-toastify';

const schema = yup.object({
  email: yup
    .string()
    .email('올바른 이메일 형식이 아닙니다')
    .required('이메일을 입력해주세요'),
  password: yup
    .string()
    .required('비밀번호를 입력해주세요')
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      '대문자, 소문자, 숫자, 특수문자를 최소 1개 이상 포함해주세요'
    ),
  nickName: yup
    .string()
    .required('닉네임을 입력해주세요')
    .min(2, '닉네임은 최소 2자 이상이어야 합니다')
    .max(15, '닉네임은 최대 15자까지 가능합니다'),
});

export const SignupPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await authApi.signup(data);
      toast.success('회원가입이 완료되었습니다');
      navigate('/login');
    } catch (error) {
      console.error('Signup failed:', error);
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
        회원가입
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
        <TextField
          fullWidth
          margin="normal"
          label="닉네임"
          {...register('nickName')}
          error={!!errors.nickName}
          helperText={errors.nickName?.message}
        />
        <Button
          fullWidth
          type="submit"
          variant="contained"
          sx={{ mt: 3 }}
        >
          회원가입
        </Button>
      </form>
    </Box>
  );
}; 
