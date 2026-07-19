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
