export enum BoardType {
  NOTICE = 'NOTICE',
  BAND_PROMOTION = 'BAND_PROMOTION',
  PERFORMANCE_INFO = 'PERFORMANCE_INFO',
  MEMBER_RECRUITMENT = 'MEMBER_RECRUITMENT',
  BAND_MATCHING = 'BAND_MATCHING',
  SESSION_RECRUITMENT = 'SESSION_RECRUITMENT',
  FREE = 'FREE'
}

export interface BoardRequestDto {
  title: string;
  text: string;
  boardType: BoardType;
  deleteFileIds?: number[];
}

export interface BoardResponseDto {
  id: number;
  title: string;
  text: string;
  content: string;
  boardType: BoardType;
  userId: number;
  userName: string;
  createdAt: string;
  updatedAt: string;
  fileUrls: string[];
  viewCount: number;
}

export interface BoardListResponse {
  content: BoardResponseDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
} 
