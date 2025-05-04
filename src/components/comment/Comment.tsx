import React from 'react';

interface CommentProps {
  content: string;
}

const Comment: React.FC<CommentProps> = ({ content }) => {
  return (
    <div className="comment">
      <div className="comment-content">{content}</div>
    </div>
  );
};

export default Comment; 