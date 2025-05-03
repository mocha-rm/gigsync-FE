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
} from '@mui/material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Node } from '@tiptap/core';
import { boardApi } from '../api/board';
import { BoardType } from '../types/board';
import { useAuthStore } from '../stores/authStore';

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
    
    const content = editor?.getHTML() || '';
    console.log('제출하는 내용:', content);
    
    const formData = new FormData();
    formData.append('board', new Blob([JSON.stringify({
      title,
      text: content,
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
      const newFiles = Array.from(e.target.files).map(file => {
        const fileWithPreview = file as FileWithPreview;
        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
          fileWithPreview.preview = URL.createObjectURL(file);
          
          // 이미지나 비디오 URL을 에디터에 삽입
          const fileUrl = fileWithPreview.preview;
          if (file.type.startsWith('image/')) {
            editor?.chain().focus().setImage({ src: fileUrl }).run();
          } else if (file.type.startsWith('video/')) {
            // 비디오를 HTML 문자열로 삽입
            const videoHtml = `<video controls src="${fileUrl}" style="width: 100%; max-height: 400px; margin: 1rem auto; display: block;"></video>`;
            editor?.chain().focus().insertContent(videoHtml).run();
          }
          editor?.commands.createParagraphNear();
        }
        return fileWithPreview;
      });
      setFiles(prev => [...prev, ...newFiles]);
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

            {files.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  첨부된 파일: {files.map(file => file.name).join(', ')}
                </Typography>
              </Box>
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
      </Paper>
    </Container>
  );
};

export default BoardCreatePage; 
