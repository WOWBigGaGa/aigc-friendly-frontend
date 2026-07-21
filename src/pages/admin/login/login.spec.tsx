import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminLoginPage } from '../login';

export const mockNavigate = vi.fn();
const mockLogin = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Button: ({
      type,
      htmlType,
      style,
      children,
      onClick,
      loading,
    }: {
      type?: string;
      htmlType?: 'submit' | 'reset' | 'button';
      style?: React.CSSProperties;
      children?: React.ReactNode;
      onClick?: () => void;
      loading?: boolean;
    }) => (
      <button
        data-testid="button"
        data-type={type}
        type={htmlType}
        style={style}
        onClick={onClick}
        disabled={loading}
      >
        {children}
      </button>
    ),
    Card: ({ style, children }: { style?: React.CSSProperties; children?: React.ReactNode }) => (
      <div data-testid="card" style={style}>
        {children}
      </div>
    ),
    Form: Object.assign(
      ({
        onFinish,
        children,
      }: {
        form?: { getFieldValue: (key: string) => string };
        onFinish?: (values: Record<string, string>) => void;
        layout?: string;
        children?: React.ReactNode;
      }) => (
        <form
          data-testid="form"
          onSubmit={(e) => {
            e.preventDefault();
            const usernameInput = e.currentTarget.querySelector(
              '[data-testid="input"]',
            ) as HTMLInputElement;
            const passwordInput = e.currentTarget.querySelector(
              '[data-testid="input-password"]',
            ) as HTMLInputElement;
            onFinish?.({
              username: usernameInput?.value || '',
              password: passwordInput?.value || '',
            });
          }}
        >
          {children}
        </form>
      ),
      {
        useForm: () => [{ getFieldValue: vi.fn(() => '') }],
        Item: ({
          label,
          name,
          children,
        }: {
          label?: string;
          name?: string;
          rules?: unknown[];
          children?: React.ReactNode;
        }) => (
          <div data-testid={`form-item-${name}`}>
            <label>{label}</label>
            {children}
          </div>
        ),
      },
    ),
    Input: Object.assign(
      ({
        placeholder,
        type,
        onChange,
        value,
      }: {
        placeholder?: string;
        type?: string;
        onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
        value?: string;
      }) => (
        <input
          data-testid="input"
          type={type || 'text'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      ),
      {
        Password: ({
          placeholder,
          onChange,
          value,
        }: {
          placeholder?: string;
          onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
          value?: string;
        }) => (
          <input
            data-testid="input-password"
            type="password"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
          />
        ),
      },
    ),
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

vi.mock('@/app/providers/use-admin-auth', () => ({
  useAdminAuth: () => ({
    isAuthenticated: false,
    authChecked: true,
    user: null,
    login: mockLogin,
    logout: vi.fn(),
    accessToken: null,
  }),
}));

vi.mock('@/shared/graphql/request', () => ({
  executeGraphQL: vi.fn(),
}));

import { executeGraphQL } from '@/shared/graphql/request';

describe('AdminLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  });

  afterEach(() => {
    cleanup();
    document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  });

  it('should render login form with username and password fields', () => {
    render(
      <MemoryRouter>
        <AdminLoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('管理后台登录')).toBeInTheDocument();
    expect(screen.getByText('用户名')).toBeInTheDocument();
    expect(screen.getByText('密码')).toBeInTheDocument();
    expect(screen.getByTestId('button')).toHaveTextContent('登录');
  });

  it('should successfully login with correct credentials', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      login: {
        accessToken: 'mock_token',
        refreshToken: 'mock_refresh_token',
        accountId: 1,
        role: 'ADMIN',
        userInfo: { id: 1, accountId: 1, nickname: 'admin', email: 'admin@example.com', avatarUrl: '' },
      },
    });

    render(
      <MemoryRouter>
        <AdminLoginPage />
      </MemoryRouter>,
    );

    const inputs = screen.getAllByTestId('input');
    const usernameInput = inputs[0];
    const passwordInput = screen.getByTestId('input-password');

    fireEvent.change(usernameInput, { target: { value: 'admin' } });
    fireEvent.change(passwordInput, { target: { value: 'admin' } });

    fireEvent.submit(screen.getByTestId('form'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('mock_token', {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        roles: ['ADMIN'],
      });
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('should show error with incorrect credentials', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Authentication failed'),
    );

    render(
      <MemoryRouter>
        <AdminLoginPage />
      </MemoryRouter>,
    );

    const inputs = screen.getAllByTestId('input');
    const usernameInput = inputs[0];
    const passwordInput = screen.getByTestId('input-password');

    fireEvent.change(usernameInput, { target: { value: 'wrong' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });

    fireEvent.submit(screen.getByTestId('form'));

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('should not login when username is empty', async () => {
    render(
      <MemoryRouter>
        <AdminLoginPage />
      </MemoryRouter>,
    );

    const passwordInput = screen.getByTestId('input-password');
    fireEvent.change(passwordInput, { target: { value: 'admin' } });

    fireEvent.submit(screen.getByTestId('form'));

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it('should not login when password is empty', async () => {
    render(
      <MemoryRouter>
        <AdminLoginPage />
      </MemoryRouter>,
    );

    const inputs = screen.getAllByTestId('input');
    const usernameInput = inputs[0];
    fireEvent.change(usernameInput, { target: { value: 'admin' } });

    fireEvent.submit(screen.getByTestId('form'));

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });
});
