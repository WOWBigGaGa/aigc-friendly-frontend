// src/app/providers/use-auth.ts

import { createContext, useContext } from 'react';

import type { UserInfo } from './auth-types';

type AuthContextValue = {
  isAuthenticated: boolean;
  user: UserInfo | null;
  login: (accessToken: string, user: UserInfo) => void;
  logout: () => void;
  accessToken: string | null;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}