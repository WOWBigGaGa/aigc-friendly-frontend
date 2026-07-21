import { gql } from '@apollo/client';

export const CREATE_ARTICLE = gql`
  mutation CreateArticle($input: CreateArticleInput!) {
    createArticle(input: $input) {
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

export const UPDATE_ARTICLE = gql`
  mutation UpdateArticle($id: String!, $input: UpdateArticleInput!) {
    updateArticle(id: $id, input: $input) {
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

export const DELETE_ARTICLE = gql`
  mutation DeleteArticle($id: String!) {
    deleteArticle(id: $id)
  }
`;

export const TOGGLE_ARTICLE_STATUS = gql`
  mutation ToggleArticleStatus($id: String!, $status: ArticleStatus!) {
    toggleArticleStatus(id: $id, status: $status) {
      id
      title
      status
    }
  }
`;

export const INCREMENT_VIEW_COUNT = gql`
  mutation IncrementViewCount($id: String!) {
    incrementViewCount(id: $id) {
      id
      viewCount
    }
  }
`;

export const INCREMENT_LIKE_COUNT = gql`
  mutation IncrementLikeCount($id: String!) {
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

export const APPROVE_COMMENT = gql`
  mutation ApproveComment($id: String!) {
    approveComment(id: $id) {
      id
      status
    }
  }
`;

export const REJECT_COMMENT = gql`
  mutation RejectComment($id: String!) {
    rejectComment(id: $id) {
      id
      status
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: String!) {
    deleteComment(id: $id)
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
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

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: String!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      slug
      description
      sort
      updatedAt
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: String!) {
    deleteCategory(id: $id)
  }
`;

export const CREATE_TAG = gql`
  mutation CreateTag($input: CreateTagInput!) {
    createTag(input: $input) {
      id
      name
      slug
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_TAG = gql`
  mutation UpdateTag($id: String!, $input: UpdateTagInput!) {
    updateTag(id: $id, input: $input) {
      id
      name
      slug
      updatedAt
    }
  }
`;

export const DELETE_TAG = gql`
  mutation DeleteTag($id: String!) {
    deleteTag(id: $id)
  }
`;
