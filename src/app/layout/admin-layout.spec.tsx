import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminLayout } from '@/app/layout';

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Button: ({
      icon,
      onClick,
      danger,
      children,
    }: {
      icon?: React.ReactNode;
      onClick?: () => void;
      danger?: boolean;
      children?: React.ReactNode;
    }) => (
      <button data-testid="button" data-danger={danger} onClick={onClick}>
        {icon}
        {children}
      </button>
    ),
    Layout: Object.assign(
      ({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) => (
        <div data-testid="layout" style={style}>
          {children}
        </div>
      ),
      {
        Header: ({
          children,
          style,
        }: {
          children?: React.ReactNode;
          style?: React.CSSProperties;
        }) => (
          <header data-testid="header" style={style}>
            {children}
          </header>
        ),
        Sider: ({
          collapsed,
          theme,
          children,
        }: {
          collapsible?: boolean;
          collapsed?: boolean;
          onCollapse?: (value: boolean) => void;
          theme?: string;
          width?: number;
          children?: React.ReactNode;
        }) => (
          <aside data-testid="sider" data-collapsed={collapsed} data-theme={theme}>
            {children}
          </aside>
        ),
        Content: ({
          children,
          style,
        }: {
          children?: React.ReactNode;
          style?: React.CSSProperties;
        }) => (
          <main data-testid="content" style={style}>
            {children}
          </main>
        ),
      },
    ),
    Menu: ({
      mode,
      items,
      onClick,
    }: {
      defaultSelectedKeys?: string[];
      mode?: string;
      selectedKeys?: string[];
      items?: Array<{ key: string; icon?: React.ReactNode; label: string }>;
      onClick?: ({ key }: { key: string }) => void;
    }) => (
      <nav data-testid="menu" data-mode={mode}>
        {items?.map((item) => (
          <button
            key={item.key}
            data-testid={`menu-item-${item.key}`}
            onClick={() => onClick?.({ key: item.key })}
          >
            {item.label}
          </button>
        ))}
      </nav>
    ),
    Tooltip: ({ title, children }: { title?: string; children?: React.ReactNode }) => (
      <span data-testid="tooltip" data-title={title}>
        {children}
      </span>
    ),
  };
});

vi.mock('@ant-design/icons', () => ({
  BarChartOutlined: () => <span data-testid="icon-bar-chart" />,
  FileTextOutlined: () => <span data-testid="icon-file-text" />,
  FolderOutlined: () => <span data-testid="icon-folder" />,
  PictureOutlined: () => <span data-testid="icon-picture" />,
  SettingOutlined: () => <span data-testid="icon-setting" />,
  TagOutlined: () => <span data-testid="icon-tag" />,
  MessageOutlined: () => <span data-testid="icon-message" />,
  UserOutlined: () => <span data-testid="icon-user" />,
  LogoutOutlined: () => <span data-testid="icon-logout" />,
  MenuFoldOutlined: () => <span data-testid="icon-menu-fold" />,
  MenuUnfoldOutlined: () => <span data-testid="icon-menu-unfold" />,
}));

const mockNavigate = vi.fn();
const mockLogout = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/admin/dashboard' }),
    MemoryRouter: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Outlet: () => <div data-testid="outlet">Content</div>,
  };
});

vi.mock('@/app/providers/use-admin-auth', () => ({
  useAdminAuth: () => ({
    isAuthenticated: true,
    authChecked: true,
    user: { id: '1', username: 'admin', email: 'admin@example.com', roles: ['admin'] },
    login: vi.fn(),
    logout: mockLogout,
    accessToken: 'mock_token',
  }),
}));

describe('AdminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.cookie = 'admin_token=mock_token';
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    document.cookie = 'admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  });

  it('should render sidebar with navigation menu', () => {
    render(
      <MemoryRouter>
        <AdminLayout />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('sider')).toBeInTheDocument();
    expect(screen.getByTestId('menu')).toBeInTheDocument();
    expect(screen.getByTestId('menu-item-/admin/dashboard')).toHaveTextContent('仪表盘');
    expect(screen.getByTestId('menu-item-/admin/articles')).toHaveTextContent('文章管理');
    expect(screen.getByTestId('menu-item-/admin/categories')).toHaveTextContent('分类管理');
    expect(screen.getByTestId('menu-item-/admin/tags')).toHaveTextContent('标签管理');
    expect(screen.getByTestId('menu-item-/admin/comments')).toHaveTextContent('评论管理');
    expect(screen.getByTestId('menu-item-/admin/files')).toHaveTextContent('文件管理');
    expect(screen.getByTestId('menu-item-/admin/settings')).toHaveTextContent('系统设置');
  });

  it('should navigate when menu item is clicked', () => {
    render(
      <MemoryRouter>
        <AdminLayout />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId('menu-item-/admin/articles'));

    expect(mockNavigate).toHaveBeenCalledWith('/admin/articles');
  });

  it('should toggle sidebar collapse when collapse button is clicked', () => {
    render(
      <MemoryRouter>
        <AdminLayout />
      </MemoryRouter>,
    );

    const sider = screen.getByTestId('sider');
    expect(sider.getAttribute('data-collapsed')).toBe('false');

    const buttons = screen.getAllByTestId('button');
    const collapseButton = buttons[0];
    fireEvent.click(collapseButton);

    expect(sider.getAttribute('data-collapsed')).toBe('true');
  });

  it('should call logout and navigate to login when logout is clicked', () => {
    render(
      <MemoryRouter>
        <AdminLayout />
      </MemoryRouter>,
    );

    const buttons = screen.getAllByTestId('button');
    const logoutButton = buttons[1];
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/admin/login');
  });

  it('should render content area', () => {
    render(
      <MemoryRouter>
        <AdminLayout>
          <div data-testid="custom-content">Custom Content</div>
        </AdminLayout>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('custom-content')).toHaveTextContent('Custom Content');
  });
});
