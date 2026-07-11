// src/shared/graphql/blog/mutations.ts

import { gql } from '@apollo/client';

export const CREATE_ARTICLE = gql`
  mutation CreateArticle($input: CreateArticleInput!) {
    createArticle(input: $input) {
      id
      title
      slug
      excerpt
      content
      status
      publishedAt
      category {
        id
        name
      }
      tags {
        id
        name
      }
    }
  }
`;

export const UPDATE_ARTICLE = gql`
  mutation UpdateArticle($id: ID!, $input: UpdateArticleInput!) {
    updateArticle(id: $id, input: $input) {
      id
      title
      slug
      excerpt
      content
      status
      publishedAt
      category {
        id
        name
      }
      tags {
        id
        name
      }
    }
  }
`;

export const DELETE_ARTICLE = gql`
  mutation DeleteArticle($id: ID!) {
    deleteArticle(id: $id) {
      id
      title
    }
  }
`;

export const TOGGLE_ARTICLE_STATUS = gql`
  mutation ToggleArticleStatus($id: ID!, $status: ArticleStatus!) {
    toggleArticleStatus(id: $id, status: $status) {
      id
      title
      status
    }
  }
`;

export const INCREMENT_VIEW_COUNT = gql`
  mutation IncrementViewCount($id: ID!) {
    incrementViewCount(id: $id) {
      id
      viewCount
    }
  }
`;

export const INCREMENT_LIKE_COUNT = gql`
  mutation IncrementLikeCount($id: ID!) {
    incrementLikeCount(id: $id) {
      id
      likeCount
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      articleId
      authorName
      authorEmail
      authorAvatar
      content
      parentId
      status
      createdAt
    }
  }
`;