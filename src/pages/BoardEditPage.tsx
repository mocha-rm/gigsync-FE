import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { BoardType, BoardFile } from '../types/board';
import { Close as CloseIcon } from '@mui/icons-material';

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

const BoardEditPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [boardType, setBoardType] = useState<BoardType>(BoardType.FREE);
  const [existingFiles, setExistingFiles] = useState<BoardFile[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deleteFileIds, setDeleteFileIds] = useState<number[]>([]);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      VideoNode,
    ],
    content: '',
  });

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const response = await boardApi.getBoard(Number(boardId));
        console.log('게시글 데이터:', response.data);
        
        setTitle(response.data.title);
        setBoardType(response.data.boardType);
        
        // 기존 파일 정보 설정
        if (response.data.files) {
          setExistingFiles(response.data.files.map(file => ({
            id: file.id,
            fileName: file.fileName,
            fileUrl: file.fileUrl
          })));
        }

        // 에디터 내용 설정
        let content = response.data.text || '';
        
        // 이미지와 비디오 URL을 실제 S3 URL로 교체
        if (response.data.files) {
          response.data.files.forEach(file => {
            const fileUrl = file.fileUrl;
            if (fileUrl.match(/\.(jpg|jpeg|png|gif)$/i)) {
              // 이미지인 경우
              content = content.replace(
                /<img[^>]*src="[^"]*"[^>]*>/,
                `<img src="${fileUrl}" style="max-width: 100%; max-height: 600px; height: auto; object-fit: contain; margin: 1rem auto; display: block;">`
              );
            } else if (fileUrl.match(/\.(mp4|webm|ogg)$/i)) {
              // 비디오인 경우
              content = content.replace(
                /<video[^>]*src="[^"]*"[^>]*>/,
                `<video src="${fileUrl}" controls style="width: 100%; max-height: 400px; margin: 1rem auto; display: block; object-fit: contain;">`
              );
            }
          });
        }
        
        editor?.commands.setContent(content);
        
      } catch (error) {
        console.error('게시글 조회 실패:', error);
      }
    };

    if (boardId) {
      fetchBoard();
    }
  }, [boardId, editor]);

  const handleFileDelete = (fileId: number, fileName: string, fileUrl: string) => {
    if (window.confirm('첨부된 파일을 삭제하시겠습니까?')) {
      console.log('삭제할 파일 ID:', fileId);
      setDeleteFileIds(prev => [...prev, fileId]);
      setExistingFiles(prev => prev.filter(file => file.id !== fileId));
      
      // 에디터 내용에서 해당 파일 제거
      const content = editor?.getHTML() || '';
      const escapedUrl = fileUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const filePattern = new RegExp(
        `<video[^>]*src="${escapedUrl}"[^>]*>.*?</video>|` +
        `<img[^>]*src="${escapedUrl}"[^>]*>`,
        'g'
      );
      const newContent = content.replace(filePattern, '').replace(/<p><\/p>/g, '');
      editor?.commands.setContent(newContent);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = editor?.getHTML() || '';
    console.log('제출할 내용:', content);
    console.log('삭제할 파일 ID들:', deleteFileIds);
    
    try {
      const boardData = {
        title,
        text: content,
        boardType,
        deleteFileIds: deleteFileIds.length > 0 ? deleteFileIds : null
      };
      
      console.log('전송할 데이터:', boardData);
      
      const formData = new FormData();
      formData.append('board', new Blob([JSON.stringify(boardData)], { 
        type: 'application/json' 
      }));

      if (newFiles.length > 0) {
        newFiles.forEach(file => {
          formData.append('files', file);
        });
      }

      await boardApi.updateBoard(Number(boardId), formData);
      navigate(`/boards/${boardId}`);
    } catch (error: any) {
      console.error('게시글 수정 실패:', error);
      if (error.response?.status === 401) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }
      alert('게시글 수정 중 오류가 발생했습니다.');
    }
  };

  const handleNewFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFilesArray = Array.from(files);
      
      // 파일 크기 및 타입 검증
      const validFiles = newFilesArray.filter(file => {
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
          alert(`${file.name}의 크기가 너무 큽니다. 50MB 이하의 파일만 업로드 가능합니다.`);
          return false;
        }
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          alert(`${file.name}은(는) 지원하지 않는 파일 형식입니다. 이미지나 동영상 파일만 업로드 가능합니다.`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        setNewFiles(prev => [...prev, ...validFiles]);
        
        validFiles.forEach(file => {
          const fileUrl = URL.createObjectURL(file);
          if (file.type.startsWith('image/')) {
            // 이미지 삽입 시 스타일 추가
            const imageHtml = `<img src="${fileUrl}" style="max-width: 100%; max-height: 600px; height: auto; object-fit: contain; margin: 1rem auto; display: block;">`;
            editor?.chain().focus().insertContent(imageHtml).run();
          } else if (file.type.startsWith('video/')) {
            const videoHtml = `<video controls src="${fileUrl}" style="width: 100%; max-height: 400px; margin: 1rem auto; display: block; object-fit: contain;"></video>`;
            editor?.chain().focus().insertContent(videoHtml).run();
          }
          editor?.commands.createParagraphNear();
        });
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          게시글 수정
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

          <Box sx={{ mb: 3 }}>
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleNewFileChange}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label htmlFor="file-input">
              <Button variant="outlined" component="span">
                이미지/동영상 첨부
              </Button>
            </label>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                첨부된 파일:
              </Typography>
              {existingFiles.map((file) => (
                <Box 
                  key={file.id}
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
                  <Typography>{file.fileName}</Typography>
                  <IconButton
                    size="small"
                    onClick={() => handleFileDelete(file.id, file.fileName, file.fileUrl)}
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
              {newFiles.map((file, index) => (
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
                  <Typography>{file.name} (새로 추가됨)</Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (window.confirm('첨부된 파일을 삭제하시겠습니까?')) {
                        const blobUrl = URL.createObjectURL(file);
                        setNewFiles(prev => prev.filter((_, i) => i !== index));
                        
                        const content = editor?.getHTML() || '';
                        const escapedUrl = blobUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const filePattern = new RegExp(
                          `<video[^>]*src="${escapedUrl}"[^>]*>.*?</video>|` +
                          `<img[^>]*src="${escapedUrl}"[^>]*>`,
                          'g'
                        );
                        const newContent = content.replace(filePattern, '').replace(/<p><\/p>/g, '');
                        editor?.commands.setContent(newContent);
                        URL.revokeObjectURL(blobUrl);
                      }
                    }}
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

          <Box sx={{ 
            border: '1px solid #ddd',
            borderRadius: 1,
            padding: 2,
            minHeight: '300px',
            mb: 3,
            '& .ProseMirror': {
              minHeight: '250px',
              outline: 'none',
              '& img': {
                maxWidth: '100%',
                maxHeight: '600px',
                height: 'auto',
                display: 'block',
                margin: '1rem auto',
                objectFit: 'contain'
              },
              '& video': {
                maxWidth: '100%',
                maxHeight: '400px',
                height: 'auto',
                display: 'block',
                margin: '1rem auto',
                objectFit: 'contain'
              },
              '& p': {
                margin: '1rem 0',
                '&:empty': {
                  display: 'block',
                  minHeight: '1rem'
                }
              }
            }
          }}>
            <EditorContent editor={editor} />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
            >
              수정하기
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate(`/boards/${boardId}`)}
            >
              취소
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default BoardEditPage; 