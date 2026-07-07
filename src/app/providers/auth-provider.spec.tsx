// src/app/providers/auth-provider.spec.tsx

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthProvider } from './auth-provider';
import type { UserInfo } from './auth-types';
import { useAuth } from './use-auth';

const testUser: UserInfo = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  roles: ['user'],
};

function TestComponent() {
  const { isAuthenticated, user, login, logout, accessToken } = useAuth();

  return (
    <div>
      <span data-testid="is-authenticated">{String(isAuthenticated)}</span>
      <span data-testid="access-token">{accessToken ?? 'null'}</span>
      <span data-testid="username">{user?.username ?? 'null'}</span>
      <button data-testid="login-btn" onClick={() => login('token123', testUser)}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('initializes with no authentication when localStorage is empty', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    expect(screen.getByTestId('access-token').textContent).toBe('null');
    expect(screen.getByTestId('username').textContent).toBe('null');
  });

  it('restores authentication state from localStorage', () => {
    localStorage.setItem('access-token', 'saved-token');
    localStorage.setItem('user', JSON.stringify(testUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    expect(screen.getByTestId('access-token').textContent).toBe('saved-token');
    expect(screen.getByTestId('username').textContent).toBe('testuser');
  });

  it('handles malformed user data in localStorage', () => {
    localStorage.setItem('access-token', 'token');
    localStorage.setItem('user', 'invalid-json');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    expect(screen.getByTestId('username').textContent).toBe('null');
  });

  it('persists authentication to localStorage on login', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByTestId('login-btn'));

    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    expect(screen.getByTestId('access-token').textContent).toBe('token123');
    expect(screen.getByTestId('username').textContent).toBe('testuser');

    expect(localStorage.getItem('access-token')).toBe('token123');
    expect(JSON.parse(localStorage.getItem('user') ?? 'null')).toEqual(testUser);
  });

  it('removes authentication from localStorage on logout', () => {
    localStorage.setItem('access-token', 'token');
    localStorage.setItem('user', JSON.stringify(testUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');

    fireEvent.click(screen.getByTestId('logout-btn'));

    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    expect(screen.getByTestId('access-token').textContent).toBe('null');
    expect(screen.getByTestId('username').textContent).toBe('null');

    expect(localStorage.getItem('access-token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('requires both accessToken and user to be authenticated', () => {
    localStorage.setItem('access-token', 'token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
  });

  it('throws error when useAuth is called outside AuthProvider', () => {
    function ComponentOutsideProvider() {
      useAuth();
      return null;
    }

    expect(() => {
      render(<ComponentOutsideProvider />);
    }).toThrow('useAuth must be used within an AuthProvider');
  });

  it('handles localStorage unavailable gracefully', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    expect(() => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>,
      );
    }).not.toThrow();

    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');

    fireEvent.click(screen.getByTestId('login-btn'));

    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');

    fireEvent.click(screen.getByTestId('logout-btn'));

    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
    removeItemSpy.mockRestore();
  });

  it('treats empty string token as not authenticated', () => {
    localStorage.setItem('access-token', '');
    localStorage.setItem('user', JSON.stringify(testUser));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
  });

  it('persists user with all fields including roles', () => {
    const userWithRoles: UserInfo = {
      id: '2',
      username: 'admin',
      email: 'admin@example.com',
      roles: ['admin', 'user'],
    };

    function TestComponentWithRoles() {
      const { user, login } = useAuth();
      return (
        <div>
          <span data-testid="roles">{user?.roles.join(',') ?? 'null'}</span>
          <button data-testid="login-btn" onClick={() => login('token', userWithRoles)}>
            Login
          </button>
        </div>
      );
    }

    render(
      <AuthProvider>
        <TestComponentWithRoles />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByTestId('login-btn'));

    expect(screen.getByTestId('roles').textContent).toBe('admin,user');
    const storedUser = JSON.parse(localStorage.getItem('user') ?? 'null');
    expect(storedUser.roles).toEqual(['admin', 'user']);
  });
});
