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
  query AdminPendingComments($page: Int, $pageSize: Int) {
    pendingComments(pagination: { page: $page, pageSize: $pageSize }) {
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
  query AdminRecentArticles($page: Int, $pageSize: Int) {
    articles(pagination: { page: $page, pageSize: $pageSize }) {
      items {
        id
        title
        status
        viewCount
        likeCount
        publishedAt
      }
      total
      page
      pageSize
    }
  }
`;

export const ADMIN_ALL_COMMENTS = `
  query AdminAllComments($page: Int, $pageSize: Int) {
    allComments(pagination: { page: $page, pageSize: $pageSize }) {
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

export const ADMIN_FILES = `
  query AdminFiles($page: Int, $limit: Int) {
    files(page: $page, limit: $limit) {
      id
      originalName
      storedName
      path
      url
      mimeType
      size
      uploadedBy
      createdAt
    }
  }
`;

export const ADMIN_ARTICLE_BY_ID = `
  query AdminArticleById($id: String!) {
    article(id: $id) {
      id
      title
      content
      summary
      coverImage
      status
      categoryId
      authorId
      viewCount
      likeCount
      isPinned
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_CATEGORIES = `
  query GetCategories {
    categories {
      id
      name
      slug
      description
      parentId
    }
  }
`;
