import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface CommentFormProps {
  onSubmit: (content: string) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info('로그인이 필요한 서비스입니다.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      navigate('/login');
      return;
    }
    onSubmit(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form" style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="댓글을 입력하세요..."
        style={{
          flex: 1,
          padding: '10px',
          borderRadius: '20px',
          border: '1px solid #ddd',
          backgroundColor: '#fff',
          marginRight: '10px',
          height: '40px',
          color: '#000'
        }}
      />
      <button type="submit" style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '20px'
      }}>📤</button>
    </form>
  );
};

export default CommentForm; 