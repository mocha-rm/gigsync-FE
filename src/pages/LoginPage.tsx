import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
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

export const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isFindEmailOpen, setIsFindEmailOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const {
    register: findEmailRegister,
    handleSubmit: handleFindEmailSubmit,
    formState: { errors: findEmailErrors },
  } = useForm({
    resolver: yupResolver(
      yup.object({
        phoneNumber: yup
          .string()
          .required('휴대폰 번호를 입력해주세요')
          .matches(/^\d{10,11}$/, '올바른 휴대폰 번호 형식이 아닙니다'),
      })
    ),
  });

  const {
    register: resetPasswordRegister,
    handleSubmit: handleResetPasswordSubmit,
    formState: { errors: resetPasswordErrors },
    getValues: getResetPasswordValues,
    setError: setResetPasswordError,
    watch: watchResetPassword,
  } = useForm({
    resolver: yupResolver(
      yup.object({
        email: yup
          .string()
          .email('올바른 이메일 형식이 아닙니다')
          .required('이메일을 입력해주세요'),
        verificationCode: yup
          .string()
          .required('인증 코드를 입력해주세요'),
        password: yup
          .string()
          .required('비밀번호를 입력해주세요')
          .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
          .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            '대문자, 소문자, 숫자, 특수문자를 최소 1개 이상 포함해주세요'
          ),
      })
    ),
  });

  const verificationCode = watchResetPassword('verificationCode');

  const onSubmit = async (data) => {
    try {
      const response = await authApi.login(data);
      setAuth(response.data, response.data.accessToken);
      toast.success('로그인되었습니다');
      navigate('/');
    } catch (error: any) {
      console.error('Login failed:', error);
      
      if (error.response?.data?.message === '유저를 찾을 수 없습니다.') {
        toast.error('존재하지 않는 이메일입니다.');
      } else if (error.response?.data?.message === '비밀번호가 일치하지 않습니다.') {
        toast.error('비밀번호가 일치하지 않습니다.');
      } else {
        toast.error('로그인에 실패했습니다.');
      }
    }
  };

  const handleFindEmail = async (data) => {
    try {
      const response = await authApi.findEmail(data);
      toast.success(`가입된 이메일: ${response.data.email}`);
      setIsFindEmailOpen(false);
    } catch (error) {
      console.error('이메일 찾기 실패:', error);
      toast.error('이메일 찾기에 실패했습니다');
    }
  };

  const handleSendVerificationCode = async () => {
    const email = getResetPasswordValues('email');
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

  const handleResetPassword = async (data) => {
    try {
      await authApi.resetPassword(data);
      toast.success('비밀번호가 재설정되었습니다');
      setIsResetPasswordOpen(false);
    } catch (error: any) {
      console.error('비밀번호 재설정 실패:', error);
      if (error.response?.data?.message === '이메일 인증번호가 맞지 않습니다.') {
        setResetPasswordError('verificationCode', {
          type: 'manual',
          message: '이메일 인증번호가 맞지 않습니다.',
        });
        toast.error('이메일 인증번호가 맞지 않습니다.');
      } else {
        toast.error('비밀번호 재설정에 실패했습니다');
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
        로그인
      </Typography>
      <form onSubmit={handleLoginSubmit(onSubmit)}>
        <TextField
          fullWidth
          margin="normal"
          label="이메일"
          {...loginRegister('email')}
          error={!!loginErrors.email}
          helperText={loginErrors.email?.message}
        />
        <TextField
          fullWidth
          margin="normal"
          type="password"
          label="비밀번호"
          {...loginRegister('password')}
          error={!!loginErrors.password}
          helperText={loginErrors.password?.message}
        />
        <Button
          fullWidth
          type="submit"
          variant="contained"
          sx={{ mt: 3 }}
        >
          로그인
        </Button>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setIsFindEmailOpen(true)}>
            이메일 찾기
          </Button>
          <Button onClick={() => setIsResetPasswordOpen(true)}>
            비밀번호 재설정
          </Button>
        </Box>
      </form>

      {/* 이메일 찾기 다이얼로그 */}
      <Dialog open={isFindEmailOpen} onClose={() => setIsFindEmailOpen(false)}>
        <DialogTitle>이메일 찾기</DialogTitle>
        <DialogContent>
          <form onSubmit={handleFindEmailSubmit(handleFindEmail)}>
            <TextField
              fullWidth
              margin="normal"
              label="휴대폰 번호"
              {...findEmailRegister('phoneNumber')}
              error={!!findEmailErrors.phoneNumber}
              helperText={findEmailErrors.phoneNumber?.message}
              placeholder="01012345678"
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
            >
              이메일 찾기
            </Button>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsFindEmailOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 비밀번호 재설정 다이얼로그 */}
      <Dialog open={isResetPasswordOpen} onClose={() => setIsResetPasswordOpen(false)}>
        <DialogTitle>비밀번호 재설정</DialogTitle>
        <DialogContent>
          <form onSubmit={handleResetPasswordSubmit(handleResetPassword)}>
            <TextField
              fullWidth
              margin="normal"
              label="이메일"
              {...resetPasswordRegister('email')}
              error={!!resetPasswordErrors.email}
              helperText={resetPasswordErrors.email?.message}
            />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField
                fullWidth
                label="인증 코드"
                {...resetPasswordRegister('verificationCode')}
                error={!!resetPasswordErrors.verificationCode}
                helperText={resetPasswordErrors.verificationCode?.message}
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
              label="새 비밀번호"
              {...resetPasswordRegister('password')}
              error={!!resetPasswordErrors.password}
              helperText={resetPasswordErrors.password?.message}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{ mt: 2 }}
              disabled={!verificationCode}
            >
              비밀번호 재설정
            </Button>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsResetPasswordOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 
