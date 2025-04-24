import api from './axios';
import { BoardRequestDto, BoardResponseDto, BoardListResponse } from '../types/board';

export const boardApi = {
  // 게시글 작성
  createBoard: (data: FormData) => 
    api.post<BoardResponseDto>('/boards', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // 게시글 상세 조회
  getBoard: (boardId: number) => 
    api.get<BoardResponseDto>(`/boards/${boardId}`),

  // 게시글 목록 조회
  getBoards: (sortType: string = 'latest', page: number = 0, size: number = 10) => 
    api.get<BoardListResponse>(`/boards?sortType=${sortType}&page=${page}&size=${size}`),

  // 게시글 수정
  updateBoard: (boardId: number, data: FormData) => 
    api.patch(`/boards/${boardId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  // 게시글 삭제
  deleteBoard: (boardId: number) => 
    api.delete(`/boards/${boardId}`),
}; 
