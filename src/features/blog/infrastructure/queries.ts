import { gql } from '@apollo/client';

// 文章列表（支持分页、筛选、搜索）
export const GET_ARTICLES = gql`
  query GetArticles($pagination: PaginationInput, $filter: ArticleFilterInput) {
    articles(pagination: $pagination, filter: $filter) {
      items {
        id
        title
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
      total
      page
      pageSize
      pageInfo {
        hasNext
      }
    }
  }
`;

// 文章详情
export const GET_ARTICLE_BY_ID = gql`
  query GetArticleById($id: String!) {
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

// 分类列表
export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
      description
      sort
      createdAt
      updatedAt
    }
  }
`;

// 标签列表
export const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      name
      slug
      createdAt
      updatedAt
    }
  }
`;

// 搜索文章（复用 articles 接口，通过 keyword 筛选）
export const SEARCH_ARTICLES = gql`
  query SearchArticles($pagination: PaginationInput, $keyword: String) {
    articles(pagination: $pagination, filter: { keyword: $keyword }) {
      items {
        id
        title
        summary
        coverImage
        status
        viewCount
        likeCount
        publishedAt
        createdAt
      }
      total
      page
      pageSize
      pageInfo {
        hasNext
      }
    }
  }
`;

// 按分类筛选文章（前端先查 categories 获取 categoryId，再调用此查询）
export const GET_ARTICLES_BY_CATEGORY = gql`
  query GetArticlesByCategory($pagination: PaginationInput, $categoryId: String!) {
    articles(pagination: $pagination, filter: { categoryId: $categoryId }) {
      items {
        id
        title
        summary
        coverImage
        status
        viewCount
        likeCount
        publishedAt
        createdAt
      }
      total
      page
      pageSize
      pageInfo {
        hasNext
      }
    }
  }
`;

// 按标签筛选文章（前端先查 tags 获取 tagId，再调用此查询）
export const GET_ARTICLES_BY_TAG = gql`
  query GetArticlesByTag($pagination: PaginationInput, $tagIds: [String!]!) {
    articles(pagination: $pagination, filter: { tagIds: $tagIds }) {
      items {
        id
        title
        summary
        coverImage
        status
        viewCount
        likeCount
        publishedAt
        createdAt
      }
      total
      page
      pageSize
      pageInfo {
        hasNext
      }
    }
  }
`;

// 归档
export const GET_ARCHIVES = gql`
  query GetArchives {
    archives {
      year
      month
      count
    }
  }
`;

// 友链列表
export const GET_FRIEND_LINKS = gql`
  query GetFriendLinks {
    friendLinks {
      id
      name
      url
      description
      logo
      sort
      isActive
      createdAt
      updatedAt
    }
  }
`;

// 评论列表
export const GET_COMMENTS = gql`
  query GetComments($articleId: String!, $pagination: PaginationInput) {
    comments(articleId: $articleId, pagination: $pagination) {
      items {
        id
        articleId
        authorName
        authorEmail
        authorAvatar
        content
        parentId
        status
        createdAt
        updatedAt
      }
      total
      page
      pageSize
      pageInfo {
        hasNext
      }
    }
  }
`;
