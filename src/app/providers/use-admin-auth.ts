import { createContext, useContext } from 'react';

import type { AdminUserInfo } from './admin-auth-types';

type AdminAuthContextValue = {
  isAuthenticated: boolean;
  authChecked: boolean;
  user: AdminUserInfo | null;
  login: (token: string, userInfo: AdminUserInfo) => void;
  logout: () => void;
  accessToken: string | null;
};

export const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }

  return context;
}