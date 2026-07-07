// src/app/providers/auth-provider.tsx

import { type ReactNode, useEffect, useState } from 'react';

import type { UserInfo } from './auth-types';
import { AuthContext } from './use-auth';

function readStoredToken(): string | null {
  try {
    return localStorage.getItem('access-token');
  } catch {
    return null;
  }
}

function readStoredUser(): UserInfo | null {
  try {
    const saved = localStorage.getItem('user');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    return null;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(readStoredToken);
  const [user, setUser] = useState<UserInfo | null>(readStoredUser);

  useEffect(() => {
    try {
      if (accessToken) {
        localStorage.setItem('access-token', accessToken);
      } else {
        localStorage.removeItem('access-token');
      }
    } catch {
      // Storage can be unavailable in restricted browsers.
    }
  }, [accessToken]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    } catch {
      // Storage can be unavailable in restricted browsers.
    }
  }, [user]);

  const login = (token: string, userInfo: UserInfo) => {
    setAccessToken(token);
    setUser(userInfo);
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!accessToken && !!user,
        user,
        login,
        logout,
        accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
