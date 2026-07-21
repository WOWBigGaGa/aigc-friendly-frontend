export interface DashboardStats {
  articleCount: number;
  commentCount: number;
  categoryCount: number;
  tagCount: number;
  totalViewCount: number;
  totalLikeCount: number;
  pendingCommentCount: number;
}

export interface ArticleItem {
  id: string;
  title: string;
  status: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string | null;
}

export interface ArticleView {
  id: string;
  title: string;
  content: string;
  summary: string;
  coverImage: string;
  status: string;
  categoryId: string;
  authorId: string;
  viewCount: number;
  likeCount: number;
  isPinned: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string;
}

export interface CommentItem {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: string;
  createdAt: string;
}

export interface FileItem {
  id: string;
  originalName: string;
  storedName: string;
  path: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
