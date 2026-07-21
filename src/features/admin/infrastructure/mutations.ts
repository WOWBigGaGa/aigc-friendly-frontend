export const ADMIN_LOGIN = `
  mutation AdminLogin($loginName: String!, $loginPassword: String!, $type: LoginTypeEnum!, $audience: AudienceTypeEnum!) {
    login(input: { loginName: $loginName, loginPassword: $loginPassword, type: $type, audience: $audience }) {
      accessToken
      refreshToken
      accountId
      role
      userInfo {
        id
        accountId
        nickname
        email
        avatarUrl
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

export const ADMIN_UPLOAD_FILE = `
  mutation AdminUploadFile($filename: String!, $content: String!, $mimeType: String!) {
    uploadFile(filename: $filename, content: $content, mimeType: $mimeType) {
      id
      originalName
      url
      size
    }
  }
`;

export const ADMIN_DELETE_FILE = `
  mutation AdminDeleteFile($id: String!) {
    deleteFile(id: $id)
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

export const ADMIN_CHANGE_PASSWORD = `
  mutation AdminChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      success
      message
    }
  }
`;

export const ADMIN_CREATE_FRIEND_LINK = `
  mutation AdminCreateFriendLink($name: String!, $url: String!, $description: String, $logo: String, $sort: Int) {
    createFriendLink(name: $name, url: $url, description: $description, logo: $logo, sort: $sort) {
      id
      name
      url
      description
      logo
      sort
      isActive
    }
  }
`;

export const ADMIN_UPDATE_FRIEND_LINK = `
  mutation AdminUpdateFriendLink($id: String!, $name: String, $url: String, $description: String, $logo: String, $sort: Int, $isActive: Boolean) {
    updateFriendLink(id: $id, name: $name, url: $url, description: $description, logo: $logo, sort: $sort, isActive: $isActive) {
      id
      name
      url
      description
      logo
      sort
      isActive
    }
  }
`;

export const ADMIN_DELETE_FRIEND_LINK = `
  mutation AdminDeleteFriendLink($id: String!) {
    deleteFriendLink(id: $id)
  }
`;

export const ADMIN_UPDATE_USER_INFO = `
  mutation AdminUpdateUserInfo($input: UpdateUserInfoInput!) {
    updateUserInfo(input: $input) {
      isUpdated
      userInfo {
        id
        nickname
        signature
      }
    }
  }
`;
