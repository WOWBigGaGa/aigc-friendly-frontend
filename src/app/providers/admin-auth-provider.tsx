import { type ReactNode, useEffect, useState } from 'react';

import type { AdminUserInfo } from './admin-auth-types';
import { AdminAuthContext } from './use-admin-auth';

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() ?? null;
  }
  return null;
}

function setCookie(name: string, value: string, days: number = 7): void {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Strict`;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

function readStoredUser(): AdminUserInfo | null {
  try {
    const saved = localStorage.getItem('admin_user');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    return null;
  }
  return null;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => getCookie('admin_token'));
  const [user, setUser] = useState<AdminUserInfo | null>(readStoredUser);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (accessToken) {
      setCookie('admin_token', accessToken, 7);
    } else {
      deleteCookie('admin_token');
    }
  }, [accessToken]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('admin_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('admin_user');
      }
    } catch {
      // Storage can be unavailable in restricted browsers.
    }
  }, [user]);

  useEffect(() => {
    setAuthChecked(true);
  }, []);

  const login = (token: string, userInfo: AdminUserInfo) => {
    setAccessToken(token);
    setUser(userInfo);
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    deleteCookie('admin_token');
    localStorage.removeItem('admin_user');
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAuthenticated: !!accessToken && !!user,
        authChecked,
        user,
        login,
        logout,
        accessToken,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}
