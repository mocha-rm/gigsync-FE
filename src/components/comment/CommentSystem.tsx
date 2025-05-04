// src/components/comment/CommentSystem.tsx
import React, { useState, useEffect } from 'react';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { getComments, addComment } from '../../api/comment';

interface Comment {
  id: number;
  boardId: number;
  userName: string;
  text: string;
  createdAt: string;
  modifiedAt: string;
}

const CommentSystem: React.FC<{ boardId: number }> = ({ boardId }) => {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await getComments(boardId);
        setComments(data.content || []);
      } catch (error) {
        console.error('댓글을 가져오는 중 오류 발생:', error);
        setComments([]);
      }
    };

    fetchComments();
  }, [boardId]);

  const handleAddComment = async (text: string) => {
    const newComment = await addComment(boardId, text);
    setComments([...comments, newComment]);
  };

  return (
    <div className="comment-system">
      <CommentForm onSubmit={handleAddComment} />
      <CommentList comments={comments} setComments={setComments} />
    </div>
  );
};

export default CommentSystem;