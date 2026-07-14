export const ADMIN_DASHBOARD_STATS = `
  query AdminDashboardStats {
    dashboardStats {
      articleCount
      commentCount
      categoryCount
      tagCount
      totalViewCount
      totalLikeCount
      pendingCommentCount
    }
  }
`;

export const ADMIN_PENDING_COMMENTS = `
  query AdminPendingComments($page: Int, $limit: Int) {
    pendingComments(pagination: { page: $page, limit: $limit }) {
      items {
        id
        articleId
        authorName
        authorEmail
        content
        status
        createdAt
      }
      total
      page
      pageSize
    }
  }
`;

export const ADMIN_RECENT_ARTICLES = `
  query AdminRecentArticles($page: Int, $limit: Int) {
    articles(pagination: { page: $page, limit: $limit }) {
      items {
        id
        title
        status
        viewCount
        likeCount
        publishedAt
        category {
          id
          name
        }
      }
      total
      page
      pageSize
    }
  }
`;