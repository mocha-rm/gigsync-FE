import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Avatar,
  Paper,
  Grid,
  Divider,
} from '@mui/material';
import { userApi } from '../api/user';
import { UserProfileDto } from '../types/user';

export const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [userProfile, setUserProfile] = useState<UserProfileDto | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await userApi.getUserProfile(Number(userId));
        setUserProfile(response.data);
      } catch (error) {
        console.error('사용자 프로필 조회 실패:', error);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  if (!userProfile) return null;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={userProfile.profileImageUrl}
            sx={{ width: 100, height: 100, mr: 3 }}
          />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {userProfile.nickName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {userProfile.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              자기소개
            </Typography>
            <Typography variant="body1">
              {userProfile.bio || '자기소개가 없습니다.'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              관심 장르
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {userProfile.interestedGenres?.map((genre, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  {genre}
                </Typography>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              악기
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {userProfile.instruments?.map((instrument, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    bgcolor: 'secondary.main',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  {instrument}
                </Typography>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}; 
