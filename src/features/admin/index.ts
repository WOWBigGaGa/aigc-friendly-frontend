export { ADMIN_LOGIN, ADMIN_ME, ADMIN_APPROVE_COMMENT, ADMIN_REJECT_COMMENT, ADMIN_DELETE_COMMENT } from './infrastructure/mutations';
export {
  ADMIN_DASHBOARD_STATS,
  ADMIN_PENDING_COMMENTS,
  ADMIN_RECENT_ARTICLES,
  ADMIN_ALL_COMMENTS,
} from './infrastructure/queries';
export type { DashboardStats, ArticleItem, CommentItem, PaginatedResult } from './types';
