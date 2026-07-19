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
  category: { id: string; name: string } | null;
}

export interface CommentItem {
  id: string;
  articleId: string;
  articleTitle?: string;
  authorName: string;
  authorEmail: string;
  content: string;
  status: string;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}