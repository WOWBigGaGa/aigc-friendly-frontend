// src/app/providers/auth-types.ts

export type UserInfo = {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  roles: string[];
};