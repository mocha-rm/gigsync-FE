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

export interface BoardFile {
  id: number;
  fileName: string;
  fileUrl: string;
}

export interface BoardResponseDto {
  id: number;
  userId: number;
  userName: string;
  title: string;
  text: string;
  boardType: BoardType;
  viewCount: number;
  fileUrls: string[];
  files: BoardFile[];
  createdAt: string;
  modifiedAt: string;
}

export interface BoardListResponse {
  content: BoardResponseDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
} 
