// src/shared/graphql/blog/queries.ts

import { gql } from '@apollo/client';

export const GET_ARTICLES = gql`
  query GetArticles($page: Int, $pageSize: Int) {
    articles(page: $page, pageSize: $pageSize) {
      data {
        id
        title
        slug
        excerpt
        content
        status
        viewCount
        likeCount
        publishedAt
        isPinned
        category {
          id
          name
          slug
        }
        tags {
          id
          name
          slug
        }
      }
      pagination {
        page
        pageSize
        total
        totalPages
      }
    }
  }
`;

export const GET_ARTICLE_BY_ID = gql`
  query GetArticleById($id: ID!) {
    article(id: $id) {
      id
      title
      slug
      excerpt
      content
      status
      viewCount
      likeCount
      publishedAt
      category {
        id
        name
        slug
      }
      tags {
        id
        name
        slug
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
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

export const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      name
      slug
      description
    }
  }
`;

export const SEARCH_ARTICLES = gql`
  query SearchArticles($keyword: String!, $page: Int, $pageSize: Int) {
    searchArticles(keyword: $keyword, page: $page, pageSize: $pageSize) {
      data {
        id
        title
        slug
        excerpt
        publishedAt
        category {
          id
          name
          slug
        }
      }
      pagination {
        page
        pageSize
        total
        totalPages
      }
    }
  }
`;

export const GET_ARTICLES_BY_CATEGORY = gql`
  query GetArticlesByCategory($slug: String!, $page: Int, $pageSize: Int) {
    articlesByCategory(slug: $slug, page: $page, pageSize: $pageSize) {
      data {
        id
        title
        slug
        excerpt
        publishedAt
        category {
          id
          name
          slug
        }
      }
      pagination {
        page
        pageSize
        total
        totalPages
      }
    }
  }
`;

export const GET_ARTICLES_BY_TAG = gql`
  query GetArticlesByTag($slug: String!, $page: Int, $pageSize: Int) {
    articlesByTag(slug: $slug, page: $page, pageSize: $pageSize) {
      data {
        id
        title
        slug
        excerpt
        publishedAt
        tags {
          id
          name
          slug
        }
      }
      pagination {
        page
        pageSize
        total
        totalPages
      }
    }
  }
`;

export const GET_ARCHIVES = gql`
  query GetArchives {
    archives {
      year
      month
      count
    }
  }
`;

export const GET_ADJACENT_ARTICLES = gql`
  query GetAdjacentArticles($id: ID!) {
    adjacentArticles(id: $id) {
      prev {
        id
        title
        slug
      }
      next {
        id
        title
        slug
      }
    }
  }
`;

export const GET_COMMENTS = gql`
  query GetComments($articleId: ID!, $page: Int, $pageSize: Int) {
    comments(articleId: $articleId, pagination: { page: $page, limit: $pageSize }) {
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
    }
  }
`;
