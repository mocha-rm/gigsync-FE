import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { boardApi } from '../api/board';
import { BoardType } from '../types/board';

const BoardCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [boardType, setBoardType] = useState<BoardType>(BoardType.FREE);
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('board', new Blob([JSON.stringify({
      title,
      text,
      boardType,
    })], { type: 'application/json' }));
    
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      await boardApi.createBoard(formData);
      navigate('/boards');
    } catch (error) {
      console.error('게시글 작성 실패:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        게시글 작성
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>카테고리</InputLabel>
          <Select
            value={boardType}
            label="카테고리"
            onChange={(e) => setBoardType(e.target.value as BoardType)}
          >
            <MenuItem value={BoardType.BAND_PROMOTION}>밴드 홍보</MenuItem>
            <MenuItem value={BoardType.PERFORMANCE_INFO}>공연 정보</MenuItem>
            <MenuItem value={BoardType.MEMBER_RECRUITMENT}>멤버 모집</MenuItem>
            <MenuItem value={BoardType.BAND_MATCHING}>밴드 매칭</MenuItem>
            <MenuItem value={BoardType.SESSION_RECRUITMENT}>세션 모집</MenuItem>
            <MenuItem value={BoardType.FREE}>자유게시판</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 3 }}
          required
        />

        <TextField
          fullWidth
          label="내용"
          value={text}
          onChange={(e) => setText(e.target.value)}
          multiline
          rows={10}
          sx={{ mb: 3 }}
          required
        />

        <Box sx={{ mb: 3 }}>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="file-input"
          />
          <label htmlFor="file-input">
            <Button variant="outlined" component="span">
              파일 첨부
            </Button>
          </label>
          {files.length > 0 && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              선택된 파일: {files.map(file => file.name).join(', ')}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
          >
            작성하기
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/boards')}
          >
            취소
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default BoardCreatePage; 
