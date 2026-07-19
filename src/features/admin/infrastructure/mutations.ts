export const ADMIN_LOGIN = `
  mutation AdminLogin($username: String!, $password: String!) {
    adminLogin(username: $username, password: $password) {
      token
      user {
        id
        username
        email
        roles
      }
    }
  }
`;

export const ADMIN_ME = `
  query AdminMe {
    adminMe {
      id
      username
      email
      roles
    }
  }
`;

export const ADMIN_APPROVE_COMMENT = `
  mutation AdminApproveComment($id: String!) {
    approveComment(id: $id) {
      id
      status
    }
  }
`;

export const ADMIN_REJECT_COMMENT = `
  mutation AdminRejectComment($id: String!) {
    rejectComment(id: $id) {
      id
      status
    }
  }
`;

export const ADMIN_DELETE_COMMENT = `
  mutation AdminDeleteComment($id: String!) {
    deleteComment(id: $id)
  }
`;

export const ADMIN_REPLY_COMMENT = `
  mutation AdminReplyComment($id: String!, $content: String!) {
    replyComment(id: $id, content: $content) {
      id
      content
    }
  }
`;

export const ADMIN_CREATE_ARTICLE = `
  mutation AdminCreateArticle($input: CreateArticleInput!) {
    createArticle(input: $input) {
      id
      title
      status
      publishedAt
    }
  }
`;

export const ADMIN_UPDATE_ARTICLE = `
  mutation AdminUpdateArticle($id: String!, $input: UpdateArticleInput!) {
    updateArticle(id: $id, input: $input) {
      id
      title
      status
      publishedAt
    }
  }
`;

export const ADMIN_DELETE_ARTICLE = `
  mutation AdminDeleteArticle($id: String!) {
    deleteArticle(id: $id)
  }
`;

export const ADMIN_TOGGLE_ARTICLE_STATUS = `
  mutation AdminToggleArticleStatus($id: String!, $status: ArticleStatus!) {
    toggleArticleStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;
