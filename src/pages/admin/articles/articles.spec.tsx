import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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
    }: {
      icon?: React.ReactNode;
      onClick?: () => void;
      children?: React.ReactNode;
    }) => (
      <button data-testid="button" onClick={onClick}>
        {icon}
        {children}
      </button>
    ),
    Table: ({
      columns,
      dataSource,
    }: {
      columns?: Array<{ title: string; key: string }>;
      dataSource?: Array<{ key: string; title: string }>;
    }) => (
      <table data-testid="table">
        <thead>
          <tr>
            {columns?.map((col) => (
              <th key={col.key}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataSource?.map((row) => (
            <tr key={row.key}>
              <td>{row.title}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
  };
});

vi.mock('@ant-design/icons', () => ({
  PlusOutlined: () => <span data-testid="icon-plus" />,
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

describe('AdminArticlesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('should render articles page title', () => {
    render(
      <MemoryRouter>
        <AdminArticlesPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('文章管理')).toBeInTheDocument();
  });

  it('should render new article button', () => {
    render(
      <MemoryRouter>
        <AdminArticlesPage />
      </MemoryRouter>,
    );

    const button = screen.getByTestId('button');
    expect(button).toHaveTextContent('新建文章');
  });

  it('should navigate to new article page when button is clicked', () => {
    render(
      <MemoryRouter>
        <AdminArticlesPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTestId('button'));

    expect(mockNavigate).toHaveBeenCalledWith('/admin/articles/new');
  });

  it('should render article table with columns', () => {
    render(
      <MemoryRouter>
        <AdminArticlesPage />
      </MemoryRouter>,
    );

    const table = screen.getByTestId('table');
    expect(table).toBeInTheDocument();

    const headers = table.querySelectorAll('th');
    expect(headers.length).toBe(5);
    expect(headers[0].textContent).toBe('标题');
    expect(headers[1].textContent).toBe('分类');
    expect(headers[2].textContent).toBe('状态');
    expect(headers[3].textContent).toBe('发布时间');
    expect(headers[4].textContent).toBe('操作');
  });

  it('should render article data rows', () => {
    render(
      <MemoryRouter>
        <AdminArticlesPage />
      </MemoryRouter>,
    );

    const table = screen.getByTestId('table');
    const rows = table.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);

    const titles = table.querySelectorAll('tbody td:first-child');
    expect(titles[0].textContent).toBe('React 18 新特性详解');
    expect(titles[1].textContent).toBe('TypeScript 最佳实践');
  });
});
