export const NewsStatus = {
  ACTIVE: 'ACTIVE',
  PAUSE: 'PAUSE',
  DELETE: 'DELETE',
} as const;

export type NewsStatus = typeof NewsStatus[keyof typeof NewsStatus];

export interface News {
  id: string;
  title: string;
  content: string;
  status: NewsStatus;
  image?: string | null;
  video?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsListResponse {
  findAllNews: {
    list: News[];
    metaCounter: Array<{ total: number }>;
  };
}

export interface NewsFilterInput {
  page?: number;
  limit?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
  search?: {
    status?: NewsStatus;
  };
}

