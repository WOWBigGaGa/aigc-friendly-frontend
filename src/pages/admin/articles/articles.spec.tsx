import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdminArticlesPage } from '../articles';

vi.mock('antd', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Button: ({
      icon,
      onClick,
      children,
      type,
      danger,
    }: {
      icon?: React.ReactNode;
      onClick?: () => void;
      children?: React.ReactNode;
      type?: string;
      danger?: boolean;
    }) => (
      <button data-testid="button" onClick={onClick} data-type={type} data-danger={danger}>
        {icon}
        {children}
      </button>
    ),
    Table: ({
      columns,
      dataSource,
      loading,
    }: {
      columns?: Array<{ title: string; key: string }>;
      dataSource?: Array<{ id: string; title: string }>;
      loading?: boolean;
    }) => (
      <table data-testid="table">
        {loading && <div data-testid="loading">Loading...</div>}
        <thead>
          <tr>
            {columns?.map((col) => (
              <th key={col.key}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource?.map((row) => (
            <tr key={row.id}>
              <td>{row.title}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
    Tag: ({ children, color }: { children?: React.ReactNode; color?: string }) => (
      <span data-testid="tag" data-color={color}>
        {children}
      </span>
    ),
    Popconfirm: ({
      onConfirm,
      children,
    }: {
      title?: string;
      onConfirm?: () => void;
      children?: React.ReactNode;
    }) => (
      <div data-testid="popconfirm" onClick={onConfirm}>
        {children}
      </div>
    ),
    Space: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
    Typography: {
      Title: ({ children }: { children?: React.ReactNode }) => (
        <h2 data-testid="title">{children}</h2>
      ),
    },
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

vi.mock('@ant-design/icons', () => ({
  PlusOutlined: () => <span data-testid="icon-plus" />,
  EditOutlined: () => <span data-testid="icon-edit" />,
  DeleteOutlined: () => <span data-testid="icon-delete" />,
}));

vi.mock('dayjs', () => ({
  default: vi.fn(() => ({
    format: vi.fn(() => '2024-01-01'),
  })),
}));

const mockNavigate = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    MemoryRouter: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  };
});

vi.mock('@/shared/graphql/request', () => ({
  executeGraphQL: vi.fn(),
}));

import { executeGraphQL } from '@/shared/graphql/request';

describe('AdminArticlesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render articles page title', () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      articles: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      },
    });

    render(
      <MemoryRouter>
        <AdminArticlesPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('文章管理')).toBeInTheDocument();
  });

  it('should render new article button', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      articles: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      },
    });

    render(
      <MemoryRouter>
        <AdminArticlesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const buttons = screen.getAllByTestId('button');
      const newButton = buttons.find((btn) => btn.textContent?.includes('新建文章'));
      expect(newButton).toBeInTheDocument();
    });
  });

  it('should navigate to new article page when button is clicked', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      articles: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      },
    });

    render(
      <MemoryRouter>
        <AdminArticlesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const buttons = screen.getAllByTestId('button');
      const newButton = buttons.find((btn) => btn.textContent?.includes('新建文章'));
      fireEvent.click(newButton!);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/admin/articles/new');
  });

  it('should render article table with columns', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      articles: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      },
    });

    render(
      <MemoryRouter>
        <AdminArticlesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const table = screen.getByTestId('table');
      expect(table).toBeInTheDocument();
    });
  });

  it('should render article data rows', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockResolvedValue({
      articles: {
        items: [
          {
            id: '1',
            title: 'React 18 新特性详解',
            status: 'PUBLISHED',
            viewCount: 100,
            likeCount: 20,
            publishedAt: '2024-01-15',
            category: { id: '1', name: '技术' },
          },
          {
            id: '2',
            title: 'TypeScript 最佳实践',
            status: 'DRAFT',
            viewCount: 50,
            likeCount: 10,
            publishedAt: null,
            category: { id: '1', name: '技术' },
          },
        ],
        total: 2,
        page: 1,
        pageSize: 10,
      },
    });

    render(
      <MemoryRouter>
        <AdminArticlesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const table = screen.getByTestId('table');
      const rows = table.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);

      const titles = table.querySelectorAll('tbody td:first-child');
      expect(titles[0].textContent).toBe('React 18 新特性详解');
      expect(titles[1].textContent).toBe('TypeScript 最佳实践');
    });
  });

  it('should show loading state initially', async () => {
    const mockExecute = vi.fn().mockImplementation(() => new Promise(() => {}));
    (executeGraphQL as ReturnType<typeof vi.fn>).mockImplementation(mockExecute);

    render(
      <MemoryRouter>
        <AdminArticlesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });

  it('should handle API error and show empty table', async () => {
    (executeGraphQL as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('API error'));

    render(
      <MemoryRouter>
        <AdminArticlesPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      const table = screen.getByTestId('table');
      const rows = table.querySelectorAll('tbody tr');
      expect(rows.length).toBe(0);
    });
  });
});
