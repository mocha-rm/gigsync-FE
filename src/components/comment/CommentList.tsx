import React from 'react';
import Comment from './Comment';
import { deleteComment, updateComment } from '../../api/comment';
import { useAuthStore } from '../../stores/authStore';

interface CommentListProps {
  comments: {
    id: number;
    boardId: number;
    userName: string;
    text: string;
    createdAt: string;
    modifiedAt: string;
  }[];
  setComments: React.Dispatch<React.SetStateAction<{
    id: number;
    boardId: number;
    userName: string;
    text: string;
    createdAt: string;
    modifiedAt: string;
  }[]>>;
}

const CommentList: React.FC<CommentListProps> = ({ comments, setComments }) => {
  const user = useAuthStore((state) => state.user);

  const handleDelete = async (boardId: number, commentId: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      await deleteComment(boardId, commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
    }
  };

  const handleUpdate = async (boardId: number, commentId: number) => {
    const newText = prompt('수정할 내용을 입력하세요:');
    if (newText) {
      await updateComment(boardId, commentId, newText);
      setComments(comments.map(comment => 
        comment.id === commentId ? { ...comment, text: newText } : comment
      ));
    }
  };

  return (
    <div className="comment-list" style={{ borderTop: '1px solid #ddd' }}>
      {comments.map((comment, index) => (
        <div key={index} style={{ borderBottom: '1px solid #ddd', padding: '10px 0' }}>
          <div className="comment-header">
            <span className="username">{comment.userName}</span>
            <span className="modified-at" style={{ color: '#888', marginLeft: '10px', fontSize: '0.8em' }}>
              {new Date(comment.modifiedAt).toLocaleString()}
            </span>
          </div>
          <Comment content={comment.text} />
          {user?.nickName === comment.userName && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
              <button
                onClick={() => handleUpdate(comment.boardId, comment.id)}
                style={{
                  fontSize: '0.8em',
                  color: '#555',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  marginRight: '5px',
                  transition: 'color 0.3s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#000')}
                onMouseOut={(e) => (e.currentTarget.style.color = '#555')}
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(comment.boardId, comment.id)}
                style={{
                  fontSize: '0.8em',
                  color: '#555',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 0.3s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#000')}
                onMouseOut={(e) => (e.currentTarget.style.color = '#555')}
              >
                삭제
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList;