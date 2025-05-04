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
  Paper,
  IconButton,
} from '@mui/material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Node } from '@tiptap/core';
import { boardApi } from '../api/board';
import { BoardType } from '../types/board';
import { useAuthStore } from '../stores/authStore';
import { Close as CloseIcon } from '@mui/icons-material';

// 비디오 노드 생성
const VideoNode = Node.create({
  name: 'video',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      controls: {
        default: true,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['video', { ...HTMLAttributes, controls: true, style: 'width: 100%; max-height: 400px; margin: 1rem auto; display: block;' }];
  },
});

interface FileWithPreview extends File {
  preview?: string;
  type: string;
  blobUrl?: string;
}

const BoardCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [boardType, setBoardType] = useState<BoardType>(BoardType.FREE);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const user = useAuthStore((state) => state.user);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      VideoNode,
    ],
    content: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    
    const content = editor?.getHTML() || '';
    console.log('제출하는 내용:', content);
    
    try {
      const boardData = {
        title,
        text: content,
        boardType
      };
      
      console.log('전송할 게시글 데이터:', boardData);
      
      const formData = new FormData();
      formData.append('board', new Blob([JSON.stringify(boardData)], { 
        type: 'application/json' 
      }));
    
      // 파일 크기 검증
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      const oversizedFiles = files.filter(file => file.size > maxFileSize);
      if (oversizedFiles.length > 0) {
        alert(`다음 파일이 너무 큽니다 (최대 50MB):\n${oversizedFiles.map(f => f.name).join('\n')}`);
        return;
      }
      
      if (files.length > 0) {
        files.forEach(file => {
          // 파일 타입 검증
          if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            throw new Error(`지원하지 않는 파일 형식입니다: ${file.name}`);
          }
          formData.append('files', file);
        });
      }

      const response = await boardApi.createBoard(formData);
      console.log('게시글 생성 응답:', response);

      // 응답에서 받은 파일 URL로 에디터 내용 업데이트
      if (response.data.files) {
        let updatedContent = content;
        files.forEach((file, index) => {
          const serverFile = response.data.files[index];
          if (!serverFile) return;

          const fileUrl = serverFile.fileUrl;
          if (file.preview) {
            const escapedPreviewUrl = file.preview.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            if (file.type.startsWith('image/')) {
              updatedContent = updatedContent.replace(
                new RegExp(`<img[^>]*src="${escapedPreviewUrl}"[^>]*>`, 'g'),
                `<img src="${fileUrl}" style="max-width: 100%; max-height: 600px; height: auto; object-fit: contain; margin: 1rem auto; display: block;">`
              );
            } else if (file.type.startsWith('video/')) {
              updatedContent = updatedContent.replace(
                new RegExp(`<video[^>]*src="${escapedPreviewUrl}"[^>]*>`, 'g'),
                `<video controls src="${fileUrl}" style="width: 100%; max-height: 400px; margin: 1rem auto; display: block; object-fit: contain;">`
              );
            }
          }
        });
        
        // 업데이트된 내용으로 다시 서버에 요청
        const updateData = {
          title,
          text: updatedContent,
          boardType
        };
        
        const updateFormData = new FormData();
        updateFormData.append('board', new Blob([JSON.stringify(updateData)], { 
          type: 'application/json' 
        }));
        
        await boardApi.updateBoard(response.data.id, updateFormData);
      }
      
      navigate('/boards');
    } catch (error: any) {
      console.error('게시글 작성 실패:', error);
      if (error.response) {
        console.error('에러 상세:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        if (error.response.status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
          navigate('/login');
          return;
        }
      }
      alert(error.message || '게시글 작성 중 오류가 발생했습니다.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => {
        const fileWithPreview = file as FileWithPreview;
        
        // 파일 타입 검증
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          alert(`지원하지 않는 파일 형식입니다: ${file.name}`);
          return null;
        }
        
        // 파일 크기 검증
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
          alert(`파일이 너무 큽니다 (최대 50MB): ${file.name}`);
          return null;
        }
        
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
          fileWithPreview.preview = URL.createObjectURL(file);
          
          // 이미지나 비디오 URL을 에디터에 삽입
          const fileUrl = fileWithPreview.preview;
          if (file.type.startsWith('image/')) {
            // 이미지 삽입 시 스타일 추가
            const imageHtml = `<img src="${fileUrl}" style="max-width: 100%; max-height: 600px; height: auto; object-fit: contain; margin: 1rem auto; display: block;">`;
            editor?.chain().focus().insertContent(imageHtml).run();
          } else if (file.type.startsWith('video/')) {
            const videoHtml = `<video controls src="${fileUrl}" style="width: 100%; max-height: 400px; margin: 1rem auto; display: block;"></video>`;
            editor?.chain().focus().insertContent(videoHtml).run();
          }
          editor?.commands.createParagraphNear();
        }
        return fileWithPreview;
      }).filter((file): file is FileWithPreview => file !== null);
      
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileDelete = (fileName: string) => {
    if (window.confirm('첨부된 파일을 삭제하시겠습니까?')) {
      // 삭제할 파일 찾기
      const fileToDelete = files.find(file => file.name === fileName);
      
      if (fileToDelete?.preview) {
        // 본문에서 해당 파일 태그 제거
        const content = editor?.getHTML() || '';
        const escapedUrl = fileToDelete.preview.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const filePattern = new RegExp(
          `<video[^>]*src="${escapedUrl}"[^>]*>.*?</video>|` +
          `<img[^>]*src="${escapedUrl}"[^>]*>`,
          'g'
        );
        const newContent = content.replace(filePattern, '').replace(/<p><\/p>/g, '');
        editor?.commands.setContent(newContent);
        
        // Blob URL 해제
        URL.revokeObjectURL(fileToDelete.preview);
      }
      
      // 파일 목록에서 제거
      setFiles(prev => prev.filter(file => file.name !== fileName));
    }
  };

  // 컴포넌트가 언마운트될 때 URL 객체 정리
  React.useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
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
              {user?.role === 'ADMIN' && (
                <MenuItem value={BoardType.NOTICE}>공지사항</MenuItem>
              )}
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

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              내용
            </Typography>
            <Box sx={{ 
              border: '1px solid #ddd',
              borderRadius: 1,
              padding: 2,
              minHeight: '300px',
              '& .ProseMirror': {
                minHeight: '250px',
                outline: 'none',
                whiteSpace: 'pre-wrap',
                '& img': {
                  maxWidth: '100%',
                  height: 'auto',
                  margin: '1rem auto',
                  display: 'block',
                },
                '& video': {
                  maxWidth: '100%',
                  height: 'auto',
                  margin: '1rem auto',
                  display: 'block',
                },
                '& p': {
                  margin: '1rem 0',
                  lineHeight: 1.5,
                }
              }
            }}>
              <EditorContent editor={editor} />
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button variant="outlined" component="span">
                이미지/동영상 첨부
              </Button>
            </label>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                첨부된 파일:
              </Typography>
              {files.map((file, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    px: 2,
                    py: 1,
                    mb: 1,
                  }}
                >
                  <Typography>{file.name}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleFileDelete(file.name)}
                    sx={{ 
                      color: 'grey.500',
                      '&:hover': { 
                        color: 'error.main',
                        bgcolor: 'error.light',
                      }
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
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
      </Paper>
    </Container>
  );
};

export default BoardCreatePage; 
