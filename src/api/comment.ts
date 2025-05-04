import api from './axios';

export const getComments = async (boardId: number) => {
  const response = await api.get(`/boards/${boardId}/comments`);
  return response.data;
};

export const addComment = async (boardId: number, text: string) => {
  const response = await api.post(`/boards/${boardId}/comments`, { text });
  return response.data;
};

export const updateComment = async (boardId: number, commentId: number, text: string) => {
  const response = await api.put(`/boards/${boardId}/comments/${commentId}`, { text });
  return response.data;
};

export const deleteComment = async (boardId: number, commentId: number) => {
  await api.delete(`/boards/${boardId}/comments/${commentId}`);
};