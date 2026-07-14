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
