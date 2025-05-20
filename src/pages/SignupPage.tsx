import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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
  phoneNumber: yup
    .string()
    .required('휴대폰 번호를 입력해주세요')
    .matches(/^\d{10,11}$/, '올바른 휴대폰 번호 형식이 아닙니다'),
  verificationCode: yup
    .string()
    .required('인증 코드를 입력해주세요'),
});

export const SignupPage = () => {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setError,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // 인증 코드 입력값 감시
  const verificationCode = watch('verificationCode');

  const handleSendVerificationCode = async () => {
    const email = getValues('email');
    if (!email) {
      toast.error('이메일을 먼저 입력해주세요');
      return;
    }

    setIsSendingCode(true);
    try {
      await authApi.sendVerificationCode({ email });
      toast.success('인증 코드가 이메일로 전송되었습니다');
    } catch (error) {
      console.error('인증 코드 전송 실패:', error);
      toast.error('인증 코드 전송에 실패했습니다');
    } finally {
      setIsSendingCode(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await authApi.signup(data);
      toast.success('회원가입이 완료되었습니다');
      navigate('/login');
    } catch (error: any) {
      console.error('Signup failed:', error);
      if (error.response?.data?.message === '이메일 인증번호가 맞지 않습니다.') {
        setError('verificationCode', {
          type: 'manual',
          message: '이메일 인증번호가 맞지 않습니다.',
        });
        toast.error('이메일 인증번호가 맞지 않습니다.');
      } else {
        toast.error('회원가입에 실패했습니다');
      }
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
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <TextField
            fullWidth
            label="인증 코드"
            {...register('verificationCode')}
            error={!!errors.verificationCode}
            helperText={errors.verificationCode?.message}
          />
          <Button
            variant="outlined"
            onClick={handleSendVerificationCode}
            disabled={isSendingCode}
            sx={{ minWidth: 120 }}
          >
            {isSendingCode ? <CircularProgress size={24} /> : '인증 코드 전송'}
          </Button>
        </Box>
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
        <TextField
          fullWidth
          margin="normal"
          label="휴대폰 번호"
          {...register('phoneNumber')}
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber?.message}
          placeholder="01012345678"
        />
        <Button
          fullWidth
          type="submit"
          variant="contained"
          sx={{ mt: 3 }}
          disabled={!verificationCode} // 인증 코드가 입력되었을 때만 버튼 활성화
        >
          회원가입
        </Button>
      </form>
    </Box>
  );
}; 
